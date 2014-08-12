Fractal(function(){
  Fractal.TOPIC.DATA_TABLE = {};
  Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED = "table.head.updated";
  Fractal.TOPIC.DATA_TABLE.BODY_UPDATED = "table.body.updated";
  Fractal.TOPIC.DATA_TABLE.LOAD_MORE = "table.load_more";
  Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN = "table.show_col";
  Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN = "table.hide_col";
});

var col2Class = function(colName) { return "col-" + colName.replace(/\./g, "_"); };
var getColumnConfig = function() {
  return new MONGRES.kv("Fields." + Fractal.env.col);
};

Fractal("data_table2", Fractal.Component.extend({
  getBtn: function(){ return this.$container.find(".btn-load_more"); },
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.conn || data.db || data.col) self.load();
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.BODY_UPDATED, function(topic, data){
      if (data.all_loaded) self.getBtn().hide();
      else self.getBtn().show();
    });
  },
  afterRender: function(callback){
    var self = this;
    self.getBtn().click(function(){
      self.publish(Fractal.TOPIC.DATA_TABLE.LOAD_MORE);
      self.getBtn().hide();
    });
    self.$container.find(".btn-reset_col").click(function(){
      var config = getColumnConfig().getAll();
      getColumnConfig().clear();
      if (!config) return;
      for (var i in config) {
        self.publish(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, i);
      }
    });
    callback();
  }
}));

Fractal("table_part", Fractal.Component.extend({
  showColumn: function(colName) { this.$container.find("." + col2Class(colName)).removeClass("hide"); },
  hideColumn: function(colName) { this.$container.find("." + col2Class(colName)).addClass("hide"); },
}));
