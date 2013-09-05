/*! webhook-redactor - v0.0.1 - 2013-09-05
* https://github.com/gpbmike/webhook-redactor
* Copyright (c) 2013 Mike Horn; Licensed MIT */
(function ($) {
  "use strict";

  window.RedactorPlugins = window.RedactorPlugins || {};

  // this needs a better home
  $.embedly.defaults.key = '65874c90af644c6a8f0b7072fe857811';
  $.embedly.defaults.query = { maxwidth: 640 };

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
  var Figure = function (redactor) {
    this.redactor = redactor;
    this.toolbar = {};
    this.observe();
  };
  Figure.prototype = {
    control: {
      up    : { classSuffix: 'arrow-up' },
      down  : { classSuffix: 'arrow-down' },
      '|'   : { classSuffix: 'divider' },
      remove: { classSuffix: 'delete' }
    },
    controlGroup: ['up', 'down', 'remove'],
    observe: function () {

      // move toolbar into figure on mouseenter
      this.redactor.$editor.on('mouseenter', 'figure', $.proxy(function (event) {
        var $figure = $(event.currentTarget),
            type = $figure.data('type'),
            $toolbar = this.getToolbar(type).data('figure', $figure).prependTo($figure);
        $toolbar.trigger('show');
      }, this));

      // remove toolbar from figure on mouseleave
      this.redactor.$editor.on('mouseleave', 'figure', $.proxy(function (event) {
        $(event.currentTarget).find('.wh-figure-controls').appendTo(this.redactor.$box);
      }, this));

      // before clicking a command, make sure we save the current node within the editor
      this.redactor.$editor.on('mousedown', '.wh-figure-controls', $.proxy(function () {
        this.current = this.redactor.getCurrent();
      }, this));

      this.redactor.$editor.on('click', '.wh-figure-controls span, .wh-figure-controls a', $.proxy(function (event) {
        event.stopPropagation();
        var $target = $(event.currentTarget),
            command = $target.data('command'),
            $figure = $target.closest('figure'),
            plugin  = this.redactor[$figure.data('type')];
        this.command(command, $figure, plugin);
      }, this));
    },
    getToolbar: function (type) {

      if (this.toolbar[type]) {
        return this.toolbar[type];
      }

      var controlGroup = (this.redactor[type] && this.redactor[type].controlGroup) || this.controlGroup,
          controls = $.extend({}, this.control, (this.redactor[type] && this.redactor[type].control) || {}),
          $controls = this.buildControls(controlGroup, controls),
          $toolbar = $('<div class="wh-figure-controls">').append($controls);

      return this.toolbar[type] = $toolbar;
    },
    buildControls: function (controlGroup, controls) {

      var $controls = $();

      $.each(controlGroup, $.proxy(function (index, command) {
        var control;
        // basic command
        if (typeof command === 'string') {
          control = controls[command];
          $controls = $controls.add($('<span>', {
            'class': 'wh-figure-controls-' + control.classSuffix,
            'text': control.text
          }).data({
            command: command,
            control: control
          }));
        }
        // dropdown
        else if (typeof command === 'object') {
          $.each(command, $.proxy(function (text, commands) {
            var dropdown = $('<span>', {
              'class': 'wh-figure-controls-table wh-dropdown',
              'text': ' ' + text
            });
            $('<span class="caret">').appendTo(dropdown);
            var list = $('<dl class="wh-dropdown-menu wh-dropdown-bubble wh-dropdown-arrow wh-dropdown-arrow-left">').appendTo(dropdown);
            $.each(commands, $.proxy(function (index, command) {
              control = controls[command];
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
            $controls = $controls.add(dropdown);
          }, this));
        }
      }, this));

      return $controls;
    },
    command: function (command, $figure, plugin) {

      // move the toolbar before carrying out the command so it doesn't break when undoing/redoing
      $figure.find('.wh-figure-controls').appendTo(this.redactor.$box);

      // maintain undo buffer
      this.redactor.bufferSet();

      // only handle a few commands here, everything else should be taken care of from other plugins
      switch (command) {
        case 'up':
          $figure.insertBefore($figure.prev());
          break;

        case 'down':
          $figure.insertAfter($figure.next());
          break;

        case 'remove':
          $figure.remove();
          break;

        default:
          if (plugin && plugin.command) {
            plugin.command(command, $figure);
          }
          break;
      }

    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.figure = {
    init: function () {
      this.figure = new Figure(this);
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
  var Image = function (redactor) {
    this.redactor = redactor;
  };
  Image.prototype = {
    control: {
      left  : { classSuffix: 'arrow-left' },
      right : { classSuffix: 'arrow-right' },
      small : { classSuffix: 'small', text: 'S' },
      medium: { classSuffix: 'medium', text: 'M' },
      large : { classSuffix: 'large', text: 'L' }
    },
    controlGroup: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'remove'],
    command: function (command, $figure) {

      var classString = function (suffixArray, separator, prefix, dot) {
        var base_class = (dot ? '.' : '') + 'wh-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addString) {
        $figure.removeClass(classString(removeArray)).addClass('wh-figure-' + addString);
      };

      switch (command) {
        case 'left':
        case 'right':
          if (command === 'left' && $figure.hasClass('wh-figure-right')) {
            $figure.removeClass('wh-figure-right');
            changeSuffix(['small', 'medium', 'large'], 'large');
          } else if (command === 'right' && $figure.hasClass('wh-figure-left')) {
            $figure.removeClass('wh-figure-left');
            changeSuffix(['small', 'medium', 'large'], 'large');
          } else {
            changeSuffix(['left', 'right'], command);
            if (!$figure.hasClass('wh-figure-medium') && !$figure.hasClass('wh-figure-small')) {
              $figure.addClass('wh-figure-medium');
            }
          }
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
          break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.image = {
    init: function () {
      this.image = new Image(this);
      this.buttonAddBefore('link', 'image', 'Image', $.proxy(function () {
        window.console.log('image', this);
      }, this.image));
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.quote = {
    init: function () {
      this.buttonAddBefore('link', 'quote', 'Quote', $.proxy(function () {

        // maintain undo buffer
        this.bufferSet();

        this.formatQuote();

        var $target = $(this.getBlock() || this.getCurrent());

        if ($target.is('blockquote')) {
          $('<figure data-type="quote"><figcaption>Type to add quote credit (optional)</figcaption>').insertBefore($target).prepend($target);
        } else {
          $target.closest('figure').before($target).remove();
        }

        this.sync();

      }, this));
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // namespacing
  var Table = function (redactor) {
    this.redactor = redactor;
  };
  Table.prototype = {
    control: {
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
    controlGroup: [
      'up', 'down', '|', {
        'Table Options': [
          'row_up', 'row_down', 'col_left', 'col_right', '|',
          'add_head', 'del_head', '|',
          'del_col', 'del_row', 'del_table', '|',
          'border', 'stripe', 'full_border'
        ]
      }, 'remove'],
    command: function (command, $figure) {

      switch (command) {
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
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.table = {
    init: function () {
      this.table = new Table(this);
      this.buttonAddBefore('link', 'table', 'Table', $.proxy(function () {

        var callback = $.proxy(function () {

          // save cursor position
          this.selectionSave();

          $('#redactor_insert_table_btn').click($.proxy(function () {

            // maintain undo buffer
            this.bufferSet();

            var rows = $('#redactor_table_rows').val(),
                columns = $('#redactor_table_columns').val(),
                $table_box = $('<div></div>'),
                tableId = Math.floor(Math.random() * 99999),
                $table = $('<table id="table' + tableId + '">').addClass('wh-table wh-table-bordered-rows full-width'),
                $thead = $('<thead>').appendTo($table),
                $tbody = $('<tbody>').appendTo($table),
                i, $row, z, $column;

            $row = $('<tr>').appendTo($thead);
            for (z = 0; z < columns; z++) {
              $('<th>Header</th>').appendTo($row);
            }

            for (i = 0; i < rows; i++) {
              $row = $('<tr>');

              for (z = 0; z < columns; z++) {
                $column = $('<td>Data</td>');

                // set the focus to the first td
                if (i === 0 && z === 0) {
                  $column.append('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
                }

                $($row).append($column);
              }

              $tbody.append($row);
            }

            $('<figure data-type="table">').append($table).appendTo($table_box);
            var html = $table_box.html();

            this.modalClose();
            this.selectionRestore();

            var current = this.getBlock() || this.getCurrent();
            if (current) {
              $(current).after(html);
            } else {
              this.insertHtmlAdvanced(html, false);

            }

            this.selectionRestore();

            var table = this.$editor.find('#table' + tableId);
            this.tableObserver(table);
            this.buttonActiveObserver();

            table.find('span#selection-marker-1').remove();
            table.removeAttr('id');

            this.sync();

          }, this));

          setTimeout(function () {
            $('#redactor_table_rows').focus();
          }, 200);

        }, this);

        var modal = String() +
          '<section>' +
            '<label>' + this.opts.curLang.rows + '</label>' +
            '<input type="text" size="5" value="2" id="redactor_table_rows">' +
            '<label>' + this.opts.curLang.columns + '</label>' +
            '<input type="text" size="5" value="3" id="redactor_table_columns">' +
          '</section>' +
          '<footer>' +
            '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>' +
            '<input type="button" name="upload" class="redactor_modal_btn" id="redactor_insert_table_btn" value="' + this.opts.curLang.insert + '">' +
          '</footer>';

        this.modalInit('Insert Table', modal, 500, callback);

      }, this));
    }
  };

}(jQuery));

(function ($) {
  "use strict";

  // namespacing
  var Video = function (redactor) {
    this.redactor = redactor;
  };

  Video.prototype = {
    control: {
      resize: { classSuffix: 'resize-full' }
    },
    controlGroup: ['up', 'down', '|', 'resize', 'remove'],
    command: function (command, $figure) {
      if (command === 'resize') {
        $figure.toggleClass('wh-figure-full');
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.video = {
    init: function () {
      this.video = new Video(this);

      var insertVideo = function (data) {

        // maintain undo buffer
        this.bufferSet();

        data = '<figure data-type="video"><p>' + this.cleanStripTags(data) + '</p><figcaption>Type to add caption (optional)</figcaption></figure>';

        this.selectionRestore();

        var current = this.getBlock() || this.getCurrent();

        if (current) {
          $(current).after(data);
        } else {
          this.insertHtmlAdvanced(data, false);
        }

        this.sync();
        this.modalClose();

      };

      var urlRegex = /(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w.,@?\^=%&amp;:\/~+#\-]*[\w@?\^=%&amp;\/~+#\-])?/;

      this.buttonAddBefore('link', 'video', 'Video', $.proxy(function () {

        // callback (optional)
        var callback = $.proxy(function () {

          // save cursor position
          this.selectionSave();

          $('#redactor_insert_video_btn').click($.proxy(function () {

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
          '</section>' +
          '<footer>' +
            '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>' +
            '<input type="button" class="redactor_modal_btn" id="redactor_insert_video_btn" value="' + this.opts.curLang.insert + '" />' +
          '</footer>';

        // or call a modal with a code
        this.modalInit('Insert Video', modal, 500, callback);

      }, this));

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
      // 'image', 'video', 'table',
      'link', '|',
      'html'
    ],
    plugins: ['cleanup', 'fullscreen', 'fixedtoolbar', 'autoembedly', 'figure', 'image', 'video', 'table', 'quote']
  };

}(jQuery));
