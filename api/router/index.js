var objectTypes = exports.objectTypes = ['conn', 'db', 'col', 'doc'];

var apps = exports.apps = {};
apps.doc = function(getCollection) {
  return require(__dirname + '/doc').setup('doc', getCollection);
};

apps.col = function(getDatabase) {
  return require(__dirname + '/col').setup('col', getDatabase, apps.doc());
};

apps.db = function(getConnection) {
  return require(__dirname + '/db').setup('db', getConnection, apps.col());
};

apps.conn = function() {
  return require(__dirname + '/conn').setup('conn', apps.db());
};

