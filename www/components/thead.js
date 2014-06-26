Fractal("thead", Fractal.Component.extend({
  template: '<tr>' +
    '    {{#fields}}' +
    '    <th class="{{classValue}}">{{#displayParts}}{{.}}<br>{{/displayParts}}</th>' +
    '    {{/fields}}' +
    '  </tr>',
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.fields = [];
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HEAD_UPDATED, function(topic, data){
      if (data.length !== self.fields.length) {
        self.fields = data;
        self.data = {
          fields: data.map(function(f){
            return {
              displayParts: f.v.split("."),
              classValue: "col-" + f.escaped
            };
          })
        };
        self.load();
      }
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.SHOW_COLUMN, function(topic, data){
      self.$container.find(".col-" + data).show();;
    });
    self.subscribe(Fractal.TOPIC.DATA_TABLE.HIDE_COLUMN, function(topic, data){
      self.$container.find(".col-" + data).hide();;
    });
  },
  getData: function(callback) {
    // TODO get fields from localStorage
    callback();
  },
}));

