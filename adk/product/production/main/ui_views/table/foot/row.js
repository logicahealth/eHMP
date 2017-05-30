define([
    'backbone',
    'marionette',
    'handlebars'
], function(Backbone, Marionette, Handlebars) {
    'use strict';

    // collection is columns
    var TableFoot = Backbone.Marionette.ItemView.extend({
        label: null,
        tagName: 'tr',
        className: 'sr-only',
        attributes: {
            'aria-live': 'assertive'
        },
        template: Handlebars.compile(
            '<td colspan="{{getColspan}}">{{message}}</td>'
        ),
        templateHelpers: function() {
            return {
                getColspan: this.getOption('colspan')
            };
        },
        modelEvents: {
            'change:message': 'render'
        },
        initialize: function(options) {
            this.model = new Backbone.Model({
                label: this.getOption('label')
            });
            this.bindEntityEvents(this.getOption('emptyModel'), this._emptyModelEvents);
            this._previousState = this.getOption('emptyModel').get('state') || '';
        },
        onBeforeDestroy: function(options) {
            this.unbindEntityEvents(this.getOption('emptyModel'), this._emptyModelEvents);
        },
        _previousState: null,
        _emptyModelEvents: {
            'change:state': '_notifyOfCompletedState'
        },
        _notifyOfCompletedState: function(model, newValue) {
            if (_.isEqual(newValue, 'complete')) {
                this.model.set('message', (this.model.has('label') ? (this.model.get('label') + ' finished ') : 'Finished ') + this._previousState + '.');
                this._previousState = '';
            } else {
                this._previousState = newValue;
                this.model.unset('message');
            }
        }
    });
    return TableFoot;
});