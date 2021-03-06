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

  module('jQuery#webhookRedactor.image', {
    setup: function() {
      this.elems = $('<textarea>').appendTo('#qunit-fixture');
      this.elems.val('<figure data-type="image"><img src="/gh-pages/static/img/ryancop.png"></figure>');
      this.elems.webhookRedactor();
      this.redactor = this.elems.webhookRedactor('getObject');
      this.$editor = this.redactor.$editor;
      this.$figure = this.$editor.find('figure');
    },
    teardown: function () {
      this.elems.webhookRedactor('destroy');
      this.elems.remove();
    }
  });

  test('plugin', function () {
    ok(this.redactor.image, 'plugin exists');
  });

  test('figcaption', function () {
    ok(this.$editor.find('figcaption').length, 'figcaption automatically added');
  });

  test('controls - default', function () {
    var $controls = this.$figure.trigger('mouseenter').find('.wy-figure-controls');
    ok($controls.length, 'controls on mouseenter');
    ok(!$controls.find('.on').length, 'none of the controls are on');
    strictEqual($controls.find('.wy-figure-controls-small').css('display'), 'none', 'hide small control');
    strictEqual($controls.find('.wy-figure-controls-medium').css('display'), 'none', 'hide medium control');
    strictEqual($controls.find('.wy-figure-controls-resize-full').css('display'), 'none', 'hide resize-full control');
    strictEqual($controls.find('.wy-figure-controls-resize-small').css('display'), 'inline', 'show resize-small control');
  });

  test('commands - left', function () {

    this.redactor.figure.command('left', this.$figure, this.redactor.image);
    ok(this.$figure.hasClass('wy-figure-left'), 'has left class after left command');

    this.$figure.trigger('mouseenter');
    var $controls = this.$figure.find('.wy-figure-controls');
    ok($controls.find('.wy-figure-controls-arrow-left').hasClass('on'), 'left control active after left command');
    ok(!$controls.find('.wy-figure-controls-arrow-right').hasClass('on'), 'right control inactive after left command');
  });

  test('commands - right', function () {

    this.redactor.figure.command('right', this.$figure, this.redactor.image);
    ok(this.$figure.hasClass('wy-figure-right'), 'has right class after right command');

    this.$figure.trigger('mouseenter');
    var $controls = this.$figure.find('.wy-figure-controls');
    ok($controls.find('.wy-figure-controls-arrow-right').hasClass('on'), 'right control active after right command');
    ok(!$controls.find('.wy-figure-controls-arrow-left').hasClass('on'), 'left control inactive after right command');
  });

  test('commands - sizes', function () {
    var $controls;

    this.redactor.figure.command('small', this.$figure, this.redactor.image);
    ok(this.$figure.hasClass('wy-figure-small'), 'has small class after small command');

    this.$figure.trigger('mouseenter');
    $controls = this.$figure.find('.wy-figure-controls');
    ok($controls.find('.wy-figure-controls-small').hasClass('on'), 'small control active after small command');

    this.redactor.figure.command('medium', this.$figure, this.redactor.image);
    ok(this.$figure.hasClass('wy-figure-medium'), 'has medium class after medium command');

    this.$figure.trigger('mouseenter');
    $controls = this.$figure.find('.wy-figure-controls');
    ok($controls.find('.wy-figure-controls-medium').hasClass('on'), 'medium control active after small command');

    this.redactor.figure.command('resize_full', this.$figure, this.redactor.image);
    ok(!this.$figure.hasClass('wy-figure-left'), 'remove left class after full command');
    ok(!this.$figure.hasClass('wy-figure-right'), 'remove right class after full command');
    ok(!this.$figure.hasClass('wy-figure-small'), 'remove small class after full command');
    ok(!this.$figure.hasClass('wy-figure-medium'), 'remove left class after full command');
  });

}(jQuery));
