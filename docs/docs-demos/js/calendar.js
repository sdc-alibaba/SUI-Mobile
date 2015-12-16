$(function() {
  $(document).on("pageInit", function() {
    $("#birthday").calendar({
      value: ['2015-12-05'],
      onChange: function(p, v, d) {
        console.log(p, v, d);
      }
    });
  });
  $.init();
});
