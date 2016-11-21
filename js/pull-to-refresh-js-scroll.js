+ function($) {
    "use strict";
    //这里实在js滚动时使用的下拉刷新代码。

    var refreshTime = 0;
    var initPullToRefreshJS = function(pageContainer) {
        var eventsTarget = $(pageContainer);
        if (!eventsTarget.hasClass('pull-to-refresh-content')) {
            eventsTarget = eventsTarget.find('.pull-to-refresh-content');
        }
        if (!eventsTarget || eventsTarget.length === 0) return;

        var page = eventsTarget.hasClass('content') ? eventsTarget : eventsTarget.parents('.content');
        var scroller = $.getScroller(page[0]);
        if(!scroller) return;


        var container = eventsTarget;

        function handleScroll() {
            if (container.hasClass('refreshing')) return;
            if (scroller.scrollTop() * -1 >= 44) {
                container.removeClass('pull-down').addClass('pull-up');
            } else {
                container.removeClass('pull-up').addClass('pull-down');
            }
        }

        function handleRefresh() {
            if (container.hasClass('refreshing')) return;
            container.removeClass('pull-down pull-up');
            container.addClass('refreshing transitioning');
            container.trigger('refresh');
            refreshTime = +new Date();
        }
        scroller.on('scroll', handleScroll);
        scroller.scroller.on('ptr', handleRefresh);

        // Detach Events on page remove
        function destroyPullToRefresh() {
            scroller.off('scroll', handleScroll);
            scroller.scroller.off('ptr', handleRefresh);
        }
        eventsTarget[0].destroyPullToRefresh = destroyPullToRefresh;

    };

    var pullToRefreshDoneJS = function(container) {
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content.refreshing');
        if (container.length === 0) return;
        var interval = (+new Date()) - refreshTime;
        var timeOut = interval > 1000 ? 0 : 1000 - interval; //long than bounce time
        var scroller = $.getScroller(container);
        setTimeout(function() {
            scroller.refresh();
            container.removeClass('refreshing');
            container.transitionEnd(function() {
                container.removeClass("transitioning");
            });
        }, timeOut);
    };
    var pullToRefreshTriggerJS = function(container) {
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content');
        if (container.hasClass('refreshing')) return;
        container.addClass('refreshing');
        var scroller = $.getScroller(container);
        scroller.scrollTop(44 + 1, 200);
        container.trigger('refresh');
    };

    var destroyPullToRefreshJS = function(pageContainer) {
        pageContainer = $(pageContainer);
        var pullToRefreshContent = pageContainer.hasClass('pull-to-refresh-content') ? pageContainer : pageContainer.find('.pull-to-refresh-content');
        if (pullToRefreshContent.length === 0) return;
        if (pullToRefreshContent[0].destroyPullToRefresh) pullToRefreshContent[0].destroyPullToRefresh();
    };

    $._pullToRefreshJSScroll = {
        "initPullToRefresh": initPullToRefreshJS,
        "pullToRefreshDone": pullToRefreshDoneJS,
        "pullToRefreshTrigger": pullToRefreshTriggerJS,
        "destroyPullToRefresh": destroyPullToRefreshJS,
    };
}(Zepto); // jshint ignore:line
