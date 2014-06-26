Fractal("tbody", Fractal.Component.extend({
  template: '  {{#records}}' +
    '  <tr data-id="{{_id}}">' +
    '    {{#values}}' +
    '    <td class="{{k}}">{{v}}</td>' +
    '    {{/values}}' +
    '  </tr>' +
    '  {{/records}}',
  current: 0,
  options: {limit: 10},
  fieldByName: {},
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.DATA_TABLE.LOAD_MORE, function(topic, data){
      self.load();
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.$container.find(".col-" + data).show();;
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.$container.find(".col-" + data).hide();;
    });
  },
  afterRender: function(callback){
    callback();
  },
  render: function(callback) {
    var contents = Fractal.Render(this.template, this.data);
    this.$container.append(contents);
    callback();
  },
  getData: function(callback) {
    var self = this;
    if (!Fractal.env.db || !Fractal.env.col) {
      self.data = {};
      return callback();
    }
    self.options.skip = self.current;
    var query = "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/col/" + Fractal.env.col;
    var countQuery = query + "/stats";
    var dataQuery = query + "?options=" + encodeURIComponent(JSON.stringify(self.options));
    Fractal.require([countQuery, dataQuery], function(data){
      var total = data[countQuery].count;

      var flattenData = [];
      var fieldAdded = {};
      data[dataQuery].forEach(function(v){
        var f = MONGRES.flatten(v);
        for (var i in f) {
          if (!(i in self.fieldByName)) {
            fieldAdded[i] = true;
            self.fieldByName[i] = true;
          }
        }
        flattenData.push(f);
      });

      var fields = [];
      for (var i in self.fieldByName) fields.push({v: i, escaped: i.replace(/\./g, "_")});
      fields.sort(function(a, b) {return a.v > b.v ? 1 : -1;});

      self.publish(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, fields);

      records = [];
      flattenData.forEach(function(d){
        r = {_id: d._id, values: []};
        fields.forEach(function(f){ r.values.push({k: "col-" + f.escaped, v: d[f.v]}); });
        records.push(r);
      });
      self.data = { records: records };

      // if (fields.changed) update existing table
      if (self.current > 0) {
        var insertCols = [];
        for (var i in fields) {
          if (fields[i].v in fieldAdded && i>0)
            insertCols.push({me: fields[i].escaped, after: fields[i-1].escaped});
        }
        for (var i in insertCols) {
          var $after = self.$container.find(".col-" + insertCols[i].after);
          var $me = $('<td class="col-' + insertCols[i].me + '"></td>');
          $after.after($me);
        }
      }

      self.current += records.length;
      self.publish(Fractal.TOPIC.DATA_TABLE.BODY_UPDATED, {all_loaded: (self.current >= total)});

      callback();
    });
  },
}));

