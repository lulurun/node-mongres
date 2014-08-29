var log4js = require('log4js');
var express = require('express');
var store = require(__dirname + '/../store.js').store;

var logger = log4js.getLogger('db');

var setup = exports.setup = function(prefix, mountApp) {
  prefix = prefix || 'databases';
  var app = express();

  prefix = '/' + prefix;
  // get databases
  app.get(prefix, function(req, res, next) {
    req.mongodb.admin.listDatabases(function(err, dbs) {
      res.json(dbs);
    });
  });

  // create database
  app.post(prefix, function(req, res, next) {
    var name = req.body.name;
    var db = req.mongodb.conn.db(name);
    db.collection(name, function(err, col){
      col.insert({}, function(){
        col.remove({}, function(){
          db.dropDatabase(function(){
            res.json({});
          })
        });
      });
    });
  });

  prefix += '/:dbId';

  // drop database
  app.delete(prefix, function(req, res, next) {
    var db = req.mongodb.conn.db(req.params.dbId);
    db.dropDatabase(function(err, result) {
      res.json(result);
    });
  });

  // get database stats
  app.get(prefix, function(req, res, next) {
    var db = req.mongodb.conn.db(req.params.dbId);
    db.stats(function(err, stats) {
      res.json(stats);
    });
  });

  if (mountApp) {
    app.all(prefix + '/*', function(req, res, next) {
      req.mongodb.db = req.mongodb.conn.db(req.params.dbId);
      next();
    });

    app.use(prefix + '/', mountApp);
  }

  return app;
};

