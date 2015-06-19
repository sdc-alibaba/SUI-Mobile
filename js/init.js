/* global Zepto:true */
+function ($) {
  "use strict";
  
  //初始化页面中的JS组件
  $.initPage = function(page) {
    var $page = $(page);
    if(!$page[0]) $page = $(document.body);
    var $content = $page.hasClass("content") ? $page : $page.find(".content");
    if($content.hasClass("inited")) return;
    $content.scroller();  //注意滚动条一定要最先初始化

    $.initPullToRefresh($content);
    $.initInfiniteScroll($content);

    //extend
    if($.initSwiper) $.initSwiper($content);

    $content.addClass("inited");
  };

  if($.smConfig.autoInit) {
    $(document).on("pageInit", function() {
      $.initPage();
    });
    $(function() {
      $.initPage();
    });
  }

  if($.smConfig.showPageLoadingIndicator) {
    $(window).on("pushStart", function() {
      $.showIndicator();
    });
    $(window).on("pushAnimationStart", function() {
      $.hideIndicator();
    });
  }

}(Zepto);
