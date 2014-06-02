var db = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.dbname = self.$container.data("dbname");
  },
  getData: function(callback) {
    var self = this;
    var query = "conn/" + Fractal.env.conn + "/db/" + self.dbname + "/col";
    Fractal.require(query, function(data){
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
});

var sidebar = Fractal.Component.extend({
  getData: function(callback) {
    var self = this;
    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) return Fractal.next("connect");
    Fractal.require("conn/" + Fractal.env.conn + "/db", function(data){
      if (data && data.err) {
        return Fractal.next("connect");
      }
      self.data = data;
      callback();
    });
  }
});
