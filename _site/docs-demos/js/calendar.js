$(function() {
  $(document).on("pageInit", function() {
    $("#birthday").calendar({
      dateFormat: "yy-mm-dd",
      onChange: function(p, v, d) {
        console.log(p, v, d);
      }
    });
  });
  $.init();
});
