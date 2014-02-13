$(function () {
  $('#redactor').webhookRedactor();
  $('form').submit(function (event) {
    return false;
  });
});
