/* global Zepto:true */
+function ($) {
  "use strict";

  var Router = function() {
    this.state = sessionStorage;
    this.state.setItem("stateid", this.state.getItem("stateid") || 1);
    this.state.setItem("currentStateID", this.state.getItem("stateid"));
    this.urlIDMap = {};
    this.init();
  }
  Router.prototype.init = function() {
    var currentPage = this.getCurrentPage();
    if(!currentPage[0]) currentPage = $(".page").eq(0).addClass("page-current");
    var hash = location.hash;
    if(currentPage[0] && !currentPage[0].id) currentPage[0].id = (hash ? hash.slice(1) : this.genRandomID());

    if(!currentPage[0]) throw new Error("can't find .page element");
    var newCurrentPage = $(hash); 

    if(newCurrentPage[0] && (!currentPage[0] || hash.slice(1) !== currentPage[0].id)) {
      currentPage.removeClass("page-current");
      newCurrentPage.addClass("page-current");
      this.pushstate(hash);
    } else {
      this.pushstate("#"+currentPage[0].id);
    }

    window.addEventListener('popstate', $.proxy(this.onpopstate, this));
  }

  //加载一个页面,传入的参数是页面id或者url
  Router.prototype.loadPage = function(url) {
    this.getPage(url, function(page) {
      this.animatePages(this.getCurrentPage(), page);
      this.pushstate(url);
      page.trigger("pageInit", {url: url});
    });
  }

  Router.prototype.animatePages = function (leftPage, rightPage, leftToRight) {
    var removeClasses = 'page-left page-right page-current page-from-center-to-left page-from-center-to-right page-from-right-to-center page-from-left-to-center';
    if (!leftToRight) {
      leftPage.removeClass(removeClasses).addClass('page-from-center-to-left');
      rightPage.removeClass(removeClasses).addClass('page-from-right-to-center');
      leftPage.animationEnd(function() {
        leftPage.removeClass(removeClasses);
      });
      rightPage.animationEnd(function() {
        rightPage.removeClass(removeClasses).addClass("page-current");
      });
    } else {
      leftPage.removeClass(removeClasses).addClass('page-from-left-to-center');
      rightPage.removeClass(removeClasses).addClass('page-from-center-to-right');
      leftPage.animationEnd(function() {
        leftPage.removeClass(removeClasses).addClass("page-current");
      });
      rightPage.animationEnd(function() {
        rightPage.removeClass(removeClasses);
      });
    }

  }
  Router.prototype.getCurrentPage = function () {
    return $(".page-current");
  }

  //后退
  Router.prototype.back = function() {}

  //前进
  Router.prototype.forward = function() {}

  Router.prototype.pushstate = function(url) {
    var id = this.genStateID();
    history.pushState({url: url, id: id}, '', url);
    this.setCurrentStateID(id);
  }
  Router.prototype.popstate = function() {
  }

  Router.prototype.onpopstate = function(d) {
    var state = d.state;
    if(!state || !state.url) {
      location.reload();
      return false;
    }
    if(state.id === this.currentStateID) {
      console.log("current page");
      return false;
    }
    var forward = state.id > this.getCurrentStateID();
    var currentPage = this.getCurrentPage();
    if(!currentPage || ("#"+currentPage[0].id) === state.url) return false;
    this.getPage(state.url, function(page) {
      if(forward) {
        this.animatePages(currentPage, page);
      } else {
        this.animatePages(page, currentPage, true);
      }
      this.setCurrentStateID(state.id);
    });
  }


  //根据url获取页面的DOM，如果是一个内联页面，则直接返回，否则用ajax加载
  Router.prototype.getPage = function(url, callback) {
    if(url.startsWith("#")) return callback.apply(this, [$(url)]);
    if(this.urlIDMap[url]) return callback.apply(this, [$(this.urlIDMap[url])]);

    $.ajax({
      url: url,
      success: $.proxy(function(data, s, xhr) {
        var response = xhr.responseText;
        var html  = response.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[1];
        if(!html) html = response;
        html = "<div>"+html+"</div>";
        var tmp = $(html);
        var $page = tmp.find(".page");
        if(!$page[0]) $page = tmp.addClass("page");
        $page.insertAfter($(".page")[0]);
        if(!$page[0].id) $page[0].id = this.genRandomID();
        this.urlIDMap[url] = "#"+$page[0].id;
        callback.apply(this, [$page]);
      }, this)
    });
  }

  Router.prototype.genStateID = function() {
    var id = parseInt(this.state.getItem("stateid")) + 1;
    this.state.setItem("stateid", id);
    return id;
  }
  Router.prototype.getCurrentStateID = function() {
    return parseInt(this.state.getItem("currentStateID"));
  }
  Router.prototype.setCurrentStateID = function(id) {
    this.state.setItem("currentStateID", id);
  }
  Router.prototype.genRandomID = function() {
    return "page-"+(+new Date());
  }

  $(function() {
    var router = new Router();
    $(document).on("click", "a", function(e) {
      var $target = $(e.currentTarget);
      if($target.hasClass("external") ||
         $target.attr("external") ||
         $target.hasClass("tab-link") ||
         $target.hasClass("open-popup") ||
         $target.hasClass("open-panel")
        ) return;
      var url = $target.attr("href");
      if(!url || url === "#") return;
      e.preventDefault();
      router.loadPage(url);
    })
  });
}(Zepto);
