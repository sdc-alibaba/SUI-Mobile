/* global Zepto:true */
/* jshint unused:false*/

+ function($) {
  "use strict";


  var format = function(data) {
    var result = [];
    for(var i=0;i<data.length;i++) {
      var d = data[i];
      if(d.name === "请选择") continue;
      result.push(d.name);
    }
    if(result.length) return result;
    return [""];
  }
  var sub = function(data) {
    if(!data.sub) return [""];
    return format(data.sub);
  }

  var getCities = function(d) {
    for(var i=0;i< raw.length;i++) {
      if(raw[i].name == d) return sub(raw[i]);
    }
    return [""];
  }
  var getDistricts = function(p, c) {
    for(var i=0;i< raw.length;i++) {
      if(raw[i].name == p) {
        for(var j=0;j< raw[i].sub.length;j++) {
          if(raw[i].sub[j].name == c) {
            return sub(raw[i].sub[j]);
          }
        }
      }
    }
    return [""];
  }

  var raw = $.smConfig.rawCitiesData;
  var provinces = raw.map(function(d) {
    return d.name;
  });
  var initCities = sub(raw[0]);
  var initDistricts = [""];

  var currentProvince = provinces[0];
  var currentCity = initCities[0];
  var currentDistrict = initDistricts[0];

  var defaults = {

    cssClass: "city-picker",
    rotateEffect: false,  //为了性能

    onChange: function (picker, values, displayValues) {
      var newProvince = picker.cols[0].value;
      var newCity;
      if(newProvince !== currentProvince) {
        var newCities = getCities(newProvince);
        var newCity = newCities[0];
        picker.cols[1].replaceValues(newCities);
        picker.cols[2].replaceValues(getDistricts(newProvince, newCity));
        currentProvince = newProvince;
        currentCity = newCity;
        return;
      }
      newCity = picker.cols[1].value;
      if(newCity !== currentCity) {
        picker.cols[2].replaceValues(getDistricts(newProvince, newCity));
        currentCity = newCity;
      }
    },

    cols: [
      {
        values: provinces,
        cssClass: "col-province"
      },
      {
        values: initCities,
        cssClass: "col-city"
      },
      {
        values: initDistricts,
        cssClass: "col-district"
      }
    ]
  };
   
  $.fn.cityPicker = function(params) {
      var p = $.extend(defaults, params);
      $(this).picker(p);
  };

}(Zepto);
