(function($) {
  'use strict';
  $.fn.fixedHeader = function (options) {
    if (options){ $.extend(config, options); }
    var $cloned = null;

    return this.each( function() {
      if ($cloned) return;
      var $head = $(this);
      var headTop = $head.offset().top;

      function processScroll($scrolled) {
        $cloned.width($head.width());
        $head.find('tr > th').each(function (i, h) {
          var w = $(h).width();
          $cloned.find('tr > th:eq('+i+')').width(w);
        });
        var scrollTop = $scrolled.scrollTop();
        if (scrollTop >= headTop) $cloned.show().offset({ left: $head.offset().left });
        else $cloned.hide();
      }

      // $win.on('scroll', processScroll);
      Fractal.Pubsub.subscribe("layout_vsp2.second.scroll", function(topic, $scrolled){
        processScroll($scrolled);
      });

      var $cloned = $head.clone(true).css({
        'position': 'fixed',
        'top': 0,
        'display': 'none',
        'background-color': '#fff',
        '-webkit-transform': 'translate3d(0, 0, 0)',
      }).insertAfter($head);
    });
  };

})(jQuery);
