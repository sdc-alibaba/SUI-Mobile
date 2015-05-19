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
    //$.initPullToRefresh($content);
    //$.initInfiniteScroll($content);
  };
}(Zepto);
