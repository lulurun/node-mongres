F("connect", F.Component.extend({
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
      MONGRES.connect(params, function(result){
        if (result.err) {
          console.error("failed to connect", params, result);
        } else {
          localStorage.setItem("last_connected", JSON.stringify(params));
          MONGRES.currentDB = result.connected;
          F.navigate("viewer", { conn: result.connected });
        }
      });
    });
    callback();
  },
  getData: function(callback) {
    var self = this;
    var lastConnected = JSON.parse(localStorage.getItem("last_connected") || "{}");
    self.data = lastConnected;
    F.require("conn", function(data){
      self.data.conns = data;
      callback();
    });
  }
}));

