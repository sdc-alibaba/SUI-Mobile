//home
$(function() {
  $(document).on('refresh', '.page-home',function(e) {
    setTimeout(function() {
      $($("#index-tpl").html()).insertBefore($(".list a").eq(0));
      $.pullToRefreshDone('.page-home');
    }, 2000);
  });
  var loading = false;
  $(document).on('infinite', '.page-home',function() {
    if(loading) return;
    loading = true;
    setTimeout(function() {
      $(".list").append($($("#index-tpl").html()));
      loading = false;
    }, 2000);
  });
});

//goods
$(function() {
  var loading = false;
  $(document).on('infinite', '.page-goods',function() {
    if(loading) return;
    loading = true;
    setTimeout(function() {
      $(".page-goods ul").append($(".page-goods ul").html());
      loading = false;
    }, 2000);
  });
});

$.init();
