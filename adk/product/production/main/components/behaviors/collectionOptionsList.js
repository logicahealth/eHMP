define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    return Backbone.Marionette.Behavior.extend({
        initialize: function() {
            this._currentItemIndex = -1;
        },
        onBeforeShow: function() {
            if (this.view instanceof Backbone.Marionette.CollectionView) {
                this.setTabIndex();
            }
            this._currentItemIndex = -1;
        },
        onAddChild: function(childView) {
            childView.$el.attr({'tabIndex': '-1', 'role': 'option'});
            this._currentItemIndex = -1;
        },
        onRemoveChild: function() {
            this._currentItemIndex = -1;
        },
        onReorder: function() {
            this._currentItemIndex = -1;
        },
        events: function() {
            return this.view instanceof Backbone.Marionette.CollectionView ? {
                'keydown': 'onKeydownEvent',
                'focusin': 'selectCurrentItem',
                'focusout': 'setTabIndex'
            } : {};
        },
        setTabIndex: function() {
            this.$el.attr({'tabIndex': '0', 'role': 'listbox'});
        },
        onKeydownEvent: function(event, triggeredFromPopover) {
            if (event.keyCode === $.ui.keyCode.TAB && event.shiftKey) {
                this.$el.attr('tabIndex', '-1');
            } else if (event.keyCode === $.ui.keyCode.TAB && _.isEqual(event.target, this.el)) {
                this.selectCurrentItem(event, true);
            } else if (event.keyCode === $.ui.keyCode.UP) {
                event.preventDefault();
                if (this._currentItemIndex > 0) {
                    this._currentItemIndex--;
                    this.selectItem(this._currentItemIndex);
                }
            } else if (event.keyCode === $.ui.keyCode.DOWN) {
                event.preventDefault();
                if (this._currentItemIndex < (this.view.children.length - 1)) {
                    this._currentItemIndex = this._currentItemIndex + 1;
                    this.selectItem(this._currentItemIndex);
                }
            }
        },
        selectCurrentItem: function(e, skipCheck) {
            if (!skipCheck && !_.isEqual(e.target, this.el)) return;
            if (!this.view.children.isEmpty()) {
                if (this._currentItemIndex < 0)
                    this._currentItemIndex = this._currentItemIndex + 1;
                this.selectItem(this._currentItemIndex);
            }
        },
        selectItem: function(index) {
            if (index > -1) {
                _.first(_.at(_.get(this, 'view.$childViewContainer', this.$el).find('>'), index)).focus();
            }
        }
    });
});
