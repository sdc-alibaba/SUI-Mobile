/* global Zepto:true */
+ function($) {
  "use strict";

  

  //pie chart
  $.fn.pie = function(data, options) {

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

    function format(data) {
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
      }
      return data;
    }

    if(!options) {
      options = data;
    }

    this.each(function() {
      var $this = $(this);
      var chart = $this.data("chart");
      if(chart) {
        return;
      }
      $this.data("chart", chart = new Chart($this[0].getContext("2d")));
      var d = data || $this.data('json');
      if(d && (typeof d == typeof 'a')) d = JSON.parse(d);
      if(!d) {
        var url = $this.data("url");
        if(url) {
          $.getJSON(url, function(d) {
            chart.Pie(format($.smConfig.ajaxDataParser(d)), options);
          });
        }
      } else {
        chart.Pie(format(d), options);
      }
    });
  };


  //初始化页面中的所有chart
  $.initChart = function(page) {
    var $page = $(page || ".content");
    $page.find("[data-toggle='pie']").pie();
  };

  $(function() {
    $.initChart();
  });
}(Zepto);
