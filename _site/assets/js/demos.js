$(function () {
  'use strict';

  var initPageBtns = function() {
    //初始化页面的代码放在这里
    console.log("btns page init");
  }

  var initPages = function() {
    // 在 content 上加id，通过id判断加载的是哪一个页面。
    var $content = $(".content");
    var id = $content[0].id;
    console.log(id);
    if(id == 'page-btns') {
      initPageBtns();
    }
  }
  $(window).on('push', initPages);

  initPages();  //如果是刷新当前页面，没有push事件。
});
