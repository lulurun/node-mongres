Fractal("main", Fractal.Components.Router.extend({
  onEnvChange: function(data) {
    if (data.page) this.load();
  },
  getData: function(callback) {
    this.data = { componentName: Fractal.env.page || "connect" };
    callback();
  }
}));

