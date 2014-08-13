F("connInfo", F.Component.extend({loadOnce: true}));

F("buildInfo", F.Components.basicInfo.extend({
  title: "Build Info",
  getQuery: function(){ return "connections/" + F.env.conn + "/buildInfo"; }
}));

F("serverStatus", F.Components.basicInfo.extend({
  title: "Server Status",
  getQuery: function(){ return "connections/" + F.env.conn + "/serverStatus"; }
}));

F("replSetStatus", F.Components.basicInfo.extend({
  title: "ReplSet Status",
  getQuery: function(){ return "connections/" + F.env.conn + "/replSetGetstatus"; }
}));

F("dbList", F.Component.extend({
  getData: function(callback) {
    var self = this;
    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) return Fractal.next("connect");
    Fractal.require("connections/" + Fractal.env.conn + "/databases", function(data){
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

