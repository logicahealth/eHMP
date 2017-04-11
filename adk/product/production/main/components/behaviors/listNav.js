define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var Popover = Backbone.Marionette.Behavior.extend({
        events: {
            'keydown @ui.$menu': 'keyHandler'
        },
        ui: {
            '$menu': 'ul'
        },
        keyHandler: function(e) {
            if(e.defaultPrevented) return;

            if (!/(38|40)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

            e.preventDefault();
            e.stopPropagation();

            if (this.$el.is('.disabled, :disabled')) return;

            var desc = ' li:not(.disabled):visible a';
            var $items = this.$('[role="menu"]' + desc + ', [role="listbox"]' + desc);

            if (!$items.length) return;

            var index = $items.index(e.target);

            if (e.which == 38 && index > 0) index--; // up
            if (e.which == 40 && index < $items.length - 1) index++; // down
            if (!~index) index = 0;

            $items.eq(index).trigger('focus');
        },
        initializeList: function() {
            //508 -- Bootstrap sets events on document that look for certain patterns.  If these patterns exist keyboard arrow nav is applied
            var menu = this.ui.$menu;
            if (!menu.is('ul')) {
                return;
            }
            menu.attr('role', 'menu');
            menu.attr('tabindex', '-1'); //required to hard set focus on this element
            menu.children().attr('role', 'presentation');
            menu.find('[role=presentation]').children()
                .attr('role', 'menuitem')
                .attr('tabindex', '-1').on('keydown', function(e) {
                    var k = e.which || e.keycode;
                    if (!/(13|32)/.test(k)) return;
                    $(this).trigger('click');
                    e.preventDefault();
                });
        },
        onShow: function() {
            this.initializeList();
        }
    });

    return Popover;
});