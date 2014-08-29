var log4js = require('log4js');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var store = require(__dirname + '/../store.js').store;

var logger = log4js.getLogger('doc');

var DocParser = (function(){
  var re = /^ObjectID\('([0-9a-f]{24})'\)$/;
  return function(k, v){
    if (typeof(v) === 'string') {
      var res = v.match(re);
      if (res) return new ObjectID(res[1]);
    }
    return v;
  };
})();

ObjectID.prototype.toJSON = function(){
  return 'ObjectID(\'' + this + '\')';
};

var setup = exports.setup = function(prefix, getCollection, mountApp) {
  prefix = prefix || 'documents';
  var app = express();

  prefix = '/' + prefix;
  // get documents
  app.get(prefix, function(req, res, next) {
    var query = {}, options = {};
    if (req.param('query')) {
      try {
        var s = unescape(req.param('query'));
        query = JSON.parse(s);
        // convert regex
        var r = /^\/(.+)\/([igmy]?)$/;
        for (var i in query) {
          var result = r.exec(query[i]);
          if (result) {
            // it's a regexp
            try {
              query[i] = new RegExp(result[1], result[2]);
            } catch (e) {
              cb('bad query');
              return null;
            }
          }
        }
      } catch (e) {
        return res.json({err: 'bad query'});
      }
    }
    if (req.param('options')) {
      try {
        var s = unescape(req.param('options'));
        options = JSON.parse(s);
      } catch (e) {
        return res.json({err: 'bad options'});
      }
    }
    req.mongodb.col.find(query, options).toArray(function(err, docs) {
      res.json(docs);
    });
  });

  // create document
  app.post(prefix, function(req, res, next) {
    var docs = req.body;
    if (typeof(docs) === 'string') {
      docs = JSON.parse(docs, DocParser);
    }
    req.mongodb.col.insert(docs, function(err, inserted) {
      res.json(inserted);
    });
  });

  // delete multiple documents
  app.delete(prefix, function(req, res, next) {
    var docIds = req.body;
    if (docIds && docIds.length) {
      var nbRemoved = 0;
      var total = docIds.length;
      var complete = 0;
      docIds.forEach(function(id){
        req.mongodb.col.remove(
          {_id: new ObjectID(id)},
          function(err, nb) {
            nbRemoved += nb;
            if (++complete === total) {
              res.json({removed: nbRemoved});
            }
          }
        );
      });
    } else {
      next();
    }
  });

  prefix += '/:docId';
  // update document
  app.post(prefix, function(req, res, next) {
    var doc = req.body;
    if (typeof(doc) === 'string') {
      doc = JSON.parse(doc, DocParser);
    }
    delete doc._id;
    var id = req.params.docId;
    if (id.match(/^[0-9a-f]{24}$/)) {
      id = new ObjectID(id);
    }
    req.mongodb.col.update(
      {_id: id},
      {$set: doc},
      function(err, result) {
        res.json(result);
      }
    );
  });

  // get document
  app.get(prefix, function(req, res, next) {
    var id = req.params.docId;
    if (id.match(/^[0-9a-f]{24}$/)) {
      id = new ObjectID(id);
    }
    req.mongodb.col.findOne(
      {_id: id},
      function(err, doc) {
        var json = JSON.stringify(doc);
        res.send(json);
      }
    );
  });

  // delete 1 document
  app.delete(prefix, function(req, res, next) {
    req.mongodb.col.remove(
      {_id: new ObjectID(req.params.docId)},
      function(err, nbRemoved) {
        res.json({removed: nbRemoved});
      }
    );
  });

  if (mountApp) {
    app.use(prefix + '/', mountApp);
  }

  return app;
};


