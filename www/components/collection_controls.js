F("collection_controls", F.Component.extend({
  init: function(name, $container){
    var self = this;
    self._super(name, $container);
    self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.page) {
        if (F.env.page === "data_table2") self.load();
        else if (self.data && self.data.enable) self.load();
      }
    });
  },
  afterRender: function(cb){
    if (this.data.enable_search) {
    }
    cb();
  },
  getData: function(cb){
    this.data = {
      enable: F.env.page === "data_table2",
      conn: F.env.conn,
      db: F.env.db,
      col: F.env.col
    };
    cb();
  }
}));

F("colCtrl_removeDoc", F.Component.extend({
  init: function(name, $container){
    var self = this;
    self._super(name, $container);
    self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.col) self.load();
    });
    self.subscribe("doc.checked", function(topic, data){
      if (data.length) {
        self.removeList = data;
        self.$(".badge").text(data.length);
        self.$container.show();
      } else {
        self.$container.hide();
        self.$(".badge").text("");
        self.removeList = [];
      }
    });
    self.$container.click(function(){
      if (self.removeList && self.removeList.length) {
        MONGRES.client.removeDocs(self.removeList, function(err, res){
          self.publish(F.TOPIC.DATA_TABLE.RELOAD, res);
          self.load();
        })
      }
    });
  },
  afterRender: function(cb){
    this.$container.hide();
    cb();
  }
}));

F("colCtrl_resetColumn", F.Component.extend({
  init: function(name, $container){
    var self = this;
    self._super(name, $container);
    self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.col) self.load();
    });
    self.subscribe(F.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.$container.show();
    });
    self.$container.click(function(){
      var config = MONGRES.getColumnConfig().getAll();
      MONGRES.getColumnConfig().clear();
      $(this).hide();
      if (!config) return;
      for (var i in config) {
        self.publish(F.TOPIC.DATA_TABLE.SHOW_COLUMN, i);
      }
    });
  },
  afterRender: function(cb){
    if (MONGRES.getColumnConfig().exists()) {
      this.$container.show();
    } else {
      this.$container.hide();
    }
    cb();
  }
}));
