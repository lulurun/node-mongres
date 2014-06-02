var main = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.page) self.load();
    });
  },
  getData: function(callback) {
    if (!Fractal.env.page) Fractal.env.page = "viewer";
    this.data = { page: Fractal.env.page };
    callback();
  }
});

