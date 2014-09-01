var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require(__dirname + "/config.js");
var log4js = require('log4js');

var logger = log4js.getLogger("server");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(express.static(__dirname + "/../www"));
app.use(function(req, res, next){
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,HEAD,OPTIONS");
  next();
});

var getApp = function(cb){
  var apps = require(__dirname + '/router').apps;
  var storeConfig = config.store || {};
  if (!storeConfig.conn) {
    return cb(apps.conn());
  }
  var store = require(__dirname + '/store.js').storel;
  store.connect(storeConfig.conn, function(err, connector){
    if (!storeConfig.db) {
      return cb(
        apps.db(function(req, cb){
          cb(connector.conn);
        })
      );
    }
    var db = connector.conn.db(storeConfig.db);
    if (!storeConfig.col) {
      return cb(
        apps.col(function(req, cb){
          cb(db);
        })
      );
    }
    db.collection(storeConfig.col, function(err, col){
      return cb(
        apps.doc(function(req, cb){
          cb(col);
        })
      );
    });
  });
}

getApp(function(mongoresApp){
  app.use('/api', mongoresApp);
  app.listen(config.app.server_port, function() {
    logger.info('listening on port', config.app.server_port);
  });
});

