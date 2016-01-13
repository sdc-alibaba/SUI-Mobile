/*======================================================
************   Modals   ************
======================================================*/
/*jshint unused: false*/
/* global Zepto:true */
+function ($) {
  "use strict";
  $.lastPosition =function(options) {
    if (!location || !sessionStorage) {
        return;
    }
      // 需要记忆模块的className
      var needMemoryClass = options.needMemoryClass || [];

    
      var url = location.href;
      var positionName = location.pathname + '?' + (url.split('?')[1] || '');

      var currentScrollTop;
      try {
          currentScrollTop = parseInt(sessionStorage.getItem(positionName));
      } catch (e) {
          currentScrollTop = 0;
      }

      var timer;

      // 设置需要记忆模块的高度
      needMemoryClass.forEach(function(item, index) {
          var memoryNodes = $(item);

          if (memoryNodes.length === 0) {
              return;
          }

          var memoryHeight;
          // 遍历对应节点设置存储的高度
          memoryNodes.each(function (i, node) {
              try {
                  memoryHeight = sessionStorage.getItem(positionName + '_' + item + '_' + i);
              } catch (e) {
                  memoryHeight = 'auto';
              }
              $(node).scrollTop(parseInt(memoryHeight));
          });

          memoryNodes.off('scroll').on('scroll', function() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(updateMemory, 100);
          });  
      });

     
      function updateMemory() {

          positionName = location.pathname + '?' + (url.split('?')[1] || '');

          // 存储需要记忆模块的高度
          needMemoryClass.forEach(function(item, index) {
              var memoryNodes = $(item);

              if (memoryNodes.length === 0) {
                  return;
              }

              // 遍历对应节点设置存储的高度
              memoryNodes.each(function (i, node) {
                  try {
                      sessionStorage.setItem(
                          positionName + '_' + item + '_' + i,
                          $(node).scrollTop()
                      );
                  } catch (e) {
                  }
              });
          });  
      }
  };
}(Zepto);
