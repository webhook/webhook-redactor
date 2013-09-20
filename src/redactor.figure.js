/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

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
    },
    observeCaptions: function () {

      // adding a BR to empty captions and citations on click will put the cursor in the expected place
      // (centered for centered text)
      this.redactor.$editor.on('click', 'figcaption:empty, cite:empty', $.proxy(function (event) {
        $(event.target).prepend('<br>');
        this.redactor.selectionEnd(event.target);
        event.stopPropagation();
      }, this));

      // remove redactor generated <br> tags from otherwise empty figcaptions
      $(window).on('click', $.proxy(this.cleanCaptions, this));
      this.redactor.$editor.on('blur', $.proxy(this.cleanCaptions, this));
      this.redactor.$editor.closest('form').one('submit', $.proxy(this.clearCaptions, this));

      // prevent user from removing captions or citations with delete/backspace keys
      this.redactor.$editor.on('keydown', $.proxy(function (event) {
        var current         = this.redactor.getCurrent(),
            is_empty        = !current.length,
            is_caption_node = !!$(current).closest('figcaption, cite').length,
            is_delete_key   = $.inArray(event.keyCode, [this.redactor.keyCode.BACKSPACE, this.redactor.keyCode.DELETE]) >= 0;

        if (is_empty && is_delete_key && is_caption_node) {
          event.preventDefault();
        }
      }, this));
    },
    cleanCaptions: function () {
      this.redactor.$editor.find('figcaption, cite').filter(function () { return !$(this).text(); }).empty();
    },
    clearCaptions: function () {
      this.redactor.$editor.find('figcaption, cite').filter(function () { return !$(this).text(); }).remove();
    },
    observeToolbars: function () {

      // move toolbar into figure on mouseenter
      this.redactor.$editor.on('mouseenter', 'figure', $.proxy(function (event) {
        var $figure = $(event.currentTarget),
            type = $figure.data('type') || 'default',
            $toolbar = this.getToolbar(type).data('figure', $figure).prependTo($figure);

        if (this.redactor[type] && this.redactor[type].onShow) {
          this.redactor[type].onShow($figure, $toolbar);
        }
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
      this.redactor.bufferSet(this.redactor.$editor.html());

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
