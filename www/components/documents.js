F(function(){
  F("documents", F.Component.extend({
    getBtn: function(){ return this.$container.find(".btn-load_more"); },
    init: function(name, $container) {
      var self = this;
      self._super(name, $container);
      self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
        if (data.conn || data.db || data.col) self.load();
      });
      self.subscribe(F.TOPIC.DATA_TABLE.BODY_UPDATED, function(topic, data){
        if (data.all_loaded) self.getBtn().hide();
        else self.getBtn().show();
      });
    },
    afterRender: function(callback){
      var self = this;
      self.getBtn().click(function(){
        self.publish(F.TOPIC.DATA_TABLE.LOAD_MORE);
        self.getBtn().hide();
      });
      callback();
    }
  }));

  F("table_part", F.Component.extend({
    showColumn: function(colName) {
      this.$("." + MONGRES.col2Class(colName)).removeClass("hide");
    },
    hideColumn: function(colName) {
      this.$("." + MONGRES.col2Class(colName)).addClass("hide");
    },
  }));
});
