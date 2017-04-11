define([
    'backbone',
    'handlebars'
], function(Backbone, Handlebars) {
    "use strict";

    var SingleFacilityListItemView = Backbone.Marionette.ItemView.extend({
        tagName: "option",
        className: "list-group-item row-layout simple",
        template: Handlebars.compile('{{name}}'),
        onShow: function() {
            this.$el.val(this.model.get('siteCode'));
        }
    });
    var FacilityListView = Backbone.Marionette.CompositeView.extend({
        template: Handlebars.compile('<option class="{{cssClass}}" selected="selected" value="">{{message}}</option>'),
        childView: SingleFacilityListItemView,
        tagName: "select",
        className: "form-control",
        modelEvents: {
            'change': 'render',
            'change:disabled': 'updateDisabled'
        },
        collectionEvents: {
            'read:success': function(coll, resp) {
                this.model.set({
                    'message': 'Select a facility',
                    'disabled': false
                });
                this.parentView.$el.find('#facility').val(this.parentView.options.routeParam);
            },
            'read:error': function(coll, resp) {
                console.error('Error loading facility list', resp);
                this.model.set({
                    'message': 'Server error while trying to load list of facilities.',
                    'disabled': true,
                    'cssClass': 'bg-danger'
                });
                this.parentView.$el.find('#errorMessage').html('Unable to login due to server error. Status code: ' + resp.status);
            }
        },
        attributes: {
            name: "facility",
            id: "facility",
            title: "Use the up and down arrows keys to select a facility",
            required: true,
            disabled: true
        },
        initialize: function(options) {
            this.parentView = options.parentView;
            this.collection = new Backbone.Collection();
            this.model = new Backbone.Model({
                'message': 'Loading facilities...',
                'disabled': true,
                'cssClass': ''
            });
        },
        onShow: function() {
            var self = this;
            var searchOptions = {
                resourceTitle: 'authentication-list',
                cache: true,
                onError: function(coll, resp) {
                    coll.trigger('read:error', coll, resp);
                },
                onSuccess: function(coll, resp) {
                    coll.trigger('read:success', coll, resp);
                }
            };
            ADK.ResourceService.fetchCollection(searchOptions, this.collection);
        },
        updateDisabled: function() {
            this.$el.attr('disabled', this.model.get('disabled'));
        },
    });

    return FacilityListView;
});