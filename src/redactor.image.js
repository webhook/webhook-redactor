/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

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
      large       : { classSuffix: 'large', text: 'L' },
      resize_full : { classSuffix: 'resize-full' },
      resize_small: { classSuffix: 'resize-small' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'resize_full', 'resize_small', 'remove'],
    init: function () {
      this.redactor.$editor.on('focus', $.proxy(this.addCaptions, this));
   //   this.addCaptions();

      // this.redactor.$editor.on('mousedown', 'figure[data-type=image] img', function () {
      //   var range = document.createRange();
      //   range.selectNodeContents($(this).siblings('figcaption').get(0));
      //   var sel = window.getSelection();
      //   sel.removeAllRanges();
      //   sel.addRange(range);
      // });

      // this.redactor.$editor.on('touchstart', 'figure[data-type=image] img', $.proxy(function (event) {
      //   this.redactor.$editor.trigger('blur');
      //   $(this).trigger('mouseenter');
      //   event.preventDefault();
      //   event.stopPropagation();
      //   window.alert('touchstart');
      // }, this));
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
        $toolbar.find('.wy-figure-controls-large').show();
        $toolbar.find('.wy-figure-controls-resize-full').show();
        $toolbar.find('.wy-figure-controls-resize-small').hide();
      }

      else if ($figure.hasClass('wy-figure-medium')) {
        $toolbar.find('.wy-figure-controls-small').show();
        $toolbar.find('.wy-figure-controls-medium').show().addClass('on');
        $toolbar.find('.wy-figure-controls-large').show();
        $toolbar.find('.wy-figure-controls-resize-full').show();
        $toolbar.find('.wy-figure-controls-resize-small').hide();
      }

      else if ($figure.hasClass('wy-figure-large')) {
        $toolbar.find('.wy-figure-controls-small').show();
        $toolbar.find('.wy-figure-controls-medium').show();
        $toolbar.find('.wy-figure-controls-large').show().addClass('on');
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
        var baseClass = (dot ? '.' : '') + 'wy-figure-' + (prefix || '');
        return baseClass + suffixArray.join((separator || ' ') + baseClass);
      };

      var changeSuffix = function (removeArray, addArray) {
        $figure.removeClass(classString(removeArray)).addClass(classString(addArray));
        $.each(addArray, function (index, command) {
          $figure.trigger('imageCommand', command);
        });
      };

      switch (command) {
        case 'left':
        case 'right':
          changeSuffix(['left', 'right'], [command]);
          if (!$figure.hasClass('wy-figure-medium') && !$figure.hasClass('wy-figure-small')) {
            $figure.addClass('wy-figure-medium');
            $figure.trigger('medium');
          }
          break;

        case 'small':
        case 'medium':
        case 'large':
          changeSuffix(['small', 'medium', 'large', 'full'], [command]);
          if (!$figure.hasClass('wy-figure-left') && !$figure.hasClass('wy-figure-right')) {
            $figure.addClass('wy-figure-left');
            $figure.trigger('left');
          }
          break;

        case 'resize_full':
          changeSuffix(['small', 'medium', 'large', 'left', 'right'], ['full']);
          break;

        case 'resize_small':
          changeSuffix(['small', 'medium', 'full', 'right'], ['large', 'left']);
          break;
      }

     // this.redactor.caret.setEnd($figure.find('figcaption').first());
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.webhookImage = function() {
    return {
      init: function () {
        this.webhookImage = new Image(this);
      }
    };
  };

}(jQuery));
