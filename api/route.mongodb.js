var store = require(__dirname + "/store.js").store;
var log4js = require('log4js');
var logger = log4js.getLogger("route.mongodb");
var ObjectID = require('mongodb').ObjectID;

var URI_MASTER = {
  X: "/*",
  BUILD_INFO: "/buildInfo",
  SERVER_STATUS: "/serverStatus",
  REPL_SET_GET_STATUS: "/replSetGetStatus",
  DB_LIST: "/databases",
  DB: "/databases/:dbid",
  DB_X: "/databases/:dbid/*",
  COLLECTION_LIST: "/databases/:dbid/collections",
  COLLECTION: "/databases/:dbid/collections/:colid",
  COLLECTION_X: "/databases/:dbid/collections/:colid/*",
  DOC_LIST: "/databases/:dbid/collections/:colid/documents",
  DOC: "/databases/:dbid/collections/:colid/documents/:docid"
};

var setup = function(app, prefix, connect) {
  prefix = prefix || "/api";
  var URI = {};
  for (var i in URI_MASTER) {
    URI[i] = prefix + URI_MASTER[i];
    logger.info("setup", i, URI[i]);
  }

  connect = connect || store.connect;

  app.all(URI.X, function(req, res, next){
    connect(req, function(conn){
      if (!conn) {
        res.json({err: "not connected"});
      } else {
        if (!req.mongodb) req.mongodb = {};
        req.mongodb.conn = conn;
        req.mongodb.admin = conn.db('local').admin();
        next();
      }
    });
  });

  // get buildInfo
  app.get(URI.BUILD_INFO, function(req, res, next) {
    req.mongodb.admin.buildInfo(function(err, result) {
      res.json(result);
    });
  });

  // get serverStatus
  app.get(URI.SERVER_STATUS, function(req, res, next) {
    req.mongodb.admin.serverStatus(function(err, result) {
      res.json(result);
    });
  });

  // get replSetGetStatus
  app.get(URI.REPL_SET_GET_STATUS, function(req, res, next) {
    req.mongodb.admin.replSetGetStatus(function(err, result) {
      res.json(result);
    });
  });

  // get databases
  app.get(URI.DB_LIST, function(req, res, next) {
    req.mongodb.admin.listDatabases(function(err, dbs) {
      res.json(dbs);
    });
  });

  // // create database
  // app.post(URI.DB_LIST, function(req, res, next) {
  //   var name = req.body.name;
  //   req.mongodb.conn.db(name);
  //   res.json({});
  // });

  app.all(URI.DB_X, function(req, res, next) {
    var name = req.params.dbid;
    req.mongodb.db = req.mongodb.conn.db(name);
    next();
  });

  // get database stats
  app.get(URI.DB, function(req, res, next) {
    var name = req.params.dbid;
    req.mongodb.conn.db(name).stats(function(err, stats) {
      res.json(stats);
    });
  });

  // drop database
  app.delete(URI.DB, function(req, res, next) {
    var name = req.params.dbid;
    req.mongodb.conn.db(name).dropDatabase(function(err, result) {
      res.json(result);
    });
  });

  // get collections
  app.get(URI.COLLECTION_LIST, function(req, res, next) {
    req.mongodb.db.collectionNames(function(err, items) {
      res.json(items);
    });
  });

  // create collection
  app.post(URI.COLLECTION_LIST, function(req, res, next) {
    var name = req.body.name;
    req.mongodb.db.collection(name, function(err, col) {
      col.insert({}, function(){
        col.remove({}, function(){
          res.json({});
        });
      });
    });
  });

  app.all(URI.COLLECTION_X, function(req, res, next) {
    var name = req.params.colid;
    req.mongodb.db.collection(name, function(err, col) {
      req.mongodb.col = col;
      next();
    });
  });

  // get collection stats
  app.get(URI.COLLECTION, function(req, res, next) {
    var name = req.params.colid;
    req.mongodb.db.collection(name, function(err, col) {
      col.stats(function(err, stats) {
        res.json(stats);
      });
    });
  });

  // drop collection
  app.delete(URI.COLLECTION, function(req, res, next) {
    var name = req.params.colid;
    req.mongodb.db.collection(name, function(err, col) {
      col.drop(function(err, result) {
        res.json(result);
      });
    });
  });

  // get documents
  app.get(URI.DOC_LIST, function(req, res, next) {
    var query = {}, options = {};
    if (req.param("query")) {
      try {
        var s = unescape(req.param("query"));
        query = JSON.parse(s);

        // // if query is a regex
        // var r = /^\/(.+)\/([igmy]?)$/;
        // for (var i in query) {
        //   var result = r.exec(query[i]);
        //   if (result) {
        //     // it's a regexp
        //     try {
        //       query[i] = new RegExp(result[1], result[2]);
        //     } catch (e) {
        //       cb("bad query");
        //       return null;
        //     }
        //   }
        // }

      } catch (e) {
        return res.json({err: "bad query"});
      }
    }
    if (req.param("options")) {
      try {
        var s = unescape(req.param("options"));
        options = JSON.parse(s);
      } catch (e) {
        return res.json({err: "bad options"});
      }
    }
    req.mongodb.col.find(query, options).toArray(function(err, docs) {
      res.json(docs);
    });
  });

  // create document
  app.post(URI.DOC_LIST, function(req, res, next) {
    var docs = req.body;
    req.mongodb.col.insert(docs, function(err, docs) {
      res.json(docs);
    });
  });

  // update document
  app.post(URI.DOC, function(req, res, next) {
    var doc = req.body;
    if (typeof(doc) === "string") {
      doc = JSON.parse(doc, DocParser);
    }
    delete doc._id;
    req.mongodb.col.update(
      {_id: new ObjectID(req.params.docid)},
      {$set: doc},
      function(err, result) {
        res.json(result);
      }
    );
  });

  var DocParser = (function(){
    var re = /^ObjectID\('([0-9a-f]{24})'\)$/;
    return function(k, v){
      if (typeof(v) === "string") {
        var res = v.match(re);
        if (res) return new ObjectID(res[1]);
      }
      return v;
    };
  })();

  ObjectID.prototype.toJSON = function(){
    return "ObjectID('" + this + "')";
  };

  // get document
  app.get(URI.DOC, function(req, res, next) {
    req.mongodb.col.findOne(
      {_id: new ObjectID(req.params.docid)},
      function(err, doc) {
        var json = JSON.stringify(doc);
        res.send(json);
      }
    );
  });

  // delete document
  app.delete(URI.DOC, function(req, res, next) {
    req.mongodb.col.remove(
      {_id: new ObjectID(req.params.docid)},
      function(err, nbRemoved) {
        res.json({removed: nbRemoved});
      }
    );
  });
};

exports.setup = setup;

