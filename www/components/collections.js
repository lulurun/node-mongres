F("collections", F.Component.extend({
  afterRender: function(cb) {
    var self = this;
    self.$("#btn-createCollection").click(function(){
      var colName = self.$("#input-colName").val().trim();
      if (!colName) return;
      MONGRES.client.createCollection(F.env.conn, F.env.db, colName, function(){
        self.load();
      });
    });
    self.$(".btn-remove").click(function(){
      var res = confirm("are you sure ?");
      if (!res) return;
      var colName = $(this).closest(".collection").data("id");
      MONGRES.client.dropCollection(F.env.conn, F.env.db, colName, function(){
        self.load();
      });
    });
    cb();
  },
  getData: function(callback) {
    var self = this;
    F.require(
      "connections/" + F.env.conn + "/databases/" + F.env.db + "/collections",
      function(data){
        if (data && data.err) {
          return Fractal.next("connect");
        }
        data = data.map(function(v){
          return { name: v.name.replace(F.env.db + ".", "") };
        });
        self.data = {
          collections: data,
          removable: function() { return this.name !== "system.indexes"; }
        };
        callback();
      }
    );
  }
}));

