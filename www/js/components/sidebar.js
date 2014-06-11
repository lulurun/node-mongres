Fractal("sidebar", Fractal.Component.extend({
  getData: function(callback) {
    var self = this;
    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) {
      console.error("no connection");
      return Fractal.next("connect");
    }
    Fractal.require("conn/" + Fractal.env.conn + "/db", function(data){
      if (data && data.err) {
        console.error("can not get db list", data);
        return Fractal.next("connect");
      }
      data.databases.sort(function(a, b){ return a.name < b.name ? -1 : 1; });
      self.data = data;
      callback();
    });
  }
}));

Fractal("db", Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.dbname = self.$container.data("dbname");
  },
  getData: function(callback) {
    var self = this;
    var query = "conn/" + Fractal.env.conn + "/db/" + self.dbname + "/col";
    Fractal.require(query, function(data){
      data.sort(function(a, b){ return a.name < b.name ? -1 : 1; });
      self.data = {
        conn: Fractal.env.conn,
        db: self.dbname,
        userdb: self.dbname != "local",
        collections: data,
        colname: function(){
          return  this.name.split(".").slice(1).join(".");
        }
      };
      callback();
    });
  }
}));

