/* ========================================================================
 * Ratchet: push.js v2.0.2
 * http://goratchet.com/components#push
 * ========================================================================
 * inspired by @defunkt's jquery.pjax.js
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

/* global _gaq: true */
/* global Zepto: true */

+ function ($) {
  'use strict';

  var noop = function () {};

  var getPage = function() {
    var page = $(".page")[0];
    if(!page) page = document.body;
    return page;
  };

  var getTransitionEnd = (function () {
    var el = document.createElement('ratchet');
    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition : 'transitionend',
      OTransition : 'oTransitionEnd otransitionend',
      transition : 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return transEndEventNames[name];
      }
    }

    return transEndEventNames.transition;
  })();

  if (!window.CustomEvent) {
    window.CustomEvent = function (type, config) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail, config.id);
      return e;
    };
  }
  // Pushstate caching
  // ==================

  var isScrolling;  //这个是没用的变量！
  var maxCacheLength = 20;
  //cacheMap 存储了三种数据
  //1. 每一次的历史记录对象 id: {id,url,title,...}
  //2. 前进的历史 cacheForwardStack ，里面存储的也是每一个
  //3. 后退的历史 cacheBackStack
  var cacheMapping   = sessionStorage;
  //缓存页面的DOM元素
  var domCache       = {};
  //记录滚动位置
  var scrollCache    = {};
  // Change these to unquoted camelcase in the next major version bump
  var transitionMap  = {
    'slide-in'  : 'slide-out',
    'slide-out' : 'slide-in',
    fade     : 'fade'
  };

  //需要交换的几种bar
  var bars = {
    bartab             : '.bar-tab',
    barnav             : '.bar-nav',
    barfooter          : '.bar-footer',
    barheadersecondary : '.bar-header-secondary',
    barfootersecondary : '.bar-footer-secondary'
  };

  //需要插入的其他内容，这些内容直接插入到页面中，不用交换
  var inserts = {
    popup: '.popup',
    panel: '.panel',
    panelOverlay: '.panel-overlay',
  };

  //替换掉当前最新的一个历史记录
  var cacheReplace = function (data, updates) {
    PUSH.id = data.id;
    if (updates) {
      data = getCached(data.id);
    }
    cacheMapping[data.id] = JSON.stringify(data);
    window.history.replaceState(data.id, data.title, data.url); //注意这里存的id
  };

  //浏览历史上的前进(点击了浏览器的前进按钮)
  var cachePush = function () {
    var id = PUSH.id;

    var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
    var cacheBackStack    = JSON.parse(cacheMapping.cacheBackStack    || '[]');

    cacheBackStack.push(id);

    while (cacheForwardStack.length) {
      delete cacheMapping[cacheForwardStack.shift()];
    }
    while (cacheBackStack.length > maxCacheLength) {
      delete cacheMapping[cacheBackStack.shift()];
    }

    if (getCached(PUSH.id).url) {
      window.history.pushState(null, '', getCached(PUSH.id).url);
    }

    cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
    cacheMapping.cacheBackStack    = JSON.stringify(cacheBackStack);
  };

  //浏览历史上的后退
  var cachePop = function (id, direction) {
    var forward           = direction === 'forward';
    var cacheForwardStack = JSON.parse(cacheMapping.cacheForwardStack || '[]');
    var cacheBackStack    = JSON.parse(cacheMapping.cacheBackStack    || '[]');
    var pushStack         = forward ? cacheBackStack    : cacheForwardStack;
    var popStack          = forward ? cacheForwardStack : cacheBackStack;

    if (PUSH.id) {
      pushStack.push(PUSH.id);
    }
    popStack.pop();

    cacheMapping.cacheForwardStack = JSON.stringify(cacheForwardStack);
    cacheMapping.cacheBackStack    = JSON.stringify(cacheBackStack);
  };

  var getCached = function (id) {
    return JSON.parse(cacheMapping[id] || null) || {};
  };

  //获取正确的A元素
  var getTarget = function (e) {
    var target = findTarget(e.target);

    if (!target ||
        e.which > 1 ||
        e.metaKey ||
        e.ctrlKey ||
        isScrolling ||
        location.protocol !== target.protocol ||
        location.host     !== target.host ||
        !target.hash && /#/.test(target.href) ||
        target.hash && target.href.replace(target.hash, '') === location.href.replace(location.hash, '') ||
        target.getAttribute('data-ignore') === 'push') { return; }

    return target;
  };


  // Main event handlers (touchend, popstate)
  // ==========================================

  /*
   * 当点击了浏览器的后退按钮之后执行此操作
   * 1，从 cacheMapping 中根据id 取出对应的历史
   * 2，因为id是时间戳，所以可以根据id和当前id的大小判断是前进还是后退
   * 3，
  */
  var popstate = function (e) {
    var key;
    var barElement;
    var activeObj;
    var activeDom;
    var direction;
    var transition;
    var transitionFrom;
    var transitionFromObj; //应该叫 transitionToObj 比较合理，就是需要加载的那个页面的 历史对象 
    var id = e.state; //上次通过 pushState 或者 replaceState 存的

    if (!id || !cacheMapping[id]) {
      return;
    }

    direction = PUSH.id < id ? 'forward' : 'back';  //这里的id是时间戳，因此可以根据大小来判断用户是前进还是后退

    cachePop(id, direction);

    activeObj = getCached(id);    //历史对象
    activeDom = domCache[id]; //因为是后退，所以直接用缓存中的dom，而不重新加载。也有可能取不到，因为用户有可能执行过刷新操作。

    if (activeObj.title) {
      document.title = activeObj.title;
    }

    //根据浏览方向（前进还是后退）来取对应的历史记录
    if (direction === 'back') {
      transitionFrom    = JSON.parse(direction === 'back' ? cacheMapping.cacheForwardStack : cacheMapping.cacheBackStack);
      transitionFromObj = getCached(transitionFrom[transitionFrom.length - 1]);
    } else {
      transitionFromObj = activeObj;
    }

    //不清楚这种情况是怎么发生的，点击了后退却没有取到后退历史
    if (direction === 'back' && !transitionFromObj.id) {
      return (PUSH.id = id);
    }

    transition = direction === 'back' ? transitionMap[transitionFromObj.transition] : transitionFromObj.transition;

    //没有取到缓存的DOM，那么就通过ajax加载
    //有两种情况会取不到：1，执行了前进操作。2，执行了后退，但是用户刷新了当前页面导致DOM缓存被清空
    if (!activeDom) {
      return PUSH({
        id         : activeObj.id,
        url        : activeObj.url,
        title      : activeObj.title,
        timeout    : activeObj.timeout,
        transition : transition,
        ignorePush : true
      });
    }

    activeObj = extendWithDom(activeObj, '.content', activeDom.cloneNode(true));
    for (key in bars) {
      if (bars.hasOwnProperty(key)) {
        barElement = document.querySelector(bars[key]);
        if (activeObj[key]) {
          swapContent(activeObj[key], barElement);
        } else if (barElement) {
          barElement.parentNode.removeChild(barElement);
        }
      }
    }

    var _data = extendWithDom(activeObj, '.content', activeDom.cloneNode(true));
    for (key in inserts) {
      if (inserts.hasOwnProperty(key)) {
        if (_data[key]) {
          insertContent(_data[key]);
        }
      }
    }

    swapContent(
      (activeObj.contents || activeDom).cloneNode(true),
      document.querySelector('.content'),
      transition, undefined, true
    );

    PUSH.id = id; //这个全局id很坏

    document.body.offsetHeight; // force reflow to prevent scroll
  };


  // Core PUSH functionality
  // =======================
  /*
   * 加载一个指定的url页面到当前页面，他会通过ajax加载页面，然后取出其中的contents和bars，插入到当前页面，然后做一个动画，最后删除旧的页面
   * 几个参数：
   * url: 要加载的页面的地址
   * container: 要替换的当前页面，默认直接取当前的 .content
   * transition: 需要执行的动画
   */

  var PUSH = function (options) {
    var key;
    var xhr = PUSH.xhr;

    options.container = options.container || options.transition ? document.querySelector('.content') : document.body;

    var isFileProtocol = /^file:/.test(window.location.protocol);

    for (key in bars) {
      if (bars.hasOwnProperty(key)) {
        options[key] = options[key] || document.querySelector(bars[key]);
      }
    }

    //如果有上一个没加载完，直接销毁
    if (xhr && xhr.readyState < 4) {
      xhr.onreadystatechange = noop;
      xhr.abort();
      triggerStateChange("pushCancel");
    }

    //创建xhr来加载新页面
    xhr = new XMLHttpRequest();
    if (isFileProtocol) {
      xhr.open('GET', options.url, false);
    } else {
      xhr.open('GET', options.url, true);
      xhr.setRequestHeader('X-PUSH', 'true');

      xhr.onreadystatechange = function () {
        if (options._timeout) {
          clearTimeout(options._timeout);
        }
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            success(xhr, options);
          } else {
            failure(options.url);
          }
        }
      };
    }

    //把当前页面作为一个历史记录存起来，因为如果是第一次进入页面，实际上当前页是没有存历史记录的
    //只有当用户第一次打开页面，然后在打开下一个页面的时候才会出现这种情况
    //也就是第一次调用PUSH的时候才会没有 PUSH.id 可以用
    if (!PUSH.id) {
      cacheReplace({
        id         : +new Date(),
        url        : window.location.href,
        title      : document.title,
        timeout    : options.timeout,
        transition : options.transition
      });
    }

    cacheCurrentContent();//缓存当前的DOM，其实就是整个body

    if (options.timeout) {
      options._timeout = setTimeout(function () {
        xhr.abort('timeout');
        triggerStateChange("pushCancel");
      }, options.timeout);
    }

    xhr.send();

    if (isFileProtocol) {
      if (xhr.status === 0 || xhr.status === 200) {
        success(xhr, options);
      } else {
        failure(options.url);
      }
    }

    if (xhr.readyState && !options.ignorePush) {
      cachePush();
    }
    triggerStateChange("pushStart");
    $(document).trigger("pageLoadStart", {url: options.url});
  };

  function cacheCurrentContent () {
    //缓存当前的DOM
    domCache[PUSH.id] = document.body.cloneNode(true);
    var $content = $(".content");
    var id = $content[0].id;
    if(id) {
      scrollCache[id] = $content.scrollTop();
    }
  }

  //恢复滚动位置
  function revertScroll(content) {
    var $content = $(content);
    var id = $content[0].id;
    if(id && $content.data("remember-scroll") !== "false") {
      $content.scrollTop(scrollCache[id]);
    }
  }


  // Main XHR handlers
  // =================

  /*
   * ajax加载新页面成功
   * 此时取到了新页面的html字符串
   * 然后只需要设置一下页面标题，再调用 swapContent 把新页面的内容换到当前页面就行了
   */
  var success = function (xhr, options) {
    var key;
    var barElement;
    var data = parseXHR(xhr, options);  //解析出其中的 contents，bars 以及 title

    if (!data.contents) {
      return locationReplace(options.url);
    }

    if (data.title) {
      document.title = data.title;
    }
    var id = options.id || +new Date();

    for (key in bars) {
      if (bars.hasOwnProperty(key)) {
        barElement = document.querySelector(bars[key]);
        if (data[key]) {
          swapContent(data[key], barElement);
        } else if (barElement) {
          barElement.parentNode.removeChild(barElement);
        }
      }
    }

    for (key in inserts) {
      if (inserts.hasOwnProperty(key)) {
        if (data[key]) {
          insertContent(data[key]);
        }
      }
    }

    swapContent(data.contents, options.container, options.transition, function () {
      //动画完成之后，会把当前页面存到历史记录中
      cacheReplace({
        id         : id,
        url        : data.url,
        title      : data.title,
        timeout    : options.timeout,
        transition : options.transition
      }, options.id);
    }, true);

    if (!options.ignorePush && window._gaq) {
      _gaq.push(['_trackPageview']); // google analytics
    }
    if (!options.hash) {
      return;
    }
  };

  var failure = function (url) {
    triggerStateChange("pushFail");
    throw new Error('Could not get: ' + url);
  };


  // PUSH helpers
  // ============

  /*
   * 交换两个DOM元素，可以指定一个切换动画
   * 用swap 替换 container 
   */
  var swapContent = function (swap, container, transition, complete, triggerPageInit) {
    var enter;
    var containerDirection;
    var swapDirection;
    triggerStateChange("pushAnimationStart");

    //现在会增加一个 .page 容器，目的是为了方便做整页动画。
    var page = getPage();



    if (!transition) {
      if (container) {
        container.innerHTML = swap.innerHTML;
        container.className = swap.className;
        container.id = swap.id;
        revertScroll(container);
      } else if (swap.classList.contains('content')) {
        page.appendChild(swap);
        revertScroll(swap);
      } else {
        $(swap).insertBefore(document.querySelector('.content'));
        revertScroll(swap);
      }
    } else {
      enter = /in$/.test(transition);

      if (transition === 'fade') {
        container.classList.add('in');
        container.classList.add('fade');
        swap.classList.add('fade');
      }

      if (/slide/.test(transition)) {
        swap.classList.add('sliding-in', enter ? 'right' : 'left');
        swap.classList.add('sliding');
        container.classList.add('sliding');
      }

      container.parentNode.insertBefore(swap, container);
      revertScroll(swap);
    }


    if(triggerPageInit) {
      if(!transition) {
        $('.content').trigger("pageAnimationStart", [swap.id, swap]);
      } else {
        $(swap).trigger("pageAnimationStart", [swap.id, swap]);
      }
    }

    var triggerComplete = function() {
      if (complete) {
        complete();
      }
      triggerStateChange("pushAnimationComplete");
      if(triggerPageInit) {
        triggerStateChange("push");
        if(!transition) {
          $.initPage($('.content'));
          $(".content").trigger("pageInit", [swap.id, swap]);
        } else {
          $.initPage($(swap));
          $(swap).trigger("pageInit", [swap.id, swap]);
        }
      }
    };

    if (!transition) {
      triggerComplete();
    }

    if (transition === 'fade') {
      container.offsetWidth; // force reflow
      container.classList.remove('in');
      var fadeContainerEnd = function () {
        container.removeEventListener(getTransitionEnd, fadeContainerEnd);
        swap.classList.add('in');
        //注意，安卓 4.2.0 及以下版本，无法正确触发 transitionEnd 事件，这个时候通过 timeout 模拟
        if($.os.android && $.compareVersion("4.2.0", $.os.version)) {
          setTimeout(fadeSwapEnd, $.smConfig.pushAnimationDuration);
        } else {
          swap.addEventListener(getTransitionEnd, fadeSwapEnd);
        }
      };
      var fadeSwapEnd = function () {
        swap.removeEventListener(getTransitionEnd, fadeSwapEnd);
        container.parentNode.removeChild(container);
        swap.classList.remove('fade');
        swap.classList.remove('in');
        triggerComplete();
      };
      if($.os.android && $.compareVersion("4.2.0", $.os.version)) {
        setTimeout(fadeContainerEnd, $.smConfig.pushAnimationDuration);
      } else {
        container.addEventListener(getTransitionEnd, fadeContainerEnd);
      }

    }

    if (/slide/.test(transition)) {
      var slideEnd = function () {
        swap.removeEventListener(getTransitionEnd, slideEnd);
        swap.classList.remove('sliding', 'sliding-in');
        swap.classList.remove(swapDirection);
        container.parentNode.removeChild(container);
        triggerComplete();
      };

      container.offsetWidth; // force reflow
      swapDirection      = enter ? 'right' : 'left';
      containerDirection = enter ? 'left' : 'right';
      container.classList.add(containerDirection);
      swap.classList.remove(swapDirection);
      if($.os.android && $.compareVersion("4.2.0", $.os.version)) {
        setTimeout(slideEnd, $.smConfig.pushAnimationDuration);
      } else {
        swap.addEventListener(getTransitionEnd, slideEnd);
      }
    }
  };

  //把DOM插入到当前页面
  var insertContent = function(dom) {
    $(dom).appendTo(document.body);
  };

  //自定义事件
  var triggerStateChange = function (event, id) {
    event = event || "push";
    var e = new CustomEvent(event, {
      detail: { state: getCached(PUSH.id) },
      bubbles: true,
      id: id,
      cancelable: true
    });

    window.dispatchEvent(e);
  };

  var findTarget = function (target) {
    var i;
    var toggles = document.querySelectorAll('a');

    for (; target && target !== document; target = target.parentNode) {
      for (i = toggles.length; i--;) {
        if (toggles[i] === target) {
          return target;
        }
      }
    }
  };

  var locationReplace = function (url) {
    window.history.replaceState(null, '', '#');
    window.location.replace(url);
  };

  /*
   * 把一个历史记录对象上面加上它对应的DOM
   * 本来一个历史对象只有 id, url, transition 等几个属性
   * 这里会追加上它对应的dom，比如 contents, barfooter 等
   */
  var extendWithDom = function (obj, fragment, dom) {
    var i;
    var result = {};

    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        result[i] = obj[i];
      }
    }

    var parts = $.extend({}, bars, inserts);
    Object.keys(parts).forEach(function (key) {
      var el = dom.querySelector(parts[key]);
      if (el) {
        el.parentNode.removeChild(el);
      }
      result[key] = el;
    });

    result.contents = dom.querySelector(fragment);

    return result;
  };

  /*
   * 解析xhr的返回结果，从其中抽取出：contents,bars,title,url
   */
  var parseXHR = function (xhr, options) {
    var head;
    var body;
    var data = {};
    var responseText = xhr.responseText;

    data.url = options.url;

    if (!responseText) {
      return data;
    }

    if (/<html/i.test(responseText)) {
      head           = document.createElement('div');
      body           = document.createElement('div');
      head.innerHTML = responseText.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0];
      body.innerHTML = responseText.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
    } else {
      head           = body = document.createElement('div');
      head.innerHTML = responseText;
    }

    data.title = head.querySelector('title') || document.querySelector('title');
    var text = 'innerText' in data.title ? 'innerText' : 'textContent';
    data.title = data.title && data.title[text].trim();

    if (options.transition) {
      data = extendWithDom(data, '.content', body);
    } else {
      data.contents = body;
    }

    return data;
  };


  // Attach PUSH event handlers
  // ==========================

  if($.smConfig.pushjs) {
    window.addEventListener('click', function (e) {
      //支持通过click触发
      var target = getTarget(e);

      if (!target) {
        return;
      }

      e.preventDefault();

      PUSH({
        url        : target.href,
        hash       : target.hash,
        timeout    : target.getAttribute('data-timeout'),
        transition : target.getAttribute('data-transition')
      });
    });
    window.addEventListener('popstate', popstate);
  }

  $(document).on("click", ".back", function() {
    history.back();
  });

  $.push = PUSH;

}(Zepto);
