/* global Zepto:true */
+function ($) {
  "use strict";

  //初始化页面中的JS组件
  $.initPage = function(page) {
    var $page = $(page);
    if(!$page[0]) $page = $(document.body);
    var $content = $page.find(".content");

    $content.scroller();  //注意滚动条一定要最先初始化
    $.initPullToRefresh($content);
    $.initInfiniteScroll($content);

    //extend
    if($.initSwiper) $.initSwiper($content);
  };

  //全局配置
  var defaults = {
    autoInit: true,
    showPageLoadingIndicator: true
  };

  var config = $.extend(defaults, $.config);

  if(config.autoInit) {
    $(window).on("push", function() {
      $.initPage();
    });
    $(function() {
      $.initPage();
    });
  }

  if(config.showPageLoadingIndicator) {
    $(window).on("pushStart", function() {
      $.showIndicator();
    });
    $(window).on("pushAnimationStart", function() {
      $.hideIndicator();
    });
  }



}(Zepto);
