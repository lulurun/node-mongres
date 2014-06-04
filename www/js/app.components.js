Fractal(function(){
  var template = '<style>' +
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
    '{{/second}}';

  Fractal.Components.layout_vsp2 = Fractal.Component.extend({
    template:template,
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
        var $first = self.$container.find(".layout-first");
        var $second = self.$container.find(".layout-second");
        var $splitter = self.$container.find(".layout-splitter");

        $splitter.bind("mousedown", function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          var mouseDown = ev.pageX;
          var startPos = $splitter.offset().left;
          console.log("Down", mouseDown, startPos);
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
  });

  Fractal.Components.basicInfo = Fractal.Component.extend({
    template: '{{#title}}<div class="panel panel-default">' +
      '<div class="panel-heading">{{title}}</div>' +
      '  <div class="panel-body">' +
      '    <dl class="dl-horizontal">' +
      '    {{#fields}}<dt>{{key}}&nbsp;</dt><dd>{{val}}&nbsp;</dd>{{/fields}}' +
      '    </dl>' +
      '  </div>' +
      '</div>{{/title}}',
    getData: function(callback) {
      var self = this;
      if (!self.title || !self.query) {
        console.error(self.name, "missing title/query");
        callback();
      }
      else {
        Fractal.require(self.query, function(data){
          var fields = [];
          for (var i in data) {
            fields.push({ key:i, val:data[i] });
          }
          if (fields.length) {
            self.data = {
              title: self.title,
              fields: fields
            };
          }
          callback();
        });
      }
    }
  });

});
