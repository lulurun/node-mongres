F("header", F.Component.extend({
  afterRender: function(cb){
    var self = this;
    self.$('#btn-toggle-sidebar').click(function(){
      self.publish("toggle.sidebar");
    });
    cb();
  },
  getData: function(cb) {
    this.data = {
      reset_col: F.env.page === "data_table2"
    }
    cb();
  }
}));

F("resetColumnButton", F.Component.extend({
  show: function(){
    return F.env.page === "data_table2";
  },
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.data = {};
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.page && self.show() !== self.data.show) self.load();
    });
  },
  getData: function(cb){
    this.data.show = self.show();
    cb();
  }
}));

F("toggleSidebar", F.Component.extend({
  template: '<span class="glyphicon glyphicon-step-{{icon}}"></span>',
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe("toggle.sidebar", function(){
      self.load();
    });
  },
  getData: function(cb){
    this.icon = (this.icon === "backward") ? "forward" : "backward";
    this.data = { icon: this.icon };
    cb();
  }
}));

F("navi", F.Component.extend({
  naviItems: {
    conn: [{page: "connInfo"}],
    db: [{page: "dbStats"}],
    col: [{page: "data_table2"}, {page: "colStats", name: "stats"}]
  },
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col || data.page) self.load();
    });
  },
  getData: function(callback){
    var self = this;
    var items = [];
    var params = {};

    for (var i in self.naviItems) {
      if (F.env[i]) {
        var naviItem = self.naviItems[i];
        naviItem.forEach(function(v){
          params.page = v.page;
          for (var j in self.naviItems) {
            if (F.env[j]) params[j] = F.env[j];
          }
          items.push({
            link: "#" + F.encodeParam(params),
            name: v.name || F.env[i],
            active: v.page === F.env.page
          })
        })
      }
    }
    self.data = {
      items: items,
    };
    callback();
  }
}));

