F("connect", F.Component.extend({
  init: function(name, $container) {
    this._super(name, $container);
    this.lastConnected = new MONGRES.kv("lastConnected");
  },
  afterRender: function(callback) {
    var self = this;
    self.$('#btn-connect').click(function(){
      var params = {};
      self.$(".form-connect input").each(function(){
        var $this = $(this);
        var key = $this.attr("name");
        var val = $this.val();
        if (val) params[key] = val;
      });
      MONGRES.client.connect(params, function(result){
        console.log("connect result", result);
        if (result.err) {
          console.error("failed to connect", params, result);
        } else {
          self.lastConnected.setAll(params);
          F.navigate("connInfo", { conn: result.connected });
        }
      });
    });
    callback();
  },
  getData: function(callback) {
    var self = this;
    self.data = self.lastConnected.getAll();
    F.require("connections", function(data){
      console.log("connections", data);
      self.data.conns = data;
      callback();
    });
  }
}));

