$(function() {
  $(document).on("pageInit", function() {
    $("#birthday").calendar({
      dateFormat: "yy-mm-dd",
      minDate: "2015-06-01",
      maxDate: "2015-08-01",
      onChange: function(p, v, d) {
        console.log(p, v, d);
      }
    });
  });
});
