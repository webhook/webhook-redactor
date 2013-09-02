/*
 * webhook-redactor
 *
 *
 * Copyright (c) 2013 Mike Horn
 * Licensed under the MIT license.
 */


/*
      <div class="wh-figure-controls">
        <span class="wh-figure-controls-arrow-up"></span>
        <span class="wh-figure-controls-arrow-down"></span>
        <span class="wh-figure-controls-divider"></span>
        <span class="wh-figure-controls-table wh-dropdown">
          Table options<span class="caret"></span>
          <dl class="wh-dropdown-menu wh-dropdown-bubble wh-dropdown-arrow wh-dropdown-arrow-left">
            <dd><a href="">Add row above</a></dd>
            <dd><a href="">Add row below</a></dd>
            <dd><a href="">Add column left</a></dd>
            <dd><a href="">Add column right</a></dd>
            <dd class="divider"></dd>
            <dd><a href="">Add head</a></dd>
            <dd><a href="">Delete head</a></dd>
            <dd class="divider"></dd>
            <dd><a href="">Delete column</a></dd>
            <dd><a href="">Delete row</a></dd>
            <dd><a href="">Delete table</a></dd>
            <dd class="divider"></dd>
            <dd><a href="">Bordered</a></dd>
            <dd><a href="">Striped</a></dd>
            <dd><a href="">Full border</a></dd>
          </dl>
        </span>
        <span class="wh-figure-controls-delete"></span>
      </div>
*/

(function ($) {
  "use strict";

  window.RedactorPlugins = window.RedactorPlugins || {};

  // namespacing
  var Traverse = function (redactor) {
    this.redactor = redactor;
    this.$toolbars = {};
    this.init();
  };
  Traverse.prototype = {
    control: {
        left  : { classSuffix: 'arrow-left' },
        up    : { classSuffix: 'arrow-up' },
        down  : { classSuffix: 'arrow-down' },
        right : { classSuffix: 'arrow-right' },
        '|'   : { classSuffix: 'divider' },
        small : { classSuffix: 'small', text: 'S' },
        medium: { classSuffix: 'medium', text: 'M' },
        large : { classSuffix: 'large', text: 'L' },
        remove: { classSuffix: 'delete' },
        resize: { classSuffix: 'resize-full' }
    },
    init: function () {

      this.controlgroup = {
        image: ['left', 'up', 'down', 'right', '|', 'small', 'medium', 'large', 'remove'],
        table: ['up', 'down', 'remove'],
        video: ['up', 'down', '|', 'resize', 'remove']
      };

      this.observe();
    },
    observe: function () {
      this.redactor.$editor.on('mouseenter', 'figure', $.proxy(this.mouseenter, this));
    },
    mouseenter: function (event) {
      var $figure = $(event.currentTarget);

      $.each(['image', 'table', 'video'], $.proxy(function (index, type) {
        if ($figure.hasClass('wh-figure-' + type)) {
          this.getToolbar(type).data('figure', $figure).prependTo($figure);
        }
      }, this));
    },
    getToolbar: function (type) {

      if (this.$toolbars[type]) {
        return this.$toolbars[type];
      }

      var toolbar = $('<div class="wh-figure-controls">');

      $.each(this.controlgroup[type], $.proxy(function (index, command) {
        var control = this.control[command];
        $('<span>', {
          'class': 'wh-figure-controls-' + control.classSuffix,
          'text': control.text
        }).data({
          command: command,
          control: control
        }).appendTo(toolbar);
      }, this));

      toolbar.on('click', 'span', $.proxy(function (event) {
        this.command($(event.currentTarget), toolbar.data('figure'));
      }, this));

      return this.$toolbars[type] = toolbar.appendTo(this.redactor.$editor);

    },
    command: function ($control, $figure) {

      var command = $control.data('command');

      var classString = function (suffixArray, separator, prefix, dot) {
        var base_class = (dot ? '.' : '') + 'wh-figure-' + (prefix || '');
        return base_class + suffixArray.join((separator || ' ') + base_class);
      };

      var changeSuffix = function (removeArray, addString) {
        $figure.removeClass(classString(removeArray)).addClass('wh-figure-' + addString);
      };

      switch (command) {
        case 'up':
          $figure.insertBefore($figure.prev());
          break;
        case 'down':
          $figure.insertAfter($figure.next());
          break;

        case 'left':
        case 'right':
          changeSuffix(['left', 'right'], command);
          if (!$figure.hasClass('wh-figure-medium') && !$figure.hasClass('wh-figure-small')) {
            $figure.addClass('wh-figure-medium');
          }
          break;

        case 'small':
        case 'medium':
        case 'large':
          changeSuffix(['small', 'medium', 'large'], command);
          if (command === 'large') {
            $figure.removeClass(classString(['left', 'right']));
          }
          $control.addClass('on').siblings(classString(['small', 'medium', 'large'], ', ', 'controls-', true)).removeClass('on');
          break;
      }
    }
  };

  // Hook up plugin to Redactor.
  window.RedactorPlugins.traverse = {
    init: function () {
      this.traverse = new Traverse(this);
    }
  };

}(jQuery));
