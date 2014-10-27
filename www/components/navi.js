F("navi", F.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col || data.page) self.load();
    });
  },
  afterRender: function(cb) {
    var self = this;
    self.$('.btn-menu-item a').click(function(){
      self.$('.btn-menu-item').removeClass('active');
      $(this).closest('.btn-menu-item').addClass('active');
    });
    self.$('#btn-toggle-sidebar').click(function(){
      self.publish("toggle.sidebar");
    });
    cb();
  },
  getData: function(cb){
    var self = this;
    var linkQuery = "";
    self.data = {};
    ['conn', 'db', 'col'].forEach(function(v){
      if (F.env[v]) {
        linkQuery += "&" + v + "=" + F.env[v];
        self.data[v] = F.env[v];
      }
    });
    self.data.linkQuery = linkQuery;
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

