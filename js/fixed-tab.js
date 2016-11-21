/* ===============================================================================
************   Tabs   ************
=============================================================================== */
+function ($) {
    "use strict";
    $.initFixedTab = function(){
        var $fixedTab = $('.fixed-tab');
        if ($fixedTab.length === 0) return;
        $('.fixed-tab').fixedTab();//默认{offset: 0}
    };
    var FixedTab = function(pageContent, _options) {
        var $pageContent = this.$pageContent = $(pageContent);
        var shadow = $pageContent.clone();
        var fixedTop = $pageContent[0].getBoundingClientRect().top;

        shadow.css('visibility', 'hidden');
        this.options = $.extend({}, this._defaults, {
            fixedTop: fixedTop,
            shadow: shadow,
            offset: 0
        }, _options);

        this._bindEvents();
    };

    FixedTab.prototype = {
        _defaults: {
            offset: 0,
        },
        _bindEvents: function() {
            this.$pageContent.parents('.content').on('scroll', this._scrollHandler.bind(this));
            this.$pageContent.on('active', '.tab-link', this._tabLinkHandler.bind(this));
        },
        _tabLinkHandler: function(ev) {
            var isFixed = $(ev.target).parents('.buttons-fixed').length > 0;
            var fixedTop = this.options.fixedTop;
            var offset = this.options.offset;
            $.refreshScroller();
            if (!isFixed) return;
            this.$pageContent.parents('.content').scrollTop(fixedTop - offset);
        },
        // 滚动核心代码
        _scrollHandler: function(ev) {
            var $scroller = $(ev.target);
            var $pageContent = this.$pageContent;
            var shadow = this.options.shadow;
            var offset = this.options.offset;
            var fixedTop = this.options.fixedTop;
            var scrollTop = $scroller.scrollTop();
            var isFixed = scrollTop >= fixedTop - offset;
            if (isFixed) {
                shadow.insertAfter($pageContent);
                $pageContent.addClass('buttons-fixed').css('top', offset);
            } else {
                shadow.remove();
                $pageContent.removeClass('buttons-fixed').css('top', 0);
            }
        }
    };

    //FixedTab PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        this.each(function() {
            var $this = $(this);
            var options = $.extend({}, $this.dataset(), typeof option === 'object' && option);
            var data = $this.data('fixedtab');
            if (!data) {
                //获取data-api的
                $this.data('fixedtab', (data = new FixedTab(this, options)));
            }
        });

    }
    $.fn.fixedTab = Plugin;
    $.fn.fixedTab.Constructor = FixedTab;
    $(document).on('pageInit',function(){
        $.initFixedTab();
    });



}(Zepto);
