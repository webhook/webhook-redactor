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
  var Quote = function (redactor) {
    this.redactor = redactor;
  };
  Quote.prototype = {
    control: {
      left  : { classSuffix: 'arrow-left' },
      right : { classSuffix: 'arrow-right' },
      small : { classSuffix: 'small', text: 'S' },
      medium: { classSuffix: 'medium', text: 'M' },
      large : { classSuffix: 'large', text: 'L' },
      resize: { classSuffix: 'resize-full' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'resize', '|', 'small', 'medium', 'large', 'remove'],
    command: function (command, $figure) {

      switch (command) {
        case 'left':
          $figure.removeClass('wh-figure-right').addClass('wh-figure-left');
          break;

        case 'right':
          $figure.removeClass('wh-figure-left').addClass('wh-figure-right');
          break;

        case 'resize':
          $figure.removeClass('wh-figure-left wh-figure-right');
          break;

        case 'small':
          $figure.removeClass('wh-figure-medium wh-figure-large').addClass('wh-figure-small');
          break;

        case 'medium':
          $figure.removeClass('wh-figure-small wh-figure-large').addClass('wh-figure-medium');
          break;

        case 'large':
          $figure.removeClass('wh-figure-small wh-figure-medium').addClass('wh-figure-large');
          break;
      }

    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.quote = {
    init: function () {
      this.quote = new Quote(this);
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
