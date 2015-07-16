/* global Zepto:true */

+ function($) {

  var today = new Date();

  var getDays = function(max) {
    var monthes = [];
    for(var i=1; i<= (max||31);i++) {
      monthes.push(i < 10 ? "0"+i : i);
    }
    return monthes;
  }

  var getDaysByMonthAndYear = function(month, year) {
    var int_d = new Date(year, parseInt(month)+1-1, 1);
    d = new Date(int_d - 1);
    return getDays(d.getDate());
  }

  var formatNumber = function (n) {
    return n < 10 ? "0" + n : n;
  }

  var defaults = {

    rotateEffect: true,

    value: [today.getFullYear(), formatNumber(today.getMonth()), today.getDate(), today.getHours(), formatNumber(today.getMinutes())],

    onChange: function (picker, values, displayValues) {
      var days = getDaysByMonthAndYear(picker.cols[1].value, picker.cols[0].value);
      var currentValue = picker.cols[2].value;
      if(currentValue > days.length) currentValue = days.length;
      picker.cols[2].setValue(currentValue);
    },

    formatValue: function (p, values, displayValues) {
      return displayValues[0] + '-' + values[1] + '-' + values[2] + ' ' + values[3] + ':' + values[4];
    },

    cols: [
      // Years
      {
        values: (function () {
          var arr = [];
          for (var i = 1950; i <= 2030; i++) { arr.push(i); }
          return arr;
        })(),
      },
      // Months
      {
        values: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),
      },
      // Days
      {
        values: getDays(),
      },

      // Space divider
      {
        divider: true,
        content: '  '
      },
      // Hours
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 23; i++) { arr.push(i); }
          return arr;
        })(),
      },
      // Divider
      {
        divider: true,
        content: ':'
      },
      // Minutes
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
          return arr;
        })(),
      }
    ]
  }
   
  $.fn.datetimePicker = function(params) {
      var p = $.extend(defaults, params);
      $(this).picker(p);
  }
}(Zepto);
