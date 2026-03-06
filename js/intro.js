+function ($) {
    "use strict";

    //全局配置
    var defaults = {
        autoInit: false, //自动初始化页面
        showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
        router: true, //默认使用router
        //点击超链接时是否使用缓存的全局标识，其中，单个链接通过[data-no-cache]来判断，
        //同时修改ignoreCache.forward或ignoreCache.back的值。
        //对于全部链接，则忽略[data-no-cache]，通过全局覆盖。
        ignoreCache: {
            forward: false,
            back: false,
            allForward: false,
            allBack: false
        },
        swipePanel: "left", //滑动打开侧栏
        swipePanelOnlyClose: true  //只允许滑动关闭，不允许滑动打开侧栏
    };

    $.smConfig = $.extend(defaults, $.config);

}(Zepto);
