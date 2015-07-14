/* global Zepto:true */
+function ($) {
  "use strict";
  
  //初始化页面中的JS组件
  $.initPage = function(page) {
    var $page = $(page);
    if(!$page[0]) $page = $(document.body);
    var $content = $page.hasClass("content") ? $page : $page.find(".content");
    $content.scroller();  //注意滚动条一定要最先初始化

    $.initPullToRefresh($content);
    $.initInfiniteScroll($content);
    $.initCalendar($content);

    //extend
    if($.initSwiper) $.initSwiper($content);
  };


  if($.smConfig.showPageLoadingIndicator) {
    //这里的 以 push 开头的是私有事件，不要用
    $(window).on("pushStart", function() {
      $.showIndicator();
    });
    $(window).on("pushAnimationStart", function() {
      $.hideIndicator();
    });
    $(window).on("pushCancel", function() {
      $.hideIndicator();
    });
    $(window).on("pushFail", function() {
      $.hideIndicator();
      $.toast("加载失败");
    });
  }

  $.init = function() {
    var $content = $(".content");
    if(!$content[0]) return;
    var id = $content[0].id;
    $.initPage();
    $content.trigger("pageInit", [id, $content]);
  }

  $(function() {
    if($.smConfig.autoInit) {
      $.init();
    }
  });

}(Zepto);
