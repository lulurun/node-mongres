Fractal("tbody", Fractal.Components.table_part.extend({
  template: '  {{#records}}' +
    '  <tr data-id="{{_id}}">' +
    '    {{#values}}' +
    '    <td class="{{classValue}} {{#hide}}hide{{/hide}}">{{value}}</td>' +
    '    {{/values}}' +
    '  </tr>' +
    '  {{/records}}',
  current: 0,
  options: {limit: 10},
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.DATA_TABLE.LOAD_MORE, function(topic, data){
      self.load();
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.showColumn(data);
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.hideColumn(data);
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
      var fieldAdded = {}, fieldByName = {};
      data[dataQuery].forEach(function(v){
        var f = MONGRES.flatten(v);
        for (var i in f) {
          if (!(i in fieldByName)) {
            fieldAdded[i] = true;
            fieldByName[i] = true;
          }
        }
        flattenData.push(f);
      });

      var fields = [];
      for (var i in fieldByName) fields.push(i);
      fields.sort();

      self.publish(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, fields);

      var config = getColumnConfig().getAll();
      var hide = config ? function(v){
        return (v in config && !config[v]);
      } : function(){ return false; };
      records = [];
      flattenData.forEach(function(d){
        r = {_id: d._id, values: []};
        fields.forEach(function(f){
          r.values.push({
            classValue: col2Class(f),
            value: d[f],
            hide: hide(f),
          });
        });
        records.push(r);
      });
      self.data = { records: records };

      // if (fields.changed) update existing table
      if (self.current > 0) {
        var insertCols = [];
        var lastV = null;
        fields.forEach(function(v){
          if (v in fieldAdded && lastV) { insertCols.push({me: v, after: lastV}); }
          lastV = v;
        });
        insertCols.forEach(function(v){
          var $after = self.$container.find("." + col2Class(v.after));
          var classes = col2Class(v.me) + (hide(v) ? " hide" : "");
          var $me = $('<td class="' + classes + '"></td>');
          $after.after($me);
        });
      }
      self.current += records.length;
      self.publish(Fractal.TOPIC.DATA_TABLE.BODY_UPDATED, {all_loaded: (self.current >= total)});

      callback();
    });
  },
}));

