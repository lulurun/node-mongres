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
              parts: v.split(".").map(function(name, index){
                return {name: name, index: index};
              }),
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
    self.$(".field-part").mouseenter(function(){
      $(this).children(".btn-remove_col").css("opacity", "0.3");
    }).mouseleave(function(){
      $(this).children(".btn-remove_col").css("opacity", "0");
    });
    self.$(".btn-remove_col").click(function(){
      var index = parseInt($(this).data("index"));
      var name = $(this).data("name");
      var i = 0, len = self.data.fields.length;
      for (; i< len; ++i) {
        var field = self.data.fields[i];
        if (field.parts[index] && field.parts[index].name === name) {
          MONGRES.getColumnConfig().set(field.value, false);
          self.publish(F.TOPIC.DATA_TABLE.HIDE_COLUMN, field.value);
        }
      }

    });
    cb();
  },
}));

