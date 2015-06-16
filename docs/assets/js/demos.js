$(function () {
  'use strict';

  var initPageBtns = function() {
    //初始化页面的代码放在这里
    console.log("btns page init");
  }

  //直接代理的事件
  //下拉刷新
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

  //无线滚动
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


  //图片浏览器
  var myPhotoBrowserStandalone = $.photoBrowser({
    photos : [
      '//img.alicdn.com/tps/i3/TB1kt4wHVXXXXb_XVXX0HY8HXXX-1024-1024.jpeg',
      '//img.alicdn.com/tps/i1/TB1SKhUHVXXXXb7XXXX0HY8HXXX-1024-1024.jpeg',
      '//img.alicdn.com/tps/i4/TB1AdxNHVXXXXasXpXX0HY8HXXX-1024-1024.jpeg',
    ]
  });
  //点击时打开图片浏览器
  $(document).on('click','.pb-standalone',function () {
    myPhotoBrowserStandalone.open();
  });

  /*=== Popup ===*/
  var myPhotoBrowserPopup = $.photoBrowser({
    photos : [
      '//img.alicdn.com/tps/i3/TB1kt4wHVXXXXb_XVXX0HY8HXXX-1024-1024.jpeg',
      '//img.alicdn.com/tps/i1/TB1SKhUHVXXXXb7XXXX0HY8HXXX-1024-1024.jpeg',
      '//img.alicdn.com/tps/i4/TB1AdxNHVXXXXasXpXX0HY8HXXX-1024-1024.jpeg',
    ],
    type: 'popup'
  });
  $(document).on('click','.pb-popup',function () {
    myPhotoBrowserPopup.open();
  });


  /*=== 有标题 ===*/
  var myPhotoBrowserCaptions = $.photoBrowser({
    photos : [
      {
        url: '//img.alicdn.com/tps/i3/TB1kt4wHVXXXXb_XVXX0HY8HXXX-1024-1024.jpeg',
        caption: 'Caption 1 Text'
      },
      {
        url: '//img.alicdn.com/tps/i1/TB1SKhUHVXXXXb7XXXX0HY8HXXX-1024-1024.jpeg',
        caption: 'Second Caption Text'
      },
      // 这个没有标题
      {
        url: '//img.alicdn.com/tps/i4/TB1AdxNHVXXXXasXpXX0HY8HXXX-1024-1024.jpeg',
      },
    ],
    theme: 'dark',
    type: 'standalone'
  });
  $(document).on('click','.pb-standalone-captions',function () {
    myPhotoBrowserCaptions.open();
  });

  //对话框
  $(document).on('click','.alert-text',function () {
    $.alert('这是一段提示消息');
  });

  $(document).on('click','.alert-text-title', function () {
    $.alert('这是一段提示消息', '这是自定义的标题!');
  });

  $(document).on('click', '.alert-text-title-callback',function () {
    $.alert('这是自定义的文案', '这是自定义的标题!', function () {
      $.alert('你点击了确定按钮!')
    });
  });
  $(document).on('click','.confirm-ok', function () {
    $.confirm('你确定吗?', function () {
      $.alert('你点击了确定按钮!');
    });
  });
  $(document).on('click','.prompt-ok', function () {
    $.prompt('你叫什么问题?', function (value) {
      $.alert('你输入的名字是"' + value + '"');
    });
  });

  $(document).on('click','.create-actions', function () {
    var buttons1 = [
      {
        text: '请选择',
        label: true
      },
      {
        text: '卖出',
        bold: true,
        color: 'danger',
        onClick: function() {
          $.alert("你选择了“卖出“");
        }
      },
      {
        text: '买入',
        onClick: function() {
          $.alert("你选择了“买入“");
        }
      }
    ];
    var buttons2 = [
      {
        text: '取消',
        bg: 'danger'
      }
    ];
    var groups = [buttons1, buttons2];
    $.actions(groups);
  }); 

  //加载提示符
  $(document).on('click','.open-preloader-title', function () {
    $.showPreloader('加载中...')
    setTimeout(function () {
      $.hidePreloader();
    }, 2000);
  });
  $(document).on('click','.open-indicator', function () {
    $.showIndicator();
    setTimeout(function () {
      $.hideIndicator();
    }, 2000);
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
