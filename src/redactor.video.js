/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

  // namespacing
  var Video = function (redactor) {
    this.redactor = redactor;
    this.init();
  };

  Video.prototype = {
    control: {
      resizeFull : { classSuffix: 'resize-full' },
      resizeSmall: { classSuffix: 'resize-small' }
    },
    controlGroup: ['up', 'down', '|', 'resizeFull', 'resizeSmall', 'remove'],
    init: function () {
    },
    onShow: function ($figure, $toolbar) {

      if ($figure.hasClass('wy-figure-full')) {
        $toolbar.find('.wy-figure-controls-resize-full').hide();
        $toolbar.find('.wy-figure-controls-resize-small').show();
      } else {
        $toolbar.find('.wy-figure-controls-resize-full').show();
        $toolbar.find('.wy-figure-controls-resize-small').hide();
      }

    },
    command: function (command, $figure) {
      if (command === 'resizeFull') {
        $figure.addClass('wy-figure-full');
      } else if (command === 'resizeSmall') {
        $figure.removeClass('wy-figure-full');
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.video = function() { 
    return {
      init: function () {
        this.video = new Video(this);

        var insertVideo = function (data) {

          // maintain undo buffer
          this.buffer.set();

          data = '<figure data-type="video"><p>' + data + '</p><figcaption></figcaption></figure>';

          this.selection.restore();

          var current = this.selection.getBlock() || this.selection.getCurrent();

          if (current) {
            $(current).after(data);
          } else {
            this.insert.html(data, false);
          }

          this.code.sync();
          this.modal.close();

        };

        var urlRegex = /(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w.,@?\^=%&amp;:\/~+#\-]*[\w@?\^=%&amp;\/~+#\-])?/;

        var button = this.button.addBefore('link', 'video', 'Video');

        this.button.addCallback(button, $.proxy(function () {

          // callback (optional)
          var callback = $.proxy(function () {

            // save cursor position
            this.selection.save();
            
            setTimeout(function () {
              $('#redactor_insert_video_area').focus();
            }, 200);

          }, this);

          var modal = String() +
            '<section>' +
              '<form id="redactorInsertVideoForm">' +
                '<label>' + this.opts.curLang.video_html_code + '</label>' +
                '<textarea id="redactor_insert_video_area" style="width: 99%; height: 160px;"></textarea>' +
              '</form>' +
            '</section>';

          // or call a modal with a code
          this.modal.addTemplate('insert-video', modal);
          this.modal.addCallback('insert-video', callback);
          this.modal.load('insert-video', 'Insert Video', 500);


          this.modal.createCancelButton();
          var button = this.modal.createActionButton('Insert');
          button.on('click', $.proxy(function () {

            var data = $.trim($('#redactor_insert_video_area').val());
            if (urlRegex.test(data)) {

              $.embedly.oembed(data).done($.proxy(function (results) {
                $.each(results, $.proxy(function (index, result) {
                  insertVideo.call(this, result.html);
                }, this));
              }, this));

            } else {
              insertVideo.call(this, data);
            }

          }, this));

          this.modal.show();

        }, this));

        this.button.get('video').addClass('redactor_btn_video');

      }
    };
  };

}(jQuery));
