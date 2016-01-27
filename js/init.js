/*jshint unused: false*/
+function($) {
    'use strict';

    var getPage = function() {
        var $page = $(".page-current");
        if (!$page[0]) $page = $(".page").addClass('page-current');
        return $page;
    };

    //初始化页面中的JS组件
    $.initPage = function(page) {
        var $page = getPage();
        if (!$page[0]) $page = $(document.body);
        var $content = $page.hasClass('content') ?
                       $page :
                       $page.find('.content');
        $content.scroller();  //注意滚动条一定要最先初始化

        $.initPullToRefresh($content);
        $.initInfiniteScroll($content);
        $.initCalendar($content);

        //extend
        if ($.initSwiper) $.initSwiper($content);
    };

    if ($.smConfig.showPageLoadingIndicator) {
        //这里的 以 push 开头的是私有事件，不要用
        $(window).on('pageLoadStart', function() {
            $.showIndicator();

        });
        $(window).on('pageAnimationStart', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadCancel', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadComplete', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadError', function() {
            $.hideIndicator();
            $.toast('加载失败');
        });
    }

    $(window).on('pageAnimationStart', function(event,id,page) {
        // 在路由切换页面动画开始前,为了把位于 .page 之外的 popup 等隐藏,此处做些处理
        $.closeModal();
        $.closePanel();
        // 如果 panel 的 effect 是 reveal 时,似乎是 page 的动画或别的样式原因导致了 transitionEnd 时间不会触发
        // 这里暂且处理一下
        $('body').removeClass('panel-closing');
        $.allowPanelOpen = true;  
    });
   
    $(window).on('pageInit', function() {
        $.hideIndicator();
        $.lastPosition({
            needMemoryClass: [
                '.content'
            ]
        });
    });
    // safari 在后退的时候会使用缓存技术，但实现上似乎存在些问题，
    // 导致路由中绑定的点击事件不会正常如期的运行（log 和 debugger 都没法调试），
    // 从而后续的跳转等完全乱了套。
    // 所以，这里检测到是 safari 的 cache 的情况下，做一次 reload
    // 测试路径(后缀 D 表示是 document，E 表示 external，不使用路由跳转）：
    // 1. aD -> bDE
    // 2. back
    // 3. aD -> bD
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            location.reload();
        }
    });

    $.init = function() {
        var $page = getPage();
        var id = $page[0].id;
        $.initPage();
        $page.trigger('pageInit', [id, $page]);
    };

    //DOM READY
    $(function() {
        //直接绑定
        FastClick.attach(document.body);

        if ($.smConfig.autoInit) {
            $.init();
        }

        $(document).on('pageInitInternal', function(e, id, page) {
            $.init();
        });
    });

}(Zepto);
