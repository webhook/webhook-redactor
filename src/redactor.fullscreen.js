/*
 * webhook-redactor
 * Adapted from Redactor's Fullscreen plugin.
 *
 * Copyright (c) 2014 Webhook
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';

  var RedactorPlugins = window.RedactorPlugins = window.RedactorPlugins || {};

  RedactorPlugins.fullscreen = function() {
    return {
      init: function()
      {
        this.isFullscreen = false;

        var button = this.button.add('fullscreen', 'Fullscreen');
        this.button.addCallback(button, this.fullscreen.toggleFullscreen);
        
        this.button.get('fullscreen').addClass('redactor_btn_fullscreen');
        this.button.get('fullscreen').parent().addClass('redactor_btn_right');

        if (this.opts.fullscreen) {
          this.fullscreen.toggleFullscreen();
        }
      },
      toggleFullscreen: function()
      {
        var html;

        if (!this.isFullscreen)
        {
          this.selection.save();

          if (this.fixedtoolbar) {
            this.fixedtoolbar.unfix();
          }

          this.button.changeIcon('fullscreen', 'normalscreen');
          this.button.setActive('fullscreen');
          this.isFullscreen = true;

          if (this.opts.toolbarExternal)
          {
            this.toolcss = {};
            this.boxcss = {};
            this.toolcss.width = this.$toolbar.css('width');
            this.toolcss.top = this.$toolbar.css('top');
            this.toolcss.position = this.$toolbar.css('position');
            this.boxcss.top = this.$box.css('top');
          }

          this.fsheight = this.$editor.height();

          if (this.opts.maxHeight) {
            this.$editor.css('max-height', '');
          }
          if (this.opts.iframe) {
            html = this.code.get();
          }

          this.$box.addClass('redactor_box_fullscreen');
          $('body, html').css('overflow', 'hidden');

          if (this.opts.iframe) {
            this.fullscreen.fullscreenIframe(html);
          }

          this.fullscreen.fullScreenResize();
          $(window).resize($.proxy(this.fullscreen.fullScreenResize, this));


          this.oldScrollTop = $(document).scrollTop();
          $(document).scrollTop(0, 0);

          this.focus.setStart();
          this.observe.load();

          this.selection.restore();

        }
        else
        {
          this.selection.save();

          this.button.removeIcon('fullscreen', 'normalscreen');
          this.button.setInactive('fullscreen');
          this.isFullscreen = false;

          $(window).off('resize', $.proxy(this.fullscreen.fullScreenResize, this));
          $('body, html').css('overflow', '');

          this.$box.removeClass('redactor_box_fullscreen').css({ width: 'auto', height: 'auto' });

          if (this.opts.iframe) {
            html = this.$editor.html();
          }

          if (this.opts.iframe) {
            this.fullscreen.fullscreenIframe(html);
          }
          else {
            this.code.sync();
          }

          var height = this.fsheight;
          if (this.opts.autoresize) {
            height = 'auto';
          }
          if (this.opts.maxHeight) {
            this.$editor.css('max-height', this.opts.maxHeight);
          }

          if (this.opts.toolbarExternal)
          {
            this.$box.css('top', this.boxcss.top);
            this.$toolbar.css({
              'width': this.toolcss.width,
              'top': this.toolcss.top,
              'position': this.toolcss.position
            });
          }

          if (!this.opts.iframe) {
        //    this.$editor.css('height', height);
          }
          else {
            this.$frame.css('height', height);
          }

          //this.$editor.css('height', height);
          this.focus.setStart();
          this.observe.load();
          
          $(document).scrollTop(this.oldScrollTop);
          this.selection.restore();
        }

        $(window).trigger('scroll');

      },
      fullscreenIframe: function(html)
      {
        this.$editor = this.$frame.contents().find('body');
        this.$editor.attr({ 'contenteditable': true, 'dir': this.opts.direction });

        // set document & window
        if (this.$editor[0])
        {
          this.document = this.$editor[0].ownerDocument;
          this.window = this.document.defaultView || window;
        }

        // iframe css
        this.iframeAddCss();

        if (this.opts.fullpage) {
          this.setFullpageOnInit(html);
        }
        else {
          this.code.set(html);
        }

        if (this.opts.wym) {
          this.$editor.addClass('redactor_editor_wym');
        }
      },
      fullScreenResize: function()
      {
        if (!this.isFullscreen) {
          return false;
        }

        var toolbarHeight = this.$toolbar.height();

        // var pad = this.$editor.css('padding-top').replace('px', '');
        var height = $(window).height() - toolbarHeight;
        this.$box.width($(window).width() - 2).height(height + toolbarHeight);

        if (this.opts.toolbarExternal)
        {
          this.$toolbar.css({
            'top': '0px',
            'position': 'absolute',
            'width': '100%'
          });

          this.$box.css('top', toolbarHeight + 'px');
        }

        // if (!this.opts.iframe) {
        //   this.$editor.height(height - (pad * 2));
        // }
        // else
        // {
        //   setTimeout($.proxy(function()
        //   {
        //     this.$frame.height(height);

        //   }, this), 1);
        // }

        // this.$editor.height(height);
      }
    };
  };

}(jQuery));
