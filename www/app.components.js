Fractal("layout_vsp2", Fractal.Component.extend({
  template: '<style>' +
    '.layout {' +
    '  position: absolute;' +
    '  top: 0;' +
    '  bottom: 0;' +
    '  overflow: auto;' +
    '}' +
    '.layout-first {' +
    '  left: 0;' +
    '}' +
    '.layout-second {' +
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
  afterRender: (function(){
    var __split = function($first, $second, $splitter, pos){
      $first.css("width", pos);
      $splitter.css("left", pos);
      $second.css("left", pos + $splitter.width());
      // $second.css("width", $(window).width() - pos - $splitter.width());
      $first.trigger("resize");
      $second.trigger("resize");
    };

    return function(callback) {
      var self = this;
      var $first = $(".layout-first");
      var $second = $(".layout-second");
      var $splitter = $(".layout-splitter");

      $splitter.bind("mousedown", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var mouseDown = ev.pageX;
        var startPos = $splitter.offset().left;
        $(document).bind("mousemove", function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          var pos = startPos + (ev.pageX - mouseDown);
          __split($first, $second, $splitter, pos);
        });
        $(document).bind("mouseup", function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          var pos = startPos + (ev.pageX - mouseDown);
          __split($first, $second, $splitter, pos);
          $(document).unbind("mousemove");
          $(document).unbind("mouseup");
        })
      });

      __split($first, $second, $splitter, self.splitterInitPos);
      callback();
    }
  })(),
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
  loadOnce: true,
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
      console.log(self.data);
      self.partials = { objectViewer: self.template };
      callback();
    });
  },
}));
