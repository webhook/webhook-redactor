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
    onShow: function ($figure, $toolbar) {

      $toolbar.children().removeClass('on');

      if ($figure.hasClass('wh-figure-small')) {
        $toolbar.find('.wh-figure-controls-small').show().addClass('on');
        $toolbar.find('.wh-figure-controls-medium').show();
        $toolbar.find('.wh-figure-controls-resize-full').show();
        $toolbar.find('.wh-figure-controls-resize-small').hide();
      }

      else if ($figure.hasClass('wh-figure-medium')) {
        $toolbar.find('.wh-figure-controls-small').show();
        $toolbar.find('.wh-figure-controls-medium').show().addClass('on');
        $toolbar.find('.wh-figure-controls-resize-full').show();
        $toolbar.find('.wh-figure-controls-resize-small').hide();
      }

      else {
        $toolbar.find('.wh-figure-controls-small').hide();
        $toolbar.find('.wh-figure-controls-medium').hide();
        $toolbar.find('.wh-figure-controls-large').hide();
        $toolbar.find('.wh-figure-controls-resize-full').hide();
        $toolbar.find('.wh-figure-controls-resize-small').show();
      }

      if ($figure.hasClass('wh-figure-right')) {
        $toolbar.find('.wh-figure-controls-arrow-right').addClass('on');
      }

      if ($figure.hasClass('wh-figure-left')) {
        $toolbar.find('.wh-figure-controls-arrow-left').addClass('on');
      }

    },
    command: function (command, $figure) {

      var classString = function (suffixArray, separator, prefix, dot) {
        if (!$.isArray(suffixArray)) {
          suffixArray = [suffixArray];
        }
        var base_class = (dot ? '.' : '') + 'wh-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addArray) {
        $figure.removeClass(classString(removeArray)).addClass(classString(addArray));
      };

      switch (command) {
        case 'left':
        case 'right':
          changeSuffix(['left', 'right'], command);
          if (!$figure.hasClass('wh-figure-medium') && !$figure.hasClass('wh-figure-small')) {
            $figure.addClass('wh-figure-medium');
          }
          break;

        case 'small':
        case 'medium':
          changeSuffix(['small', 'medium', 'large'], command);
          if (!$figure.hasClass('wh-figure-left') && !$figure.hasClass('wh-figure-right')) {
            $figure.addClass('wh-figure-left');
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
      // this.buttonAddBefore('link', 'image', 'Image', $.proxy(function () {
      //   window.console.log('image', this);
      // }, this.image));
    }
  };

}(jQuery));
