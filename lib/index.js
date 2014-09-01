var objectTypes = exports.objectTypes = ['conn', 'db', 'col', 'doc'];

var apps = exports.apps = {};
apps.doc = function(getCollection) {
  return require(__dirname + '/router/doc').setup('doc', getCollection);
};

apps.col = function(getDatabase) {
  return require(__dirname + '/router/col').setup('col', getDatabase, apps.doc());
};

apps.db = function(getConnection) {
  return require(__dirname + '/router/db').setup('db', getConnection, apps.col());
};

apps.conn = function() {
  return require(__dirname + '/router/conn').setup('conn', apps.db());
};

var store = exports.store = require(__dirname + '/store').store;

