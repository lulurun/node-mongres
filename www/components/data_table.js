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
    Fractal.getTemplate([
      "data_table_thead",
      "data_table_tbody",
      "data_table_col_selector"
    ], function(data){
      self.theadTemplate = data["data_table_thead"];
      self.tbodyTemplate = data["data_table_tbody"];
      self.selectorTemplate = data["data_table_col_selector"];
      $('.btn-load_more').click(function(){
        self.update();
      });
      self.update(callback);
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
          r.values.push({k: "col-" + f.replace(/\./g, "_"), v: d[f]});
        });
        records.push(r);
      });

      if (insertCols.length) {
        var selectorFields = fields.map(function(v){
          return {
            displayText: v,
            value: "col-" + v.replace(/\./g, "_")
          }
        });
        var selector = self.selectorTemplate.render({fields: selectorFields});
        self.$container.find("#col-selector").html(selector);
        $('.multiselect').multiselect({
          nonSelectedText: 'Show/Hide columns',
          onChange: function($e, checked){
            var col = "." + $e.val();
            if (checked) {
              self.$container.find(col).show();
            } else {
              self.$container.find(col).hide();
            }
          }
        });
        var headFields = fields.map(function(v){
          return {
            //value: v,
            displayParts: v.split("."),
            classValue: "col-" + v.replace(/\./g, "_")
          };
        });
        var thead = self.theadTemplate.render({ fields: headFields });
        self.$container.find("thead").html(thead);
        if (self.current > 0) {
          // col changed, update existing data
          for (var i in insertCols) {
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
    self.current = 0;

    Fractal.require([
      "bower_components/bootstrap-multiselect/js/bootstrap-multiselect.js",
      "bower_components/bootstrap-multiselect/css/bootstrap-multiselect.css"
    ], function(){
      if (!Fractal.env.db || !Fractal.env.col) {
        self.data = {};
        return callback();
      }
      self.query = "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col;
      var countQuery = self.query + "/stats";
      Fractal.require(countQuery, {forced: true}, function(data){
        self.total = data.count;
        self.fieldMask = {};
        self.options = { limit: 100 };
        self.allData = {};
        callback();
      });
    });
  }
}));

