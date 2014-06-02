var body = Fractal.Component.extend({
  getData: function(callback){
    this.data = { page: Fractal.env.page };
    callback();
  }
});
