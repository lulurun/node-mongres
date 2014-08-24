F("thead", F.Components.table_part.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fields = [];
    self.subscribe(F.TOPIC.DATA_TABLE.HEAD_UPDATED, function(topic, data){
      if (data.length !== self.fields.length) {
        self.fields = data;

        var config = MONGRES.getColumnConfig().getAll();
        var hide = config ? function(v){
          return (v in config && !config[v]);
        } : function(){ return false; };
        self.data = {
          fields: data.map(function(v){
            return {
              value: v,
              parts: v.split("."),
              classValue: MONGRES.col2Class(v),
              hide: hide(v),
            };
          })
        };
        self.load();
      }
    });
    self.subscribe(F.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.showColumn(data);
    });
    self.subscribe(F.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.hideColumn(data);
    });
  },
  afterRender: function(cb) {
    var self = this;
    self.$container.find(".btn-remove_col").click(function(){
      var col = $(this).closest("th").data("value");
      MONGRES.getColumnConfig().set(col, false);
      self.publish(F.TOPIC.DATA_TABLE.HIDE_COLUMN, col);
    });
    cb();
  },
}));

