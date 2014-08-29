var config = {};
config.verbose = true;

config.app = {};
config.app.server_port = 8765;

config.store = {};
config.store.conn = {
  host: "127.0.0.1",
  port: 27017
};
config.store.db = "test_db";
config.store.col = "test_col";

module.exports = config;

