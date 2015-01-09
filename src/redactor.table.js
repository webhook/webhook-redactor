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
  var Table = function (redactor) {
    this.redactor = redactor;
  };
  Table.prototype = {
    control: {
      rowUp     : { text: 'Add row above' },
      rowDown   : { text: 'Add row below' },
      colLeft   : { text: 'Add column left' },
      colRight  : { text: 'Add column right' },
      addHead   : { text: 'Add header' },
      delHead   : { text: 'Delete header' },
      delCol    : { text: 'Delete column' },
      delRow    : { text: 'Delete row' },
      delTable  : { text: 'Delete table' },
      stripe    : { text: 'Striped row' },
      border    : { text: 'Borders on rows' },
      fullBorder: { text: 'Borders everywhere' }
    },
    controlGroup: [ 'up', 'down', '|', {
      'Table Options': [
        'rowUp', 'rowDown', 'colLeft', 'colRight', '|',
        'addHead', 'delHead', '|',
        'delCol', 'delRow', 'delTable', '|',
        'border', 'stripe', 'fullBorder'
      ]
    }, 'remove'],
    insertTable: function (rows, columns) {

      this.redactor.buffer.set(false);

      var $tableBox = $('<div></div>'),
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

      $('<figure data-type="table">').addClass('wy-table wy-table-bordered-rows').append($table).appendTo($tableBox);
      var html = $tableBox.html();

      this.redactor.modal.close();
      this.redactor.selection.restore();

      var current = this.redactor.selection.getBlock() || this.redactor.selection.getCurrent();
      if (current) {
        $(current).after(html);
      } else {
        this.redactor.insert.html(html, false);
      }

      this.redactor.selection.restore();

      var table = this.redactor.$editor.find('#table' + tableId);

      table.find('span#selection-marker-1').remove();
      table.removeAttr('id');

      this.redactor.code.sync();

    },
    command: function (command, $figure, $target) {

      switch (command) {
      case 'rowUp':
      case 'rowDown':
        $.proxy(function () {
          var $row = $target.closest('tr'), i, $clone = $('<tr>');
          for (i = 0; i < $row.children().length; i++) {
            $('<td>').text('Data').appendTo($clone);
          }
          if (command === 'rowUp') {
            $clone.insertBefore($row);
          } else {
            $clone.insertAfter($row);
          }
        }, this)();
        break;

      case 'colLeft':
      case 'colRight':
        $.proxy(function () {
          var $cell = $target.closest('td'),
              $row = $cell.closest('tr'),
              $table = $row.closest('table'),
              position = $row.children().index($cell) + 1,
              insertPosition = command === 'colLeft' ? 'before' : 'after';

          $table.find('thead tr').children(':nth-child(' + position + ')')[insertPosition]($('<th>').text('Header'));
          $table.find('tbody tr').children(':nth-child(' + position + ')')[insertPosition]($('<td>').text('Data'));
        }, this)();
        break;

      case 'addHead':
        if (!$figure.find('table thead').length) {
          $.proxy(function () {
            var numCols = $figure.find('tr').first().children().length,
                $table = $figure.find('table'),
                $thead = $('<thead>').prependTo($table),
                $row = $('<tr>').appendTo($thead);

            for (var i = 0; i < numCols; i++) {
              $('<th>').text('Header').appendTo($row);
            }
          }, this)();
        }
        break;

      case 'delHead':
        $figure.find('thead').remove();
        break;

      case 'delCol':
        $.proxy(function () {
          var $cell = $target.closest('td'),
              position = $cell.parent().children().index($cell) + 1;
          $cell.closest('table').find('tr').children(':nth-child(' + position + ')').remove();
        }, this)();
        break;

      case 'delRow':
        $target.closest('tr').remove();
        break;

      case 'delTable':
        $figure.remove();
        break;

      case 'border':
        $figure.removeClass('wy-table-bordered-all').toggleClass('wy-table-bordered-rows');
        break;

      case 'stripe':
        $figure.toggleClass('wy-table-striped');
        break;

      case 'fullBorder':
        $figure.removeClass('wy-table-bordered-rows').toggleClass('wy-table-bordered-all');
        break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins = window.RedactorPlugins || {};
  window.RedactorPlugins.table = function() {
      return {
        init: function () {
        this.table = new Table(this);
        var button = this.button.addBefore('link', 'table', 'Table');

        this.button.addCallback(button, $.proxy(function () {

          // save cursor position
          this.selection.save();

          var callback = $.proxy(function () {

            $('.redactor_insert_table_close_btn').on('click', $.proxy(function () {
              this.button.setInactive('table');
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
            '</section>';

          // or call a modal with a code
          this.modal.addTemplate('insert-table', modal);
          this.modal.addCallback('insert-table', callback);

          this.modal.load('insert-table', 'Insert Table', 500);

          this.modal.createCancelButton();
          var button = this.modal.createActionButton('Insert');
          button.on('click', $.proxy(function () {
              this.table.insertTable($('#redactor_table_rows').val(), $('#redactor_table_columns').val());
              this.button.setInactive('table');
          }, this));

          this.modal.show();

        }, this));
        this.button.get('table').addClass('redactor_btn_table');
      }
    }
  };

}(jQuery));
