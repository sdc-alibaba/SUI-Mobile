/* global Zepto:true */
+function ($) {
  "use strict";

  //初始化页面中的JS组件
  $.initPage = function(page) {
    var $page = $(page);
    if(!$page[0]) $page = $(document.body);
    var $content = $page.find(".content");
    $.initSwiper($content);
    $content.scroller();
    $.initPullToRefresh($content);
    $.initInfiniteScroll($content);
  };

  //全局配置

  var defaults = $.extend({
    autoInit: true
  }, $.config);

  if(defaults.autoInit) {
    $(window).on("push", function() {
      $.initPage();
    });
    $(function() {
      $.initPage();
    });
  }



}(Zepto);
