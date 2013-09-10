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
    return this.redactor(typeof options === 'string' ? options : $.extend({}, $.webhookRedactor.options, options));
  };

  // Default options.
  $.webhookRedactor.options = {
    observeImages: false,
    buttons: [
      'formatting', '|',
      'bold', 'italic', '|',
      'unorderedlist', 'orderedlist', '|',
      'link', '|',
      'html'
    ],
    plugins: ['cleanup', 'fullscreen', 'fixedtoolbar', 'autoembedly', 'figure', 'image', 'video', 'table', 'quote'],
    initCallback: function () {
      this.$element.closest('form').on('submit', $.proxy(this.sync, this));
    }
  };

}(jQuery));
