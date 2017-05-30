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
            control: 'container',
            extraClasses: ['flex-display', 'flex-direction-row', 'search-bar'],
            items: [{
                control: 'searchbar',
                name: 'patientSelectionMySiteSearchText',
                placeholder: 'My Site Patient Search (Ex: S1234 or Smith, John...)',
                label: 'Patient Selection - My Site Patient Search',
                srOnlyLabel: true,
                buttonOptions: {
                    type: 'submit',
                    title: 'Press enter to view patient results.'
                },
                type: 'search',
                minimumInputLength: 0,
                extraClasses: ['flex-width-1'],
                title: 'Enter either first letter of last name and last four of social security number, or generic name.'
            }]
        }],
        events: {
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid()) {
                    this.model.set({
                        persistedSearchText: this.model.get('patientSelectionMySiteSearchText'),
                        persist: true
                    });
                    this.stopListeningMySitetrayOpen();
                    this.onSearch();
                    this.listenToMySiteTrayOpen();
                } else {
                    this.transferFocusToFirstError();
                }
            }
        },
        modelEvents: {
            'change.inputted:patientSelectionMySiteSearchText': function(){
                this.model.set('persist', false);
            }
        },
        onSearch: function() {
            ADK.Messaging.getChannel('patient-selection-mySite').trigger('execute-search', this.model.get('patientSelectionMySiteSearchText').trim());
        },
        onInitialize: function(){
            this.listenToOnce(this.model, 'change:patientSelectionMySiteSearchText', this.initiateTextPersistance);
        },
        initiateTextPersistance: function(){
            this.listenToMySiteTrayOpen();
            this._trayKeys = ADK.Messaging.getChannel('patient-selection').request('tray-keys');
            this._trayKeys = _.without(this._trayKeys, 'mySite');
            _.each(this._trayKeys, this.registerTrayClickListener, this);
        },
        onBeforeDestroy: function(){
            this.stopListeningMySitetrayOpen();
            _.each(this._trayKeys, this.unRegisterTrayClickListener, this);
        },
        registerTrayClickListener: function(key){
            if (_.isString(key)){
                this.listenTo(ADK.Messaging.getChannel('patient-selection-'+key), 'patientSearchTray.show', this.clearSearchBar);
            }
        },
        unRegisterTrayClickListener: function(key){
            if (_.isString(key)){
                this.stopListening(ADK.Messaging.getChannel('patient-selection-'+key), 'patientSearchTray.show', this.clearSearchBar);
            }
        },
        listenToMySiteTrayOpen: function(){
             this.listenTo(ADK.Messaging.getChannel('patient-selection-mySite'), 'patientSearchTray.show', this.populateSearchBar);
        },
        stopListeningMySitetrayOpen: function(){
            this.stopListening(ADK.Messaging.getChannel('patient-selection-mySite'), 'patientSearchTray.show', this.populateSearchBar);
        },
        populateSearchBar: function(){
            var persistedSearchText = this.model.get('persistedSearchText');
            this.model.set('patientSelectionMySiteSearchText', persistedSearchText);
        },
        clearSearchBar: function(){
            if (this.model.get('persist')){
                var persistedSearchText = this.model.get('patientSelectionMySiteSearchText');
                this.model.set({
                    persistedSearchText: persistedSearchText,
                    patientSelectionMySiteSearchText: null,
                    persist: false
                });
            } else {
                this.model.set('patientSelectionMySiteSearchText', null);
            }
        }
    });

    var MySiteAllSearchView = Backbone.Marionette.ItemView.extend({
        template: false,
        className: 'patient-selection--my-site-search--input percent-width-75',
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
            this._regionManager.get('searchRegion').show(new MySiteAllSearchForm({
                model: new SearchModel()
            }));
        },
        onBeforeDestroy: function() {
            this._regionManager.destroy();
        }
    });

    return MySiteAllSearchView;
});