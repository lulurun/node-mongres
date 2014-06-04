var data_table = Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.db || data.col) self.load();
    });
  },
  getData: function(callback){
    var self = this;
    if (!Fractal.env.db || !Fractal.env.col) {
      self.data = {};
      return callback();
    }
    var query = "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col;
    Fractal.require(query, {forced: true}, function(data){
      if (data.err) {
        console.log(data.err);
        return callback();
      }
      var fieldMask = {};
      var fields = [];
      var records = [];
      data.forEach(function(v){
        var f = MONGRES.flatten(v);
        var values = [];
        for (var i in f) {
          if (!(i in fieldMask)) {
            fieldMask[i] = fields.length;
            fields.push(i);
          }
          values[fieldMask[i]] = f[i] + '';
        }
        records.push({ v: values });
      });

      var max = fields.length;
      records.forEach(function(v){
        var d = max - v.v.length;
        while(d--) v.v.push("");
      });

      self.data = {
        fields: fields,
        records: records
      };
      callback();
    });
  }
});

