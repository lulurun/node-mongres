var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require(__dirname + "/config.js");
var log4js = require('log4js');
var logger = log4js.getLogger("route.mongodb");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(express.static(__dirname + "/../www"));
app.use(function(req, res, next){
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,HEAD,OPTIONS");
  next();
});

if (config.store && config.store.host && config.store.port) {
  require(__dirname + "/route.mongodb.js").setup(app);
} else {
  var baseRoute = require(__dirname + "/route.connect.js");
  baseRoute.setup(app);
  require(__dirname + "/route.mongodb.js").setup(
    app, baseRoute.prefix, baseRoute.connect);
}

app.listen(config.app.server_port, function() {
  logger.info('listening on port', config.app.server_port);
});

