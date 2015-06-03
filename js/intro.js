/* global Zepto:true */
+function ($) {
  "use strict";

  //全局配置
  var defaults = {
    autoInit: true, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    pushjs: true, //默认使用push.js加载页面
    pushAnimationDuration: 400  //不要动这个，这是解决安卓 animationEnd 事件无法触发的bug
  };

  $.smConfig = $.extend(defaults, $.config);

}(Zepto);
