Fractal("conn_info", Fractal.Component.extend({ loadOnce: true }));

Fractal("buildInfo", Fractal.Components.basicInfo.extend({
  title: "Build Info",
  query: "conn/" + Fractal.env.conn + "/buildInfo"
}));

Fractal("serverStatus", Fractal.Components.basicInfo.extend({
  title: "Server Status",
  query: "conn/" + Fractal.env.conn + "/serverStatus"
}));

Fractal("replSetStatus", Fractal.Components.basicInfo.extend({
  title: "ReplSet Status",
  query: "conn/" + Fractal.env.conn + "/replSetGetstatus"
}));

Fractal("db_list", Fractal.Component.extend({
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
}));

