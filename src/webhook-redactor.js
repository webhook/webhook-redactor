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
    buttons: [
      'formatting', '|',
      'bold', 'italic', '|',
      'unorderedlist', 'orderedlist', '|',
      'link', '|',
      'html'
    ],
    // Custom plugins.
    plugins: ['cleanup', 'fullscreen', 'fixedtoolbar', 'autoembedly', 'figure', 'image', 'video', 'table', 'quote'],
    // Sync textarea with editor before submission.
    initCallback: function () {
      this.$element.closest('form').one('submit', $.proxy(this.sync, this));
      this.$element.trigger('init.webhookRedactor', this.getObject());
    },
    // Expose change event.
    changeCallback: function () {
      this.$editor.trigger('mutate');
      this.$element.trigger('mutate.webhookRedactor', this.getObject());
    }
  };

}(jQuery));
