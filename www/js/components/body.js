var body = Fractal.Component.extend({});

var navi = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col) self.load();
    });
  },
  getData: function(callback){
    var self = this;
    var items = [];
    if (Fractal.env.conn) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn,
        name: Fractal.env.conn
      })
    }
    if (Fractal.env.db) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn + "&db=" + Fractal.env.db,
        name: Fractal.env.db
      })
    }
    if (Fractal.env.col) {
      items.push({
        link: "#viewer&conn=" + Fractal.env.conn + "&db=" + Fractal.env.db + "&col=" + Fractal.env.col,
        name: Fractal.env.conn
      })
    }

    if (items.length) items[items.length-1].active = true;
    self.data = {
      enabled: !!items.length,
      items: items
    };
    callback();
  }
});

var contents = Fractal.Component.extend({
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
      self.data.name = "data_table";
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
});

var basicInfo = Fractal.Component.extend({
  loadOnce: true,
  compiledTemplate: (function(){
    var text = '{{#title}}<div class="panel panel-default">' +
      '<div class="panel-heading">{{title}}</div>' +
      '  <div class="panel-body">' +
      '    <dl class="dl-horizontal">' +
      '    {{#fields}}<dt>{{key}}&nbsp;</dt><dd>{{val}}&nbsp;</dd>{{/fields}}' +
      '    </dl>' +
      '  </div>' +
      '</div>{{/title}}';
    return Hogan.compile(text);
  })(),
  getData: function(callback) {
    var self = this;
    if (!self.title || !self.query) {
      console.error(self.name, "missing title/query");
      callback();
    }
    else {
      Fractal.require(self.query, function(data){
        var fields = [];
        for (var i in data) {
          fields.push({ key:i, val:data[i] });
        }
        if (fields.length) {
          self.data = {
            title: self.title,
            fields: fields
          };
        }
        callback();
      });
    }
  }
});

var buildInfo = basicInfo.extend({
  title: "Build Info",
  query: "conn/" + Fractal.env.conn + "/buildInfo"
});

var serverStatus = basicInfo.extend({
  title: "Server Status",
  query: "conn/" + Fractal.env.conn + "/serverStatus"
});

var replSetStatus = basicInfo.extend({
  title: "ReplSet Status",
  query: "conn/" + Fractal.env.conn + "/replSetGetstatus"
});

var dbStats = basicInfo.extend({
  title: "stats",
  query: "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/stats"
});

var conn_info = Fractal.Component.extend({ loadOnce: true });
var db_info = Fractal.Component.extend({ loadOnce: true });
var collection = Fractal.Component.extend({ loadOnce: true });

var data_table = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.db || data.col) self.load();
    });
  },
  getData: function(callback){
    var self = this;
    if (!Fractal.env.db || !Fractal.env.col) {
      self.data = {};
      return callback();
    }
    var query = "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col;
    Fractal.require(query, {forced: true}, function(data){
      if (data.err) {
        console.log(data.err);
        return callback();
      }
      var fieldMask = {};
      var fields = [];
      var records = [];
      data.forEach(function(v){
        var f = MONGRES.flatten(v);
        var values = [];
        for (var i in f) {
          if (!(i in fieldMask)) {
            fieldMask[i] = fields.length;
            fields.push(i);
          }
          values[fieldMask[i]] = f[i] + '';
        }
        records.push({ v: values });
      });

      var max = fields.length;
      records.forEach(function(v){
        var d = max - v.v.length;
        while(d--) v.v.push("");
      });

      self.data = {
        fields: fields,
        records: records
      };
      callback();
    });
  }
});

