/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

  window.RedactorPlugins = window.RedactorPlugins || {};

  // this needs a better home
  $.embedly.defaults.key = '65874c90af644c6a8f0b7072fe857811';
  $.embedly.defaults.query = { maxwidth: 640 };

  // namespacing
  var AutoEmbedly = function (redactor) {
    this.redactor = redactor;
    this.$editor = redactor.$editor;
    this.observe();
  };
  AutoEmbedly.prototype = {

    urlRegex: /((http:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|.*\.youtube\.com\/view_play_list.*|.*\.youtube\.com\/playlist.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/.*|player\.vimeo\.com\/.*))|(https:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|www\.vimeo\.com\/.*|vimeo\.com\/.*|player\.vimeo\.com\/.*)))/i,

    observe: function () {
      this.redactor.$editor.on('keyup.redactor', $.proxy(function (event) {
        if (event.which === this.redactor.keyCode.ENTER) {
          this.checkNode(this.redactor.$editor.get(0));
        }
      }, this));
    },
    // recursively check node and children for supported links
    checkNode: function (node) {
      $.each(node.childNodes, $.proxy(function (index, node) {
        if (node.nodeType === 3 && node.nodeValue && this.urlRegex.test(node.nodeValue)) {

          this.redactor.buffer.set();

          var url = node.nodeValue.match(this.urlRegex)[0],
              shiv = $('<span>loading embed...</span>');

          node.nodeValue = node.nodeValue.replace(this.urlRegex, '');

          $(node).parentsUntil(this.$editor).last().after(shiv);

          $.embedly.oembed(url).done(function (results) {
            $.each(results, function () {
              if (this.html) {
                shiv.replaceWith('<figure data-type="video">' + this.html + '<figcaption></figcaption></figure>');
              } else {
                shiv.replaceWith($('<p>').text(url));
              }
            });

          });

        } else if (node.nodeType === 1 && !/^(a|button|textarea)$/i.test(node.tagName)) {
          this.checkNode(node);
        }
      }, this));

      return this.matches;
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins.autoembedly = function() {
    return {
      init: function () {
        this.autoembedly = new AutoEmbedly(this);
      }
    };
  };

}(jQuery));
