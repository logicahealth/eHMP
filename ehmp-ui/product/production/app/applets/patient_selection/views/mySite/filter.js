define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    "use strict";

    var SearchModel = Backbone.Model.extend({
        defaults: {
            patientSelectionMySiteSearchText: null,
            persistedSearchText: null,
            persist: true
        },
        validate: function(attributes, options) {
            var patientSelectionMySiteSearchText = this.get('patientSelectionMySiteSearchText');
            if (!_.isString(patientSelectionMySiteSearchText) || patientSelectionMySiteSearchText.length < 3) {
                this.errorModel.set('patientSelectionMySiteSearchText', 'Search string must contain at least 3 characters');
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        }
    });

    var MySiteAllSearchForm = ADK.UI.Form.extend({
        _trayKeys: [],
        fields: [{
            control: 'fieldset',
            legend: 'My Site, Search group',
            srOnlyLegend: true,
            extraClasses: ['flex-display', 'flex-direction-row', 'search-bar'],
            items: [{
                control: 'searchbar',
                name: 'patientSelectionMySiteSearchText',
                placeholder: 'Search My Site',
                label: 'Search Patients',
                srOnlyLabel: true,
                buttonOptions: {
                    type: 'submit',
                    title: 'View results',
                    extraClasses: ['btn-default', 'background-color-grey-lightest'],
                    attributes: 'aria-label="My Site Search" aria-expanded="false" data-toggle="sidebar-tray"'
                },
                minimumInputLength: 0,
                extraClasses: ['flex-width-1'],
                instructions: 'Enter either first letter of last name and last four of social security number, or generic name. (Ex: S1234 or Smith, John...)'
            }]
        }],
        ui: {
            trayToggle: '[data-toggle="sidebar-tray"]'
        },
        events: {
            'submit': 'onSearch',
            'click @ui.trayToggle': 'onSearch',
            'form:view:updated:bound:ui:elements': function(e) {
                e.stopImmediatePropagation();
                this.$el.trigger(this.getOption('_eventPrefix') + ':view:update:bound:ui:elements');
                var isTrayOpen = ADK.Messaging.request('tray:patientSelection:mySite:trayView').isOpen();
                this.ui.trayToggle.attr('aria-expanded', isTrayOpen);
            },
            'focusout': function(e) {
                if (_.isNull(e.relatedTarget) || !_.isEmpty(this.$(e.relatedTarget))) return; // Not losing focus
                if (_.isEqual(this.ui.trayToggle.attr('aria-expanded'), "true")) {
                    this.setSearchBarToCurrentSearch();
                    this.ui.trayToggle.prop('disabled', true);
                } else {
                    this.clearSearchBar();
                }
            }
        },
        onSearch: function(event, options) {
            if (_.get(options, 'tray.toggle', false)) return;
            event.preventDefault();
            event.stopPropagation();
            if (this.model.isValid()) {
                var searchString = this.model.get('patientSelectionMySiteSearchText').trim();
                this.model.set('currentSearch', searchString);
                ADK.Messaging.getChannel(this.getOption('eventChannelName') + '-mySite').trigger('execute-search', searchString);
            } else {
                this.transferFocusToFirstError();
            }
        },
        onInitialize: function() {
            this.listenTo(ADK.Messaging.getChannel(this.getOption('eventChannelName') + '-mySite'), this.getOption('_eventPrefix') + '.hide', this.clearSearchBar);
        },
        setSearchBarToCurrentSearch: function() {
            this.model.set('patientSelectionMySiteSearchText', this.model.get('currentSearch'));
        },
        clearSearchBar: function() {
            this.model.set('patientSelectionMySiteSearchText', null);
        },
        className: 'adk-form form-container bottom-border-grey'
    });

    var MySiteAllSearchView = Backbone.Marionette.ItemView.extend({
        eventChannelName: 'patient-selection',
        _eventPrefix: 'patientSearchTray',
        template: false,
        className: 'patient-selection--my-site-search--input top-padding-sm bottom-padding-lg',
        initialize: function() {
            this._regionManager = new Backbone.Marionette.RegionManager();
            var SearchRegion = Backbone.Marionette.Region.extend({
                el: this.$el
            });
            this._regionManager.addRegions({
                'searchRegion': SearchRegion
            });
        },
        onBeforeShow: function() {
            var fields = _.set(MySiteAllSearchForm.prototype.fields, '[0].items[0].buttonOptions.id', this.model.get('tray_id'));
            var collectionLength = this.getOption('collectionLength');
            var index = this.getOption('index');
            if(collectionLength && index){
                fields = _.set(fields, '[0].legend', 'My Site, ' + index + ' of ' + collectionLength + ', Search group');
            }
            this._regionManager.get('searchRegion').show(new MySiteAllSearchForm({
                model: new SearchModel(),
                eventChannelName: this.getOption('eventChannelName'),
                _eventPrefix: this.getOption('_eventPrefix'),
                fields: fields
            }));
        },
        onBeforeDestroy: function() {
            this._regionManager.destroy();
        }
    });

    return MySiteAllSearchView;
});
