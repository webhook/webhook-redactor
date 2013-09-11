/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

  // namespacing
  var Cleanup = function (redactor) {
    this.redactor = redactor;
    this.init();
  };
  Cleanup.prototype = {
    init: function () {
      this.removeEmptyPs();
    },
    removeEmptyPs: function () {
      this.redactor.$editor.find('p').filter(function() {
        return ! $.trim($(this).text());
      }).remove();
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.cleanup = {
    init: function () {
      this.cleanup = new Cleanup(this);
    }
  };

}(jQuery));
