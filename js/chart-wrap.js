/* global Zepto:true */
+ function($) {
  "use strict";


  //获取由 data-json / data-ajax / data-jsonp 指定的数据
  var getData = function(dom, success) {
    var $this = $(dom);
    var d = $this.data('json');
    if(d && (typeof d == typeof 'a')) {
      success(JSON.parse(d));
      return;
    }
    if(!d) {
      var ajax = $this.data("ajax");
      if(ajax) {
        $.getJSON(ajax, function(d) {
          success($.smConfig.ajaxDataParser(d));
        });
      }
    } else {
      success(d);
    }
  }
  

  var pie = function($this, data, options, donut) {

    var $this = $($this);
    if($this.hasClass("loading")) return;

    var colors = [
      {
        color:"#F7464A",
        highlight: "#FF5A5E"
      },
      {
        color: "#46BFBD",
        highlight: "#5AD3D1"
      },
      {
        color: "#FDB45C",
        highlight: "#FFC870"
      },
      {
        color: "#949FB1",
        highlight: "#A8B3C5"
      },
      {
        color: "#4D5360",
        highlight: "#616774"
      }
    ];

    var format = function (data) {
      var result = [];
      for(var i=0;i<data.length;i++) {
        var c = colors[i];
        var d = data[i];
        if(typeof d !== typeof {}) {  //只传入了一个数字组成的数组。
          d = {
            value: d,
            label: d
          }
        }
        if(c) {
          d.color = d.color || c.color;
          d.highlight = d.highlight || c.highlight;
        }
        result.push(d); //不直接改data，因为有可能是值类型。
      }
      return result;
    }

    var render = function(d) {
      if(donut) {
        $this.data("chart", _chart.Doughnut(format(d), options));
      } else {
        $this.data("chart", _chart.Pie(format(d), options));
      }
      $this.removeClass("loading");
      $this.data("last", data);
      $this.trigger("complete");
    }


    var chart = $this.data("chart");
    if(chart && (typeof data == typeof 'a')) {
      //已经有一个chart，要对其进行一些操作
      return chart[data](options);
    }
    //传入一个数据，重新render
    chart && chart.destroy();
    var _chart = new Chart($this[0].getContext("2d"));
    $this.addClass("loading");
    if(data) {
      render(data, options);
    } else {
      getData($this, render);
    }
  };

  $.fn.pie = function(data, options) {
    var r;
    this.each(function() {
      r = r || pie($(this), data, options);
    });
    if(r) return r;
    return this;
  }

  $.fn.donut = function(data, options) {
    $.fn.pie = function(data, options) {
    var r;
    this.each(function() {
      r = r || pie($(this), data, options, true);
    });
    if(r) return r;
    return this;
  }


  //初始化页面中的所有chart
  $.initChart = function(page) {
    var $page = $(page || ".content");
    $page.find("[data-toggle='pie']").pie();
    $page.find("[data-toggle='donut']").donut();
  };

}(Zepto);
