var log4js = require('log4js');
var express = require('express');
var store = require(__dirname + '/../store.js').store;

var logger = log4js.getLogger('col');

var setup = exports.setup = function(prefix, getDatabase, mountApp) {
  if (typeof(getDatabase) === 'object') {
    mountApp = getDatabase;
    getDatabase = null;
  }
  getDatabase = getDatabase || function(req, cb) {
    cb(req.mongodb.db);
  };
  prefix = prefix || 'collections';
  var app = express();

  prefix = '/' + prefix;
  // get collections
  app.get(prefix, function(req, res, next) {
    getDatabase(req, function(db){
      db.listCollections().toArray(function(err, items) {
        res.json(items);
      });
    });
  });

  // create collection
  app.post(prefix, function(req, res, next) {
    var name = req.body.name;
    getDatabase(req, function(db){
      db.collection(name, function(err, col) {
        col.insert({}, function(){
          col.remove({}, function(){
            res.json({});
          });
        });
      });
    });
  });

  prefix += '/:colId';

  // drop collection
  app.delete(prefix, function(req, res, next) {
    getDatabase(req, function(db){
      db.collection(req.params.colId, function(err, col) {
        col.drop(function(err, result) {
          res.json(result);
        });
      });
    });
  });

  // get collection stats
  app.get(prefix, function(req, res, next) {
    getDatabase(req, function(db){
      db.collection(req.params.colId, function(err, col) {
        col.stats(function(err, stats) {
          res.json(stats);
        });
      });
    });
  });

  if (mountApp) {
    app.all(prefix + '/*', function(req, res, next) {
      getDatabase(req, function(db){
        db.collection(req.params.colId, function(err, col) {
          req.mongodb.col = col;
        });
        next();
      })
    });

    app.use(prefix + '/', mountApp);
  }

  return app;
};

