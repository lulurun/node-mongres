Fractal(function(){
  Fractal.TOPIC.DATA_TABLE = {};
  Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED = "table.head.updated";
  Fractal.TOPIC.DATA_TABLE.BODY_UPDATED = "table.body.updated";
  Fractal.TOPIC.DATA_TABLE.LOAD_MORE = "table.load_more";
  Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN = "table.show_col";
  Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN = "table.hide_col";
});

Fractal("data_table2", Fractal.Component.extend({
  getBtn: function(){
    if (!this.$__btn) this.$__btn = this.$container.find(".btn-load_more");
    return this.$__btn;
  },
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.subscribe(Fractal.TOPIC.DATA_TABLE.BODY_UPDATED, function(topic, data){
      if (data.all_loaded) self.getBtn().addClass("hide");
      else self.getBtn().removeClass("hide");
    });
  },
  afterRender: function(callback){
    var self = this;
    self.getBtn().click(function(){
      self.publish(Fractal.TOPIC.DATA_TABLE.LOAD_MORE);
      self.getBtn().addClass("hide");
    });
    callback();
  }
}));

