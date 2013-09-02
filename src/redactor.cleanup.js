/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

  window.RedactorPlugins = window.RedactorPlugins || {};

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
      this.redactor.$editor.find('p').each(function() {
        var $this = $(this);
        if (!$this.html().replace(/\s|&nbsp;/g, '').length) {
          $this.remove();
        }
      });
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins.cleanup = {
    init: function () {
      this.cleanup = new Cleanup(this);
    }
  };

}(jQuery));
