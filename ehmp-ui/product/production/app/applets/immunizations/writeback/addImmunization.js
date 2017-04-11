define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/immunizations/writeback/utils/parseUtils',
    'app/applets/immunizations/writeback/utils/validationUtil',
    'app/applets/immunizations/writeback/utils/writebackUtils'
], function(Backbone, Marionette, $, Handlebars, ParseUtil, ValidationUtil, WritebackUtil) {
    "use strict";

    var ImmuniztionType = {
        control: 'container',
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12'],
            items: [{
                control: 'radio',
                name: 'administeredHistorical',
                label: 'Choose an option',
                required: true,
                options: [{
                    value: 'administered',
                    label: 'Administered',
                    title: 'Choose an option.',
                }, {
                    value: 'historical',
                    label: 'Historical',
                    title: 'Choose an option.',
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-7', 'immunization-type-container', 'bottom-margin-sm'],
            template: Handlebars.compile('<i class="loading fa fa-spinner fa-spin"></i>'),
            items: [{
                control: 'select',
                name: 'immunizationType',
                label: 'Select an Immunization Type.',
                title: 'Start typing to retrieve immunizations and use the arrow keys to select.',
                required: true,
                showFilter: true,
                pickList: [],
                options: {
                    minimumInputLength: 2,
                    matcher: function(params, data) {
                        var substrRegex = new RegExp(params.term, 'i');
                        var administered = formModel.get('administeredHistorical') === 'administered';
                        var immunization = formInstance.immunizationTypes.findWhere({ien: data.id});

                        if (immunization && ParseUtil.doesItemMatch(substrRegex, immunization, administered)){
                            return data;
                        }

                        return null;
                    }
                }
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-5', 'left-padding-no'],
            items: [{
                control: 'select',
                name: 'informationSource',
                label: 'Information Source',
                title: 'Use up and down arrows to view options and then press enter to select.',
                pickList: []
            }]
        }, {
            control: 'spacer'
        }]
    };

    var LotNumberFields = {
        control: 'container',
        items: [{
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'lotNumberAdministered',
                label: 'Lot Number',
                title: 'Use up and down arrows to view options and then press enter to select.',
                pickList: []
            }, {
                control: 'input',
                name: 'lotNumberHistorical',
                label: 'Lot Number',
                title: 'Enter the lot number.'
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'container',
                extraClasses: ['expirationDateAdministered', 'form-group'],
                modelListeners: ['expirationDateAdministered'],
                template: Handlebars.compile('<label for="expirationDateAdministered">Expiration Date *</label><div id="expirationDateAdministered">{{#if expirationDateAdministered}}{{expirationDateAdministered}}{{else}}<i>Not specified</i>{{/if}}</div>'),
            }, {
                control: 'datepicker',
                name: 'expirationDateHistorical',
                label: 'Expiration Date',
                title: 'Enter in a date in the following format, MM/DD/YYYY'
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'container',
                extraClasses: ['manufacturerAdministered', 'form-group'],
                modelListeners: ['manufacturerAdministered'],
                template: Handlebars.compile('<label for="manufacturerAdministered">Manufacturer *</label><div id="manufacturerAdministered">{{#if manufacturerAdministered}}{{manufacturerAdministered}}{{else}}<i>Not specified</i>{{/if}}</div>'),
            }, {
                control: 'typeahead',
                name: 'manufacturerHistorical',
                label: 'Manufacturer',
                title: 'Enter the manufacturer.',
                pickList: [],
                options: {
                    minLength: 3
                }
            }]
        }]
    };

    var AdminDateAndProviders = {
        control: 'container',
        extraClasses: ['clear'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'container',
                extraClasses: ['administrationDate', 'form-group'],
                template: Handlebars.compile('<p class="faux-label bottom-margin-xs">Administration Date *</p><p>{{administrationDate}}</p>'),
                modelListeners: ['administrationDate']
            },{
                control: 'datepicker',
                name: 'administrationDateHistorical',
                label: 'Administration Date',
                title: 'Enter in a date in the following format, MM/DD/YYYY',
                options: {
                    endDate: '0d'
                },
                flexible: true
            },]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'typeahead',
                name: 'administeredBy',
                label: 'Administered By',
                title: 'Start typing to retrieve providers and use the arrow keys to select.',
                pickList: [],
                options: {
                    minLength: 3
                }
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'input',
                name: 'administeredLocation',
                label: 'Outside Location',
                title: 'Enter the location of administration',
            }]
        },
        {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'orderedByAdministered',
                showFilter: true,
                label: 'Ordering Provider',
                title: 'Start typing to retrieve providers and use the arrow keys to select.',
                pickList: [],
                options: {
                    minLength: 3
                }
            }]
        },
        {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'typeahead',
                name: 'orderedByHistorical',
                label: 'Ordering Provider',
                title: 'Start typing to retrieve providers and use the arrow keys to select.',
                pickList: [],
                options: {
                    minLength: 3
                }
            }]
        }]
    };

    var RouteLocationDosageSeriesRow = {
        control: 'container',
        extraClasses: ['clear'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'routeOfAdministration',
                title: 'Use up and down arrows to view options and then press enter to select.',
                label: 'Route of Administration',
                pickList: []
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'anatomicLocation',
                title: 'Use up and down arrows to view options and then press enter to select.',
                label: 'Anatomic Location',
                pickList: []
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'input',
                name: 'dosage',
                title: 'Enter dosage in milliliters',
                units: 'mL',
                label: 'Dosage/Unit'
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'series',
                title: 'Use up and down arrows to view options and then press enter to select.',
                label: 'Series',
                pickList: []
            }]
        }]
    };

    var VisRow = {
        control: 'container',
        extraClasses: ['clear'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12'],
            items: [{
                control: 'checklist',
                multiple: true,
                name: 'informationStatement',
                label: 'Vaccine Information Statement(s) (VIS)',
                selectedCountName: 'visCount',
                pickList: [],
                size: 5
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: "datepicker",
                name: "visDateOffered",
                label: "VIS Date Offered",
                title: 'Enter in a date in the following format, MM/DD/YYYY',
                options: {
                    endDate: '0d'
                }
            }]
        }]
    };

    var CommentsRow = {
        control: 'container',
        extraClasses: ['clear'],
        items: [{
            control: 'container',
            items: [{
                control: 'textarea',
                extraClasses: ['col-xs-12'],
                name: 'comments',
                label: 'Comments',
                maxlength: 245,
                rows: 8
            }]
        }]
    };

    var AddImmunizationFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["scroll-enter-form"],
            items: [ImmuniztionType, LotNumberFields, AdminDateAndProviders, RouteLocationDosageSeriesRow, VisRow, CommentsRow]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6"],
            }, {
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "button",
                    id: 'form-cancel-btn',
                    extraClasses: ["btn-default", "btn-sm", "left-margin-xs"],
                    type: "button",
                    label: "Cancel",
                    title: "Press enter to cancel"
                }, {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                    label: "Accept",
                    title: "Press enter to accept",
                    name: 'addBtn',
                    disabled: true
                }]
            }]
        }]
    }];

    var FormModel = Backbone.Model.extend({
        defaults: {
            errorModel: new Backbone.Model()
        },
        validate: function(attributes, options) {
            return ValidationUtil.validateModel(this);
        }
    });

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Try again later.'),
        tagName: 'p'
    });

    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Press enter to close."}}'),
        events: {
            'click .btn-primary': function () {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var formModel;
    var formInstance;

    var formView = ADK.UI.Form.extend({
        initialize: function() {
            this._super = ADK.UI.Form.prototype;
            this.model = new FormModel(this.model.attributes);
            formModel = this.model;
            this.immunizationTypeRequestCompleted = false;
            this.lotNumberRequestCompleted = false;
            this.informationStatementRequestCompleted = false;
            this._super.initialize.apply(this, arguments);

            this.configurePicklistResources();
        },
        fields: AddImmunizationFields,
        ui: {
            'administeredHistorical': '.administeredHistorical',
            'informationSource': '.informationSource',
            'immunizationType': '.immunizationType',
            'immunizationTypeContainer': '.immunization-type-container',
            'lotNumberAdministered': '.lotNumberAdministered',
            'lotNumberHistorical': '.lotNumberHistorical',
            'expirationDateAdministered': '.expirationDateAdministered',
            'expirationDateHistorical': '.expirationDateHistorical',
            'manufacturerAdministered': '.manufacturerAdministered',
            'manufacturerHistorical': '.manufacturerHistorical',
            'administrationDate': '.administrationDate',
            'administrationDateHistorical': '.administrationDateHistorical',
            'administeredBy': '.administeredBy',
            'administeredByInput': '#administeredBy',
            'orderedByHistorical': '.orderedByHistorical',
            'orderedByInputHistorical': '#orderedByHistorical',
            'orderedByAdministered': '.orderedByAdministered',
            'administeredLocation': '.administeredLocation',
            'routeOfAdministration': '.routeOfAdministration',
            'anatomicLocation': '.anatomicLocation',
            'dosage': '.dosage',
            'series': '.series',
            'informationStatement': '.informationStatement',
            'visDateOffered': '.visDateOffered',
            'comments': '.comments',
            'addBtn': '.addBtn'
        },
        lotNumbersEvents: {
            'read:success': function(collection, response) {
                var filteredItems = _.filter(collection.models, function(item) {
                    var expirationDate = item.get('expirationDate');
                    return _.isUndefined(expirationDate) || !expirationDate || moment(expirationDate).isBefore(moment(), 'day');
                });
                collection.remove(filteredItems);

                _.each(collection.models, function(model) {
                    model.set('label', model.get('lotNumber'));
                    model.set('value', model.get('lotNumber') + ';' + model.get('ien'));
                });
                handleOperationalDataRetrievalComplete(this, 'lotNumbers');
            }
        },
        informationStatementsEvents: {
            'read:success': function(collection, response) {
                _.each(collection.models, function(model) {
                    model.set('label', ParseUtil.getFormattedVisName(model));
                    model.set('value', model.get('ien'));
                });
                handleOperationalDataRetrievalComplete(this, 'informationStatements');
            }
        },
        immunizationTypesEvents: {
            'read:success': function(collection, response) {
                _.each(collection.models, function(model) {
                    model.set('label', model.get('name'));
                    model.set('value', model.get('ien'));
                });
                this.ui.immunizationType.trigger('control:picklist:set', collection);
                handleOperationalDataRetrievalComplete(this, 'immunizationTypes');
            }
        },
        informationSourcesEvents: {
            'read:success': function(collection, response) {
                this.ui.informationSource.trigger('control:picklist:set', [ParseUtil.getInformationSourceList(collection.toPicklist())]);
            }
        },
        manufacturersEvents: {
            'read:success': function(collection, response) {
                this.ui.manufacturerHistorical.trigger('control:picklist:set', [collection.toPicklist()]);
            }
        },
        orderingProvidersEvents: {
            'read:success': function(collection, response) {
                var orderingProviderList = [ParseUtil.getOrderingProviderList(response)];
                this.ui.orderedByAdministered.trigger('control:picklist:set', orderingProviderList);
                this.ui.orderedByHistorical.trigger('control:picklist:set', orderingProviderList);
                updateOrderedBy(this);
            }
        },
        administeredByCollectionEvents: {
            'read:success': function(collection, response) {
                this.ui.administeredBy.trigger('control:picklist:set', [collection.toPicklist()]);

                var currentUser = ParseUtil.findUser(collection, ADK.UserService.getUserSession());
                if (currentUser) {
                    this.$(this.ui.administeredByInput.selector).typeahead('val', currentUser.get('name'));
                    this.model.set('administeredBy', currentUser.get('code') + ';' + currentUser.get('name'), {
                        silent: true
                    });
                }
            }
        },
        anatomicLocationsEvents: {
            'read:success': function(collection, response) {
                this.ui.anatomicLocation.trigger('control:picklist:set', [collection.toPicklist()]);
            }
        },
        routesOfAdministrationEvents: {
            'read:success': function(collection, response) {
                this.ui.routeOfAdministration.trigger('control:picklist:set', [collection.toPicklist()]);
            }
        },
        configurePicklistResources: function() {
            this.lotNumbers = new ADK.UIResources.Picklist.Immunizations.LotNumbers();
            this.informationStatements = new ADK.UIResources.Picklist.Immunizations.InformationStatements();
            this.immunizationTypes = new ADK.UIResources.Picklist.Immunizations.Data();
            this.informationSources = new ADK.UIResources.Picklist.Immunizations.InformationSources();
            this.manufacturers = new ADK.UIResources.Picklist.Immunizations.Manufacturers();
            this.orderingProviders = new Backbone.Collection();
            this.administeredByCollection = new ADK.UIResources.Picklist.Encounters.NewPersons();
            this.anatomicLocations = new ADK.UIResources.Picklist.Immunizations.AnatomicLocations();
            this.routesOfAdministration = new ADK.UIResources.Picklist.Immunizations.RoutesOfAdministration();

            this.bindEntityEvents(this.lotNumbers, this.lotNumbersEvents);
            this.bindEntityEvents(this.informationStatements, this.informationStatementsEvents);
            this.bindEntityEvents(this.immunizationTypes, this.immunizationTypesEvents);
            this.bindEntityEvents(this.informationSources, this.informationSourcesEvents);
            this.bindEntityEvents(this.manufacturers, this.manufacturersEvents);
            this.bindEntityEvents(this.orderingProviders, this.orderingProvidersEvents);
            this.bindEntityEvents(this.administeredByCollection, this.administeredByCollectionEvents);
            this.bindEntityEvents(this.anatomicLocations, this.anatomicLocationsEvents);
            this.bindEntityEvents(this.routesOfAdministration, this.routesOfAdministrationEvents);
        },
        onRender: function() {
            this.initDefaultFields();
            formInstance = this;

            if(this.workflow.options.model.get('steps').length > 1){
                var PatientModel = ADK.PatientRecordService.getCurrentPatient();
                PatientModel.on('change:visit', function(model){
                    formInstance.handlePreselectedVisit();
                });
            }else {
                formInstance.handlePreselectedVisit();
            }

            retrievePickListData(this);
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
        },
        onAttach:function(){
            if (this.$('#immunizationType').is(':visible')){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Loading immunization types'
                });
            }
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'immunization-writeback-in-progress',
                label: 'Immunization',
                failureMessage: 'Immunization Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function(model) {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        onDestroy: function(){
            var PatientModel = ADK.PatientRecordService.getCurrentPatient();
            PatientModel.off('change:visit');
            WritebackUtil.unregisterChecks();

            this.unbindEntityEvents(this.lotNumber, this.lotNumbersEvents);
            this.unbindEntityEvents(this.informationStatements, this.informationStatementsEvents);
            this.unbindEntityEvents(this.immunizationTypes, this.immunizationTypesEvents);
            this.unbindEntityEvents(this.informationSources, this.informationSourcesEvents);
            this.unbindEntityEvents(this.manufacturers, this.manufacturersEvents);
            this.unbindEntityEvents(this.orderingProviders, this.orderingProvidersEvents);
            this.unbindEntityEvents(this.administeredByCollection, this.administeredByCollectionEvents);
            this.unbindEntityEvents(this.anatomicLocations, this.anatomicLocationsEvents);
            this.unbindEntityEvents(this.routesOfAdministration, this.routesOfAdministrationEvents);
        },
        initDefaultFields: function() {
            this.ui.immunizationType.trigger('control:disabled', true);
            this.ui.informationSource.trigger('control:hidden', false);
            this.ui.informationSource.trigger('control:disabled', true);
            this.ui.informationSource.trigger('control:required', false);
            this.ui.lotNumberAdministered.trigger('control:hidden', true);
            this.ui.lotNumberAdministered.trigger('control:disabled', true);
            this.ui.lotNumberAdministered.trigger('control:required', false);
            this.ui.lotNumberHistorical.trigger('control:hidden', false);
            this.ui.lotNumberHistorical.trigger('control:disabled', true);
            this.ui.expirationDateHistorical.trigger('control:disabled', true);
            this.ui.expirationDateAdministered.trigger('control:hidden', true);
            this.ui.expirationDateHistorical.trigger('control:hidden', false);
            this.ui.manufacturerHistorical.trigger('control:disabled', true);
            this.ui.manufacturerAdministered.trigger('control:hidden', true);
            this.ui.manufacturerHistorical.trigger('control:hidden', false);
            this.ui.administrationDateHistorical.trigger('control:disabled', true);
            this.ui.administrationDateHistorical.trigger('control:hidden', true);
            this.ui.administrationDateHistorical.trigger('control:required', false);
            this.ui.administeredBy.trigger('control:disabled', true);
            this.ui.administeredBy.trigger('control:required', false);
            this.ui.orderedByHistorical.trigger('control:disabled', true);
            this.ui.orderedByHistorical.trigger('control:hidden', true);
            this.ui.orderedByAdministered.trigger('control:disabled', true);
            this.ui.orderedByAdministered.trigger('control:hidden', false);
            this.ui.administeredLocation.trigger('control:disabled', true);
            this.ui.administeredLocation.trigger('control:hidden', false);
            this.ui.routeOfAdministration.trigger('control:disabled', true);
            this.ui.anatomicLocation.trigger('control:disabled', true);
            this.ui.dosage.trigger('control:disabled', true);
            this.ui.series.trigger('control:disabled', true);
            this.ui.informationStatement.trigger('control:disabled', true);
            this.ui.informationStatement.trigger('control:hidden', true);
            this.ui.visDateOffered.trigger('control:disabled', true);
            this.ui.visDateOffered.trigger('control:hidden', true);
            this.ui.comments.trigger('control:disabled', true);
            this.model.set('administeredHistorical', '');

            var site = ADK.UserService.getUserSession().get('site');
            var user = ADK.UserService.getUserSession().get('duz')[site];
            this.model.set('authorUid', 'urn:va:user:' + site + ':' + user);

        },
        events: {
            'click #form-cancel-btn': function(e) {
                e.preventDefault();
                var closeAlertView = new ADK.UI.Alert({
                    title: 'Cancel',
                    icon: 'icon-cancel',
                    messageView: CloseMessageView,
                    footerView: CloseFooterView,
                    workflow: this.workflow
                });
                closeAlertView.show();
            },
            'submit': function(e) {
                e.preventDefault();
                if (!this.model.isValid())
                    this.model.set("formStatus", {
                        status: "error",
                        message: this.model.validationError
                    });
                else {
                    this.$el.trigger('tray.loaderShow',{
                        loadingString:'Adding Immunization'
                    });
                    this.model.unset("formStatus");
                    this.ui.addBtn.trigger('control:disabled', true);
                    var self = this;
                    WritebackUtil.addImmunization(this.model,
                        function() {
                            self.$el.trigger('tray.loaderHide');
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Immunization Added',
                                icon: 'fa-check',
                                message: 'Immunization saved successfully',
                                type: "success"

                            });
                            saveAlertView.show();
                            self.workflow.close();
                            WritebackUtil.unregisterChecks();

                            ADK.ResourceService.clearAllCache('immunization');
                            ADK.Messaging.getChannel('immunization').trigger('refreshGridView');
                        },
                        function(error) {
                            self.$el.trigger('tray.loaderHide');
                            self.ui.addBtn.trigger('control:disabled', false);
                            var errorAlertView = new ADK.UI.Alert({
                                title: 'Save Failed (System Error)',
                                icon: 'icon-error',
                                messageView: ErrorMessageView,
                                footerView: ErrorFooterView
                            });
                            errorAlertView.show();
                        }
                    );
                }
            }
        },
        handleEnableAddButton: function(){
            var enableAddButton = false;
            if(this.model.get('administeredHistorical') === 'administered'){
                if(this.model.get('immunizationType') && this.model.get('lotNumberAdministered') && this.model.get('administeredBy') &&
                    this.model.get('routeOfAdministration') && this.model.get('anatomicLocation') &&
                    this.model.get('dosage')){

                    if(this.model.get('visCount') === 0 || (this.model.get('visCount') > 0 && this.model.get('visDateOffered'))){
                        enableAddButton = true;
                    }
                }
            } else {
                if(this.model.get('immunizationType') && this.model.get('informationSource') && this.model.get('administrationDateHistorical')){
                    enableAddButton = true;
                }
            }

            if(enableAddButton){
                this.ui.addBtn.trigger('control:disabled', false);
            } else {
                this.ui.addBtn.trigger('control:disabled', true);
            }
        },
        modelEvents: {
            'change:administeredHistorical': function() {
                var value = this.model.get('administeredHistorical');

                imunizationTypePrompt();

                if (value === 'administered') {
                    if(this.operationalDataComplete){
                        this.ui.immunizationType.trigger('control:disabled', false);
                    }
                    this.ui.informationSource.trigger('control:hidden', true);
                    this.ui.informationSource.trigger('control:required', false);
                    this.ui.lotNumberAdministered.trigger('control:hidden', false);
                    this.ui.lotNumberAdministered.trigger('control:required', true);
                    this.ui.lotNumberHistorical.trigger('control:hidden', true);
                    this.ui.expirationDateAdministered.trigger('control:hidden', false);
                    this.ui.expirationDateHistorical.trigger('control:hidden', true);
                    this.ui.manufacturerAdministered.trigger('control:hidden', false);
                    this.ui.manufacturerHistorical.trigger('control:hidden', true);
                    this.ui.administeredBy.trigger('control:required', true);
                    this.ui.orderedByHistorical.trigger('control:hidden', true);
                    this.ui.orderedByAdministered.trigger('control:hidden', false);
                    this.ui.orderedByAdministered.trigger('control:required', true);
                    this.ui.administeredLocation.trigger('control:hidden', true);
                    this.ui.routeOfAdministration.trigger('control:required', true);
                    this.ui.anatomicLocation.trigger('control:required', true);
                    this.ui.dosage.trigger('control:required', true);

                    if(this.model.get('informationStatement').length > 0){
                        this.ui.informationStatement.trigger('control:hidden', false);
                        this.ui.visDateOffered.trigger('control:hidden', false);
                    }


                    this.model.trigger('change:visCount');
                    this.$(this.ui.administeredBy.selector).parent().removeClass('col-xs-3').addClass('col-xs-5');
                    this.handleAdministrationDate(true);

                    if(_.isEmpty(this.model.get('orderedByAdministered'))){
                        updateOrderedBy(this);
                    }

                } else if (value === 'historical'){
                    if(this.operationalDataComplete){
                        this.ui.immunizationType.trigger('control:disabled', false);
                    }
                    this.ui.informationSource.trigger('control:hidden', false);
                    this.ui.informationSource.trigger('control:required', true);
                    this.ui.lotNumberAdministered.trigger('control:hidden', true);
                    this.ui.lotNumberAdministered.trigger('control:required', false);
                    this.ui.lotNumberHistorical.trigger('control:hidden', false);
                    this.ui.expirationDateAdministered.trigger('control:hidden', true);
                    this.ui.expirationDateHistorical.trigger('control:hidden', false);
                    this.ui.manufacturerAdministered.trigger('control:hidden', true);
                    this.ui.manufacturerHistorical.trigger('control:hidden', false);
                    this.ui.administeredBy.trigger('control:required', false);
                    this.ui.administeredLocation.trigger('control:hidden', false);
                    this.ui.orderedByAdministered.trigger('control:required', false);
                    this.ui.orderedByAdministered.trigger('control:hidden', true);
                    this.ui.orderedByHistorical.trigger('control:hidden', false);
                    this.ui.routeOfAdministration.trigger('control:required', false);
                    this.ui.anatomicLocation.trigger('control:required', false);
                    this.ui.dosage.trigger('control:required', false);
                    this.ui.informationStatement.trigger('control:hidden', true);
                    this.ui.visDateOffered.trigger('control:hidden', true);
                    this.ui.visDateOffered.trigger('control:required', false);

                    this.model.unset('orderedByAdministered');
                    if($(this.ui.informationSource).find('#informationSource').is(':disabled')){
                        this.ui.administrationDate.trigger('control:disabled', true);
                    }else {
                        this.ui.administrationDate.trigger('control:disabled', false);
                    }
                    this.handleAdministrationDate(false);
                }

                this.handleEnableAddButton();
            },
            'change:lotNumberAdministered': function(model) {
                var lotNumber = model.get('lotNumberAdministered');

                if (lotNumber) {
                    var lotNumberModel = this.lotNumbers.findWhere({
                        lotNumber: lotNumber.split(';')[0]
                    });

                    var expirationDate = moment(lotNumberModel.get('expirationDate'), 'MMM DD, YYYY');
                    model.set('expirationDateAdministered', expirationDate.format('MM/DD/YYYY'));
                    model.set('manufacturerAdministered', lotNumberModel.get('manufacturer'));
                } else {
                    model.unset('expirationDateAdministered');
                    model.unset('manufacturerAdministered');
                }
                this.handleEnableAddButton();
            },
            'change:visCount': function() {
                if(this.model.get('administeredHistorical') === 'administered'){
                    if(this.model.get('visCount') > 0){
                        this.ui.visDateOffered.trigger('control:required', true);
                    } else {
                        this.ui.visDateOffered.trigger('control:required', false);
                    }
                    this.handleEnableAddButton();
                }
            },
            'change:immunizationType': function(){
                this.handleImmunizationTypeSelected();
            },
            'change:informationSource': function(){
                this.handleEnableAddButton();
            },
            'change:administeredBy': function(){
                this.handleEnableAddButton();
            },
            'change:administrationDateHistorical': function(){
                this.handleEnableAddButton();
            },
            'change:routeOfAdministration': function(){
                this.handleEnableAddButton();
            },
            'change:anatomicLocation': function(){
                this.handleEnableAddButton();
            },
            'change:dosage': function(){
                this.handleEnableAddButton();
            },
            'change:visDateOffered': function(){
                this.handleEnableAddButton();
            }
        },
        handleImmunizationTypeSelected: function() {
            var self = this;
            this.disableFields(false);

            var immunization = this.immunizationTypes.findWhere({ien: this.model.get('immunizationType')});

            if(immunization){
                this.model.set('cvxCode', immunization.get('cvxCode'));
                this.model.set('immunizationNarrative', immunization.get('name'));
                if(this.lotNumbers){
                    var lotNumbers = this.lotNumbers.where({vaccine: immunization.get('name')});
                    self.ui.lotNumberAdministered.trigger('control:picklist:set', lotNumbers);
                }
                this.model.set('inactiveFlag', immunization.get('inactiveFlag'));
                self.ui.series.trigger('control:picklist:set', [ParseUtil.getSeriesList(immunization.get('maxInSeries'))]);
                this.model.get('informationStatement').reset();
                var matchedInformationStatements = new Backbone.Collection(ParseUtil.getInformationStatementList(immunization.get('vaccineInfoStmt'), self.informationStatements));

                if(matchedInformationStatements.length > 0){
                    matchedInformationStatements.each(function(infoStatement){
                        self.model.get('informationStatement').add(infoStatement);
                    });

                    if(this.model.get('administeredHistorical') === 'administered'){
                        this.ui.informationStatement.trigger('control:hidden', false);
                        this.ui.visDateOffered.trigger('control:hidden', false);
                    }
                } else {
                    this.ui.informationStatement.trigger('control:hidden', true);
                    this.ui.visDateOffered.trigger('control:hidden', true);
                }

                this.handleEnableAddButton();
            }
        },
        disableFields: function(disabled) {
            this.ui.informationSource.trigger('control:disabled', disabled);
            this.ui.lotNumberAdministered.trigger('control:disabled', disabled);
            this.ui.lotNumberHistorical.trigger('control:disabled', disabled);
            this.ui.expirationDateHistorical.trigger('control:disabled', disabled);
            this.ui.manufacturerHistorical.trigger('control:disabled', disabled);
            this.ui.administeredBy.trigger('control:disabled', disabled);
            this.ui.orderedByAdministered.trigger('control:disabled', disabled);
            this.ui.orderedByHistorical.trigger('control:disabled', disabled);
            this.ui.administeredLocation.trigger('control:disabled', disabled);
            this.ui.routeOfAdministration.trigger('control:disabled', disabled);
            this.ui.anatomicLocation.trigger('control:disabled', disabled);
            this.ui.dosage.trigger('control:disabled', disabled);
            this.ui.series.trigger('control:disabled', disabled);
            this.ui.informationStatement.trigger('control:disabled', disabled);
            this.ui.visDateOffered.trigger('control:disabled', disabled);
            this.ui.comments.trigger('control:disabled', disabled);
            this.ui.administrationDateHistorical.trigger('control:disabled', disabled);

            if(this.model.get('administeredHistorical') === 'historical'){
                this.ui.administrationDate.trigger('control:disabled', disabled);
            }
        },
        handlePreselectedVisit: function(){

            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit'); 

            if(!visit.existingVisit && visit.isHistorical){
                this.model.set('administeredHistorical', 'historical');
                this.ui.administeredHistorical.trigger('control:disabled', true);
            }

            if(this.model.get('administeredHistorical') === 'administered'){
                this.handleAdministrationDate(true);
            }

            updateOrderedBy(this);
        },
        handleAdministrationDate: function(isAdministered){
            if(isAdministered){
                this.model.set('previousHistoricalAdministrationDate', this.model.get('administrationDateHistorical'));
                var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

                if(visit.dateTime){
                    var visitDate = moment(visit.dateTime.substring(0, 8), 'YYYYMMDDhhmm').format('MM/DD/YYYY');
                    this.model.set('administrationDate', visitDate);
                }

                this.ui.administrationDateHistorical.trigger('control:hidden', true);
                this.ui.administrationDateHistorical.trigger('control:required', false);
                this.ui.administrationDate.trigger('control:hidden', false);
            } else {
                this.ui.administrationDate.trigger('control:hidden', true);
                this.ui.administrationDateHistorical.trigger('control:hidden', false);
                this.ui.administrationDateHistorical.trigger('control:required', true);

                if(this.model.get('histCancel')){
                    this.model.set('administrationDateHistorical', formModel.get('previousHistoricalAdministrationDate'));
                    this.model.set('histCancel', false);
                }else if(this.model.get('administrationDateHistorical')){
                    this.model.unset('administrationDateHistorical');
                }
            }
        }
    });

    var CloseMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
        tagName: 'p'
    });

    var CloseFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "No" classes="btn-default" title="Press enter to go back."}}{{ui-button "Yes" classes="btn-primary" title="Press enter to cancel."}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                this.getOption('workflow').close();
                WritebackUtil.unregisterChecks();
            },
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var preserveAdmMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You have chosen to switch between VA-Administered and Historical. Administered and Historical immunizations have different documentation requirements. We can preserve what you’ve previously entered, where possible, discard it, or cancel this request. What would you prefer?'),
        tagName: 'p'
    });

    var preserveAdmFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Preserve" id="adm-preserve" classes="btn-primary" title="Press enter to preserve your data."}}{{ui-button "Discard" id="adm-discard" classes="btn-default" title="Press enter to discard your data."}}{{ui-button "Cancel" id="adm-cancel" classes="btn-default" title="Press enter to cancel."}}'),
        events: {
            'click #adm-preserve': function() {
                ADK.UI.Alert.hide();
                if(formModel.get('inactiveFlag') === "1"){
                    clearForm();
                }else{
                    formModel.errorModel.clear();
                    select2_search($('#immunizationType'), formModel.get('_labelsForSelectedValues').get('immunizationType').substring(0, 5));                    
                }
            },
            'click #adm-discard': function() {
                ADK.UI.Alert.hide();
                clearForm();
            },
            'click #adm-cancel': function() {
                ADK.UI.Alert.hide();
                formModel.set('preserveCancel', true);
                formModel.set('administeredHistorical', 'administered');
            }
        },
        tagName: 'span'
    });

    var preserveHistMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You have chosen to switch between VA-Administered and Historical. Administered and Historical immunizations have different documentation requirements. We can preserve what you’ve previously entered, where possible, discard it, or cancel this request. What would you prefer?'),
        tagName: 'p'
    });

    var preserveHistFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Preserve" id="hist-preserve" classes="btn-primary" title="Press enter to preserve your data."}}{{ui-button "Discard" id="hist-discard" classes="btn-default" title="Press enter to discard your data."}}{{ui-button "Cancel" id="hist-cancel" classes="btn-default" title="Press enter to cancel."}}'),
        events: {
            'click #hist-preserve': function() {
                ADK.UI.Alert.hide();

                formModel.errorModel.clear();

                if(formModel.has('orderedByHistorical') && formModel.get('orderedByHistorical').indexOf('urn:va:user') > -1){
                    formModel.set('orderedByAdministered', formModel.get('orderedByHistorical'));
                } else {

                }

                formModel.unset('orderedByHistorical');
                formModel.unset('lotNumberAdministered');
                formModel.unset('lotNumberHistorical');
                formModel.unset('visDateOffered');
                formModel.get('informationStatement').each(function(infoStatement){
                    infoStatement.set('value', false);
                });
                formModel.unset('informationSource');
                formModel.unset('manufacturerHistorical');
                formModel.unset('expirationDateHistorical');
                formModel.unset('administeredLocation');
                if(formModel.get('inactiveFlag') === "1"){
                    clearForm();
                }else{
                    select2_search($('#immunizationType'), formModel.get('_labelsForSelectedValues').get('immunizationType').substring(0, 5));
                }

            },
            'click #hist-discard': function() {
                ADK.UI.Alert.hide();
                formInstance.ui.informationStatement.trigger('control:hidden', true);
                clearForm();
            },
            'click #hist-cancel': function() {
                ADK.UI.Alert.hide();
                formModel.set('preserveCancel', true);
                formModel.set('histCancel', true);
                formModel.set('administeredHistorical', 'historical');
            }
        },
        tagName: 'span'
    });

    function imunizationTypePrompt(){

        var value = formModel.get('administeredHistorical');
        var prevValue = formModel._previousAttributes.administeredHistorical;

        if(prevValue && !formModel.get('preserveCancel') && formModel.get('immunizationType') && isDirtyForm()){
            if(prevValue === 'administered'){
                var preserveAdmView = new ADK.UI.Alert({
                    title: 'Attention',
                    icon: 'icon-warning',
                    messageView: preserveAdmMessageView,
                    footerView: preserveAdmFooterView
                });
                preserveAdmView.show();
            }else{
                var preserveHistView = new ADK.UI.Alert({
                    title: 'Attention',
                    icon: 'icon-warning',
                    messageView: preserveHistMessageView,
                    footerView: preserveHistFooterView
                });
                preserveHistView.show();
            }
        }else if(   prevValue && value === 'administered' && !formModel.get('preserveCancel') &&
                    formModel.get('immunizationType') &&  !isDirtyForm() &&
                    !_.isUndefined(formModel.get('inactiveFlag')) && formModel.get('inactiveFlag') === "1"){

            formModel.unset('immunizationType');

        }else if(   prevValue && value === 'historical' && !formModel.get('preserveCancel') &&
                    formModel.get('immunizationType') &&  !isDirtyForm()){

            formModel.unset('immunizationType');

        }

        formModel.set('preserveCancel', false);
    }

    function clearForm(){
        formModel.unset('immunizationType');
        formModel.unset('lotNumberAdministered');
        formModel.unset('lotNumberHistorical');
        formModel.unset('visDateOffered');
        formModel.get('informationStatement').reset();
        formModel.unset('administeredLocation');
        formModel.unset('comments');
        formModel.unset('series');
        formModel.unset('routeOfAdministration');
        formModel.unset('anatomicLocation');
        formModel.unset('dosage');
        formModel.unset('informationSource');
        formModel.unset('manufacturerHistorical');
        formModel.unset('expirationDateHistorical');
        formModel.unset('orderedByHistorical');
        formModel.errorModel.clear();
    }

    function isDirtyForm(){

        var isDirty =   (!_.isUndefined(formModel.get('comments')) && (formModel.get('comments') !== "") ) ||
                        (!_.isUndefined(formModel.get('routeOfAdministration')) && (formModel.get('routeOfAdministration') !== "") ) ||
                        (!_.isUndefined(formModel.get('orderedByAdministered')) && (formModel.get('orderedByAdministered') !== "") ) ||
                        (!_.isUndefined(formModel.get('orderedByHistorical')) && (formModel.get('orderedByHistorical') !== '')) ||
                        (!_.isUndefined(formModel.get('anatomicLocation')) && (formModel.get('anatomicLocation') !== "") ) ||
                        (!_.isUndefined(formModel.get('series')) && (formModel.get('series') !== "") ) || 
                        (!_.isUndefined(formModel.get('informationSource')) && (formModel.get('informationSource') !== "") ) ||
                        (!_.isUndefined(formModel.get('lotNumberHistorical')) && (formModel.get('lotNumberHistorical') !== "") ) ||
                        (!_.isUndefined(formModel.get('manufacturerHistorical')) && (formModel.get('manufacturerHistorical') !== "") ) ||
                        (!_.isUndefined(formModel.get('administeredBy')) && (formModel.get('administeredBy') !== "") ) ||
                        (!_.isUndefined(formModel.get('administeredLocation')) && (formModel.get('administeredLocation') !== "")  );

        return isDirty;
    }

    function updateOrderedBy(form){

        var visit = ADK.PatientRecordService.getCurrentPatient().get('visit'); 
        if(!_.isUndefined(form.orderingProviders)){
            var selectedProvider = visit.selectedProvider;
            var validProvider = form.orderingProviders.findWhere({name: selectedProvider.name.toUpperCase()});
            if(!_.isUndefined(validProvider)){
                //form.$(form.ui.orderedByInput.selector).typeahead('val', validProvider.get('name'));    

                form.model.set({
                    'orderedByAdministered' :  validProvider.get('uid')
                });
            }
        }

    }

    function handleOperationalDataRetrievalComplete(form, type){

        // remove loading cover
        form.$el.trigger('tray.loaderHide');

        if(type === 'informationStatements'){
            form.informationStatementRequestCompleted = true;
        } else if(type === 'lotNumbers'){
            form.lotNumberRequestCompleted = true;
        } else if(type === 'immunizationTypes'){
            form.immunizationTypeRequestCompleted = true;
        }

        if(form.informationStatementRequestCompleted && form.lotNumberRequestCompleted && form.immunizationTypeRequestCompleted){
            form.operationalDataComplete = true;
            // Handle pre-selected immunization type
            var cvxCode = form.model.get('cvxCode');
            if(!cvxCode && form.model.get('codes') && form.model.get('codes').length > 0 && form.model.get('codes')[0].code){
                cvxCode = form.model.get('codes')[0].code;
            }
            if(cvxCode){
                var selectedType = form.immunizationTypes.find(function(model) {
                    return model.get('cvxCode') == cvxCode;
                });

                if(selectedType){
                    if( selectedType.get('inactiveFlag') === "0"){
                        form.model.set('administeredHistorical', 'administered');
                    } else{
                        if(selectedType.get('selectableHistoric') === "Y"){
                            form.model.set('administeredHistorical', 'historical');
                        }
                        else{
                            return;
                        }
                    }
                    form.model.set('immunizationType', selectedType.get('ien'));
                    form.model.set('series', form.model.get('seriesName'));
                }

            }
        }

        form.$(form.ui.immunizationTypeContainer).find('i').detach();

        if(form.model.get('administeredHistorical')){
            form.ui.immunizationType.trigger('control:disabled', false);
        }
    }

    function select2_search ($el, term) {
      $el.select2({skipFetch: true});
      $el.select2('open');

      var $search = $el.data('select2').dropdown.$search;
      $search.val(term);
    }

    function retrievePickListData(form) {
        form.lotNumbers.fetch();
        form.informationStatements.fetch();
        form.informationStatements.fetch();
        form.immunizationTypes.fetch();
        form.informationSources.fetch();
        form.manufacturers.fetch();
        form.administeredByCollection.fetch();
        form.anatomicLocations.fetch();
        form.routesOfAdministration.fetch();

        var site = ADK.UserService.getUserSession().get('site');
        var providersfetchOptions = {
            resourceTitle: "visits-providers",
            onSuccess: function(collection, response) {
                collection.trigger('read:success', collection, response);
            },
            criteria: {
                "facility.code": site
            }
        };
        ADK.ResourceService.fetchCollection(providersfetchOptions, form.orderingProviders);
    }

    return formView;
});