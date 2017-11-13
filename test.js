var Db = require('mongodb').Db,
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers;

var url = 'mongodb://localhost:27017';

MongoClient.connect(url, (err, conn) => {
  if (!err && conn) {
    console.log('connected!!!');
  } else {
    logger.error("error client.open:", err);
  }
});


