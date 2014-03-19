/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {

  // Collection method.
  $.fn.webhookRedactor = function (options) {
    // Act as proxy to redactor.
    return this.redactor(typeof options === 'string' ? options : $.extend({}, $.webhookRedactor.options, options));
  };

  // Static method.
  $.webhookRedactor = function (options) {
    // Override default options with passed-in options.
    return $.extend({}, $.webhookRedactor.options, options);
  };

  // Static method default options.
  $.webhookRedactor.options = {
    // We roll our own image plugin.
    observeImages: false,
    buttons: ['formatting', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'link', 'html'],
    // Custom plugins.
    plugins: ['cleanup', 'fullscreen', 'fixedtoolbar', 'autoembedly', 'figure', 'image', 'video', 'table', 'quote'],
    // Sync textarea with editor before submission.
    initCallback: function () {

      $.each(this.opts.buttons, $.proxy(function (index, button) {
        this.buttonGet(button).addClass('redactor_btn_' + button);
      }, this));

      this.$element.closest('form').one('submit', $.proxy(function () {
        // only sync if we're in visual mode
        if (this.opts.visual) {
          this.sync();
        }
      }, this));
      this.$element.trigger('init.webhookRedactor', this.getObject());
    },
    // Expose change event.
    changeCallback: function () {

      // Ensure first and last elements are always P
      var borderSelector = 'p, h1, h2, h3, h4, h5';

      if (!this.$editor.children(":first-child").is(borderSelector)) {
        this.$editor.prepend('<p><br></p>');
      }

      if (!this.$editor.children(":last-child").is(borderSelector)) {
        this.$editor.append('<p><br></p>');
      }

      this.$editor.trigger('mutate');
      this.$element.trigger('mutate.webhookRedactor', this.getObject());

    }
  };

}(jQuery));
