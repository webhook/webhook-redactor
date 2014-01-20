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

  module('jQuery#webhookRedactor.figure', {
    // This will run before each test in this module.
    setup: function() {
      this.form = $('<form>').appendTo('#qunit-fixture');
      this.elems = $('<textarea>').appendTo(this.form);
      this.elems.val('<figure><p>I am a figure</p><figcaption></figcaption></figure>');
      this.elems.webhookRedactor();
    },
    teardown: function () {
      this.elems.webhookRedactor('destroy');
      $('#qunit-fixture').empty();
    }
  });

  test('plugin', function () {
    ok(this.elems.webhookRedactor('getObject').figure, 'plugin exists');
  });

  test('show and hide', function () {
    var $figure = this.elems.webhookRedactor('getObject').$editor.find('figure');

    ok($figure.length, 'figure present');
    ok($figure.trigger('mouseenter').find('.wy-figure-controls').length, 'controls on mouseenter');
    ok(!$figure.trigger('mouseleave').find('.wy-figure-controls').length, 'no controls on mouseleave');

  });

  test('basic commands', function () {
    var redactor = this.elems.webhookRedactor('getObject'),
        figure = redactor.figure,
        $editor = redactor.$editor.append('<p>bottom</p>'),
        $figure = $editor.find('figure');

    figure.command('up', $figure);
    ok($figure.is(':first-child'), 'can move up');

    figure.command('down', $figure);
    ok($figure.is(':last-child'), 'can move down');

    figure.command('remove', $figure);
    ok(!$editor.find('figure').length, 'can remove');
  });

  test('figcaption', function () {
    var $editor = this.elems.webhookRedactor('getObject').$editor,
        $figcaption = $editor.find('figcaption');

    $figcaption.click();
    strictEqual($figcaption.html(), '<br>', 'add br with click in');

    $editor.click();
    strictEqual($figcaption.html(), '', 'remove br with click out');

    $figcaption.click();
    strictEqual($figcaption.html(), '<br>', 'add br with click in');

    $editor.blur();
    strictEqual($figcaption.html(), '', 'remove br on blur');

    $editor.closest('form').one('submit', function (event) {
      event.preventDefault();
    }).trigger('submit');

    ok(!$editor.find('figcaption').length, 'empty figcaption removed on submit');

  });

}(jQuery));
