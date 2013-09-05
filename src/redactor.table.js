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
    }
  };

}(jQuery));
