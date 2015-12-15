/* global Zepto:true */
/*jshint unused: false*/
+function ($) {
    "use strict";

    var getPage = function() {
        var $page = $(".page-current");
        if(!$page[0]) $page = $(".page").addClass("page-current");
        return $page;
    };

    //初始化页面中的JS组件
    $.initPage = function(page) {
        var $page = getPage();
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
        $(window).on("pageLoadStart", function() {
            $.showIndicator();
        });
        $(document).on("pageAnimationStart", function() {
            $.hideIndicator();
        });
        $(window).on("pageLoadCancel", function() {
            $.hideIndicator();
        });
        $(window).on("pageLoadError", function() {
            $.hideIndicator();
            $.toast("加载失败");
        });
    }



    $.init = function() {
        var $page = getPage();
        var id = $page[0].id;
        $.initPage();
        $page.trigger("pageInit", [id, $page]);
    };

    $(function() {
        if($.smConfig.autoInit) {
            $.init();
        }

        $(document).on("pageInitInternal", function(e, id, page) {
            $.init();
        });
    });


}(Zepto);
