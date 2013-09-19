/*
 * webhook-redactor
 *
 * requires marked (https://github.com/chjj/marked) and reMarked (https://github.com/leeoniya/reMarked.js)
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

  // namespacing
  var Markdown = function (redactor) {
    this.redactor = redactor;
  };
  Markdown.prototype = {
    insert: function (markdown_string) {

      var html = marked(markdown_string);

      this.redactor.modalClose();
      this.redactor.selectionRestore();

      // maintain undo buffer
      this.redactor.bufferSet(this.redactor.$editor.html());

      var current = this.redactor.getBlock() || this.redactor.getCurrent();
      if (current) {
        $(current).after(html);
      } else {
        this.redactor.insertHtmlAdvanced(html, false);
      }

      this.redactor.selectionRestore();

      this.redactor.sync();

    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.markdown = {
    init: function () {
      this.markdown = new Markdown(this);
      this.buttonAddAfter('html', 'html', 'Markdown', $.proxy(function () {

        // save cursor position
        this.selectionSave();

        var callback = $.proxy(function () {

          $('#redactor_insert_table_btn').on('click', $.proxy(function () {
            this.markdown.insert($('#redactor_markdown_text').val());
          }, this));

          setTimeout(function () {
            $('#redactor_markdown_text').trigger('focus');
          }, 200);

        }, this);

        var modal = String() +
          '<section>' +
            '<label>Markdown Text</label>' +
            '<textarea rows="5" id="redactor_markdown_text"></textarea>' +
          '</section>' +
          '<footer>' +
            '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>' +
            '<input type="button" name="upload" class="redactor_modal_btn" id="redactor_insert_table_btn" value="' + this.opts.curLang.insert + '">' +
          '</footer>';

        this.modalInit('Insert Markdown', modal, 500, callback);
      }, this));
    }
  };

}(jQuery));
