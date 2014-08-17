F("databases", F.Component.extend({
  getData: function(callback) {
    var self = this;
    F.require("connections/" + F.env.conn + "/databases", function(data){
      if (data && data.err) {
        return F.next("connect");
      }
      self.data = {
        databases: data.databases,
        removable: function() { return this.name !== "local"; }
      };
      callback();
    });
  }
}));

