var log4js = require('log4js');
var express = require('express');
var store = require(__dirname + '/../store.js').store;

var logger = log4js.getLogger('connect');

var setup = exports.setup = function(prefix, mountApp) {
  prefix = prefix || 'connections';
  var app = express();

  prefix = '/' + prefix;
  // get connections
  app.get(prefix, function(req, res, next) {
    res.json(store.getConnections());
    next();
  });

  // connect
  app.post(prefix, function(req, res, next) {
    var params = req.body;
    params.host = params.host || '127.0.0.1';
    params.port = parseInt(params.port || '27017');
    // TOOD user, password
    store.connect(params, function(err, connector){
     if (err) {
        logger.error('can not connect: ', params, err);
        res.json({err: err, params: params});
      } else {
        res.json({ connected: connector.key });
      }
      next();
    });
  });

  prefix += '/:connId';
  // disconnect
  app.delete(prefix, function(req, res, next) {
    store.disconnect(req.params.connId, function(err){
      res.json({});
      next();
    });
  });

  app.all(prefix + '/*', function(req, res, next){
    var conn = store.get(req.params.connId);
    if (!conn) {
      res.json({err: 'not connected'});
    } else {
      if (!req.mongodb) req.mongodb = {};
      req.mongodb.conn = conn;
      next();
    }
  });

  var getAdmin = function(req) { return req.mongodb.conn.db('local').admin(); };

  // get buildInfo
  app.get(prefix + '/buildInfo', function(req, res, next) {
    getAdmin(req).buildInfo(function(err, result) { res.json(result); });
  });

  // get serverStatus
  app.get(prefix + '/serverStatus', function(req, res, next) {
    getAdmin(req).serverStatus(function(err, result) { res.json(result); });
  });

  // get replSetGetStatus
  app.get(prefix + '/replSetGetStatus', function(req, res, next) {
    getAdmin(req).replSetGetStatus(function(err, result) { res.json(result); });
  });

  if (mountApp) {
    app.use(prefix + '/', mountApp);
  }

  return app;
};

