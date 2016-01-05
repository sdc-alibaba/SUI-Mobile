$(function() {
  $(document).on("pageInit",  function(e, id, page) {
	    //多个标签页下的无限滚动
	    var loading = false;
	    // 每次加载添加多少条目
	    var itemsPerLoad = 20;
	    // 最多可加载的条目
	    var maxItems = 100;
	    var lastIndex = $('.list-container li')[0].length;
	    function addItems(number, lastIndex) {
	      // 生成新条目的HTML
	      var html = '';
	      for (var i = lastIndex + 1; i <= lastIndex + number; i++) {
	        html += '<li class="item-content" onClick="alert(1)"><div class="item-inner"><div class="item-title">新条目</div></div></li>';
	      }
	      // 添加新条目
	      $('.infinite-scroll.active .list-container').append(html);
	    }
	    $(page).on('infinite', function() {
	      // 如果正在加载，则退出
	      if (loading) return;
	      // 设置flag
	      loading = true;
	      var tabIndex = 0;
	      if($(this).find('.infinite-scroll.active').attr('id') == "tab2"){
	        tabIndex = 0;
	      }
	      if($(this).find('.infinite-scroll.active').attr('id') == "tab3"){
	        tabIndex = 1;
	      }
	      lastIndex = $('.list-container').eq(tabIndex).find('li').length;
	      // 模拟1s的加载过程
	      setTimeout(function() {
	        // 重置加载flag
	        loading = false;
	        if (lastIndex >= maxItems) {
	          // 加载完毕，则注销无限加载事件，以防不必要的加载
	          //$.detachInfiniteScroll($('.infinite-scroll').eq(tabIndex));
	          // 删除加载提示符
	          $('.infinite-scroll-preloader').eq(tabIndex).hide();
	          return;
	        }
	        addItems(itemsPerLoad,lastIndex);
	        // 更新最后加载的序号
	        lastIndex =  $('.list-container').eq(tabIndex).find('li').length;
	        $.refreshScroller();
	      }, 1000);
	    });
  });
  $.init();
});
