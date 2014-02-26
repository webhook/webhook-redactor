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
  var Image = function (redactor) {
    this.redactor = redactor;
    this.init();
  };

  Image.prototype = {
    control: {
      left        : { classSuffix: 'arrow-left' },
      right       : { classSuffix: 'arrow-right' },
      small       : { classSuffix: 'small', text: 'S' },
      medium      : { classSuffix: 'medium', text: 'M' },
      resize_full : { classSuffix: 'resize-full' },
      resize_small: { classSuffix: 'resize-small' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'resize_full', 'resize_small', 'remove'],
    init: function () {
      this.redactor.$editor.on('focus', $.proxy(this.addCaptions, this));
      this.addCaptions();
    },
    addCaptions: function () {
      // find images without captions, add empty figcaption
      this.redactor.$editor.find('figure[data-type=image]:not(:has(figcaption))').each(function () {
        $(this).append('<figcaption>');
      });
    },
    onShow: function ($figure, $toolbar) {

      $toolbar.children().removeClass('on');

      if ($figure.hasClass('wy-figure-small')) {
        $toolbar.find('.wy-figure-controls-small').show().addClass('on');
        $toolbar.find('.wy-figure-controls-medium').show();
        $toolbar.find('.wy-figure-controls-resize-full').show();
        $toolbar.find('.wy-figure-controls-resize-small').hide();
      }

      else if ($figure.hasClass('wy-figure-medium')) {
        $toolbar.find('.wy-figure-controls-small').show();
        $toolbar.find('.wy-figure-controls-medium').show().addClass('on');
        $toolbar.find('.wy-figure-controls-resize-full').show();
        $toolbar.find('.wy-figure-controls-resize-small').hide();
      }

      else {
        $toolbar.find('.wy-figure-controls-small').hide();
        $toolbar.find('.wy-figure-controls-medium').hide();
        $toolbar.find('.wy-figure-controls-large').hide();
        $toolbar.find('.wy-figure-controls-resize-full').hide();
        $toolbar.find('.wy-figure-controls-resize-small').show();
      }

      if ($figure.hasClass('wy-figure-right')) {
        $toolbar.find('.wy-figure-controls-arrow-right').addClass('on');
      }

      if ($figure.hasClass('wy-figure-left')) {
        $toolbar.find('.wy-figure-controls-arrow-left').addClass('on');
      }

    },
    command: function (command, $figure) {

      var classString = function (suffixArray, separator, prefix, dot) {
        if (!$.isArray(suffixArray)) {
          suffixArray = [suffixArray];
        }
        var base_class = (dot ? '.' : '') + 'wy-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addArray) {
        $figure.removeClass(classString(removeArray)).addClass(classString(addArray));
      };

      switch (command) {
        case 'left':
        case 'right':
          changeSuffix(['left', 'right'], command);
          if (!$figure.hasClass('wy-figure-medium') && !$figure.hasClass('wy-figure-small')) {
            $figure.addClass('wy-figure-medium');
          }
          break;

        case 'small':
        case 'medium':
          changeSuffix(['small', 'medium', 'large'], command);
          if (!$figure.hasClass('wy-figure-left') && !$figure.hasClass('wy-figure-right')) {
            $figure.addClass('wy-figure-left');
          }
          break;

        case 'resize_full':
          changeSuffix(['small', 'medium', 'left', 'right'], 'large');
          break;

        case 'resize_small':
          changeSuffix(['small', 'large', 'right'], ['medium', 'left']);
          break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.image = {
    init: function () {
      this.image = new Image(this);
    }
  };

}(jQuery));
