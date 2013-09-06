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
      left  : { classSuffix: 'arrow-left' },
      right : { classSuffix: 'arrow-right' },
      small : { classSuffix: 'small', text: 'S' },
      medium: { classSuffix: 'medium', text: 'M' },
      resize: { classSuffix: 'resize-full' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'resize', '|', 'small', 'medium', 'remove'],
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

        case 'resize':
          changeSuffix(['small', 'medium', 'left', 'right'], 'large');
          break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.image = {
    init: function () {
      this.image = new Image(this);
      this.buttonAddBefore('link', 'image', 'Image', $.proxy(function () {
        window.console.log('image', this);
      }, this.image));
    }
  };

}(jQuery));
