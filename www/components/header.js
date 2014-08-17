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

