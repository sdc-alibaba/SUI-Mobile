$(function() {
  $(document).on("pageInit", function() {
    $("#show-toast").click(function() {
      $.toast("操作成功");
    });
  });
  $.init();
});
