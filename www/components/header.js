F("header", F.Component.extend({
  afterRender: function(cb){
    var self = this;
    self.$('#btn-toggle-sidebar').click(function(){
      self.publish("toggle.sidebar");
    });
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
