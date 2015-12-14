/* globals Zepto */

/**
 * 路由
 *
 *
 * 注: 以 _ 开头的函数标明用于此处内部使用,可随时变更,不对外确保兼容性.
 *
 */
+function($) {
    'use strict';

    if (!window.CustomEvent) {
        window.CustomEvent = function(type, config) {
            config = config || { bubbles: false, cancelable: false, detail: undefined};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);
            return e;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    var Util = {
        /**
         * 获取 url 的 fragment（即 hash 中去掉 # 的剩余部分）
         *
         * 如果没有则返回空字符串
         * 如: http://example.com/path/?query=d#123 => 123
         *
         * @param {String} url url
         * @returns {String}
         */
        getUrlFragment: function(url) {
            var hashIndex = url.indexOf('#');
            return hashIndex === -1 ? '' : url.slice(hashIndex + 1);
        },
        /**
         * 获取一个链接相对于当前页面的绝对地址形式
         *
         * 假设当前页面是 http://a.com/b/c
         * 那么有以下情况:
         * d => http://a.com/b/d
         * /e => http://a.com/e
         * #1 => http://a.com/b/c#1
         * http://b.com/f => http://b.com/f
         *
         * @param {String} url url
         * @returns {String}
         */
        getAbsoluteUrl: function(url) {
            var link = document.createElement('a');
            link.setAttribute('href', url);
            var absoluteUrl = link.href;
            link = null;
            return absoluteUrl;
        },
        /**
         * 获取一个 url 的基本部分,即不包括 hash
         *
         * @param {String} url url
         * @returns {String}
         */
        getBaseUrl: function(url) {
            var hashIndex = url.indexOf('#');
            return hashIndex === -1 ? url.slice(0) : url.slice(0, hashIndex);
        },
        /**
         * 把一个字符串的 url 转为一个可获取其 base 和 fragment 等的对象
         *
         * @param {String} url url
         * @returns {UrlObject}
         */
        toUrlObject: function(url) {
            var fullUrl = this.getAbsoluteUrl(url),
                baseUrl = this.getBaseUrl(fullUrl),
                fragment = this.getUrlFragment(url);

            return {
                original: url,
                full: fullUrl,
                base: baseUrl,
                fragment: fragment
            };
        },
        /**
         * 判断浏览器是否支持 sessionStorage,支持返回 true,否则返回 false
         * @returns {Boolean}
         */
        supportStorage: function() {
            var mod = 'sm.router.storage.ability';
            try {
                sessionStorage.setItem(mod, mod);
                sessionStorage.removeItem(mod);
                return true;
            } catch(e) {
                return false;
            }
        }
    };

    var routerConfig = {
        // router 容器的 id，page 需要放在这个容器里
        viewId: 'router-view',
        innerViewClass: 'router-view-inner',
        // 表示是当前 page 的 class
        curPageClass: 'page-current',
        // 表示是 page 的 class，注意，仅是标志 class，而不是所有的 class
        pageClass: 'page'
    };

    var DIRECTION = {
        leftToRight: 'from-left-to-right',
        rightToLeft: 'from-right-to-left'
    };

    var theHistory = window.history;

    var Router = function() {
        this.sessionNames = {
            back: 'sm.router.back',
            forward: 'sm.router.forward',
            currentState: 'sm.router.currentState',
            maxStateId: 'sm.router.maxStateId'
        };

        this._init();
        this.xhr = null;
        window.addEventListener('popstate', this._onPopState.bind(this));
    };

    /**
     * 初始化
     *
     * - 把当前文档内容缓存起来
     * - 查找默认展示的块内容,查找顺序如下
     *      1. id 是 url 中的 fragment 的元素
     *      2. 有当前块 class 标识的第一个元素
     *      3. 第一个块
     * - 初始页面 state 处理
     *
     * @private
     */
    Router.prototype._init = function() {

        this.$view = $('#' + routerConfig.viewId);
        if (!this.$view.length) {
            console.error && console.error('missing the element with id ' + routerConfig.viewId);
            return;
        }

        var curPageClass = routerConfig.curPageClass;
        var pageClass = routerConfig.pageClass;

        this.cache = {};

        var currentUrl = location.href;
        this._saveDocumentIntoCache($(document), currentUrl);

        var $pages = $('.' + pageClass);
        $pages.removeClass(curPageClass);
        var curPageId;

        // todo: 在 router 到 inner page 的情况下，刷新（或者直接访问该链接）
        // 这种情况下会闪屏，因为默认展示的 section 并不是 hash 对应的那个，是否用动画来做切换呢？
        var currentHash = location.hash;
        if (currentHash && $(currentHash).length) {
            curPageId = currentHash.slice(1);
            $(currentHash).addClass(curPageClass);
        } else {
            var $firstPage = $pages.eq(0);
            curPageId = $firstPage.attr('id');
            if (!curPageId) {
                curPageId = this._generateRandomId();
                $firstPage.attr('id', curPageId);
            }
            $firstPage.addClass(curPageClass);
        }

        // 新进入一个使用 history.state 相关技术的页面时,如果第一个 state 不 push/replace,
        // 那么在后退回该页面时,将不触发 popState 事件
        if (theHistory.state === null) {
            var curState = {
                id: this._getNextStateId(),
                url: Util.toUrlObject(currentUrl),
                pageId: curPageId
            };

            theHistory.replaceState(curState, '', currentUrl);
            this._saveAsCurrentState(curState);
            this._incMaxStateId();
        }
    };

    Router.prototype.load = function(url) {
        if (this._isTheSameDocument(location.href, url)) {
            this._switchToSection(Util.getUrlFragment(url));
        } else {
            this._switchToDocument(url);
        }
    };

    Router.prototype.forward = function() {
        theHistory.forward();
    };

    // 点击 .back 按钮
    Router.prototype.back = function() {
        theHistory.back();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    Router.prototype.loadPage = Router.prototype.load;

    Router.prototype._switchToSection = function(sectionId) {
        if (!sectionId) {
            return;
        }

        var $curPage = this._getCurrentSection(),
            $newPage = $('#' + sectionId);

        // 如果没有和 hash 对应的 dom 元素，那么让浏览器表现为普通的行为
        if (!$newPage.length) {
            location.href = '#' + sectionId;
            return;
        }

        // 如果已经是当前页，不做任何处理
        if ($curPage === $newPage) {
            return;
        }

        this._animateSection($curPage, $newPage, DIRECTION.rightToLeft);
        this._pushNewState('#' + sectionId, sectionId);
    };

    Router.prototype._switchToDocument = function(url, isPushState, direction) {
        var baseUrl = Util.toUrlObject(url).base;
        var cacheDocument = this.cache[baseUrl];

        if (cacheDocument) {
            this._doSwitchDocument(url, isPushState, direction);
        } else {
            this._loadDocument(url, function($doc) {
                try {
                    this._parseDocument(url, $doc);
                    this._doSwitchDocument(url, isPushState, direction);
                } catch (e) {
                    location.href = url;
                }
            }.bind(this));
        }
    };

    Router.prototype._doSwitchDocument = function(url, isPushState, direction) {
        if (typeof isPushState === 'undefined') {
            isPushState = true;
        }

        var urlObj = Util.toUrlObject(url);
        var $currentDoc = this.$view.find('.' + routerConfig.innerViewClass);
        var $newDoc = this.cache[urlObj.base].$content;

        // 确定一个 document 展示 section 的顺序
        // 1. 与 hash 关联的 element
        // 2. 默认的标识为 current 的 element
        // 3. 第一个 section
        var $allSection = $newDoc.find('.' + routerConfig.pageClass);
        var $visibleSection = $newDoc.find('.' + routerConfig.curPageClass);
        var $hashSection;

        if (urlObj.fragment) {
            $hashSection = $newDoc.find('#' + urlObj.fragment);
        }
        if ($hashSection && $hashSection.length) {
            $visibleSection = $hashSection.eq(0);
        } else if (!$visibleSection.length) {
            $visibleSection = $allSection.eq(0);
        }
        if (!$visibleSection.attr('id')) {
            $visibleSection.attr('id', this._generateRandomId());
        }

        $allSection.removeClass(routerConfig.curPageClass);
        $visibleSection.addClass(routerConfig.curPageClass);

        this.$view.append($newDoc);

        this._animateDocument($currentDoc, $newDoc, $visibleSection, direction);

        if (isPushState) {
            var newState = {
                id: this._getNextStateId(),
                pageId: $visibleSection.attr('id'),
                url: urlObj
            };

            theHistory.pushState(newState, '', url);
            this._saveAsCurrentState(newState);
            this._incMaxStateId();
        }
    };

    Router.prototype._isTheSameDocument = function(curUrl, newUrl) {
        return Util.toUrlObject(curUrl).base === Util.toUrlObject(newUrl).base;
    };

    Router.prototype._loadDocument = function(url, callback) {
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
            success: $.proxy(function(data, status, xhr) {
                var $doc = $('<html></html>');
                $doc.append(data);
                callback($doc, status, xhr);
            }, this),
            error: function() {
                self.dispatch("pageLoadError");
            },
            complete: function() {
                self.dispatch("pageLoadComplete");
            }
        });
    };

    Router.prototype._parseDocument = function(url, $doc) {
        var $view = $doc.find('#' + routerConfig.viewId);
        if (!$view.length) {
            throw new Error('missing router view id: ' + routerConfig.viewId);
        }

        var $innerView = $doc.find('.' + routerConfig.innerViewClass);

        if (!$innerView.length) {
            $innerView = $('<div></div>');
            $innerView.append($view.html()).appendTo($view);
        }

        this._saveDocumentIntoCache($doc, url);
    };

    Router.prototype._saveDocumentIntoCache = function(doc, url) {
        var urlAsKey = Util.toUrlObject(url).base;
        var $doc = $(doc);

        this.cache[urlAsKey] = {
            $doc: $doc,
            $content: $doc.find('.' + routerConfig.innerViewClass),
            content: $doc.find('#' + routerConfig.viewId).html()
        };
    };

    Router.prototype._getLastState = function() {
        var currentState = sessionStorage.getItem(this.sessionNames.currentState);
        try {
            currentState = JSON.parse(currentState);
        } catch(e) {
            currentState = null;
        }

        return currentState;
    };

    Router.prototype._saveAsCurrentState = function(state) {
        sessionStorage.setItem(this.sessionNames.currentState, JSON.stringify(state));
    };

    Router.prototype._getNextStateId = function() {
        var maxStateId = sessionStorage.getItem(this.sessionNames.maxStateId);
        return maxStateId ? parseInt(maxStateId, 10) + 1 : 1;
    };

    Router.prototype._incMaxStateId = function() {
        sessionStorage.setItem(this.sessionNames.maxStateId, this._getNextStateId());
    };

    Router.prototype._animateDocument = function($from, $to, $visibleSection, direction) {
        var sectionId = $visibleSection.attr('id');
        $visibleSection.trigger('pageAnimationStart', [sectionId, $visibleSection]);

        this._animateElement($from, $to, direction);

        $from.animationEnd(function() {
            $from.remove();
        });

        $to.animationEnd(function() {
            $visibleSection.trigger('pageAnimationEnd', [sectionId, $visibleSection]);
            // 外层（init.js）中会绑定 pageInitInternal 事件，然后对页面进行初始化
            $visibleSection.trigger('pageInitInternal', [sectionId, $visibleSection]);
        });
    };

    Router.prototype._animateSection = function($from, $to, direction) {
        var toId = $to.attr('id');

        $from.removeClass(routerConfig.curPageClass);
        $to.addClass(routerConfig.curPageClass);
        $to.trigger('pageAnimationStart', [toId, $to]);
        this._animateElement($from, $to, direction);
        $to.animationEnd(function() {
            $to.trigger('pageAnimationEnd', [toId, $to]);
            // 外层（init.js）中会绑定 pageInitInternal 事件，然后对页面进行初始化
            $to.trigger('pageInitInternal', [toId, $to]);
        });
    };

    Router.prototype._animateElement = function($from, $to, direction) {
        // todo: 可考虑如果入参不指定，那么尝试读取 $to 的属性，再没有再使用默认的
        // 考虑读取点击的链接上指定的方向
        if (typeof direction === 'undefined') {
            direction = DIRECTION.rightToLeft;
        }

        var animPageClasses = [
            'page-from-center-to-left',
            'page-from-center-to-right',
            'page-from-right-to-center',
            'page-from-left-to-center'].join(' ');

        var classForFrom, classForTo;
        switch(direction) {
            case DIRECTION.rightToLeft:
                classForFrom = 'page-from-center-to-left';
                classForTo = 'page-from-right-to-center';
                break;
            case DIRECTION.leftToRight:
                classForFrom = 'page-from-center-to-right';
                classForTo = 'page-from-left-to-center';
                break;
            default:
                classForFrom = 'page-from-center-to-left';
                classForTo = 'page-from-right-to-center';
                break;
        }

        $from.removeClass(animPageClasses).addClass(classForFrom);
        $to.removeClass(animPageClasses).addClass(classForTo);

        $from.animationEnd(function() {
            $from.removeClass(animPageClasses);
        });
        $to.animationEnd(function() {
            $to.removeClass(animPageClasses);
        });
    };

    Router.prototype._getCurrentSection = function() {
        return $('.' + routerConfig.curPageClass).eq(0);
    };

    // popState 后退
    Router.prototype._back = function(state, fromState) {
        if (this._isTheSameDocument(state.url.full, fromState.url.full)) {
            var $newPage = $('#' + state.pageId);
            if ($newPage.length) {
                var $currentPage = this._getCurrentSection();
                //this.animatePages($newPage, $currentPage, true);
                this._animateSection($currentPage, $newPage, DIRECTION.leftToRight);
                this._saveAsCurrentState(state);
            } else {
                location.href = state.url.full;
            }
        } else {
            this._switchToDocument(state.url.full, false, DIRECTION.leftToRight);
            this._saveAsCurrentState(state);
        }
    };

    // popState 前进
    Router.prototype._forward = function(state, fromState) {
        if (this._isTheSameDocument(state.url.full, fromState.url.full)) {
            var $newPage = $('#' + state.pageId);
            if ($newPage.length) {
                var $currentPage = this._getCurrentSection();
                //this.animatePages($currentPage, $newPage);
                this._animateSection($currentPage, $newPage, DIRECTION.rightToLeft);
                this._saveAsCurrentState(state);
            } else {
                location.href = state.url.full;
            }
        } else {
            this._switchToDocument(state.url.full, false, DIRECTION.rightToLeft);
            this._saveAsCurrentState(state);
        }
    };

    Router.prototype._onPopState = function(event) {
        var state = event.state;
        // if not a valid state, do nothing
        if (!state || !state.pageId) {
            return;
        }

        var lastState = this._getLastState();

        if (!lastState) {
            console.error && console.error('Missing last state when backward or forward');
            return;
        }

        if (state.id === lastState.id) {
            return;
        }

        if (state.id < lastState.id) {
            this._back(state, lastState);
        } else {
            this._forward(state, lastState);
        }
    };

    Router.prototype._pushNewState = function(url, sectionId) {
        var state = {
            id: this._getNextStateId(),
            pageId: sectionId,
            url: Util.toUrlObject(url)
        };

        theHistory.pushState(state, '', url);
        this._saveAsCurrentState(state);
        this._incMaxStateId();
    };

    Router.prototype._generateRandomId = function() {
        return "page-" + (+new Date());
    };

    Router.prototype.dispatch = function(event) {
        var e = new CustomEvent(event, {
            bubbles: true,
            cancelable: true
        });

        //noinspection JSUnresolvedFunction
        window.dispatchEvent(e);
    };

    $(function() {
        // 用户可选关闭router功能
        if (!$.smConfig.router) {
            return;
        }

        if (!Util.supportStorage()) {
            return;
        }

        var $pages = $('.' + routerConfig.pageClass);
        if (!$pages.length) {
            var logFn = console.warn || console.log;
            logFn && logFn('Disable router function because of no .page elements');
            return;
        }

        var router = $.router = new Router();

        $(document).on('click', 'a', function(e) {
            var $target = $(e.currentTarget);

            if ($target.hasClass('external') ||
                $target[0].hasAttribute('external') ||
                $target.hasClass('tab-link') ||
                $target.hasClass('open-popup') ||
                $target.hasClass('open-panel')
            ) return;

            var url = $target.attr('href');
            if (!url || url === '#') {
                return;
            }

            if ($target.hasClass('back')) {
                router.back(url);
            } else {
                router.load(url);
            }

            e.preventDefault();

        });
    });
}(Zepto);

/**
 * @typedef {Object} State
 * @property {Number} id
 * @property {String} url
 * @property {String} pageId
 */

/**
 * @typedef {Object} UrlObject 字符串 url 转为的对象
 * @property {String} base url 的基本路径
 * @property {String} full url 的完整绝对路径
 * @property {String} origin 转换前的 url
 * @property {String} fragment url 的 fragment
 */
