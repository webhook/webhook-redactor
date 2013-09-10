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
    this.init();
  };

  Quote.prototype = {
    control: {
      left        : { classSuffix: 'arrow-left' },
      right       : { classSuffix: 'arrow-right' },
      small       : { classSuffix: 'small', text: 'S' },
      medium      : { classSuffix: 'medium', text: 'M' },
      large       : { classSuffix: 'large', text: 'L' },
      resize_full : { classSuffix: 'resize-full' },
      resize_small: { classSuffix: 'resize-small' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'resize_full', 'resize_small', 'remove'],
    init: function () {
      // find quotes without citations, add empty cite
      this.redactor.$editor.find('figure[data-type=quote]:not(:has(cite))').each(function () {
        $(this).append('<cite>');
      });
    },
    onShow: function ($figure, $toolbar) {

      $toolbar.children().removeClass('on');

      if ($figure.hasClass('wh-figure-medium')) {
        $toolbar.find('.wh-figure-controls-medium').addClass('on');
      } else if ($figure.hasClass('wh-figure-large')) {
        $toolbar.find('.wh-figure-controls-large').addClass('on');
      } else {
        $toolbar.find('.wh-figure-controls-small').addClass('on');
      }

      if ($figure.hasClass('wh-figure-left')) {
        $toolbar.find('.wh-figure-controls-arrow-left').addClass('on');
        $toolbar.find('.wh-figure-controls-resize-small').hide();
        $toolbar.find('.wh-figure-controls-resize-full').show();
      } else if ($figure.hasClass('wh-figure-right')) {
        $toolbar.find('.wh-figure-controls-arrow-right').addClass('on');
        $toolbar.find('.wh-figure-controls-resize-small').hide();
        $toolbar.find('.wh-figure-controls-resize-full').show();
      } else {
        $toolbar.find('.wh-figure-controls-resize-small').show();
        $toolbar.find('.wh-figure-controls-resize-full').hide();
      }

    },
    command: function (command, $figure) {

      switch (command) {
        case 'left':
          $figure.removeClass('wh-figure-right').addClass('wh-figure-left');
          break;

        case 'right':
          $figure.removeClass('wh-figure-left').addClass('wh-figure-right');
          break;

        case 'resize_full':
          $figure.removeClass('wh-figure-left wh-figure-right');
          break;

        case 'resize_small':
          $figure.addClass('wh-figure-left');
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
          $('<figure data-type="quote">').insertBefore($target).prepend($target).append('<cite>Type to add quote credit (optional)</cite>');
        } else {
          $target.closest('figure').before($target).remove();
        }

        this.sync();

      }, this));
    }
  };

}(jQuery));