var log4js = require('log4js');
var logger = log4js.getLogger("store");

var store = (function(){
  var __getKey = function(params) {
    return params.host + "_" + params.port;
  };
  var __connectors = {};

  var store = {};
  store.get = function(key) {
    if (typeof(key) !== 'string') key = __getKey(key);
    var connector = __connectors[key];
    return connector && connector.conn;
  };

  store.getConnections = function(){
    var list = [];
    for (var i in __connectors) {
      var connector = __connectors[i];
      if (connector.conn) list.push(i);
    }
    return list;
  };

  store.connect = function(params, callback) {
    var key = __getKey(params);
    if (!(key in __connectors)) {
      __connectors[key] = new Connector(params, key);
    }
    var connector = __connectors[key];
    connector.connect(function(err, conn){
      if (err) {
        logger.error("error connect: ", params, err);
        callback(err);
      } else {
        callback(null, connector);
      }
    });
  };

  return store;
})();

var Connector = (function(){
  var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers;

  var Connector = function(params, key){
    this.key = key;
    this.params = params;
    this.cbq = [];
    this.connecting = false;
    this.conn = null;
  };

  var proto = Connector.prototype;

  proto.connect = function(callback) {
    var self = this;
    if (self.conn) {
      return callback(null, self.conn);
    } else {
      if (self.connecting) {
        if (callback) self.cbq.push(callback);
      } else {
        self.connecting = true;
        MongoClient.connect(
          'mongodb://' + self.params.host + ':' + self.params.port,
          (err, conn) => {
            self.connecting = false;
            if (!err && conn) {
              self.conn = conn;
            } else {
              logger.error("error connect:", err);
            }
            while (self.cbq.length) {
              (self.cbq.pop())(err);
            }
            callback(err, conn);
          }
        );
      }
    }
  };

  return Connector;
})();

exports.store = store;
