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

  module('jQuery#webhookRedactor.quote', {
    setup: function() {
      this.elems = $('<textarea><p>Hey man I am a quote</p></textarea>').appendTo('#qunit-fixture');
      this.elems.webhookRedactor();
      this.redactor = this.elems.webhookRedactor('getObject');
      this.$editor = this.redactor.$editor;
    },
    teardown: function () {
      this.elems.webhookRedactor('destroy');
      this.elems.remove();
    }
  });

  test('plugin', function () {
    ok(this.redactor.quote, 'plugin exists');
  });

  test('quote command', function () {
    // apparently i have to use setCaret method and it can't be position 0 or PhantomJS blows up
    this.redactor.setCaret(this.$editor.find('p'), 3);
    this.redactor.quote.toggle();
    strictEqual(this.$editor.find('figure[data-type=quote]').length, 1, 'figure created');
    strictEqual(this.$editor.find('figure[data-type=quote] blockquote').length, 1, 'blockquote created');
    strictEqual(this.$editor.find('figure[data-type=quote] cite').length, 1, 'cite created');

    this.redactor.setCaret(this.$editor.find('blockquote'), 3);
    this.redactor.quote.toggle();
    strictEqual(this.$editor.find('figure[data-type=quote]').length, 0, 'figure removed');
    strictEqual(this.$editor.find('figure[data-type=quote] blockquote').length, 0, 'blockquote removed');
    strictEqual(this.$editor.find('figure[data-type=quote] cite').length, 0, 'cite removed');
  });

}(jQuery));
