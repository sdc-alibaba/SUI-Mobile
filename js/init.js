/* global Zepto:true */
+function ($) {
  "use strict";
  //初始化页面中的JS组件
  $.initPage = function(page) {
    var $page = $(page);
    if(!$page[0]) $page = $(".content");
    $.initPageSwiper($page);
    $.initScroller();
    $.initPullToRefresh($page);
    $.initInfiniteScroll($page);
  };
}(Zepto);
