var layout = Fractal.Component.extend({
  afterRender: (function(){
    var __split = function($first, $second, $splitter, pos){
      $first.css("width", pos);
      $splitter.css("left", pos);
      $second.css("left", pos + $splitter.width());
      $second.css("width", $(window).width() - pos - $splitter.width());
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


var viewer = layout.extend({
  init: function(name, $container) {
    var self = this;
    self._super(name, $container);
    self.splitterInitPos = 300;
    self.first = { name: "sidebar" };
    self.second = { name: "data_view", loadOnce: true };
  }
});

