/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function () {
  "use strict";

  // namespacing
  var Video = function (redactor) {
    this.redactor = redactor;
  };

  Video.prototype = {
    control: {
      resize: { classSuffix: 'resize-full' }
    },
    controlGroup: ['up', 'down', '|', 'resize', 'remove'],
    command: function (command, $figure) {
      if (command === 'resize') {
        $figure.toggleClass('wh-figure-full');
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.video = {
    init: function () {
      this.video = new Video(this);
    }
  };

}());
