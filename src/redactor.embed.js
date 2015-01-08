/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

  if (!window.RedactorPlugins) window.RedactorPlugins = {};
      
  var WebhookEmbed = function (redactor) {
    this.redactor = redactor;
    this.$editor = redactor.$editor;
    this.init();
  };
  WebhookEmbed.prototype = {
    getTemplate: function()
    {
        return String()
        + '<section id="redactor-modal-embed-code">'
        + '<label>Enter Embed code:</label>'
        + '<textarea id="embed-code-textarea" rows="6"></textarea>'
        + '</section>' +
        '<footer>' +
          '<input type="button" class="redactor_modal_btn redactor_btn_modal_close" value="' + this.redactor.opts.curLang.cancel + '" />' +
          '<input type="button" class="redactor_modal_btn" id="redactor_insert_embed_code_btn" value="' + this.redactor.opts.curLang.insert + '" />' +
        '</footer>';
    },
    init: function ()
    {
      window.redactor = this.redactor;
      var button = this.redactor.button.add('embed', 'Embed');
      this.redactor.button.addCallback(button, $.proxy(this.show, this));
    },
    show: function()
    {
      this.redactor.modal.addTemplate('insert-embed', this.getTemplate());
      this.redactor.modal.addCallback('insert-embed', $.proxy(function() {
        this.redactor.selection.save();

        $('#redactor_insert_embed_code_btn').click($.proxy(this.insert, this));

        setTimeout(function () {
          $('#embed-code-textarea').focus();
        }, 200);

      }, this));
      this.redactor.modal.load('insert-embed', 'Insert Embed', 500);
      this.redactor.modal.show();
    },
    insert: function()
    {
      var html = $('#embed-code-textarea').val();

      this.redactor.modal.close();
      this.redactor.selection.restore();

      this.redactor.insert.html('<figure data-type="embed">' + html + '</figure>', false);

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
