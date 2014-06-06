Fractal("data_table", Fractal.Component.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.db || data.col) self.load();
    });
  },
  afterRender: function(callback) {
    var self = this;
    Fractal.getTemplate("data_table_thead", function(data){
      self.theadTemplate = Hogan.compile(data);
      Fractal.getTemplate("data_table_tbody", function(data){
        self.tbodyTemplate = Hogan.compile(data);
        $('.btn-load_more').click(function(){
          self.update();
        });
        self.update(callback);
      });
    });
  },
  update: function(callback) {
    var self = this;
    $('.btn-load_more').hide();

    self.options.skip = self.current;
    var query = self.query + "?options=" + encodeURIComponent(JSON.stringify(self.options));
    Fractal.require(query, {force: true}, function(data){
      // TODO if (data.err) { ... }
      var fieldChanged = {};
      var flattenData = [];
      data.forEach(function(v){
        var f = MONGRES.flatten(v);
        for (var i in f) {
          if (!(i in self.fieldMask)) {
            fieldChanged[i] = true;
            self.fieldMask[i] = true;
          }
        }
        flattenData.push(f);
      });

      var fields = [];
      var insertCols = [];
      for (var i in self.fieldMask) {
        fields.push(i);
      };
      fields.sort();
      for (var i in fields) {
        if (fields[i] in fieldChanged && i>0)
          insertCols.push({me: i, after: fields[i-1]});
      }

      records = [];
      flattenData.forEach(function(d){
        r = {_id: d._id, values: []};
        fields.forEach(function(f){
          r.values.push({k: f, v: d[f]});
        });
        records.push(r);
      });

      if (insertCols.length) {
        var thead = self.theadTemplate.render({fields: fields});
        self.$container.find("thead").html(thead);
        if (self.current > 0) {
          // col changed, update existing data
          for (var i in insertCols) {
            console.log(i, insertCols);
            var $after = self.$container.find('td[data-col="' + insertCols[i].after + '"]');
            var $me = $('<td data-col="' + insertCols[i].me + '"></td>');
            $after.after($me);
          }
        }
      }

      var tbody = self.tbodyTemplate.render({records: records});
      if (self.current > 0) {
        self.$container.find("tbody tr:last-child").after(tbody);
      } else {
        self.$container.find("tbody").html(tbody);
      }

      self.current += records.length;
      if (self.current < self.total) $('.btn-load_more').show();
      if (callback) callback();
    });
  },
  getData: function(callback){
    var self = this;
    if (!Fractal.env.db || !Fractal.env.col) {
      self.data = {};
      return callback();
    }
    self.query = "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col;
    var countQuery = self.query + "/stats";
    Fractal.require(countQuery, {forced: true}, function(data){
      self.total = data.count;
      self.current = 0;
      self.fieldMask = {};
      self.options = { limit: 100 };
      self.allData = {};
      callback();
    });
  }
}));

