Fractal("column_selector", Fractal.Components.table_part.extend({
  template: '  <select class="multiselect hide" multiple="multiple">' +
    '    {{#fields}}' +
    '    <option value="{{value}}" {{#selected}}selected{{/selected}}>{{displayText}}</option>' +
    '    {{/fields}}' +
    '  </select>',
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fields = [];
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, function(topic, data){
      if (data.length !== self.fields.length) {
        self.fields = data;
        var config = self.getColumnConfig().getAll();
        if (!config) {
          config = {};
          data.forEach(function(v){ config[v] = true; });
          self.getColumnConfig().setAll(config);
        }
        self.data = { fields: [] };
        data.forEach(function(v){
          self.data.fields.push({
            displayText: v,
            value: v,
            selected: (v in config && config[v]),
          });
        });
        self.load();
      }
    });
  },
  afterRender: function(callback){
    var self = this;
    Fractal.require("bower_components/bootstrap-multiselect/js/bootstrap-multiselect.js", function(){
      //setTimeout(function(){
        $('.multiselect').multiselect({
          nonSelectedText: 'Show/Hide columns',
          onChange: function($e, checked){
            var col = $e.val();
            if (checked) {
              self.publish(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, col);
            } else {
              self.publish(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, col);
            }
            self.getColumnConfig().set(col, checked);
          }
        });
        $('.multiselect').removeClass("hide");
      //}, 0);
    });
  },
  getData: function(callback) {
    Fractal.require("bower_components/bootstrap-multiselect/css/bootstrap-multiselect.css", function(){
      callback();
    });
  },
}));
