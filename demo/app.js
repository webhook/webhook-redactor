/* global $ */
(function () {
  'use strict';

  $('#redactor').webhookRedactor();
  $('form').submit(function () {
    return false;
  });

})();
