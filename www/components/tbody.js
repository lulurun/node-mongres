F("tbody", F.Components.table_part.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fieldByName = {};
    self.current = 0;
    self.options = {limit: 10};
    self.subscribe(F.TOPIC.DATA_TABLE.RELOAD, function(topic, data){
      self.load({reset: true});
    });
    self.subscribe(F.TOPIC.DATA_TABLE.LOAD_MORE, function(topic, data){
      self.load();
    });
    self.subscribe(F.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.showColumn(data);
    });
    self.subscribe(F.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.hideColumn(data);
    });
  },
  afterRender: function(cb){
    var self = this;
    self.$('.cbx-doc').click(function(ev){
      var checkedDocs = [];
      self.$('.cbx-doc').each(function(){
        if (this.checked) {
          checkedDocs.push($(this).closest(".doc").data("id"));
        }
      });
      self.publish("doc.checked", checkedDocs);
    });
    self.$('.doc-value').click(function(){
      var docId = $(this).closest(".doc").data("id");
      var params = {
        conn: F.env.conn,
        db: F.env.db,
        col: F.env.col,
        doc: docId
      };
      F.navigate("document", params);
    });
    cb();
  },
  render: function(cb, param) {
    if (param && param.reset) {
      this._super(cb);
    } else {
      var contents = F.Render(this.template, this.data);
      this.$container.append(contents);
      cb();
    }
  },
  getData: function(cb, param) {
    var self = this;
    if (!F.env.db || !F.env.col) {
      self.data = {};
      return cb();
    }
    if (param && param.reset) self.current = 0;
    self.options.skip = self.current;
    var countQuery = "connections/" + F.env.conn + "/databases/" + F.env.db + "/collections/" + F.env.col;
    var dataQuery = countQuery + "/documents?options=" + encodeURIComponent(JSON.stringify(self.options));
    F.require([countQuery, dataQuery], function(data){
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
      for (var i in self.fieldByName) fields.push(i);
      fields.sort();

      self.publish(F.TOPIC.DATA_TABLE.HEAD_UPDATED, fields);

      var config = MONGRES.getColumnConfig().getAll();
      var hide = config ? function(v){
        return (v in config && !config[v]);
      } : function(){ return false; };
      records = [];
      flattenData.forEach(function(d){
        r = {_id: d._id, values: []};
        fields.forEach(function(f){
          r.values.push({
            classValue: MONGRES.col2Class(f),
            value: d[f],
            hide: hide(f),
          });
        });
        records.push(r);
      });
      self.data = {
        records: records,
        idString: function(){
          return this._id.substr(10, 24);
        }
      };

      // if (fields.changed) update existing table
      if (self.current > 0) {
        var insertCols = [];
        var lastV = null;
        fields.forEach(function(v){
          if (v in fieldAdded && lastV) { insertCols.push({me: v, after: lastV}); }
          lastV = v;
        });
        insertCols.forEach(function(v){
          var $after = self.$("." + MONGRES.col2Class(v.after));
          var classes = MONGRES.col2Class(v.me) + (hide(v) ? " hide" : "");
          var $me = $('<td class="' + classes + '"></td>');
          $after.after($me);
        });
      }
      self.current += records.length;
      self.publish(
        F.TOPIC.DATA_TABLE.BODY_UPDATED,
        {all_loaded: (self.current >= total)}
      );

      cb();
    });
  },
}));

