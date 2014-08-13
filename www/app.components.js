Fractal("layout_vsp2", Fractal.Component.extend({
  template: '<style>' +
    '.layout {' +
    '  position: absolute;' +
    '  top: 0;' +
    '  bottom: 0;' +
    '  overflow: auto;' +
    '}' +
    '.layout-first {' +
    '  z-index: 999;' +
    '  left: 0;' +
    '}' +
    '.layout-second {' +
    '  z-index: 998;' +
    '  right: 0;' +
    '}' +
    '.layout-splitter {' +
    '  z-index: 1000;' +
    '  width: 5px;' +
    '  background: #efefef;' +
    '}' +
    '.layout-splitter:hover {' +
    '  cursor: col-resize;' +
    '}' +
    '</style>' +
    '{{#first}}' +
    '<div class="layout layout-first" data-role="component" data-name="{{name}}" />' +
    '{{/first}}' +
    '<div class="layout layout-splitter"></div>' +
    '{{#second}}' +
    '<div class="layout layout-second" data-role="component" data-name="{{name}}" />' +
    '{{/second}}',
  split: function(pos){
    this.$first.css("width", pos);
    this.$splitter.css("left", pos);
    this.$second.css("left", pos + this.$splitter.width());
    // this.$second.css("width", $(window).width() - pos - this.$splitter.width());
    this.$first.trigger("resize");
    this.$second.trigger("resize");
    this.pos = pos;
  },
  afterRender: function(callback) {
    var self = this;
    self.$first = $(".layout-first");
    self.$second = $(".layout-second");
    self.$splitter = $(".layout-splitter");

    self.$splitter.bind("mousedown", function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var mouseDown = ev.pageX;
      var startPos = self.$splitter.offset().left;
      $(document).bind("mousemove", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var pos = startPos + (ev.pageX - mouseDown);
        self.split(pos);
      });
      $(document).bind("mouseup", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var pos = startPos + (ev.pageX - mouseDown);
        self.split(pos);
        $(document).unbind("mousemove");
        $(document).unbind("mouseup");
      })
    });

    self.split(self.splitterInitPos);

    callback();
  },
  getData: function(callback) {
    var self = this;
    self.data = {
      first: self.first,
      second: self.second
    };
    callback();
  }
}));

Fractal("basicInfo", Fractal.Component.extend({
  //loadOnce: true,
  template: '{{#title}}<div class="panel panel-default">' +
    '<div class="panel-heading">{{title}}</div>' +
    '  <div class="panel-body">' +
    '    <div data-role="component" data-name="objectViewer" data-query="{{query}}">' +
    '  </div>' +
    '</div>{{/title}}',
  getData: function(callback) {
    var self = this;
    if (!self.title || !self.getQuery) {
      throw new Error(self.name + " missing title/getQuery");
    } else {
      self.data = {
        title: self.title,
        query: self.getQuery()
      };
    }
    callback();
  }
}));


Fractal("objectViewer", Fractal.Component.extend({
  loadOnce: true,
  template: '<table class="table" style="width:auto;">' +
    '  {{#fields}}<tr>' +
    '  <th>{{key}}&nbsp;</th>' +
    '  <td>{{#isObj}}{{>objectViewer}}{{/isObj}}{{^isObj}}{{val}}{{/isObj}}&nbsp;</td>' +
    '  </tr>{{/fields}}' +
    '</table>',
  getData: function(callback){
    var self = this;
    var makeData =  function(data) {
      var result = { fields: [], isObj: true};
      for (var i in data) {
        var field = null;
        if (typeof(data[i]) === "object") {
          field = makeData(data[i]);
          field.key = i;
        } else {
          field = {
            key: i,
            val: data[i],
            isObj: false,
          };
        }
        result.fields.push(field);
      }
      return result;
    }

    var query = self.$container.data("query");
    Fractal.require(query, function(data){
      self.data = makeData(data);
      self.data.isObj= false;
      self.partials = { objectViewer: self.template };
      callback();
    });
  },
}));
