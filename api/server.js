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

var router = require(__dirname + '/router');

app.use(
  '/api', router.connect.setup(
    'conn', router.mongodb.setup(
      'db', router.collection.setup(
        'col', router.document.setup(
          'doc', router.collection.getCollection
        )
      )
    )
  )
);

app.listen(config.app.server_port, function() {
  logger.info('listening on port', config.app.server_port);
});

