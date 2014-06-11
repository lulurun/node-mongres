Fractal("main", Fractal.Components.Router.extend({
  getComponentName: function(data, callback){
    callback(Fractal.env.page || "connect");
  }
}));
