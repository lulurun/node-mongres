var log4js = require('log4js');
var express = require('express');
var store = require(__dirname + '/../store.js').store;

var logger = log4js.getLogger('col');

var setup = exports.setup = function(prefix, mountApp) {
  prefix = prefix || 'collections';
  var app = express();

  prefix = '/' + prefix;
  // get collections
  app.get(prefix, function(req, res, next) {
    req.mongodb.db.collectionNames(function(err, items) {
      res.json(items);
    });
  });

  // create collection
  app.post(prefix, function(req, res, next) {
    var name = req.body.name;
    req.mongodb.db.collection(name, function(err, col) {
      col.insert({}, function(){
        col.remove({}, function(){
          res.json({});
        });
      });
    });
  });

  prefix += '/:colId';

  // drop collection
  app.delete(prefix, function(req, res, next) {
    req.mongodb.db.collection(req.params.colId, function(err, col) {
      col.drop(function(err, result) {
        res.json(result);
      });
    });
  });

  // get collection stats
  app.get(prefix, function(req, res, next) {
    req.mongodb.db.collection(req.params.colId, function(err, col) {
      col.stats(function(err, stats) {
        res.json(stats);
      });
    });
  });

  if (mountApp) {
    app.all(prefix + '/*', function(req, res, next) {
      req.mongodb.db.collection(req.params.colId, function(err, col) {
        req.mongodb.col = col;
      });
      next();
    });

    app.use(prefix + '/', mountApp);
  }

  return app;
};

