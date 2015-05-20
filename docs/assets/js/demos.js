$(function () {
  'use strict';

  var initPageBtns = function() {
    //初始化页面的代码放在这里
    console.log("btns page init");
  }

  //直接代理的事件
  $(document).on('refresh', '.pull-to-refresh-content',function(e) {
    // 模拟2s的加载过程
    setTimeout(function() {
      var cardHTML = '<div class="card">' +
        '<div class="card-header">标题</div>' +
        '<div class="card-content">' +
        '<div class="card-content-inner">内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容' +
        '</div>' +
        '</div>' +
        '</div>';

      $(e.target).find('.card-container').prepend(cardHTML);
      // 加载完毕需要重置
      $.pullToRefreshDone('.pull-to-refresh-content');
    }, 2000);
  });

  function addItems(number, lastIndex) {
    // 生成新条目的HTML
    var html = '';
    for (var i = 0; i < 20; i++) {
      html += '<li class="item-content"><div class="item-inner"><div class="item-title">新条目</div></div></li>';
    }
    // 添加新条目
    $('.infinite-scroll .list-container').append(html);
  }
  var loading = false;
  $(document).on('infinite', '.infinite-scroll', function() {

    // 如果正在加载，则退出
    if (loading) return;

    // 设置flag
    loading = true;

    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;

      addItems();
      $.refreshScroller();
    }, 1000);
  });

  var initPages = function() {
    // 在 content 上加id，通过id判断加载的是哪一个页面。
    var $content = $(".content");
    var id = $content[0].id;
    if(id == 'page-btns') {
      initPageBtns();
    }
  }
  $(window).on('push', initPages);

  initPages();  //如果是刷新当前页面，没有push事件。
});
