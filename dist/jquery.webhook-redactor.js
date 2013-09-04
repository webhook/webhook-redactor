/*! webhook-redactor - v0.0.1 - 2013-09-04
* https://github.com/gpbmike/webhook-redactor
* Copyright (c) 2013 Mike Horn; Licensed MIT */
(function ($) {
  "use strict";

  window.RedactorPlugins = window.RedactorPlugins || {};

  // this needs a better home
  $.embedly.defaults.key = '65874c90af644c6a8f0b7072fe857811';

  // namespacing
  var AutoEmbedly = function (redactor) {
    this.redactor = redactor;
    this.observe();
  };
  AutoEmbedly.prototype = {
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
        if (node.nodeType === 3 && node.nodeValue && node.nodeValue.match(/((http:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|.*\.youtube\.com\/view_play_list.*|.*\.youtube\.com\/playlist.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/.*|player\.vimeo\.com\/.*))|(https:\/\/(.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|www\.vimeo\.com\/.*|vimeo\.com\/.*|player\.vimeo\.com\/.*)))/i)) {

          var url = node.nodeValue,
              shiv = $('<span>loading...</span>');

          $(node).replaceWith(shiv);

          $.embedly.oembed(url).done(function (results) {
            $.each(results, function () {
              shiv.replaceWith(this.html);
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
  window.RedactorPlugins.autoembedly = {
    init: function () {
      this.autoembedly = new AutoEmbedly(this);
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // namespacing
  var Cleanup = function (redactor) {
    this.redactor = redactor;
    this.init();
  };
  Cleanup.prototype = {
    init: function () {
      this.removeEmptyPs();
    },
    removeEmptyPs: function () {
      this.redactor.$editor.find('p').each(function() {
        var $this = $(this);
        if (!$this.html().replace(/\s|&nbsp;/g, '').length) {
          $this.remove();
        }
      });
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.cleanup = {
    init: function () {
      this.cleanup = new Cleanup(this);
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // namespacing
  var Fixedtoolbar = function (redactor) {
    this.redactor = redactor;
    this.$window = $(redactor.window);
    this.$window.on('scroll', $.proxy(this.checkOffset, this));

  };
  Fixedtoolbar.prototype = {
    checkOffset: function () {
      if (this.redactor.$box.offset().top - this.$window.scrollTop() <= 0) {
        this.fix();
      } else {
        this.unfix();
      }
    },
    fix: function () {

      var border_left = parseInt(this.redactor.$box.css('border-left-width').replace('px', ''), 10);

      this.redactor.$toolbar.css({
        position: 'fixed',
        left: this.redactor.$box.offset().left + border_left,
        width: this.redactor.$box.width(),
        zIndex: 1
      });

      this.redactor.$editor.css('padding-top', this.redactor.$toolbar.height() + 10);
    },
    unfix: function () {
      this.redactor.$toolbar.css({
        position: 'relative',
        left: 'auto',
        width: 'auto'
      });
      this.redactor.$editor.css('padding-top', 10);
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.fixedtoolbar = {
    init: function () {
      this.fixedtoolbar = new Fixedtoolbar(this);
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  window.RedactorPlugins = window.RedactorPlugins || {};

  window.RedactorPlugins.fullscreen = {
    init: function () {
      this.fullscreen = false;

      this.buttonAdd('fullscreen', 'Fullscreen', $.proxy(this.toggleFullscreen, this));
      this.buttonSetRight('fullscreen');

      if (this.opts.fullscreen) {
        this.toggleFullscreen();
      }
    },

    toggleFullscreen: function () {
      var html;

      if (!this.fullscreen) {
        this.buttonChangeIcon('fullscreen', 'normalscreen');
        this.buttonActive('fullscreen');
        this.fullscreen = true;

        if (this.opts.toolbarExternal) {
          this.toolcss = {};
          this.boxcss = {};
          this.toolcss.width = this.$toolbar.css('width');
          this.toolcss.top = this.$toolbar.css('top');
          this.toolcss.position = this.$toolbar.css('position');
          this.boxcss.top = this.$box.css('top');
        }

        this.fsheight = this.$editor.height();

        if (this.opts.iframe) {
          html = this.get();
        }

        this.tmpspan = $('<span></span>');
        this.$box.addClass('redactor_box_fullscreen').after(this.tmpspan);

        $('body, html').css('overflow', 'hidden');
        $('body').prepend(this.$box);

        if (this.opts.iframe) {
          this.fullscreenIframe(html);
        }

        this.fullScreenResize();
        $(window).resize($.proxy(this.fullScreenResize, this));
        $(document).scrollTop(0, 0);

        this.focus();
        this.observeStart();

      } else {
        this.buttonRemoveIcon('fullscreen', 'normalscreen');
        this.buttonInactive('fullscreen');
        this.fullscreen = false;

        $(window).off('resize', $.proxy(this.fullScreenResize, this));
        $('body, html').css('overflow', '');

        this.$box.removeClass('redactor_box_fullscreen').css({
          width: 'auto',
          height: 'auto'
        });

        if (this.opts.iframe) {
          html = this.$editor.html();
        }
        this.tmpspan.after(this.$box).remove();

        if (this.opts.iframe) {
          this.fullscreenIframe(html);
        } else {
          this.sync();
        }

        var height = this.fsheight;
        if (this.opts.autoresize) {
          height = 'auto';
        }

        if (this.opts.toolbarExternal) {
          this.$box.css('top', this.boxcss.top);
          this.$toolbar.css({
            'width': this.toolcss.width,
            'top': this.toolcss.top,
            'position': this.toolcss.position
          });
        }

        if (!this.opts.iframe) {
          this.$editor.css('height', height);
        } else {
          this.$frame.css('height', height);
        }

        this.$editor.css('height', height);
        this.focus();
        this.observeStart();
      }
    },

    fullscreenIframe: function (html) {
      this.$editor = this.$frame.contents().find('body').attr({
        'contenteditable': true,
        'dir': this.opts.direction
      });

      // set document & window
      if (this.$editor[0]) {
        this.document = this.$editor[0].ownerDocument;
        this.window = this.document.defaultView || window;
      }

      // iframe css
      this.iframeAddCss();

      if (this.opts.fullpage) {
        this.setFullpageOnInit(html);
      } else {
        this.set(html);
      }

      if (this.opts.wym) {
        this.$editor.addClass('redactor_editor_wym');
      }
    },

    fullScreenResize: function () {
      if (!this.fullscreen) {
        return false;
      }

      var toolbarHeight = this.$toolbar.height();

      var pad = this.$editor.css('padding-top').replace('px', '');
      var height = $(window).height() - toolbarHeight;
      this.$box.width($(window).width() - 2).height(height + toolbarHeight);

      if (this.opts.toolbarExternal) {
        this.$toolbar.css({
          'top': '0px',
          'position': 'absolute',
          'width': '100%'
        });

        this.$box.css('top', toolbarHeight + 'px');
      }

      if (!this.opts.iframe) {
        this.$editor.height(height - (pad * 2));
      } else {
        setTimeout($.proxy(function () {
          this.$frame.height(height);

        }, this), 1);
      }

      this.$editor.height(height);
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // namespacing
  var Traverse = function (redactor) {
    this.redactor = redactor;
    this.$toolbars = {};
    this.init();
  };
  Traverse.prototype = {
    control: {
        left  : { classSuffix: 'arrow-left' },
        up    : { classSuffix: 'arrow-up' },
        down  : { classSuffix: 'arrow-down' },
        right : { classSuffix: 'arrow-right' },
        '|'   : { classSuffix: 'divider' },
        remove: { classSuffix: 'delete' },

        // image
        small : { classSuffix: 'small', text: 'S' },
        medium: { classSuffix: 'medium', text: 'M' },
        large : { classSuffix: 'large', text: 'L' },

        // video
        resize: { classSuffix: 'resize-full' },

        // table
        row_up     : { text: 'Add row above' },
        row_down   : { text: 'Add row below' },
        col_left   : { text: 'Add column left' },
        col_right  : { text: 'Add column right' },
        add_head   : { text: 'Add header' },
        del_head   : { text: 'Delete header' },
        del_col    : { text: 'Delete column' },
        del_row    : { text: 'Delete row' },
        del_table  : { text: 'Delete table' },
        border     : { text: 'Bordered' },
        stripe     : { text: 'Striped' },
        full_border: { text: 'Full border' }

    },
    init: function () {

      this.controlgroup = {
        image: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'remove'],
        video: ['up', 'down', '|', 'resize', 'remove'],
        table: ['up', 'down', '|', {
                'Table Options': [
                  'row_up', 'row_down', 'col_left', 'col_right', '|',
                  'add_head', 'del_head', '|',
                  'del_col', 'del_row', 'del_table', '|',
                  'border', 'stripe', 'full_border'
                ]
                }, 'remove']
      };

      this.observe();
    },
    observe: function () {
      this.redactor.$editor.on('mouseenter', 'figure', $.proxy(this.mouseenter, this));
      this.redactor.$editor.on('mouseleave', 'figure', $.proxy(this.mouseleave, this));

      this.redactor.$editor.on('mousedown', '.wh-figure-controls', $.proxy(function () {
        this.current = this.redactor.getCurrent();
      }, this));

      this.redactor.$editor.on('click', '.wh-figure-controls span, .wh-figure-controls a', $.proxy(function (event) {
        event.stopPropagation();
        this.command($(event.currentTarget), $(event.currentTarget).closest('figure'));
      }, this));
    },
    mouseenter: function (event) {
      var $figure = $(event.currentTarget);
      $.each(['image', 'table', 'video'], $.proxy(function (index, type) {
        if ($figure.hasClass('wh-figure-' + type)) {
          this.getToolbar(type).data('figure', $figure).prependTo($figure);
        }
      }, this));
    },
    mouseleave: function (event) {
      var $figure = $(event.currentTarget);
      $figure.find('.wh-figure-controls').appendTo(this.redactor.$box);
    },
    getToolbar: function (type) {

      if (this.$toolbars[type]) {
        return this.$toolbars[type];
      }

      var toolbar = $('<div class="wh-figure-controls">');

      $.each(this.controlgroup[type], $.proxy(function (index, command) {
        var control;
        // basic command
        if (typeof command === 'string') {
          control = this.control[command];
          $('<span>', {
            'class': 'wh-figure-controls-' + control.classSuffix,
            'text': control.text
          }).data({
            command: command,
            control: control
          }).appendTo(toolbar);
        }
        // dropdown
        else if (typeof command === 'object') {
          $.each(command, $.proxy(function (text, commands) {
            var dropdown = $('<span>', {
              'class': 'wh-figure-controls-table wh-dropdown',
              'text': ' ' + text
            }).appendTo(toolbar);
            $('<span class="caret">').appendTo(dropdown);
            var list = $('<dl class="wh-dropdown-menu wh-dropdown-bubble wh-dropdown-arrow wh-dropdown-arrow-left">').appendTo(dropdown);
            $.each(commands, $.proxy(function (index, command) {
              control = this.control[command];
              if (command === '|') {
                $('<dd class="divider">').appendTo(list);
              } else {
                $('<a>', {
                  text: control.text
                }).data({
                  command: command,
                  control: control
                }).appendTo($('<dd>').appendTo(list));
              }
            }, this));
          }, this));
        }
      }, this));

      return this.$toolbars[type] = toolbar.appendTo(this.redactor.$editor);

    },
    command: function ($control, $figure) {

      var command = $control.data('command');

      var classString = function (suffixArray, separator, prefix, dot) {
        var base_class = (dot ? '.' : '') + 'wh-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addString) {
        $figure.removeClass(classString(removeArray)).addClass('wh-figure-' + addString);
      };

      // move the toolbar before carrying out the command so it doesn't break when undoing/redoing
      $figure.find('.wh-figure-controls').appendTo(this.redactor.$box);

      // maintain undo buffer
      this.redactor.bufferSet();

      switch (command) {
        case 'up':
          $figure.insertBefore($figure.prev());
          break;
        case 'down':
          $figure.insertAfter($figure.next());
          break;

        case 'left':
        case 'right':
          changeSuffix(['left', 'right'], command);
          if (!$figure.hasClass('wh-figure-medium') && !$figure.hasClass('wh-figure-small')) {
            $figure.addClass('wh-figure-medium');
          }
          break;

        case 'remove':
          $figure.remove();
          break;

        case 'small':
        case 'medium':
        case 'large':
          changeSuffix(['small', 'medium', 'large'], command);
          if (command === 'large') {
            $figure.removeClass(classString(['left', 'right']));
          } else if (!$figure.hasClass('wh-figure-left') && !$figure.hasClass('wh-figure-right')) {
            $figure.addClass('wh-figure-left');
          }
          $control.addClass('on').siblings(classString(['small', 'medium', 'large'], ', ', 'controls-', true)).removeClass('on');
          break;

        case 'row_up':
        case 'row_down':
          $.proxy(function () {

            var $row = $(this.current).closest('tr'),
                clone = $row.clone().find('td').text('Data').end();
            if (command === 'row_up') {
              clone.insertBefore($row);
            } else {
              clone.insertAfter($row);
            }

          }, this)();
          break;

        case 'col_left':
        case 'col_right':
          $.proxy(function () {
            var $cell = $(this.current).closest('td'),
                $row = $cell.closest('tr'),
                $table = $row.closest('table'),
                position = $row.children().index($cell) + 1,
                insert_position = command === 'col_left' ? 'before' : 'after';

            $table.find('thead tr').children(':nth-child(' + position + ')')[insert_position]($('<th>').text('Header'));
            $table.find('tbody tr').children(':nth-child(' + position + ')')[insert_position]($('<td>').text('Data'));

          }, this)();

          break;

        case 'add_head':
          $.proxy(function () {
            var num_cols = $figure.find('tr').first().children().length,
                $table = $figure.find('table'),
                $thead = $('<thead>').prependTo($table),
                $row = $('<tr>').appendTo($thead);

            for (var i = 0; i < num_cols; i++) {
              $('<th>').text('Header').appendTo($row);
            }
          }, this)();
          break;

        case 'del_head':
          $figure.find('thead').remove();
          break;

        case 'del_col':
          $.proxy(function () {
            var $cell = $(this.current).closest('td'),
                position = $cell.parent().children().index($cell) + 1;

            $cell.closest('table').find('tr').children(':nth-child(' + position + ')').remove();

          }, this)();
          break;

        case 'del_row':
          $(this.current).closest('tr').remove();
          break;

        case 'del_table':
          $figure.remove();
          break;

        case 'border':
          $figure.find('table').removeClass('wh-table-bordered-all').toggleClass('wh-table-bordered-rows');
          break;

        case 'stripe':
          $figure.find('table').toggleClass('wh-table-striped');
          break;

        case 'full_border':
          $figure.find('table').removeClass('wh-table-bordered-rows').toggleClass('wh-table-bordered-all');
          break;

        default:
          window.console.log(command);
          break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.traverse = {
    init: function () {
      this.traverse = new Traverse(this);
    }
  };

}(jQuery));

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
