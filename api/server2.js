var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var ObjectID = require('mongodb').ObjectID;

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

// connect to new MongoDB
app.post('/api/conn', function(req, res){
  var params = req.body;
  params.host = params.host || "127.0.0.1";
  params.port = parseInt(params.port || "27017");
  // TOOD user, password

  StoreFactory.create(params, function(err, store){
    if (err) res.json({err: err});
    else res.json({connected: store.key});
  });
});

// get connection list
app.get('/api/conn', function(req, res){
  res.json(StoreFactory.getAll());
});

app.all('/api/conn/:connid/*', function(req, res, next){
  var store = StoreFactory.get(req.params.connid);
  if (!store) res.json({err: "not connected"});
  else {
    res.store = store;
    next();
  }
});

// get connection info / buildInfo
app.get('/api/conn/:connid/buildInfo', function(req, res){
  res.store.admin().buildInfo(function(err, info){ res.json(info); });
});

// get connection info / serverStatus
app.get('/api/conn/:connid/serverStatus', function(req, res){
  res.store.admin().serverStatus(function(err, info){ res.json(info); });
});

// get connection info / replSetGetStatus
app.get('/api/conn/:connid/replSetGetStatus', function(req, res){
  res.store.admin().replSetGetStatus(function(err, info){ res.json(info); });
});

// get database list
app.get('/api/conn/:connid/db', function(req, res){
  res.store.admin().listDatabases(function(err, dbs){ res.json(dbs); });
});

// get db stats
app.get('/api/conn/:connid/db/:db/stats', function(req, res){
  res.store.db(req.params.db).stats(function(err, stats){ res.json(stats); });
});

// get collection list
app.get('/api/conn/:connid/db/:db/col', function(req, res){
  res.store.db(req.params.db).collectionNames(function(err, items){ res.json(items); });
});

// get db stats
app.get('/api/conn/:connid/db/:db/col/:col/stats', function(req, res){
  res.store.db(req.params.db).collection(req.params.col, function(err, col) {
    col.stats(function(err, stats){ res.json(stats); });
  });
});

function sendErr(res, err) {
  if (typeof(err) != "string") err = JSON.stringify(err);
  res.send(JSON.stringify({ok: 0, err: err}));
}

function convertId(data) {
  // TODO specify which field to be converted
  if (data._id && typeof(data._id) == "string") {
    data._id = new ObjectID(data._id);
  }
}

// //////////
// find
app.get('/api/conn/:connid/db/:db/col/:col', function(req, res) {
  var dbname = req.params.db;
  var colname = req.params.col;
  var query = req.param("query");
  if (query) {
    try {
      query = JSON.parse(unescape(query));
      convertId(query);
    } catch (e) {
      return sendErr(res, "bad query");
    }
  }
  var options = req.param("options");
  if (options) {
    try {
      options = JSON.parse(unescape(options));
    } catch (e) {
      return sendErr(res, "bad options");
    }
  }
  query = query || {};
  options = options || {};

  res.store.db(dbname).collection(colname, function(err, col){
    if (err) res.json({err: "failed to get col"});
    else {
      col.find(query, options, function(err, cursor) {
        if (err) return res.json({err: err});
        cursor.toArray(function(err, docs){
          if (err) return res.json({err: err});
          res.json(docs);
        });
      });
    }
  });
});


// //////////
// insert
app.post('/api/:db/:collection', function(req, res) {
  var dbname = req.params.db;
  var colname = req.params.collection;
  if (!req.body) {
    return sendErr(res, "empty body");
  }
  var data = Array.isArray(req.body) ? req.body[0] : req.body;
  convertId(data);

  store.open(dbname, function (db) {
    db.collection(colname, function(err, col) {
      if (err) return sendErr(res, err);
      col.insert(data, function(err, docs){
        res.send(JSON.stringify({ok: !err, err: err, docs: docs}));
      });
    });
  });
});

// //////////
// update
app.put('/api/:db/:collection', function(req, res) {
  var dbname = req.params.db;
  var colname = req.params.collection;
  var query = req.param("query");
  if (query) {
    try {
      query = JSON.parse(unescape(query));
      convertId(query);
    } catch (e) {
      return sendErr(res, "bad query");
    }
  }
  var options = req.param("options");
  if (options) {
    try {
      options = JSON.parse(unescape(options));
    } catch (e) {
      return sendErr(res, "bad options");
    }
  }
  query = query || {};
  options = options || {};
  if (!req.body) {
    return sendErr(res, "empty body");
  }
  var data = Array.isArray(req.body) ? req.body[0] : req.body;
  convertId(data);

  store.open(dbname, function (db) {
    db.collection(colname, function(err, col) {
      if (err) return sendErr(res, err);
      col.update(query, data, options, function(err){
        res.send(JSON.stringify({ok: !err, err: err}));
      });
    });
  });
});


// //////////
// delete
app.delete('/api/:db/:collection', function(req, res) {
  var dbname = req.params.db;
  var colname = req.params.collection;
  var query = req.param("query");
  if (query) {
    try {
      query = JSON.parse(unescape(query));
      convertId(query);
    } catch (e) {
      return sendErr(res, "bad query");
    }
  }
  query = query || {};

  store.open(dbname, function (db) {
    db.collection(colname, function(err, col) {
      if (err) return sendErr(res, err);
      col.remove(query, function(err){
        res.send(JSON.stringify({ok: !err, err: err}));
      });
    });
  });
});

var port = 8765;
app.listen(port, function() {
  console.info('listening on port', port);
});

