define([
    'backbone',
    'backgrid',
    'api/UserDefinedScreens',
    'marionette',
    'main/components/appletToolbar/appletToolbarView',
    'api/Messaging',
    'main/adk_utils/crsUtil'
], function(Backbone, Backgrid, UserDefinedScreens, Marionette, AppletToolbar, Messaging, CrsUtil) {
    'use strict';

    var ModelRow = Backgrid.Row.extend({
        attributes: function() {

            var returnAttr = {};
            var id = this.model.get('id') || this.model.get('uid');
            CrsUtil.applyConceptCodeId(this.model);

            if (id) returnAttr['data-row-instanceid'] = id.replace(/:|;|\./g, '-');

            if (!this.simpleGrid) {
                returnAttr.tabindex = '0';
                returnAttr.class = 'selectable';
                returnAttr["data-code"] = this.model.get('dataCode');
            }

            return returnAttr;
        },
        /* this is configured in datagrid.js
        behaviors: {
            FloatingToolbar: {
                buttonTypes: ['infobutton', 'detailsviewbutton'],
                DialogContainer: '.toolbarContainer'
            }
        },*/
        constructor: function(options) {
            if (!options.model.get('excludeToolbar')) {
                this._behaviors = Backbone.Marionette.Behaviors(this);
            }

            Backgrid.Row.prototype.constructor.apply(this, arguments);
        },
        normalizeUIKeys: function() {
            Backbone.Marionette.ItemView.prototype.normalizeUIKeys.apply(this, arguments);
        },
        configureTriggers: function() {
            Backbone.Marionette.ItemView.prototype.configureTriggers.call(this);
        },
        delegateEvents: function(eventsArg) {
            var events = Marionette._getValue(eventsArg || this.events, this);

            events = this.normalizeUIKeys(events);
            if (_.isUndefined(eventsArg)) {
                this.events = events;
            }

            var combinedEvents = {};

            var behaviorEvents = _.result(this, 'behaviorEvents') || {};
            var triggers = this.configureTriggers();
            var behaviorTriggers = _.result(this, 'behaviorTriggers') || {};

            _.extend(combinedEvents, behaviorEvents, events, triggers, behaviorTriggers);


            Backgrid.Row.prototype.delegateEvents.call(this, combinedEvents);

            _.each(this._behaviors, function(behavior) {
                behavior.bindEntityEvents(this.model, behavior.getOption('modelEvents'));
                behavior.bindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
            }, this);
            _.invoke(this._behaviors, this._bindUIElements);

            return this;
        },
        _bindUIElements: function() {
            Backbone.Marionette.ItemView.prototype._bindUIElements.apply(this, arguments);
        },
        getOption: function() {
            Backbone.Marionette.ItemView.prototype.getOption.apply(this, arguments);
        },
        undelegateEvents: function() {
            _.each(this._behaviors, function(behavior) {
                behavior.unbindEntityEvents(this.model, behavior.getOption('modelEvents'));
                behavior.unbindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
            }, this);
            return Backgrid.Row.prototype.undelegateEvents.call(this);
        },
        remove: function() {
            Backgrid.Row.prototype.remove.call(this);
            _.invoke(this._behaviors, 'destroy', _.toArray(arguments));
            this.triggerMethod('destroy', this);
        },
        destroy: function() {
            Backbone.Marionette.ItemView.prototype.destroy.apply(this, arguments);
        },
        render: function() {
            this.triggerMethod('before:render', this);
            var ret = Backgrid.Row.prototype.render.call(this);
            if (this.toolbarOptions && !this.model.get('excludeToolbar')) {
                //mimic how a region works
                var fragment = document.createDocumentFragment();
                var toolbarContainer = document.createElement('div');
                var $first = this.cells[0].$el;
                toolbarContainer.className = 'toolbar-container';
                fragment.appendChild(toolbarContainer);
                $first.addClass('toolbar-cell');
                $first.prepend(fragment);
            }

            //configuration needed for the expand rows.
            this.$el.data('model', this.model);

            this.triggerMethod('render', this);
            var dataInfoButton = this.$el.find('td:nth-child(2)').text();
            var activeId =  _.get(this.el, "ownerDocument.activeElement.id");
            if (_.isUndefined(this.behaviorTriggers) && dataInfoButton.indexOf('Panel') !== 1 && activeId !== "mainModalDialog" && activeId !== "mainModal") {
                this.$el.find('td:first-child').prepend("<span class='sr-only toolbar-instructions'>Press enter to view additional details.</span>");
            }
            return ret;
        },
        setElement: function() {
            return Backbone.Marionette.ItemView.prototype.setElement.apply(this, arguments);
        },
        triggerMethod: function() {
            return Backbone.Marionette.ItemView.prototype.triggerMethod.apply(this, arguments);
        },
        _triggerEventOnBehaviors: function() {
            Backbone.Marionette.ItemView.prototype._triggerEventOnBehaviors.apply(this, arguments);
        },
        _triggerEventOnParentLayout: function() {
            Backbone.Marionette.ItemView.prototype._triggerEventOnParentLayout.apply(this, arguments);
        },
        _parentLayoutView: function() {
            var parent = this._parent;

            while (parent) {
                if (parent instanceof Backbone.Marionette.LayoutView) {
                    return parent;
                }
                parent = parent._parent;
            }
        }
    });

    return ModelRow;
});