F("databases", F.Component.extend({
  afterRender: function(cb) {
    var self = this;
    self.$("#btn-createDb").click(function(){
      var dbName = self.$("#input-dbName").val().trim();
      if (!dbName) return;
      MONGRES.client.createDb(F.env.conn, dbName, function(){
        self.load();
      });
    });
    cb();
  },
  getData: function(cb) {
    var self = this;
    F.require("conn/" + F.env.conn + "/db", function(data){
      if (data && data.err) {
        return F.next("connect");
      }
      self.data = {
        databases: data.databases,
        removable: function() {
          return this.name !== "local" && this.name !== 'admin';
        }
      };
      cb();
    });
  }
}));

