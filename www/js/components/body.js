Fractal("body", Fractal.Component.extend({}));

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
      if (Fractal.env.show == "colStats") active = 3;
      else active = 2;
    }

    if (items.length) items[active].active = true;
    self.data = {
      enabled: !!items.length,
      items: items
    };
    callback();
  }
}));

Fractal("contents", Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col) self.load();
    });
  },
  getData: function(callback){
    var self = this;

    var connId = Fractal.env.conn || MONGRES.currentConn;
    if (!connId) return Fractal.next("connect");
    self.data = {};

    if (Fractal.env.db && Fractal.env.col) {
      //self.data.name = "data_table";
      self.data.name = "col_info"
    } else if (Fractal.env.db && !Fractal.env.col) {
      self.data.name = "db_info";
    } else if (!Fractal.env.db && !Fractal.env.col) {
      self.data.name = "conn_info";
    } else {
      console.error("something wrong");
      return Fractal.next("connect");
    }
    callback();
  }
}));

