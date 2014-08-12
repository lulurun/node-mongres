F("body", F.Components.layout_vsp2.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.splitterInitPos = 300;
    self.first = { name: "sidebar" };
    self.second = { name: "viewer_body"};
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

F("viewer_body", F.Component.extend({}));

Fractal("navi", Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col || data.show) self.load();
    });
  },
  getData: function(callback){
    var self = this;
    var items = [];
    var active = 0;
    if (Fractal.env.conn) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn,
        name: Fractal.env.conn
      });
    }
    if (Fractal.env.db) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn + "&db=" + Fractal.env.db,
        name: Fractal.env.db
      });
      active = 1;
    }
    if (Fractal.env.col) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn + "&db=" + Fractal.env.db + "&col=" + Fractal.env.col,
        name: Fractal.env.col
      });
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn + "&db=" + Fractal.env.db + "&col=" + Fractal.env.col + "&show=colStats",
        name: "Stats"
      });
      active = (Fractal.env.show == "colStats") ? 3 : 2;
    }

    if (items.length) items[active].active = true;
    self.data = {
      enabled: !!items.length,
      items: items
    };
    callback();
  }
}));

Fractal("contents", Fractal.Components.Router.extend({
  getComponentName: function(data, callback){
    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) {
      console.error("no connection");
      return Fractal.next("connect");
    }
    var componentName = "";
    if (Fractal.env.db && Fractal.env.col) {
      if (Fractal.env.show == "colStats") componentName = "colStats";
      else componentName = "data_table2";
    } else if (Fractal.env.db && !Fractal.env.col) {
      componentName = "dbStats";
    } else {
      componentName = "conn_info";
    }
    callback(componentName);
  }
}));

Fractal("dbStats", Fractal.Components.basicInfo.extend({
  title: "DB Stats",
  getQuery: function(){ return "connections/" + Fractal.env.conn + "/databases/" + Fractal.env.db; }
}));

Fractal("colStats", Fractal.Components.basicInfo.extend({
  title: "Collection Stats",
  getQuery: function(){
    return "connections/" + Fractal.env.conn + "/databases/" + Fractal.env.db + "/collections/" + Fractal.env.col;
  }
}));

