Fractal("viewer", Fractal.Components.layout_vsp2.extend({
  loadOnce: true,
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.splitterInitPos = 300;
    self.first = { name: "sidebar" };
    self.second = { name: "body"};
  }
}));


