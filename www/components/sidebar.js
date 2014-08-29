F("sidebar", F.Component.extend({
  onAllLoaded: function(cb){
    var self = this;
    self.$('.list-group-item').click(function(){
      self.$('.list-group-item').removeClass("active");
      $(this).addClass("active");
    });
    cb();
  },
  getData: function(callback) {
    var self = this;
    F.require("conn/" + F.env.conn + "/db", function(data){
      if (!data || data.err) {
        console.error("can not get db list", data);
        F.navigate("connect");
        callback();
        return;
      }
      data.databases.sort(function(a, b){ return a.name < b.name ? -1 : 1; });
      data.connId = F.env.conn;
      self.data = data;
      callback();
    });
  }
}));

F("db", F.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.dbname = self.$container.data("dbname");
  },
  getData: function(callback) {
    var self = this;
    var query = "conn/" + Fractal.env.conn + "/db/" +
      self.dbname + "/col";
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

