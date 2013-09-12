(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#webhookRedactor.table', {
    setup: function() {
      this.elems = $('<textarea>').appendTo('#qunit-fixture');
      this.elems.webhookRedactor();
      this.redactor = this.elems.webhookRedactor('getObject');
      this.$editor = this.redactor.$editor;
      this.table = this.redactor.table;
    },
    teardown: function () {
      this.elems.webhookRedactor('destroy');
      this.elems.remove();
    }
  });

  test('plugin', function () {
    ok(this.redactor.table, 'plugin exists');
  });

  test('add table', function () {
    this.table.insertTable(2, 2);
    strictEqual(this.$editor.find('table').length, 1, 'created a table');
    strictEqual(this.$editor.find('table thead').length, 1, 'with 1 thead');
    strictEqual(this.$editor.find('table thead tr').length, 1, 'with 1 thead row');
    strictEqual(this.$editor.find('table thead tr th').length, 2, 'with 2 thead cols');
    strictEqual(this.$editor.find('table tbody tr').length, 2, 'with 2 tbody rows');
    strictEqual(this.$editor.find('table tbody tr td').length, 4, 'with 2 tbody cols (4 cells)');
  });

  test('table commands', function () {
    this.table.insertTable(2, 2);
    var $figure = this.$editor.find('figure'),
        $table = $figure.find('table'),
        $target = $figure.find('td:first').attr('id', 'target');

    this.table.command('row_up', $figure, $target);
    strictEqual(this.$editor.find('td').length, 6, 'row added (6 cells)');
    strictEqual($target.parent().index(), 1, 'row added above');

    this.table.command('row_down', $figure, $target);
    strictEqual(this.$editor.find('td').length, 8, 'row added (8 cells)');
    strictEqual($target.parent().index(), 1, 'row added below');

    this.table.command('col_left', $figure, $target);
    strictEqual(this.$editor.find('tr:first').children().length, 3, 'column added (3 cols)');
    strictEqual($target.index(), 1, 'column added left');

    this.table.command('col_right', $figure, $target);
    strictEqual(this.$editor.find('tr:first').children().length, 4, 'column added (4 cols)');
    strictEqual($target.index(), 1, 'column added right');

    this.table.command('add_head', $figure);
    strictEqual(this.$editor.find('thead').length, 1, 'only one thead at a time');

    this.table.command('del_head', $figure);
    strictEqual(this.$editor.find('thead').length, 0, 'can delete thead');

    this.table.command('add_head', $figure);
    strictEqual(this.$editor.find('thead').length, 1, 'can add thead');

    this.table.command('del_col', $figure, $target);
    strictEqual(this.$editor.find('tr:first').children().length, 3, 'column removed (3 cols)');
    strictEqual($figure.find('#target').length, 0, 'target column removed');

    $target = $figure.find('td:first').attr('id', 'target');
    this.table.command('del_row', $figure, $target);
    strictEqual(this.$editor.find('td').length, 9, 'row removed (9 cells)');
    strictEqual($figure.find('#target').length, 0, 'target row removed');

    // border is on by default
    this.table.command('border', $figure);
    ok(!$table.hasClass('wh-table-bordered-rows'), 'remove border class');
    this.table.command('border', $figure);
    ok($table.hasClass('wh-table-bordered-rows'), 'add border class');

    this.table.command('stripe', $figure);
    ok($table.hasClass('wh-table-striped'), 'add stripe class');
    this.table.command('stripe', $figure);
    ok(!$table.hasClass('wh-table-striped'), 'remove stripe class');

    this.table.command('full_border', $figure);
    ok($table.hasClass('wh-table-bordered-all'), 'add full border class');
    this.table.command('full_border', $figure);
    ok(!$table.hasClass('wh-table-bordered-all'), 'remove full border class');

    this.table.command('del_table', $figure);
    strictEqual(this.$editor.find('figure').length, 0, 'remove table');

  });

}(jQuery));
