F("body", F.Components.layout_vsp2.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.splitterInitPos = 300;
    self.first = { name: "sidebar" };
    self.second = { name: "contents"};
    self.subscribe("toggle.sidebar", function(topic, data){
      if (self.pos) {
        self.lastPos = self.pos;
        self.split(0);
      } else self.split(self.lastPos);
    });
    self.subscribe("open.sidebar", function(topic, data){
      self.__split(self.lastPos);
    });
  },
  getData: function(cb){
    if (!F.env.conn) {
      console.error("no connection");
      F.navigate("connect");
    }
    this._super(cb);
  }
}));

F("contents", F.Components.Router.extend({
  init: function(name, $container) {
    this._super(name, $container);
    $container.css("padding-top", 60);
  },
  getComponentName: function(data, cb){
    if (data.page) {
      cb(F.env.page);
    } else {
      if (this.data && this.data.componentName) cb();
      else cb(F.env.page || "databases");
    }
  }
}));

F("buildInfo", F.Components.basicInfo.extend({
  title: "Build Info",
  getQuery: function(){ return "conn/" + F.env.conn + "/buildInfo"; }
}));

F("serverStatus", F.Components.basicInfo.extend({
  title: "Server Status",
  getQuery: function(){ return "conn/" + F.env.conn + "/serverStatus"; }
}));

F("replSetStatus", F.Components.basicInfo.extend({
  title: "ReplSet Status",
  getQuery: function(){ return "conn/" + F.env.conn + "/replSetGetstatus"; }
}));

F("dbStats", F.Components.basicInfo.extend({
  title: "DB Stats",
  getQuery: function(){ return "conn/" + F.env.conn + "/db/" + F.env.db; }
}));

F("colStats", F.Components.basicInfo.extend({
  title: "Collection Stats",
  getQuery: function(){
    return "conn/" + F.env.conn + "/db/" + F.env.db + "/col/" + F.env.col;
  }
}));

