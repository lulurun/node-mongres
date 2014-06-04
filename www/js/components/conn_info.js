var conn_info = Fractal.Component.extend({ loadOnce: true });

var buildInfo = Fractal.Components.basicInfo.extend({
  title: "Build Info",
  query: "conn/" + Fractal.env.conn + "/buildInfo"
});

var serverStatus = Fractal.Components.basicInfo.extend({
  title: "Server Status",
  query: "conn/" + Fractal.env.conn + "/serverStatus"
});

var replSetStatus = Fractal.Components.basicInfo.extend({
  title: "ReplSet Status",
  query: "conn/" + Fractal.env.conn + "/replSetGetstatus"
});

var db_list = Fractal.Component.extend({
  getData: function(callback) {
    var self = this;
    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) return Fractal.next("connect");
    Fractal.require("conn/" + Fractal.env.conn + "/db", function(data){
      if (data && data.err) {
        return Fractal.next("connect");
      }
      self.data = {
        databases: data.databases,
        removable: function() { return this.name !== "local"; }
      };
      callback();
    });
  }
});

