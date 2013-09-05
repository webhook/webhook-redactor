/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.quote = {
    init: function () {
      this.buttonAddBefore('link', 'quote', 'Quote', $.proxy(function () {

        // maintain undo buffer
        this.bufferSet();

        this.formatQuote();

        var $target = $(this.getBlock() || this.getCurrent());

        if ($target.is('blockquote')) {
          $('<figure data-type="quote"><figcaption>Type to add quote credit (optional)</figcaption>').insertBefore($target).prepend($target);
        } else {
          $target.closest('figure').before($target).remove();
        }

        this.sync();

      }, this));
    }
  };

}(jQuery));
