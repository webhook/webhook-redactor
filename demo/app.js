/* global $ */
(function () {
  'use strict';

  $('#redactor').webhookRedactor();

  $('#redactor').webhookRedactor('getObject').$editor.on('imageCommand', 'figure', function (event, command) {
    window.console.log(command);
  });

  $('form').submit(function () {
    return false;
  });

})();
