var main = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (!self.rendered) return;
      if (data.page && data.page != self.data.page) self.load();
    });
  },
  getData: function(callback) {
    this.data = { page: Fractal.env.page || "connect" };
    callback();
  }
});

