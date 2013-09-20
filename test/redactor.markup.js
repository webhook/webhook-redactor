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
      this.elems = $('<textarea>').appendTo('#qunit-fixture');
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
    ok(this.redactor.markup, 'plugin exists');
  });

}(jQuery));
