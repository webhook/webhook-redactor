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

  module('jQuery#webhookRedactor', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('<textarea>').appendTo('#qunit-fixture');
    },
    teardown: function () {
      $('#qunit-fixture').empty();
    }
  });

  test('basic jQuery functionality', function() {
    expect(2);

    ok(this.elems.webhookRedactor, 'plugin is defined');
    strictEqual(this.elems.webhookRedactor(), this.elems, 'should be chainable');
  });

  test('works as proxy to $.fn.redactor', function () {
    expect(2);

    this.elems.webhookRedactor({ focus: true });

    deepEqual(this.elems.webhookRedactor('getObject'), this.elems.redactor('getObject'), 'can get Redactor object');
    strictEqual(this.elems.webhookRedactor('getObject').opts.focus, true, 'can set Redactor options');

  });

}(jQuery));
