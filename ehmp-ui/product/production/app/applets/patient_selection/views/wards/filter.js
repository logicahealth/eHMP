define([
    'backbone',
    'marionette'
], function(
    Backbone,
    Marionette
) {
    'use strict';

    var SearchModel = Backbone.Model.extend({
        defaults: {
            wardLocation: null,
            locationList: []
        },
        initialize: function(attributes, options) {
            var locations = new ADK.UIResources.Fetch.PatientSelection.Wards();
            this.set({
                'wardLocation': null,
                'locationList': locations
            });
            this.listenToOnce(ADK.Messaging.getChannel(_.get(options, 'eventChannelName', 'patient-selection-wards')), _.get(options, '_eventPrefix', 'patientSearchTray') + '.show', this.executeSearch);
        },
        validate: function(attributes, options) {
            var wardLocation = attributes.wardLocation;
            if (_.isEmpty(wardLocation)) {
                this.errorModel.set('wardLocation', 'Please select an item in the list.');
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        executeSearch: function() {
            this.get('locationList').fetch({
                params: {
                    site: ADK.UserService.getUserSession().get('site')
                }
            });
        }
    });

    var WardSearchForm = ADK.UI.Form.extend({
        fields: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'select',
                name: 'wardLocation',
                label: 'Ward Location',
                pickList: 'locationList',
                extraClasses: ['col-xs-3', 'all-margin-no', 'pixel-height-77'],
                showFilter: true,
                required: true,
                disabled: true,
                options: {
                    minimumInputLength: 0
                },
                attributeMapping: {
                    value: 'uid',
                    label: 'displayName'
                }
            }]
        }],
        events: {
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid()) {
                    this.onSearch();
                } else {
                    this.transferFocusToFirstError();
                }
            }
        },
        modelEvents: {
            'change:wardLocation': function() {
                this.$el.submit();
            }
        },
        onInitialize: function() {
            this.listenToOnce(this.model.get('locationList'), 'sync', this.enableSelect);
        },
        enableSelect: function() {
            this.$('.wardLocation').trigger('control:disabled', false);
        },
        onSearch: function() {
            ADK.Messaging.getChannel(this.getOption('eventChannelName')).trigger('execute-search', this.model);
        }
    });

    var WardFilterView = Backbone.Marionette.ItemView.extend({
        template: false,
        initialize: function(options) {
            this._regionManager = new Backbone.Marionette.RegionManager();
            var SearchRegion = Backbone.Marionette.Region.extend({
                el: this.$el
            });
            this._regionManager.addRegions({
                'searchRegion': SearchRegion
            });
        },
        onBeforeShow: function() {
            this._regionManager.get('searchRegion').show(new WardSearchForm(_.extend({}, this.options, {
                model: new SearchModel({}, this.options)
            })));
        },
        onBeforeDestroy: function() {
            this._regionManager.destroy();
        }
    });

    return WardFilterView;
});
