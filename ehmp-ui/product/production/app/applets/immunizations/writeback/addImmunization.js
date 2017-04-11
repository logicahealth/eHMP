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
                    title: 'Please choose an option.',
                }, {
                    value: 'historical',
                    label: 'Historical',
                    title: 'Please choose an option.',
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
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
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'informationSource',
                label: 'Information Source',
                title: 'To select an option, use the up and down arrow keys then press enter to select.',
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
                title: 'To select an option, use the up and down arrow keys then press enter to select.',
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
                title: 'Please enter in a date in the following format, MM/DD/YYYY'
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
                control: 'datepicker',
                name: 'administrationDate',
                label: 'Administration Date',
                title: 'Please enter in a date in the following format, MM/DD/YYYY',
                options: {
                    endDate: '0d'
                },
                flexible: true,
                required: true
            }]
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
                label: 'Administered Location',
                title: 'Please enter the location of administration',
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'typeahead',
                name: 'orderedBy',
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
                title: 'To select an option, use the up and down arrow keys then press enter to select.',
                label: 'Route of Administration',
                pickList: []
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'anatomicLocation',
                title: 'To select an option, use the up and down arrow keys then press enter to select.',
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
                title: 'To select an option, use the up and down arrow keys then press enter to select.',
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
                control: 'select',
                multiple: true,
                name: 'informationStatement',
                label: 'Vaccine Information Statement(s) (VIS)',
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
                title: 'Please enter in a date in the following format, MM/DD/YYYY'
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
                    extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                    type: "button",
                    label: "Cancel",
                    title: "Press enter to cancel"
                }, {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                    label: "Add",
                    title: "Press enter to add",
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
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Please try again later.'),
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
        },
        fields: AddImmunizationFields,
        ui: {
            'administeredHistorical': '.administeredHistorical',
            'informationSource': '.informationSource',
            'immunizationType': '.immunizationType',
            'lotNumberAdministered': '.lotNumberAdministered',
            'lotNumberHistorical': '.lotNumberHistorical',
            'expirationDateAdministered': '.expirationDateAdministered',
            'expirationDateHistorical': '.expirationDateHistorical',
            'manufacturerAdministered': '.manufacturerAdministered',
            'manufacturerHistorical': '.manufacturerHistorical',
            'administrationDate': '.administrationDate',
            'administeredBy': '.administeredBy',
            'administeredByInput': '#administeredBy',
            'orderedBy': '.orderedBy',
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
            ADK.Navigation.registerCheck(new ADK.Navigation.PatientContextCheck({
                id: 'immunization-writeback-in-progress',
                failureMessage: 'Immunization Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onCancel: _.bind(function() {
                    this.$el.trigger('tray.show');
                }, this)
            }));
        },
        onDestroy: function(){
            var PatientModel = ADK.PatientRecordService.getCurrentPatient();
            PatientModel.off('change:visit');
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
            this.ui.administrationDate.trigger('control:disabled', true);
            this.ui.administeredBy.trigger('control:disabled', true);
            this.ui.administeredBy.trigger('control:required', false);
            this.ui.orderedBy.trigger('control:disabled', true);
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

        },
        events: {
            'click #form-cancel-btn': function(e) {
                e.preventDefault();
                var closeAlertView = new ADK.UI.Alert({
                    title: 'Are you sure you want to delete?',
                    icon: 'fa-exclamation-triangle font-size-18 color-red',
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
                    this.model.unset("formStatus");
                    var self = this;
                    WritebackUtil.addImmunization(this.model,
                        function() {
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Immunization Added',
                                icon: 'fa-check',
                                message: 'Immunization saved successfully',
                                type: "success"

                            });
                            saveAlertView.show();
                            self.workflow.close();
                            WritebackUtil.unregisterNavigationCheck();

                            ADK.ResourceService.clearAllCache('immunization');
                            ADK.Messaging.getChannel('immunization').trigger('refreshGridView');
                        },
                        function(error) {
                            var errorAlertView = new ADK.UI.Alert({
                                title: 'Save Failed (System Error)',
                                icon: 'fa-exclamation-circle font-size-18 color-red',
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
                    this.model.get('administrationDate') && this.model.get('routeOfAdministration') && this.model.get('anatomicLocation') &&
                    this.model.get('dosage')){

                    var informationStatementArray = this.model.get('informationStatement');
                    if(!informationStatementArray || (informationStatementArray.length === 1 && informationStatementArray[0] === '') ||
                        (informationStatementArray.length >= 1 && informationStatementArray[0] !== '' && this.model.get('visDateOffered')) ||
                        (informationStatementArray.length > 1 && this.model.get('visDateOffered'))){
                        enableAddButton = true;
                    }
                }
            } else {
                if(this.model.get('immunizationType') && this.model.get('informationSource') && this.model.get('administrationDate')){
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
                    this.ui.immunizationType.trigger('control:disabled', false);
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
                    this.ui.administeredLocation.trigger('control:hidden', true);
                    this.ui.routeOfAdministration.trigger('control:required', true);
                    this.ui.anatomicLocation.trigger('control:required', true);
                    this.ui.dosage.trigger('control:required', true);
                    this.ui.informationStatement.trigger('control:hidden', false);
                    this.ui.visDateOffered.trigger('control:hidden', false);
                    this.model.trigger('change:informationStatement');
                    this.$(this.ui.administeredBy.selector).parent().removeClass('col-xs-3').addClass('col-xs-5');
                    this.$(this.ui.orderedBy.selector).parent().removeClass('col-xs-3').addClass('col-xs-5');
                    this.handleAdministrationDate(true);
                } else if (value === 'historical'){
                    this.ui.immunizationType.trigger('control:disabled', false);
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
                    this.ui.routeOfAdministration.trigger('control:required', false);
                    this.ui.anatomicLocation.trigger('control:required', false);
                    this.ui.dosage.trigger('control:required', false);
                    this.ui.informationStatement.trigger('control:hidden', true);
                    this.ui.visDateOffered.trigger('control:hidden', true);
                    this.ui.visDateOffered.trigger('control:required', false);

                    if($(this.ui.informationSource).find('#informationSource').is(':disabled')){
                        this.ui.administrationDate.trigger('control:disabled', true);
                    }else {
                        this.ui.administrationDate.trigger('control:disabled', false);
                    }

                    this.$(this.ui.administeredBy.selector).parent().removeClass('col-xs-5').addClass('col-xs-3');
                    this.$(this.ui.orderedBy.selector).parent().removeClass('col-xs-5').addClass('col-xs-3');
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
            'change:informationStatement': function() {
                var informationStatementArray = this.model.get('informationStatement');
                if(this.model.get('administeredHistorical') === 'administered'){
                    if (_.isUndefined(informationStatementArray) || (informationStatementArray.length === 1 && informationStatementArray[0] === '')) {
                        this.ui.visDateOffered.trigger('control:required', false);
                    } else {
                        this.ui.visDateOffered.trigger('control:required', true);
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
            'change:administrationDate': function(){
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
                self.ui.informationStatement.trigger('control:picklist:set', [ParseUtil.getInformationStatementList(immunization.get('vaccineInfoStmt'), self.informationStatements)]);
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
            this.ui.orderedBy.trigger('control:disabled', disabled);
            this.ui.administeredLocation.trigger('control:disabled', disabled);
            this.ui.routeOfAdministration.trigger('control:disabled', disabled);
            this.ui.anatomicLocation.trigger('control:disabled', disabled);
            this.ui.dosage.trigger('control:disabled', disabled);
            this.ui.series.trigger('control:disabled', disabled);
            this.ui.informationStatement.trigger('control:disabled', disabled);
            this.ui.visDateOffered.trigger('control:disabled', disabled);
            this.ui.comments.trigger('control:disabled', disabled);

            if(this.model.get('administeredHistorical') === 'historical'){
                this.ui.administrationDate.trigger('control:disabled', disabled);
            }
        },
        handlePreselectedVisit: function(){
            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

            if(!visit.existingVisit && visit.newVisit && visit.newVisit.isHistorical){
                this.model.set('administeredHistorical', 'historical');
                this.ui.administeredHistorical.trigger('control:disabled', true);
            }
        },
        handleAdministrationDate: function(isAdministered){
            if(isAdministered){
                this.model.set('previousHistoricalAdministrationDate', this.model.get('administrationDate'));
                var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                var unformattedDate = !visit.existingVisit && visit.newVisit ? visit.newVisit.dateTime : visit.dateTime;

                if(unformattedDate){
                    var visitDate = moment(unformattedDate.substring(0, 8), 'YYYYMMDDhhmm').format('MM/DD/YYYY');
                    this.model.set('administrationDate', visitDate);
                }

                this.ui.administrationDate.trigger('control:disabled', true);
            } else {
                if(this.model.get('histCancel')){
                    this.model.set('administrationDate', formModel.get('previousHistoricalAdministrationDate'));
                    this.model.set('histCancel', false);
                }else if(this.model.get('administrationDate')){
                    this.model.unset('administrationDate', {silent: true});
                    $(this.ui.administrationDate).find('#administrationDate').data('datepicker').clearDates();
                }
            }
        }
    });

    var CloseMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you close this task. Would you like to proceed?'),
        tagName: 'p'
    });

    var CloseFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                this.getOption('workflow').close();
                WritebackUtil.unregisterNavigationCheck();
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

                 var orderedBy = formModel.get('orderedBy');
                 if(orderedBy){
                    var validProvider = orderingProviders.findWhere({uid: orderedBy});

                    if(!validProvider){
                        formModel.unset('orderedBy');
                    }
                 }

                formModel.unset('lotNumberAdministered');
                formModel.unset('lotNumberHistorical');
                formModel.unset('visDateOffered');
                formModel.unset('informationStatement');
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
                    title: 'What would you prefer?',
                    icon: 'fa-exclamation-triangle font-size-18 color-red',
                    messageView: preserveAdmMessageView,
                    footerView: preserveAdmFooterView
                });
                preserveAdmView.show();
            }else{
                var preserveHistView = new ADK.UI.Alert({
                    title: 'What would you prefer?',
                    icon: 'fa-exclamation-triangle font-size-18 color-red',
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
        formModel.unset('informationStatement');
        formModel.unset('administeredLocation');
        formModel.unset('comments');
        formModel.unset('series');
        formModel.unset('routeOfAdministration');
        formModel.unset('orderedBy');
        formModel.unset('anatomicLocation');
        formModel.unset('dosage');
        formModel.unset('informationSource');
        formModel.unset('manufacturerHistorical');
        formModel.unset('expirationDateHistorical');
    }

    function isDirtyForm(){

        var isDirty =   (!_.isUndefined(formModel.get('comments')) && (formModel.get('comments') !== "") ) ||
                        (!_.isUndefined(formModel.get('routeOfAdministration')) && (formModel.get('routeOfAdministration') !== "") ) ||
                        (!_.isUndefined(formModel.get('orderedBy')) && (formModel.get('orderedBy') !== "") ) ||
                        (!_.isUndefined(formModel.get('anatomicLocation')) && (formModel.get('anatomicLocation') !== "") ) ||
                        (!_.isUndefined(formModel.get('series')) && (formModel.get('series') !== "") ) || 
                        (!_.isUndefined(formModel.get('informationSource')) && (formModel.get('informationSource') !== "") ) ||
                        (!_.isUndefined(formModel.get('lotNumberHistorical')) && (formModel.get('lotNumberHistorical') !== "") ) ||
                        (!_.isUndefined(formModel.get('manufacturerHistorical')) && (formModel.get('manufacturerHistorical') !== "") ) ||
                        (!_.isUndefined(formModel.get('administeredBy')) && (formModel.get('administeredBy') !== "") ) ||
                        (!_.isUndefined(formModel.get('administeredLocation')) && (formModel.get('administeredLocation') !== "")  );

        return isDirty;
    }

    function handleOperationalDataRetrievalComplete(form, type){
        if(type === 'informationStatements'){
            form.informationStatementRequestCompleted = true;
        } else if(type === 'lotNumbers'){
            form.lotNumberRequestCompleted = true;
        } else if(type === 'immunizationTypes'){
            form.immunizationTypeRequestCompleted = true;
        }

        if(form.informationStatementRequestCompleted && form.lotNumberRequestCompleted && form.immunizationTypeRequestCompleted){
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
    }

    function select2_search ($el, term) {
      $el.select2('open', {term: term, skipFetch: true});
    }

    var orderingProviders;

    function retrievePickListData(form) {
        var lotNumbers = new ADK.UIResources.Picklist.Immunizations.LotNumbers();
        form.listenTo(lotNumbers, 'read:success', function(collection, response){
            _.each(collection.models, function(model){
                model.set('label', model.get('lotNumber'));
                model.set('value', model.get('lotNumber') + ';' + model.get('ien'));
            });
            form.lotNumbers = collection;
            handleOperationalDataRetrievalComplete(form, 'lotNumbers');
        });
        lotNumbers.fetch();

        var informationStatements = new ADK.UIResources.Picklist.Immunizations.InformationStatements();
        form.listenTo(informationStatements, 'read:success', function(collection, response){
            _.each(collection.models, function(model){
                model.set('label', ParseUtil.getFormattedVisName(model));
                model.set('value', model.get('ien'));
            });
            form.informationStatements = collection;
            handleOperationalDataRetrievalComplete(form, 'informationStatements');
        });
        informationStatements.fetch();

        var immunizationTypes = new ADK.UIResources.Picklist.Immunizations.Data();
        form.listenTo(immunizationTypes, 'read:success', function(collection, response){
            _.each(collection.models, function(model){
                model.set('label', model.get('name'));
                model.set('value', model.get('ien'));
            });
            form.ui.immunizationType.trigger('control:picklist:set', collection);
            handleOperationalDataRetrievalComplete(form, 'immunizationTypes');
        });
        immunizationTypes.fetch();
        form.immunizationTypes = immunizationTypes;

        var informationSources = new ADK.UIResources.Picklist.Immunizations.InformationSources();
        form.listenTo(informationSources, 'read:success', function(collection, response){
            form.ui.informationSource.trigger('control:picklist:set', [ParseUtil.getInformationSourceList(collection.toPicklist())]);
        });
        informationSources.fetch();

        var manufacturers = new ADK.UIResources.Picklist.Immunizations.Manufacturers();
        form.listenTo(manufacturers, 'read:success', function(collection, response){
            form.ui.manufacturerHistorical.trigger('control:picklist:set', [collection.toPicklist()]);
        });
        manufacturers.fetch();

        var site = ADK.UserService.getUserSession().get('site');
        var providersfetchOptions = {
            resourceTitle: "visits-providers",
            onSuccess: function(collection, response) {
                orderingProviders = collection;
                form.ui.orderedBy.trigger('control:picklist:set', [ParseUtil.getOrderingProviderList(response)]);
            },
            criteria: {
                "facility.code": site
            }
        };
        ADK.ResourceService.fetchCollection(providersfetchOptions);

        var administeredByCollection = new ADK.UIResources.Picklist.Encounters.NewPersons();
        form.listenTo(administeredByCollection, 'read:success', function(collection, response){
            form.administeringProviderList = collection.toPicklist();
            form.ui.administeredBy.trigger('control:picklist:set', [form.administeringProviderList]);

            var currentUser = ParseUtil.findUser(collection, ADK.UserService.getUserSession());
            if (currentUser) {
                form.$(form.ui.administeredByInput.selector).typeahead('val', currentUser.get('name'));
                form.model.set('administeredBy', currentUser.get('code') + ';' + currentUser.get('name'), {
                    silent: true
                });
            }
        });
        administeredByCollection.fetch();

        var anatomicLocations = new ADK.UIResources.Picklist.Immunizations.AnatomicLocations();
        form.listenTo(anatomicLocations, 'read:success', function(collection, response){
            form.ui.anatomicLocation.trigger('control:picklist:set', [collection.toPicklist()]);
        });
        anatomicLocations.fetch();

        var routesOfAdministration = new ADK.UIResources.Picklist.Immunizations.RoutesOfAdministration();
        form.listenTo(routesOfAdministration, 'read:success', function(collection, response){
            form.ui.routeOfAdministration.trigger('control:picklist:set', [collection.toPicklist()]);
        });
        routesOfAdministration.fetch();
    }

    return formView;
});