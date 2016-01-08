// jshint ignore: start
/*
 * 路由器
 */
+function($) {
    "use strict";

    if (!window.CustomEvent) {
        window.CustomEvent = function(type, config) {
            config = config || { bubbles: false, cancelable: false, detail: undefined};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);
            return e;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    var Router = function() {
        this.state = sessionStorage;
        this.state.setItem("stateid", parseInt(this.state.getItem("stateid") || 1) + 1);
        this.state.setItem("currentStateID", this.state.getItem("stateid"));
        this.stack = sessionStorage;
        this.stack.setItem("back", "[]");  //返回栈, {url, pageid, stateid}
        this.stack.setItem("forward", "[]");  //前进栈, {url, pageid, stateid}
        this.init();
        this.xhr = null;
        // 解决各个webview针对页面重新加载（包括后退造成的）时History State的处理差异，加此标志位
        this.newLoaded = true;
    };

    Router.prototype.defaults = {};

    Router.prototype.init = function() {
        var currentPage = this.getCurrentPage(),
            page1st = $(".page").eq(0);
        if (!currentPage[0]) currentPage = page1st.addClass("page-current");
        var hash = location.hash;
        if(currentPage[0] && !currentPage[0].id) currentPage[0].id = (hash ? hash.slice(1) : this.genRandomID());

        if (!currentPage[0]) throw new Error("can't find .page element");
        var newCurrentPage = $(hash);

        // 确保是 page 时才切换显示，不然可能只是普通的 hash（#129）
        if (newCurrentPage[0] && newCurrentPage.hasClass('page')
            && (!currentPage[0] || hash.slice(1) !== currentPage[0].id)) {
            currentPage.removeClass("page-current");
            newCurrentPage.addClass("page-current");
            currentPage = newCurrentPage;
        }

        var id = this.genStateID(),
            curUrl = location.href,
            // 需要设置入口页的Url，方便用户在类似xx/yy#step2 的页面刷新加载后 点击后退可以回到入口页
            entryUrl = curUrl.split('#')[0];

        // 在页面加载时，可能会包含一个非空的状态对象history.state。这种情况是会发生的，例如，如果页面中使用pushState()或replaceState()方法设置了一个状态对象，然后用户重启了浏览器。https://developer.mozilla.org/en-US/docs/Web/API/History_API#Reading_the_current_state
        history.replaceState({url: curUrl, id: id}, '', curUrl);
        this.setCurrentStateID(id);
        this.pushBack({
            url: entryUrl,
            pageid: '#' + page1st[0].id,
            id: id
        });
        window.addEventListener('popstate', $.proxy(this.onpopstate, this));
    };

    //加载一个页面,传入的参数是页面id或者url
    Router.prototype.loadPage = function(url) {

        // android chrome 在移动端加载页面时不会触发一次‘popstate’事件
        this.newLoaded && (this.newLoaded = false);
        this.getPage(url, function(page) {

            var pageid = this.getCurrentPage()[0].id;
            this.pushBack({
                url: url,
                pageid: "#" + pageid,
                id: this.getCurrentStateID()
            });

            //删除全部forward
            var forward = JSON.parse(this.state.getItem("forward") || "[]");
            for (var i = 0; i < forward.length; i++) {
                $(forward[i].pageid).each(function() {
                    var $page = $(this);
                    if ($page.data("page-remote")) $page.remove();
                });
            }
            this.state.setItem("forward", "[]");  //clearforward

            page.insertAfter($(".page")[0]);
            this.animatePages(this.getCurrentPage(), page);

            var id = this.genStateID();
            this.setCurrentStateID(id);

            this.pushState(url, id);

            this.forwardStack = [];  //clear forward stack

        });
    };

    /**
     * 页面转场效果
     *
     * 首先给要移入展示的页面添加上当前页面标识（page-current），要移出展示的移除当前页面标识；
     * 然后给移入移除的页面添加上对应的动画 class，动画结束后清除动画 class 并发送对应事件。
     *
     * 注意，不能在动画后才给移入展示的页面添加当前页面标识，否则，在快速切换的时候将会因为没有 .page-current
     * 的页面而报错（具体来说是找这类页面的 id 时报错，目前并没有确保 id 查找的健壮性）
     *
     * @param leftPage 从效果上看位于左侧的页面，jQuery/Zepto 对象
     * @param rightPage 从效果上位于右侧的页面，jQuery/Zepto 对象
     * @param {Boolean} leftToRight 是否是从左往右切换（代表是后退），默认是相当于 false
     */
    Router.prototype.animatePages = function(leftPage, rightPage, leftToRight) {
        var curPageClass = 'page-current';
        var animPageClasses = [
            'page-from-center-to-left',
            'page-from-center-to-right',
            'page-from-right-to-center',
            'page-from-left-to-center'].join(' ');

        if (!leftToRight) {
            // 新页面从右侧切入
            rightPage.trigger("pageAnimationStart", [rightPage[0].id, rightPage]);
            leftPage.removeClass(animPageClasses).removeClass(curPageClass).addClass('page-from-center-to-left');
            rightPage.removeClass(animPageClasses).addClass(curPageClass).addClass('page-from-right-to-center');
            leftPage.animationEnd(function() {
                leftPage.removeClass(animPageClasses);
            });
            rightPage.animationEnd(function() {
                rightPage.removeClass(animPageClasses);
                rightPage.trigger("pageAnimationEnd", [rightPage[0].id, rightPage]);
                rightPage.trigger("pageInitInternal", [rightPage[0].id, rightPage]);
            });
        } else {
            leftPage.trigger("pageAnimationStart", [rightPage[0].id, rightPage]);
            leftPage.removeClass(animPageClasses).addClass(curPageClass).addClass('page-from-left-to-center');
            rightPage.removeClass(animPageClasses).removeClass(curPageClass).addClass('page-from-center-to-right');
            leftPage.animationEnd(function() {
                leftPage.removeClass(animPageClasses);
                leftPage.trigger("pageAnimationEnd", [leftPage[0].id, leftPage]);
                leftPage.trigger("pageReinit", [leftPage[0].id, leftPage]);
            });
            rightPage.animationEnd(function() {
                rightPage.removeClass(animPageClasses);
            });
        }

    };

    Router.prototype.getCurrentPage = function() {
        return $(".page-current");
    };

    // 其实没调用到，如果无法前进，则加载对应的url
    Router.prototype.forward = function(url) {
        var stack = JSON.parse(this.stack.getItem("forward"));
        if (stack.length) {
            history.forward();
        } else {
            location.href = url;
        }
    };

    // 点击 .back 按钮，如果无法后退，则加载对应的url
    Router.prototype.back = function(url) {
        var stack = JSON.parse(this.stack.getItem("back"));
        if (stack.length) {
            history.back();
        } else if (url) {
            location.href = url;
        } else {
            console.warn('[router.back]: can not back')
        }
    };

    // popstate 后退
    Router.prototype._back = function(url) {
        var h = this.popBack();
        var currentPage = this.getCurrentPage();
        var newPage = $(h.pageid);
        if (!newPage[0]) return;
        this.pushForward({url: location.href, pageid: "#" + currentPage[0].id, id: this.getCurrentStateID()});
        this.setCurrentStateID(h.id);
        this.animatePages(newPage, currentPage, true);
    };

    // popstate 前进
    Router.prototype._forward = function() {
        var h = this.popForward();
        var currentPage = this.getCurrentPage();
        var newPage = $(h.pageid);
        if (!newPage[0]) return;
        this.pushBack({url: location.href, pageid: "#" + currentPage[0].id, id: this.getCurrentStateID()});
        this.setCurrentStateID(h.id);
        this.animatePages(currentPage, newPage);
    };

    Router.prototype.pushState = function(url, id) {
        history.pushState({url: url, id: id}, '', url);
    };

    Router.prototype.onpopstate = function(d) {
        var state = d.state;
        // 刷新再后退导致无法取到state
        if (!state || this.newLoaded) {
            this.newLoaded = false;
            return;
        }

        if (state.id === this.getCurrentStateID()) {
            return false;
        }
        var forward = state.id > this.getCurrentStateID();
        if (forward) this._forward();
        else this._back(state.url);
    };

    //根据url获取页面的DOM，如果是一个内联页面，则直接返回，否则用ajax加载
    Router.prototype.getPage = function(url, callback) {
        if (url[0] === "#") return callback.apply(this, [$(url)]);

        this.dispatch("pageLoadStart");

        if (this.xhr && this.xhr.readyState < 4) {
            this.xhr.onreadystatechange = function() {
            };
            this.xhr.abort();
            this.dispatch("pageLoadCancel");
        }

        var self = this;

        this.xhr = $.ajax({
            url: url,
            success: $.proxy(function(data, s, xhr) {
                var $page = this.parseXHR(xhr);
                if (!$page[0].id) $page[0].id = this.genRandomID();
                $page.data("page-remote", 1);
                callback.apply(this, [$page]);
            }, this),
            error: function() {
                self.dispatch("pageLoadError");
            },
            complete: function() {
                self.dispatch("pageLoadComplete");
            }
        });
    };

    Router.prototype.parseXHR = function(xhr) {
        var html = '';
        var response = xhr.responseText;
        var matches = response.match(/<body[^>]*>([\s\S.]*)<\/body>/i);
        if(matches) {
            html = matches[1];
        } else {
            html = response;
        }
        html = "<div>" + html + "</div>";
        var tmp = $(html);

        tmp.find(".popup, .panel, .panel-overlay").appendTo(document.body);

        var $page = tmp.find(".page");
        if (!$page[0]) $page = tmp.addClass("page");
        return $page;
    };

    Router.prototype.genStateID = function() {
        var id = parseInt(this.state.getItem("stateid")) + 1;
        this.state.setItem("stateid", id);
        return id;
    };

    Router.prototype.getCurrentStateID = function() {
        return parseInt(this.state.getItem("currentStateID"));
    };

    Router.prototype.setCurrentStateID = function(id) {
        this.state.setItem("currentStateID", id);
    };

    Router.prototype.genRandomID = function() {
        return "page-" + (+new Date());
    };

    Router.prototype.popBack = function() {
        var stack = JSON.parse(this.stack.getItem("back"));
        if (!stack.length) return null;
        var h = stack.splice(stack.length - 1, 1)[0];
        this.stack.setItem("back", JSON.stringify(stack));
        return h;
    };

    Router.prototype.pushBack = function(h) {
        var stack = JSON.parse(this.stack.getItem("back"));
        stack.push(h);
        this.stack.setItem("back", JSON.stringify(stack));
    };

    Router.prototype.popForward = function() {
        var stack = JSON.parse(this.stack.getItem("forward"));
        if (!stack.length) return null;
        var h = stack.splice(stack.length - 1, 1)[0];
        this.stack.setItem("forward", JSON.stringify(stack));
        return h;
    };

    Router.prototype.pushForward = function(h) {
        var stack = JSON.parse(this.stack.getItem("forward"));
        stack.push(h);
        this.stack.setItem("forward", JSON.stringify(stack));
    };

    Router.prototype.dispatch = function(event) {
        var e = new CustomEvent(event, {
            bubbles: true,
            cancelable: true
        });

        window.dispatchEvent(e);
    };

    $(function() {
        // 用户可选关闭router功能
        if (!$.smConfig.router) return;
        var router = $.router = new Router();
        $(document).on("click", "a", function(e) {
            var $target = $(e.currentTarget);
            if ($target.hasClass("external") ||
                $target[0].hasAttribute("external") ||
                $target.hasClass("tab-link") ||
                $target.hasClass("open-popup") ||
                $target.hasClass("open-panel")
            ) return;
            e.preventDefault();
            var url = $target.attr("href");
            if ($target.hasClass("back")) {
                router.back(url);
                return;
            }

            if (!url || url === "#") return;
            router.loadPage(url);
        })
    });
}(Zepto);
// jshint ignore: end
