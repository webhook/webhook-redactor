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
      stripe     : { text: 'Striped row' },
      border     : { text: 'Borders on rows' },
      full_border: { text: 'Borders everywhere' }
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
    insertTable: function (rows, columns) {

      var $table_box = $('<div></div>'),
          tableId = Math.floor(Math.random() * 99999),
          $table = $('<table id="table' + tableId + '">'),
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
            $column.append('<span id="selection-marker-1">' + this.redactor.opts.invisibleSpace + '</span>');
          }

          $($row).append($column);
        }

        $tbody.append($row);
      }

      $('<figure data-type="table">').addClass('wy-table wy-table-bordered-rows').append($table).appendTo($table_box);
      var html = $table_box.html();

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

      var table = this.redactor.$editor.find('#table' + tableId);

      table.find('span#selection-marker-1').remove();
      table.removeAttr('id');

      this.redactor.sync();

    },
    command: function (command, $figure, $target) {

      switch (command) {
        case 'row_up':
        case 'row_down':
          $.proxy(function () {
            var $row = $target.closest('tr'), i, $clone = $('<tr>');
            for (i = 0; i < $row.children().length; i++) {
              $('<td>').text('Data').appendTo($clone);
            }
            if (command === 'row_up') {
              $clone.insertBefore($row);
            } else {
              $clone.insertAfter($row);
            }
          }, this)();
          break;

        case 'col_left':
        case 'col_right':
          $.proxy(function () {
            var $cell = $target.closest('td'),
                $row = $cell.closest('tr'),
                $table = $row.closest('table'),
                position = $row.children().index($cell) + 1,
                insert_position = command === 'col_left' ? 'before' : 'after';

            $table.find('thead tr').children(':nth-child(' + position + ')')[insert_position]($('<th>').text('Header'));
            $table.find('tbody tr').children(':nth-child(' + position + ')')[insert_position]($('<td>').text('Data'));
          }, this)();
          break;

        case 'add_head':
          if (!$figure.find('table thead').length) {
            $.proxy(function () {
              var num_cols = $figure.find('tr').first().children().length,
                  $table = $figure.find('table'),
                  $thead = $('<thead>').prependTo($table),
                  $row = $('<tr>').appendTo($thead);

              for (var i = 0; i < num_cols; i++) {
                $('<th>').text('Header').appendTo($row);
              }
            }, this)();
          }
          break;

        case 'del_head':
          $figure.find('thead').remove();
          break;

        case 'del_col':
          $.proxy(function () {
            var $cell = $target.closest('td'),
                position = $cell.parent().children().index($cell) + 1;
            $cell.closest('table').find('tr').children(':nth-child(' + position + ')').remove();
          }, this)();
          break;

        case 'del_row':
          $target.closest('tr').remove();
          break;

        case 'del_table':
          $figure.remove();
          break;

        case 'border':
          $figure.removeClass('wy-table-bordered-all').toggleClass('wy-table-bordered-rows');
          break;

        case 'stripe':
          $figure.toggleClass('wy-table-striped');
          break;

        case 'full_border':
          $figure.removeClass('wy-table-bordered-rows').toggleClass('wy-table-bordered-all');
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

        // save cursor position
        this.selectionSave();

        var callback = $.proxy(function () {

          $('#redactor_insert_table_btn').on('click', $.proxy(function () {
            this.table.insertTable($('#redactor_table_rows').val(), $('#redactor_table_columns').val());
          }, this));

          setTimeout(function () {
            $('#redactor_table_rows').trigger('focus');
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
