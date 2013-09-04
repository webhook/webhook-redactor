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
    return this.redactor($.extend({}, $.webhookRedactor.options, options));
  };

  // Static method.
  $.webhookRedactor = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.awesome.options, options);
    // Return something awesome.
    return options;
  };

  // Static method default options.
  $.webhookRedactor.options = {
    observeImages: false,
    buttons: [
      'formatting', '|',
      'bold', 'italic', '|',
      'unorderedlist', 'orderedlist', '|',
      'image', 'video', 'table', 'link', '|',
      'html'
    ],
    plugins: ['cleanup', 'fullscreen', 'fixedtoolbar', 'autoembedly', 'traverse']
  };

}(jQuery));
