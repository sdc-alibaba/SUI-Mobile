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
+ function($) {
	"use strict";
	var scrollFix = function(elem) {
		
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
	var scrollable = document.getElementsByClassName("content")[0];
	var pageContent = document.getElementsByClassName("page-current")[0];
	["nav", "footer"].forEach(function (item) {
		var elem = document.getElementsByClassName("bar-" + item);
		if (elem.length > 0) {
			elem[0].addEventListener("touchmove", function (event) {
				
				event.preventDefault();
			});
		}
	});
	 new scrollFix(scrollable);
}(Zepto);