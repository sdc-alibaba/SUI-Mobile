$(function () {
  'use strict';

  module('tabs plugin')

  //test plugin api exist
  test('should be defined on zepto object', function () {
    ok($.showTab, 'tabs method is defined')
  })

  //test show tab by showTab method
  test('should show tab when call showTab method', function () {

    var tabsBody = '<div class="tabs">\
        <div id="tab-test-1" class="tab active"></div>\
        <div id="tab-test-2" class="tab"> </div>\
        </div>';

    var $tabsBody = $(tabsBody).appendTo('#qunit-fixture')

    $.showTab('#tab-test-2');
    equal($('#qunit-fixture').find('.tab.active').attr('id'), 'tab-test-2')

    $.showTab('#tab-test-1');
    equal($('#qunit-fixture').find('.tab.active').attr('id'), 'tab-test-1')
  })

  //test show tab by click
  test('should show tab when click', function () {
    var tabs = '<div class="buttons-row"> \
    <a href="#tab-test-1" id="tab-link-1" class="tab-link active button">Tab 1</a> \
    <a href="#tab-test-2" id="tab-link-2" class="tab-link button">Tab 2</a>\
    </div>';

    var tabsBody = '<div class="tabs">\
        <div id="tab-test-1" class="tab active"></div>\
        <div id="tab-test-2" class="tab"> </div>\
        </div>';

    var $tabs = $(tabs).appendTo('#qunit-fixture')
    var $tabsBody = $(tabsBody).appendTo('#qunit-fixture')


    $("#tab-link-2").click();
    equal($('#qunit-fixture').find('.tab.active').attr('id'), 'tab-test-2');
    $("#tab-link-1").click();
    equal($('#qunit-fixture').find('.tab.active').attr('id'), 'tab-test-1');
  })

  //test show tab event is triggered
  test('should trigger showTab event', function () {
    stop();
    var tabs = '<div class="buttons-row"> \
    <a href="#tab-test-1" id="tab-link-1" class="tab-link active button">Tab 1</a> \
    <a href="#tab-test-2" id="tab-link-2" class="tab-link button">Tab 2</a>\
    </div>';

    var tabsBody = '<div class="tabs">\
        <div id="tab-test-1" class="tab active"></div>\
        <div id="tab-test-2" class="tab"> </div>\
        </div>';

    var $tabs = $(tabs).appendTo('#qunit-fixture')
    var $tabsBody = $(tabsBody).appendTo('#qunit-fixture')


    $("#tab-test-2").on("show", function() {
      ok(true, "show event fired");
      start();
    });
    $("#tab-link-2").click();
  })
});
