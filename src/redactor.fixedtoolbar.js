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
  var Fixedtoolbar = function (redactor) {
    this.redactor = redactor;
    this.$window = $(redactor.window);
    this.$window.on('scroll', $.proxy(this.checkOffset, this));

  };
  Fixedtoolbar.prototype = {
    checkOffset: function () {
      if (this.redactor.$box.offset().top - this.$window.scrollTop() <= 0) {
        this.fix();
      } else {
        this.unfix();
      }
    },
    fix: function () {

      var border_left = parseInt(this.redactor.$box.css('border-left-width').replace('px', ''), 10);

      this.redactor.$toolbar.css({
        position: 'fixed',
        left: this.redactor.$box.offset().left + border_left,
        width: this.redactor.$box.width(),
        zIndex: 1
      });

      this.redactor.$editor.css('padding-top', this.redactor.$toolbar.height() + 10);
    },
    unfix: function () {
      this.redactor.$toolbar.css({
        position: 'relative',
        left: 'auto',
        width: 'auto'
      });
      this.redactor.$editor.css('padding-top', 10);
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.fixedtoolbar = {
    init: function () {
      this.fixedtoolbar = new Fixedtoolbar(this);
    }
  };

}(jQuery));
