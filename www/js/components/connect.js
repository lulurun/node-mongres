var connect = Fractal.Component.extend({
  afterRender: function(callback) {
    var self = this;
    $('#btn-connect').click(function(){
      var params = {};
      self.$container.find(".form-connect input").each(function(){
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
          Fractal.next("viewer", { conn: result.connected });
        }
      });
    });
    callback();
  },
  getData: function(callback) {
    var self = this;
    var lastConnected = JSON.parse(localStorage.getItem("last_connected") || "{}");
    ["host", "port", "user", "password"].forEach(function(v){
      lastConnected[v] = lastConnected[v] || "";
    });
    self.data = { last_conn: lastConnected };
    Fractal.require("conn", function(data){
      console.log(data);
      self.data.conns = data;
    });
    callback();
  }
});
