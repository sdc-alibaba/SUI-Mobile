/**
 * ScrollFix v0.1
 * http://www.joelambert.co.uk
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
/* ===============================================================================
************   ScrollFix   ************
=============================================================================== */

/* global Zepto:true */
+ function($) {
    "use strict";
    var ScrollFix = function(elem) {

        // Variables to track inputs
        var startY;
        var startTopScroll;

        elem = elem || document.querySelector(elem);

        // If there is no element, then do nothing
        if(!elem)
            return;

        // Handle the start of interactions
        elem.addEventListener('touchstart', function(event){
            startY = event.touches[0].pageY;
            startTopScroll = elem.scrollTop;

            if(startTopScroll <= 0)
            elem.scrollTop = 1;

        if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
            elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
        }, false);
    };

    function init () {
        var prefix = $('.page-current').length > 0 ? '.page-current ' : '';
        var scrollable = $(prefix + ".content");
        ["nav", "footer"].forEach(function (item) {
            var elem = $(prefix + ".bar-" + item);
            elem.off($.touchEvents.move);
            elem.on($.touchEvents.move, function (event) {
                if (event.type === 'touchmove') {
                    event.preventDefault();
                }
            });
        });
        new ScrollFix(scrollable[0]);
    }
    //安卓微信中使用scrollfix会有问题，因此只在ios中使用，安卓机器按照原来的逻辑
    if($.device.ios){
        window.addEventListener('pageLoadComplete', init);
        init();
    }
    
}(Zepto);
