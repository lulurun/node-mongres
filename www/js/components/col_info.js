Fractal("colStats", Fractal.Components.basicInfo.extend({
  title: "Collection Stats",
  getQuery: function(){
    return "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col + "/stats";
  }
}));

Fractal("col_info", Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);

    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (!self.rendered) return;
      if (data.show) {
        self.componentName = Fractal.env.show || "colStats";
        self.load();
      }
    });
  },
  getData: function(callback) {
    this.data = { name: this.componentName || "colStats" };
    callback();
  }
}));

