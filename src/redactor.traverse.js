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
          $figure.find('table').removeClass('wh-table-bordered-all').addClass('wh-table-bordered-rows');
          break;

        case 'stripe':
          $figure.find('table').toggleClass('wh-table-striped');
          break;

        case 'full_border':
          $figure.find('table').removeClass('wh-table-bordered-rows').addClass('wh-table-bordered-all');
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
