Fractal("column_selector", Fractal.Component.extend({
  template: '  <select class="multiselect hide" multiple="multiple">' +
    '    {{#fields}}' +
    '    <option value="{{value}}" {{#selected}}selected{{/selected}}>{{displayText}}</option>' +
    '    {{/fields}}' +
    '  </select>',
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fields = [];
    self.columnConfig = new MONGRES.Settings("Fields");
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, function(topic, data){
      if (data.length !== self.fields.length) {
        self.fields = data;

        var config = self.columnConfig.getAll();
        if (!config) {
          config = {};
          data.forEach(function(f){ config[f.v] = f; f.checked = true; });
          self.columnConfig.setAll(config);
        }
        self.data = {
          fields: data.map(function(f){
            return {
              displayText: f.v,
              value: f.escaped,
              selected: (f.v in config && config[f.v]) ? true : false,
            };
          })
        };
        self.load();
      }
    });
  },
  afterRender: function(callback){
    var self = this;
    Fractal.require("bower_components/bootstrap-multiselect/js/bootstrap-multiselect.js", function(){
      $('.multiselect').multiselect({
        nonSelectedText: 'Show/Hide columns',
        onChange: function($e, checked){
          var col = $e.val();
          if (checked) {
            self.publish(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, col);
          } else {
            self.publish(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, col);
          }
          var f = self.columnConfig.get(col);
          f.checked = checked;
          self.columnConfig.set(col, f);
        }
      });
      $('.multiselect').removeClass("hide");
    });
  },
  getData: function(callback) {
    this.data = { fields: [] };
    var config = this.columnConfig.getAll();
    if (config) {
      for (var i in config) {
        var f = config[i];
        this.data.fields.push({
          displayText: f.v,
          value: f.escaped,
          selected: f.checked,
        });
      }
    }
    Fractal.require("bower_components/bootstrap-multiselect/css/bootstrap-multiselect.css", function(){
      callback();
    });
  },
}));
