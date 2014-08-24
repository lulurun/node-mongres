F("collection_controls", F.Component.extend({
  init: function(name, $container){
    var self = this;
    self._super(name, $container);
    self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
      if (data.page) {
        if (F.env.page === "data_table2") self.load();
        else if (self.data && self.data.enable) self.load();
      }
      if (data.col) {
        if (MONGRES.getColumnConfig().exists()) {
          self.$('#btn-reset-col').show();
        } else {
          self.$('#btn-reset-col').hide();
        }
      }
    });
    self.subscribe(F.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.$('#btn-reset-col').show();
    });
    self.subscribe("doc.checked", function(topic, data){
      if (data.length) {
        self.removeList = data;
        self.$('#btn-remove-docs').find(".badge").text(data.length);
        self.$('#btn-remove-docs').show();
      } else {
        self.$('#btn-remove-docs').hide();
        self.$('#btn-remove-docs').find(".badge").text("");
        self.removeList = [];
      }
    });
  },
  afterRender: function(cb){
    var self = this;
    if (!self.data.enable) return cb();
    if (MONGRES.getColumnConfig().exists()) {
      self.$('#btn-reset-col').show();
    } else {
      self.$('#btn-reset-col').hide();
    }
    self.$("#btn-reset-col").click(function(){
      var config = MONGRES.getColumnConfig().getAll();
      MONGRES.getColumnConfig().clear();
      $(this).hide();
      if (!config) return;
      for (var i in config) {
        self.publish(F.TOPIC.DATA_TABLE.SHOW_COLUMN, i);
      }
    });
    self.$("#btn-remove-docs").click(function(){
      console.log("aaa", self.removeList);
      if (self.removeList && self.removeList.length) {
        MONGRES.client.removeDocs(self.removeList, function(err, res){
          console.log(err, res);
          self.publish("documents.removed", res);
        })
      }
    });
    cb();
  },
  getData: function(cb){
    var self = this;
    if (F.env.page !== "data_table2") {
      self.data = {}
      cb();
    } else {
      self.data = {
        enable: true,
        resetColumn: MONGRES.getColumnConfig().exists()
      };
      cb();
    }
  }
}));

