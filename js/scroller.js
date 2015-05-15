/* ===============================================================================
************   scroller   ************
=============================================================================== */
/* global Zepto:true */
+ function($) {
    "use strict";
    //比较一个字符串版本号
    //a > b === 1
    //a = b === 0
    //a < b === -1
    var compareVersion = function(a, b) {
        var as = a.split('.');
        var bs = b.split('.');
        if (a === b) return 0;

        for (var i = 0; i < as.length; i++) {
            var x = parseInt(as[i]);
            if (!bs[i]) return 1;
            var y = parseInt(bs[i]);
            if (x < y) return -1;
            if (x > y) return 1;
        }
        return 1;
    };
    //重置zepto自带的滚动条
    var _zeptoMethodCache = {
        "scrollTop": $.fn.scrollTop,
        "scrollLeft": $.fn.scrollLeft
    };
    //重置scrollLeft和scrollRight
    (function() {
        $.extend($.fn, {
            scrollTop: function(top) {
                if (!this.length) return;
                var scroller = this.data('scroller');
                if (scroller && this.hasClass('javascript-scroll')) { //js滚动
                    if (top !== undefined) {
                        scroller.scroller.scrollTo(0, -1 * top);
                        return this;
                    } else {
                        return scroller.scroller.getComputedPosition().y * -1;
                    }
                } else {
                    return _zeptoMethodCache.scrollTop.apply(this, arguments);
                }
            }
        });
        $.extend($.fn, {
            scrollLeft: function(left) {
                if (!this.length) return;
                var scroller = this.data('scroller');
                if (scroller && this.hasClass('javascript-scroll')) { //js滚动
                    if (top !== undefined) {
                        scroller.scroller.scrollTo(-1 * left, 0);
                        return this;
                    } else {
                        return scroller.scroller.getComputedPosition().x * -1;
                    }
                } else {
                    return _zeptoMethodCache.scrollLeft.apply(this, arguments);
                }
            }
        });
    })();



    //自定义的滚动条
    var Scroller = function(pageContent, _options) {
        var $pageContent = this.$pageContent = $(pageContent);

        this.options = $.extend({}, this._defaults, _options);

        var type = this.options.type;
        //auto的type,系统版本的小于4.4.0的安卓设备和系统版本小于6.0.0的ios设备，启用js版的iscoll
        var useJSScroller = (type === 'js') || (type === 'auto' && ($.os.android && compareVersion('4.4.0', $.os.version) > -1) || ($.os.ios && compareVersion('6.0.0', $.os.version) > -1));

        if (useJSScroller) {
            var ptr = $(pageContent).hasClass('pull-to-refresh-content');
            var options = {
                probeType: 1,
                mouseWheel: true,
            };
            if (ptr) {
                options.ptr = true;
                options.ptrOffset = 44;
            }
            this.scroller = new IScroll(pageContent, options); // jshint ignore:line
            //和native滚动统一起来
            this._bindEventToDomWhenJs();
            /* app.initPullToRefresh = app.initPullToRefreshJS;
             app.pullToRefreshDone = app.pullToRefreshDoneJS;
             app.pullToRefreshTrigger = app.pullToRefreshTriggerJS;
             app.destroyToRefresh = app.destroyToRefreshJS;*/
            $pageContent.addClass('javascript-scroll');
        } else {
            $pageContent.addClass('native-scroll');
        }
    };
    Scroller.prototype = {
        _defaults: {
            type: 'auto',
        },
        _scrollTop: function(top, dur) {
            if (this.scroller) {
                if (top !== undefined) {
                    this.scroller.scrollTo(0, -1 * top, dur);
                } else {
                    return this.scroller.getComputedPosition().y * -1;
                }
            } else {
                return this.$pageContent.scrollTop(top, dur);
            }
            return this;
        },
        _scrollLeft: function() {

        },
        _bindEventToDomWhenJs: function() {
            //"scrollStart", //the scroll started.
            //"scroll", //the content is scrolling. Available only in scroll-probe.js edition. See onScroll event.
            //"scrollEnd", //content stopped scrolling.
            if (this.scroller) {
                var self = this;
                this.scroller.on('scrollStart', function function_name() {
                    self.$pageContent.trigger('scrollstart');
                });
                this.scroller.on('scroll', function function_name() {
                    self.$pageContent.trigger('scroll');
                });
                this.scroller.on('scrollEnd', function function_name() {
                    self.$pageContent.trigger('scrollend');
                });
            } else {
                //TODO: 实现native的scrollStart和scrollEnd

            }
        },
        refresh: function() {
            if (this.scroller) this.scroller.refresh();
            return this;
        },
        scrollHeight: function() {
            if (this.scroller) {
                return this.scroller.scrollerHeight;
            } else {
                return this.$pageContent[0].scrollHeight;
            }
        }

    };

    //Scroller PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function() {


            var $this = $(this);

            var $pageContentInner = $this.find('.scroller-content-inner');
            //如果滚动内容没有被包裹，自动添加wrap
            if (!$pageContentInner[0]) {
                $this.html('<div class="scroller-content-inner">' + $this.html() + '</div>');
            }

            if ($this.hasClass('pull-to-refresh-content')) {
                //因为iscroll 当页面高度不足 100% 时无法滑动，所以无法触发下拉动作，这里改动一下高度
                $this.find('.page-content-inner').css('min-height', ($(window).height() + 20) + 'px');
            }



            var data = $this.data('scroller');
            var options = $.extend({}, typeof option === 'object' && option);

            //如果 scroller 没有被初始化，对scroller 进行初始化r
            if (!data) {
                //获取data-api的值

                if (!options.type && $this.data('scroller-type')) options.type = $this.data('scroller-type');
                $this.data('scroller', (data = new Scroller(this, options)));

            } else {
                //TODO: 如果已经初始化了。  
            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
                    return false;
            }

        });

        if (internal_return !== undefined)
            return internal_return;
        else
            return this;

    }

    var old = $.fn.scroller;

    $.fn.scroller = Plugin;
    $.fn.scroller.Constructor = Scroller;


    // Scroll NO CONFLICT
    // =================

    $.fn.scroller.noConflict = function() {
        $.fn.scroller = old;
        return this;
    };
    //添加data-api
    //
    $(function() {
        $('[data-toggle="scroller"]').scroller();
    });

}(Zepto);
