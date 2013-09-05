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
      left  : { classSuffix: 'arrow-left' },
      right : { classSuffix: 'arrow-right' },
      small : { classSuffix: 'small', text: 'S' },
      medium: { classSuffix: 'medium', text: 'M' },
      large : { classSuffix: 'large', text: 'L' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'remove'],
    init: function () {
      $.extend({}, this.redactor.figure.control, this.control);
    },
    command: function (command, $figure) {

      var classString = function (suffixArray, separator, prefix, dot) {
        var base_class = (dot ? '.' : '') + 'wh-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addString) {
        $figure.removeClass(classString(removeArray)).addClass('wh-figure-' + addString);
      };

      switch (command) {
        case 'left':
        case 'right':
          if (command === 'left' && $figure.hasClass('wh-figure-right')) {
            $figure.removeClass('wh-figure-right');
            changeSuffix(['small', 'medium', 'large'], 'large');
          } else if (command === 'right' && $figure.hasClass('wh-figure-left')) {
            $figure.removeClass('wh-figure-left');
            changeSuffix(['small', 'medium', 'large'], 'large');
          } else {
            changeSuffix(['left', 'right'], command);
            if (!$figure.hasClass('wh-figure-medium') && !$figure.hasClass('wh-figure-small')) {
              $figure.addClass('wh-figure-medium');
            }
          }
          break;

        case 'small':
        case 'medium':
        case 'large':
          changeSuffix(['small', 'medium', 'large'], command);
          if (command === 'large') {
            $figure.removeClass(classString(['left', 'right']));
          } else if (!$figure.hasClass('wh-figure-left') && !$figure.hasClass('wh-figure-right')) {
            $figure.addClass('wh-figure-left');
          }
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
