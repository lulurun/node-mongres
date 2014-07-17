F("viewer", F.Components.layout_vsp2.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.splitterInitPos = 300;
    self.first = { name: "sidebar" };
    self.second = { name: "body"};
  },
  getData: function(cb){
    if (!F.env.conn) {
      console.error("no connection");
      F.navigate("connect");
    }
    this._super(cb);
  }
}));

