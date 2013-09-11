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

  test('toolbar', function () {

    this.elems.val('<figure data-type="image"><img src="/gh-pages/static/img/ryancop.png"></figure>');

    this.elems.webhookRedactor();
    var $figure = this.elems.webhookRedactor('getObject').$editor.find('figure');

    ok($figure.length, 'figure present');
    ok($figure.trigger('mouseenter').find('.wh-figure-controls').length, 'controls on mouseenter');
    ok(!$figure.trigger('mouseleave').find('.wh-figure-controls').length, 'no controls on mouseleave');

  });

}(jQuery));
