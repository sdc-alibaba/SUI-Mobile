$(function() {

  //固定banner
  /*
  var $f = $(".footer-second");
  var offset = $f.offset();
  var update = function() {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var offsetBottom = offset.top - scrollTop - windowHeight + offset.height;
    $f[offsetBottom > 0 ? "addClass" : "removeClass"]("fixed");
  }

  $(window).scroll(update);
  $(window).resize(update);
  update();
  */


  //计算indicator
  $(document).on("mouseover", ".trigger", function(e) {
    var $a = $(e.target);
    var $indicator = $a.parents("article").find(".indicator");
    var p = $a.data("position");
    $indicator.css({
      left: p[0],
      top: p[1],
      width: p[2],
      height: p[3]
    });
    $indicator.show();
  });
  $(document).on("mouseout", ".trigger", function(e) {
    var $a = $(e.target);
    var $indicator = $a.parents("article").find(".indicator");
    $indicator.hide();
  });
});
