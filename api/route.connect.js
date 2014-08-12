var store = require(__dirname + "/store.js").store;
var log4js = require('log4js');
var logger = log4js.getLogger("route.connect");

var URI_MASTER = {
  CONNECTION_LIST: "/connections",
  CONNECTION: "/connections/:connid",
};

var connect = function(req, callback) {
  callback(store.get(req.params.connid));
};

var setup = function(app, prefix) {
  prefix = prefix || "/api";
  var URI = {};
  for (var i in URI_MASTER) {
    URI[i] = prefix + URI_MASTER[i];
  }

  // get connections
  app.get(URI.CONNECTION_LIST, function(req, res, next) {
    res.json(store.getConnections());
  });

  // connect
  app.post(URI.CONNECTION_LIST, function(req, res, next) {
    var params = req.body;
    params.host = params.host || "127.0.0.1";
    params.port = parseInt(params.port || "27017");
    // TOOD user, password
    store.connect(params, function(err, connector){
      if (err) {
        logger.error("can not connect: ", params, err);
        res.json({err: err, params: params});
      } else {
        res.json({ connected: connector.key });
      }
    });
  });

  // disconnect
  app.delete(URI.CONNECTION, function(req, res, next) {
    store.disconnect(req.params.connid, function(err){
      res.json({});
    });
  });

  exports.prefix = URI.CONNECTION;
};

exports.connect = connect;
exports.setup = setup;

