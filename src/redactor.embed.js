/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

  if (!window.RedactorPlugins) {
    window.RedactorPlugins = {};
  }
      
  var WebhookEmbed = function (redactor) {
    this.redactor = redactor;
    this.$editor = redactor.$editor;
    this.init();
  };
  WebhookEmbed.prototype = {
    getTemplate: function()
    {
        return String() +
         '<section id="redactor-modal-embed-code">' +
         '<label>Enter Embed code:</label>' +
         '<textarea id="embed-code-textarea"></textarea>' +
         '</section>';
    },
    init: function ()
    {
     // window.redactor = this.redactor;
      var button = this.redactor.button.addBefore('html', 'embed', 'Insert Embed Code');


      var $button = this.redactor.button.get('embed');
      $button.removeClass('redactor-btn-image').addClass('fa-redactor-btn');
      $button.html('<i class="icon icon-share-alt"></i>');

      this.redactor.button.addCallback(button, $.proxy(this.show, this));
    },
    show: function()
    {
      this.redactor.modal.addTemplate('insert-embed', this.getTemplate());
      this.redactor.modal.addCallback('insert-embed', $.proxy(function() {
        this.redactor.selection.save();
        setTimeout(function () {
          $('#embed-code-textarea').focus();
        }, 200);
      }, this));
      this.redactor.modal.load('insert-embed', 'Insert Embed', 500);

      this.redactor.modal.createCancelButton();
      var button = this.redactor.modal.createActionButton('Insert');
      button.on('click', $.proxy(this.insert, this));

      this.redactor.modal.show();
    },
    insert: function()
    {
      var html = $('#embed-code-textarea').val();

      this.redactor.modal.close();
      this.redactor.selection.restore();

      this.redactor.insert.html('<figure data-type="embed">' + html + '<figcaption></figcaption></figure>', false);

      this.redactor.code.sync();
    }
  };

  window.RedactorPlugins.embed = function() {
    return {
      init: function ()
      {
        this.embed = new WebhookEmbed(this);
      },
    };
  };

}(jQuery));
