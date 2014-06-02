var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var ObjectID = require('mongodb').ObjectID;

var StoreFactory = (function(){
  var __getKey = function(params) {
    return params.host + ":" + params.port;
  };
  var __stores = {};
  var StoreFactory = {};
  StoreFactory.create = function(params, callback) {
    var key = __getKey(params);
    if (!(key in __stores)) {
      __stores[key] = new Store(params, key);
    }
    var store = __stores[key];
    store.connect(function(err){
      if (err) {
        delete __stores[store.key];
        store = null;
      }
      callback(err, store);
    });
  };
  StoreFactory.get = function(key) {
    if (key in __stores && !__stores[key].connecting) {
      return __stores[key];
    }
    return null;
  };
  StoreFactory.getAll = function() {
    var list = [];
    for (var i in __stores) {
      var store = __stores[i];
      if (!store.connecting) list.push(store.key);
    }
    return list;
  };

  var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers;

  var Store = function(params, key){
    var self = this;
    self.key = key;
    self.cbq = [];
    self.connecting = true;
    self.conn = null;

    // TODO check params
    var client = new MongoClient(new Server(params.host, params.port), {native_parser: true});
    client.open(function(err, conn){
      console.log(err, conn);
      if (!err && conn) {
        self.conn = conn;
        self.connecting = false;
      }
      while (self.cbq.length) {
        (self.cbq.pop())(err);
      }

    });
  };

  var proto = Store.prototype;

  proto.connect = function(callback) {
    var self = this;
    if (self.connecting) {
      if (callback) self.cbq.push(callback);
    } else {
      if (self.err) callback(err);
      else callback(null);
    }
  };

  proto.admin = function(callback) {
    return this.conn.db("test").admin();
  };

  proto.db = function(name) {
    return this.conn.db(name);
  };

  (function(){
    // proto.open = function(dbname, callback) {
    //   var self = this;
    //   if (dbname in self.dbs) {
    //     var db = self.dbs[dbname];
    //     if (db.connecting) {
    //       if (!(dbname in self.cbq)) self.cbq[dbname] = [];
    //       self.cbq[dbname].push(callback);
    //     } else {
    //       callback(self.dbs[dbname]);
    //     }
    //     return;
    //   }
    //   self.dbs[dbname] = { connecting: true };
    //   if (config.db.connect_to_replset) {
    //     var discovery = new Db("test", new Server(config.db.host, config.db.port), {w: 1});
    //     discovery.open(function(err, db) {
    //       discovery.admin().replSetGetStatus(function(err, info) {
    //         var replSet = info.members.map(function(v) {
    //           var hostport = v.name.split(':');
    //           return new Server(hostport[0], hostport[1]);
    //         });
    //         discovery.close();
    //         store._connect(dbname, new ReplSetServers(replSet), callback);
    //       });
    //     });
    //   } else {
    //     store._connect(dbname, new Server(config.db.host, config.db.port), callback);
    //   }
    // };
  })()

  return StoreFactory;
})();

var app = express();
app.use(bodyParser());
app.use(logger());
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
app.del('/api/:db/:collection', function(req, res) {
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

