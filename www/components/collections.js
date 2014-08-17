F("collections", F.Component.extend({
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

