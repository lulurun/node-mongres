Fractal("thead", Fractal.Components.table_part.extend({
  template: '  <tr>' +
    '    {{#fields}}' +
    '    <th class="{{classValue}} {{#hide}}hide{{/hide}}" data-value="{{value}}">' +
    '      <span class="glyphicon glyphicon-remove-circle btn-remove_col" style="opacity:0.3;" /><br>' +
    '      {{#parts}}{{.}}<br>{{/parts}}' +
    '    </th>' +
    '    {{/fields}}' +
    '  </tr>',
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fields = [];
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, function(topic, data){
      if (data.length !== self.fields.length) {
        self.fields = data;

        var config = getColumnConfig().getAll();
        var hide = config ? function(v){
          return (v in config && !config[v]);
        } : function(){ return false; };
        self.data = {
          fields: data.map(function(v){
            return {
              value: v,
              parts: v.split("."),
              classValue: col2Class(v),
              hide: hide(v),
            };
          })
        };
        self.load();
      }
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.showColumn(data);
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.hideColumn(data);
    });
  },
  afterRender: function(callback) {
    var self = this;
    // TODO find a better impl
    // self.$container.fixedHeader();
    self.$container.find(".btn-remove_col").click(function(){
      var col = $(this).closest("th").data("value");
      self.publish(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, col);
      getColumnConfig().set(col, false);
    });
    callback();
  },
  // getData: function(callback) {
  //   Fractal.require("js/table-fixed-header.js", function(){
  //     callback();
  //   });
  // }
}));

