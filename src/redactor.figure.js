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
  var Figure = function (redactor) {
    this.redactor = redactor;
    this.toolbar = {};
    this.init();
  };
  Figure.prototype = {
    control: {
      up    : { classSuffix: 'arrow-up' },
      down  : { classSuffix: 'arrow-down' },
      '|'   : { classSuffix: 'divider' },
      remove: { classSuffix: 'delete' }
    },

    controlGroup: ['up', 'down', 'remove'],

    init: function () {
      this.observeCaptions();
      this.observeToolbars();
      this.observeKeyboard();
    },

    observeCaptions: function () {

      // adding a BR to empty captions and citations on click will put the cursor in the expected place
      // (centered for centered text)
      this.redactor.$editor.on('click', 'figcaption:empty, cite:empty', $.proxy(function (event) {
        $(event.target).prepend('<br>');
        this.redactor.caret.setEnd(event.target);
        event.stopPropagation();
      }, this));

      // remove redactor generated <br> tags from otherwise empty figcaptions
      $(window).on('click', $.proxy(this.cleanCaptions, this));
      this.redactor.$editor.on('blur', $.proxy(this.cleanCaptions, this));

      this.redactor.$editor.closest('form').one('submit', $.proxy(this.clearCaptions, this));

      // prevent user from removing captions or citations with delete/backspace keys
      this.redactor.$editor.on('keydown', $.proxy(function (event) {
        var current         = $(this.redactor.selection.getCurrent()),
            isEmpty        = !current.text().length,
            isCaptionNode = !!$(current).closest('figcaption, cite').length,
            isDeleteKey   = $.inArray(event.keyCode, [this.redactor.keyCode.BACKSPACE, this.redactor.keyCode.DELETE]) >= 0;

        if (isEmpty && isDeleteKey && isCaptionNode) {
          event.preventDefault();
        }
      }, this));

    },

    cleanCaptions: function () {
      this.redactor.$editor.find('figcaption, cite').filter(function () { return !$(this).text(); }).empty();
    },

    clearCaptions: function () {
      this.redactor.$editor.find('figcaption, cite').filter(function () { return !$(this).text(); }).remove();
      if (this.redactor.opts.visual) {
        this.redactor.code.sync();
      }
    },

    showToolbar: function (event) {
      var $figure = $(event.currentTarget),
          type = $figure.data('type') || 'default';

      if(type === 'image') 
        type = 'webhookImage';

      var $toolbar = this.getToolbar(type).data('figure', $figure).prependTo($figure);

      if (this.redactor[type] && this.redactor[type].onShow) {
        this.redactor[type].onShow($figure, $toolbar);
      }
    },

    hideToolbar: function (event) {
      $(event.currentTarget).find('.wy-figure-controls').appendTo(this.redactor.$box);
    },

    observeToolbars: function () {

      // before clicking a command, make sure we save the current node within the editor
      this.redactor.$editor.on('mousedown', '.wy-figure-controls', $.proxy(function () {
        event.preventDefault();
        this.current = this.redactor.selection.getCurrent();
      }, this));

      this.redactor.$editor.on('click', '.wy-figure-controls span, .wy-figure-controls a', $.proxy(function (event) {

        event.stopPropagation();
        var $target = $(event.currentTarget),
            command = $target.data('command'),
            $figure = $target.closest('figure'),
            type = $figure.data('type');

        if(type === 'image')
          type = 'webhookImage';
        
        var plugin  = this.redactor[type];

        this.command(command, $figure, plugin);
      }, this));

      this.redactor.$editor.on('keydown', function () {
        $(this).find('figure').trigger('mouseleave');
      });

      if (this.redactor.utils.isMobile()) {

        // if $editor is focused, click doesn't seem to fire
        this.redactor.$editor.on('touchstart', 'figure', function (event) {
          if (event.target.nodeName !== 'FIGCAPTION' && $(event.target).parents('.wy-figure-controls').length) {
            $(this).trigger('click', event);
          }
        });

        this.redactor.$editor.on('click', 'figure', $.proxy(function (event) {
          if (event.target.nodeName !== 'FIGCAPTION') {
            this.redactor.$editor.trigger('blur');
          }
          this.showToolbar(event);
        }, this));
      } else {
        // move toolbar into figure on mouseenter
        this.redactor.$editor.on('mouseenter', 'figure', $.proxy(this.showToolbar, this));

        // remove toolbar from figure on mouseleave
        this.redactor.$editor.on('mouseleave', 'figure', $.proxy(this.hideToolbar, this));
      }

    },

    getToolbar: function (type) {

      if (this.toolbar[type]) {
        return this.toolbar[type];
      }

      var controlGroup = (this.redactor[type] && this.redactor[type].controlGroup) || this.controlGroup,
          controls = $.extend({}, this.control, (this.redactor[type] && this.redactor[type].control) || {}),
          $controls = this.buildControls(controlGroup, controls),
          $toolbar = $('<div class="wy-figure-controls">').append($controls);

      this.toolbar[type] = $toolbar;

      return $toolbar;
    },

    buildControls: function (controlGroup, controls) {

      var $controls = $();

      $.each(controlGroup, $.proxy(function (index, command) {
        var control;
        // basic command
        if (typeof command === 'string') {
          control = controls[command];
          $controls = $controls.add($('<span>', {
            'class': 'wy-figure-controls-' + control.classSuffix,
            'text': control.text
          }).data({
            command: command,
            control: control
          }));
        }
        // dropdown
        else if (typeof command === 'object') {
          $.each(command, $.proxy(function (text, commands) {

            var dropdown = $('<span>').text(' ' + text).addClass('wy-figure-controls-table wy-dropdown');

            $('<span class="caret">').appendTo(dropdown);

            var list = $('<dl class="wy-dropdown-menu wy-dropdown-bubble wy-dropdown-arrow wy-dropdown-arrow-left">').appendTo(dropdown);

            dropdown.on('mouseover', function () {
              list.show();
            });

            dropdown.on('mouseout', function () {
              list.hide();
            });

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
      $figure.find('.wy-figure-controls').appendTo(this.redactor.$box);

      // maintain undo buffer
      this.redactor.buffer.add(this.redactor.$editor.html());

      // only handle a few commands here, everything else should be taken care of from other plugins
      switch (command) {
        case 'up':
          $figure.prev().before($figure);
          break;

        case 'down':
          $figure.next().after($figure);
          break;

        case 'remove':
          $figure.remove();
          break;

        default:
          if (plugin && plugin.command) {
            plugin.command(command, $figure, $(this.current));
          }
          break;
      }

      this.redactor.code.sync();

    },

    observeKeyboard: function () {
      var redactor = this.redactor;
      redactor.$editor.on('keydown', function (event) {
        // node where cursor is
        var currentNode = redactor.selection.getBlock();

        // delete key
        if (event.keyCode === 8 && !redactor.caret.getOffset(currentNode) && currentNode.previousSibling && currentNode.previousSibling.nodeName === 'FIGURE') {
          event.preventDefault();
        }
      });
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.figure = function() {
    return {
      init: function () {
        this.figure = new Figure(this);
      }
    }
  };

}(jQuery));
