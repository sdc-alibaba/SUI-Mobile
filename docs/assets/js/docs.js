/* jshint jquery: true */
/* global FingerBlast: true */

$(function () {
    'use strict';

    var doc;
    var device;
    var menu;
    var windowWidth;
    var windowHeight;
    var pageHeight;
    var contentPadding;
    var footerHeight;
    var navComponentLinks;
    var componentsList;
    var componentLinks;
    var contentSection;
    var currentActive;
    var topCache;
    var win;
    var bod;
    var eventListeners;
    var toolbarToggle;


    var initialize = function () {
        currentActive          = -1;
        topCache               = [];
        win                    = $(window);
        doc                    = $(document);
        bod                    = $(document.body);
        device                 = device || $('.js-device');
        menu                   = menu || $('.docs-side-menu');
        navComponentLinks      = $('.js-jump-menu');
        componentsList         = $('.js-component-group');
        componentLinks         = $('.component-example a');
        contentSection         = $('.component');
        topCache               = contentSection.map(function () { return $(this).offset().top; });
        windowHeight           = $(window).height() / 3;
        windowWidth            = $(window).width();
        pageHeight             = $(document).height();
        contentPadding         = parseInt($('.docs-content').css('padding-bottom'), 10);
        footerHeight           = $('.docs-footer').outerHeight(false);
        toolbarToggle          = $('.js-docs-component-toolbar');

        if (menu.length) {
            menu.initialLeft   = menu.offset().left;
            menu.initialTop    = menu.initialTop || menu.offset().top;
        }

        // Device placement
        if (windowWidth >= 768 && device.offset()) {
            device.initialLeft   = device.offset().left;
            device.initialTop    = device.initialTop || device.offset().top;
            device.dockingOffset = ($(window).height() - device.height()) / 2;
            device.dockingOffset = (device.dockingOffset < -100 ? -100 : device.dockingOffset);

        }

        checkDesktopContent();
        calculateScroll();

        if (!eventListeners) {
            addEventListeners();
        }
    };

    var addEventListeners = function () {
        eventListeners = true;

        device.on('click', function (e) {
            var $t = $(e.target);
            var tag = $t.attr("tagName").toUpperCase();
            if(tag === 'BUTTON' || tag === 'A') {
                e.preventDefault();
            }
        });

        // Mobile navigation
        $('.js-docs-nav-trigger').on('click', function () {
            var nav     = $('.docs-nav-group');
            var trigger = $('.js-docs-nav-trigger');

            trigger.toggleClass('active');
            nav.toggleClass('active');
        });

        navComponentLinks.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            componentsList.toggleClass('active');
        });

        doc.on('click', function () {
            componentsList.removeClass('active');
        });

        // Platform switcher
        $('.platform-switch').on('click', function () {
            var components = $('.docs-components');
            var platform   = $(this).attr('data-platform');

            // Set platform
            if (components.hasClass('platform-ios')) {
                components.removeClass('platform-ios');
                components.addClass(platform);
            } else if (components.hasClass('platform-android')) {
                components.removeClass('platform-android');
                components.addClass(platform);
            } else {
                components.addClass(platform);
            }

            // Deal with active states
            $(this).siblings('.active').removeClass('active');
            $(this).addClass('active');
        });

        win.on('scroll', calculateScroll);
    };

    var checkDesktopContent = function () {
        windowWidth = $(window).width();
        if (windowWidth <= 768) {
            var content = $('.content');
            if (content.length > 1) {
                $(content[0]).remove();
            }
        }
    };

    var calculateScroll = function () {
        // if small screen don't worry about this
        if (windowWidth <= 768) {
            return;
        }

        var top;
        // Save scrollTop value
        var contentSectionItem;
        var currentTop = win.scrollTop();

        if (menu.length) {
            if ((menu.initialTop - currentTop) <= 30) {
                top = 30;
                menu[0].className = 'docs-side-menu menu-fixed';
                menu.css({ top: top });
            } else {
                menu[0].className = 'docs-side-menu';
                menu[0].setAttribute('style', '');
            }
        }

        // exit if no device
        if (!device.length) {
            return;
        }

        if ((device.initialTop - currentTop) <= device.dockingOffset) {
            top = device.dockingOffset;
            device[0].className = 'device device-fixed';
            device.css({ top: top });
        } else {
            device[0].className = 'device';
            device[0].setAttribute('style', '');
        }

        function updateContent(content) {
            var $page = $('#iwindow').html(content);
            $page.find('.content').trigger('updateContent');
            $.initPage($page);
        }

        // Injection of components into device
        for (var l = contentSection.length; l--;) {
            if ((topCache[l] - currentTop) < windowHeight) {
                if (currentActive === l) {
                    return;
                }
                currentActive = l;
                bod.find('.component.active').removeClass('active');
                contentSectionItem = $(contentSection[l]);
                contentSectionItem.addClass('active');
                var id = contentSectionItem.attr('id');
                menu.find(".active").removeClass("active");
                if (id) {
                    device.attr('id', id + 'InDevice');
                    menu.find("a[href='#"+id+"']").parents("li").addClass("active");
                } else {
                    device.attr('id', '');

                    //找到之前最近一个有id的
                    var prev = contentSectionItem.prev();
                    while(prev[0] && !prev.attr("id")) prev = prev.prev();
                    if(prev[0]) {
                        menu.find("a[href='#"+prev.attr("id")+"']").parents("li").addClass("active");
                    }
                }
                if (!contentSectionItem.hasClass('informational')) {
                    if(contentSectionItem.data("url")) {
                        var url = "/docs-demos/"+contentSectionItem.data("url");
                        var $window = $("#iwindow");
                        var iframe = $window.find("iframe")[0];
                        if(iframe && iframe.src.indexOf(url) !== -1) {
                            //已经是了
                        } else {
                            $window.html("<iframe src='" + url +"' width='320' height='569' frameBorder='0'></iframe>");
                        }
                    } else {
                        updateContent(contentSectionItem.find('.component-example+.highlight .language-html').text());
                    }
                }
                break;
            }
        }

    };


    $(window).on('load resize', initialize);
    $(window).on('load', function () {
        if (window.FingerBlast) {
            new FingerBlast('.device-content');
        }
    });
});
