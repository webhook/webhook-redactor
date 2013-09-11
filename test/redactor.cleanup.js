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

  module('jQuery#webhookRedactor.cleanup', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('<textarea>').appendTo('#qunit-fixture');
    },
    teardown: function () {
      $('#qunit-fixture').empty();
    }
  });

  test('cleanup', function () {

    var empty_paragraphs = '<p> </p><p><br></p><p>&nbsp;</p>';

    this.elems.val(empty_paragraphs);

    strictEqual(this.elems.val(), empty_paragraphs, 'dirty appended OK');

    this.elems.webhookRedactor();

    strictEqual(this.elems.val(), '', 'cleans on init');

    var $editor = this.elems.webhookRedactor('getObject').$editor;

    $editor.html(empty_paragraphs);

    strictEqual($editor.html(), empty_paragraphs, 'dirty appended OK');

    this.elems.webhookRedactor('sync');

    strictEqual(this.elems.val(), '', 'cleans on sync');

    $editor.html(empty_paragraphs);

    strictEqual($editor.html(), empty_paragraphs, 'dirty appended OK');

    $editor.closest('form').on('submit', function (event) {
      event.preventDefault();
    }).trigger('submit');

    strictEqual(this.elems.val(), '', 'cleans on submit');
  });

}(jQuery));
