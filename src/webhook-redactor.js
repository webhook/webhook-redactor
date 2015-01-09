/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {

  'use strict';

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
    imageEditable: false,
    buttons: ['formatting', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'link', 'html'],
    buttonSource: true,
    convertLinks: false,
    dragImageUpload: false,
    dragFileUpload: false,
    toolbarFixed: false,
    formatting: [],
    formattingAdd: [
      {
          tag: 'p',
          title: 'Normal text'
      },
      {
          tag: 'code',
          title: 'Code'
      },
      {
          tag: 'pre',
          title: 'Code Block'
      },
      {
          tag: 'h1',
          title: 'Header 1'
      },
      {
          tag: 'h2',
          title: 'Header 2'
      },
      {
          tag: 'h3',
          title: 'Header 3'
      },
      {
          tag: 'h4',
          title: 'Header 4'
      },
      {
          tag: 'h5',
          title: 'Header 5'
      },
    ],
    deniedTags: ['html', 'head', 'body'],
    // Custom plugins.
    // 'fixedtoolbar',
    plugins: ['fullscreen', 'fixedtoolbar',  'autoembedly', 'figure', 'video', 'webhookImage', 'table', 'quote', 'embed'],
    // Sync textarea with editor before submission.
    initCallback: function () {
      //this.clean.savePreCode = function(html) { return html; }
      //this.modal.setDraggable = function() {};

      $.each(this.opts.buttons, $.proxy(function (index, button) {
        this.button.get(button).addClass('redactor_btn_' + button);
      }, this));

      this.$element.closest('form').one('submit', $.proxy(function () {
        // only sync if we're in visual mode
        if (this.opts.visual) {
          this.code.sync();
        }
      }, this));

      var redactor = this;
      this.$editor.on('paste', function () {
        setTimeout(function () {
     //     redactor.$editor.find('[style]').removeAttr('style');
          redactor.$editor.find('[dir]').removeAttr('dir');
        }, 5);
      });

      this.$element.trigger('init.webhookRedactor', this.core.getObject());

      // find videos without captions, add empty figcaption
      this.$editor.find('figure[data-type=video]:not(:has(figcaption))').each(function () {
        $(this).append('<figcaption>');
      });

      this.$editor.find('figure[data-type=quote] blockquote:not(:has(cite))').each(function () {
        $(this).append('<cite>');
      });

      this.$editor.find('figure[data-type=image]:not(:has(figcaption))').each(function () {
        $(this).append('<figcaption>');
      });

      this.$editor.find('figure[data-type=embed]:not(:has(figcaption))').each(function () {
        $(this).append('<figcaption>');
      });
    },
    // Expose change event.
    changeCallback: function () {

      // Ensure first and last elements are always P
      var borderSelector = 'p, h1, h2, h3, h4, h5';

      if (!this.$editor.children(':first-child').is(borderSelector)) {
        this.$editor.prepend('<p><br></p>');
      }

      if (!this.$editor.children(':last-child').is(borderSelector)) {
        this.$editor.append('<p><br></p>');
      }

      this.$editor.trigger('mutate');
      this.$element.trigger('mutate.webhookRedactor', this.core.getObject());

    }
  };

}(jQuery));
