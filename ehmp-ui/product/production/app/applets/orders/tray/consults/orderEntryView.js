define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/order.consult/eventHandler',
    'app/applets/orders/writeback/consults/consultUtils',
    'app/applets/orders/writeback/consults/formFields',
    'hbs!app/applets/orders/writeback/consults/instructionsTemplate',
    'app/applets/lab_results_grid/appletHelpers',
    'app/applets/problems/applet',
    'app/applets/lab_results_grid/applet'
], function(Backbone, Marionette, _, Handlebars, moment, Utils, EventHandler, ConsultUtils, FormFields, InstructionsTemplate, LabGridHelper) {
    "use strict";

    // Initialize the view for the notificiation
    var AlertItemView, AlertFooterItemView, alertView;

    function initAlert() {
        AlertItemView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile([
                '<p>Complete the Emergent Order or change the assigned urgency to something other than Emergent.</p>'
            ].join('\n'))
        });

        AlertFooterItemView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile([
                '{{ui-button "OK" classes="btn-primary btn-sm alert-continue" title="Press enter to close"}}'
            ].join('\n')),
            events: {
                'click button': function() {
                    ADK.UI.Alert.hide();
                }
            }
        });

        alertView = new ADK.UI.Alert({
            title: "Alert",
            icon: "icon-circle-exclamation",
            messageView: AlertItemView,
            footerView: AlertFooterItemView
        });

        alertView.show();
    }

    function initLabModalAlert(string) {
        AlertItemView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile([
                string
            ].join('\n'))
        });

        AlertFooterItemView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile([
                '{{ui-button "Ok" classes="btn-primary alert-continue" title="To continue, click Ok"}}'
            ].join('\n')),
            events: {
                'click button': function() {
                    ADK.UI.Alert.hide();
                }
            }
        });

        alertView = new ADK.UI.Alert({
            title: "Alert",
            icon: "icon-warning-severe",
            messageView: AlertItemView,
            footerView: AlertFooterItemView
        });

        alertView.show();
    }

    function getIntentResult(intentLabel, allResults) {

        // FIND the result of the targeted (label) intent
        var intentResult = _.find(allResults, function(m) {
            return m.get('label') === intentLabel;
        });
        return intentResult;
    }

    var ProvideTaskModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            this.errorModel.clear();

            var earliestDate = this.get('earliestDate');
            var latestDate = this.get('latestDate');
            var urgency = this.get('urgency');
            var consultName = this.get('consultName');

            if ($.trim(consultName) === '') {
                this.errorModel.set({
                    consultName: 'Consult name is required'
                });
            }

            if ($.trim(urgency) === '') {
                this.errorModel.set({
                    urgency: 'Urgency is required'
                });
            }

            if ($.trim(earliestDate) === '') {
                this.errorModel.set({
                    earliestDate: 'Earliest date is required'
                });
            }

            if ($.trim(latestDate) === '') {
                this.errorModel.set({
                    latestDate: 'Latest date is required'
                });
            }

            if (moment(earliestDate).isAfter(latestDate)) {
                this.errorModel.set({
                    earliestDate: 'Earliest date cannot be after latest date'
                });
            }

            if (moment(latestDate).isBefore(earliestDate)) {
                this.errorModel.set({
                    latestDate: 'Latest date cannot be before earliest date'
                });
            }

            var destinationFacility = this.get('destinationFacility');
            if (!destinationFacility) {
                this.errorModel.set({
                    destinationFacility: 'Select a location for consult'
                });
            }

            if (!_.isEmpty(this.errorModel.toJSON()))
                return "Validation errors. Please fix.";
        }
    });

    var ProvideTaskForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: FormFields.orderEntryFields,
        modelEvents: {
            'change:consultName': 'onConsultNameChange',
            'change': 'updateFormFields',
            'change:instructions': 'onInstructionsChange'
        },
        updateFormFields: function() {
            this.showOverRide();
            this.showOrderResultComment();
            this.onModelChange();
        },
        onInstructionsChange: function() {

            if (!this.model.has('instructions') || $.trim(this.model.get('instructions')) === '') {
                this.ui.instructionsContainer.hide();
            } else {
                this.ui.instructionsContainer.show();
            }
        },
        // Based on the dates selected, update the urgency
        updateUrgency: function(e) {
            this.stopListening(this.model, 'change:urgency');
            // the difference between the dates in days
            var delta = moment(this.model.get('latestDate'))
                .diff(moment(this.model.get('earliestDate')), 'days');
            if (isNaN(delta)) {
                return 0;
            }
            Utils.resetFields.call(this, ['acceptingProvider']);

            // Change the urgency value based on days
            if (delta <= 1) {
                this.model.set('urgency', '2');
                Utils.activateField.call(this, 'acceptingProvider');
            } else if (delta <= 7) {
                this.model.set('urgency', '4');
            } else {
                this.model.set('urgency', '9');
            }

            this.listenTo(this.model, 'change:urgency', this.updateDates);
        },
        ui: {
            'overrideReason': '.textarea-control.overrideReason',
            'orderResultComment': '.control.textarea-control.orderResultComment',
            'preReqOrders': '.preReqOrders',
            'inputPreReqOrders': '.control.selectList-control.preReqOrders',
            'preReqQuestions': '.preReqQuestions',
            'inputPreReqQuestions': '.control.selectList-control.preReqQuestions',
            'prereqFieldset': '.prereqFieldset',
            'beginWorkupButton': '#consult-add-begin-workup-button',
            'acceptButton': '#consult-add-accept-button',
            'draftButton': '#consult-add-save-button',
            'consultName': '.control.select-control.consultName',
            'restOfTheForm': '.the_rest_of_the_form',
            'instructions': '[data-instructions]',
            'instructionsContainer': '.instructions-container',
            'destinationFacility': '.control.select-control.destinationFacility',
            'acceptingProvider': '.control.select-control.acceptingProvider',
            'condition': '.control.select-control.condition',
            'consultAddDeleteButton': '.consultAddDeleteButton button',
            'errorMessage': '.errorMessage',
            'urgency': '.control.select-control.urgency',
            'earliestDate': '.control.datepicker-control.earliestDate',
            'latestDate': '.control.datepicker-control.latestDate'
        },
        blockUI: function(trayLoaderMessage) {
            var self = this;
            this.model.set('inProgressMessage', 'Loading..');
            this.$el.trigger('tray.loaderShow', {
                loadingString: (_.isUndefined(trayLoaderMessage) ? 'Loading' : trayLoaderMessage)
            });
        },
        unBlockUI: function() {
            this.model.unset('inProgressMessage');
            this.$el.trigger('tray.loaderHide');
        },
        onConsultNameChange: function(model, value, options) {
            var val = $.trim(value);
            var previousConsultName = model.previous('consultName');
            model.set('specialty', val);

            this.$('#consult-add-save-button').attr('disabled', false);
            if (!val) {
                this.$('#consult-add-save-button').attr('disabled', true);
            } else if (val !== '' && this.ui.restOfTheForm.is(':hidden')) {
                this.ui.restOfTheForm.show();
            }

            if ((previousConsultName) || (!previousConsultName && !this.taskModel && !this.isFromOrdersSearchBar && !this.draftActivity)) {
                ConsultUtils.retrievePreReqs.call(this);
            }
            this.$el.find('#select2-consultName-container').closest('.select2-selection').focus();
        },
        showOrderResultComment: function() {
            var satisfiedPreReqOrders;

            satisfiedPreReqOrders = this.model
                .get('preReqOrders')
                .groupBy(function(model) {
                    return model.get('value');
                });

            if (satisfiedPreReqOrders.hasOwnProperty('Satisfied')) {
                this.ui.orderResultComment.trigger('control:hidden', false);
            } else {
                this.ui.orderResultComment.trigger('control:hidden', true);
            }
        },
        showOverRide: function(obj) {
            var overridePreReqQuestions;
            var overridePreReqOrders;


            overridePreReqQuestions = this.model.get('preReqQuestions');
            overridePreReqQuestions = overridePreReqQuestions.find(findOveride);

            overridePreReqOrders = this.model.get('preReqOrders');
            overridePreReqOrders = overridePreReqOrders.find(findOveride);

            if (overridePreReqOrders || overridePreReqQuestions) {
                this.ui.overrideReason.trigger('control:hidden', false);
            } else {
                this.ui.overrideReason.trigger('control:hidden', true);
            }

            function findOveride(model) {
                return model.get('value') === 'Override';
            }
        },
        showPreReqs: function() {
            var questions = this.model.get('preReqQuestions').length;
            var orders = this.model.get('preReqOrders').length;

            if (!questions) {
                this.ui.preReqQuestions.hide();
            } else {
                this.ui.preReqQuestions.show();
            }

            if (!orders) {
                this.ui.preReqOrders.hide();
            } else {
                this.ui.preReqOrders.show();
            }

            if (!questions && !orders) {
                this.ui.prereqFieldset.hide();
            } else {
                this.ui.prereqFieldset.show();
            }

            this.showOverRide();
            this.showOrderResultComment();
            this.checkForLabResults();
        },
        // Update the datepickers based on the urgency
        updateDates: function() {
            this.stopListening(this.model, 'change:earliestDate change:latestDate');
            Utils.resetFields.call(this, ['acceptingProvider']);
            var urgency = this.model.get('urgency');
            if (!urgency) {
                this.listenTo(this.model, 'change:earliestDate change:latestDate', this.updateUrgency);
                return;
            }

            urgency = urgency && urgency.toLowerCase();
            var date = moment();

            if (ConsultUtils.isEmergent(urgency)) {
                Utils.activateField.call(this, 'acceptingProvider');
                this.setDates(date.format('L'), date.add(24, 'h').format('L'));
            } else if (ConsultUtils.isUrgent(urgency)) {
                this.setDates(date.format('L'), date.add(7, 'd').format('L'));
            } else if (ConsultUtils.isRoutine(urgency)) {
                this.setDates(date.format('L'), date.add(30, 'd').format('L'));
            }
            this.listenTo(this.model, 'change:earliestDate change:latestDate', this.updateUrgency);
        },
        // Set the dates for the earliest and latest date fields
        setDates: function(earliestDate, latestDate) {
            this.model.set({
                'earliestDate': earliestDate,
                'latestDate': latestDate
            });

        },
        onInitialize: function(options) {
            var alertError = new ADK.UI.Notification({
                title: 'There was an error loading this draft.',
                type: 'error'
            });

            var self = this;
            if (this.model.errorModel) {
                this.model.errorModel.clear();
            }

            if (this.taskModel) {
                EventHandler.claimTask(this.model);
            }

        },
        registerChecks: function() {
            var checkOptions = {
                id: "consult-order-writeback-in-progress",
                label: 'Consult Order',
                failureMessage: 'Consult Order Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function() {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)
            ]);
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'consult-order-writeback-in-progress'
            });
        },
        onDestroy: function() {
            this.unregisterChecks();
            this.$el.trigger('tray.loaderHide');
        },
        onRender: function(e) {
            this.updateFormForEdit();

            this.listenToOnce(ADK.Messaging.getChannel('loadConsult'), 'visit:ready', function() {
                var taskVar = {};
                var model = this.model;

                // Disable consult name from being editable if coming from draft or process
                if (this.draftActivity || this.taskModel) {
                    this.ui.consultName.trigger('control:disabled', true);
                }

                if (_.get(this.model.toJSON(), 'name') === 'Accept') {
                    this.ui.draftButton.trigger('control:disabled', true);
                    this.ui.beginWorkupButton.trigger('control:disabled', true);
                }

                if (!this.taskModel && !this.draftActivity) {
                    this.$(this.ui.consultAddDeleteButton.selector).attr('disabled', true);
                }

                taskVar = model.toJSON();

                var specialty;
                var key;
                var consultNameList;
                if (!this.isFromOrdersSearchBar && !this.taskModel && !this.draftActivity) {
                    this.ui.restOfTheForm.hide();
                    this.ui.draftButton.trigger('control:disabled', true);
                }

                ConsultUtils.fetchInitialResources.call(this);

                // Initialize the form fields from model
                var date = moment();

                Utils.onEntryViewRender.call(this, date, taskVar);

                this.listenTo(ADK.Messaging, 'retrievePreReqs:' + this.cid, this.retrievePreReqs);
                this.listenTo(ADK.Messaging, 'retrieveConsultNames:' + this.cid, this.retrieveConsultNames);
                this.listenTo(this.model, 'change:earliestDate change:latestDate', this.updateUrgency);
                this.listenTo(this.model, 'change:urgency', this.updateDates);

                this.listenTo(ADK.Messaging.getChannel('consultOrder'), 'getLabOrdersUID', function(obj) {
                    this.$el.data(obj.lab, obj.collection.at(0).toJSON());

                });

                this.listenTo(ADK.Messaging.getChannel('consultOrder'), 'showLabModel', function(obj) {
                    obj.model.set('chart', true);
                    ADK.Messaging.getChannel('lab_results_grid').trigger('detailView', {
                        model: obj.model
                    });
                });

                this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
            });
        },
        onAttach: function() {
            if (this.ui.consultName.is(':visible') && _.isEqual(this.model.get('inProgressMessage'), 'Loading..')) {
                this.$el.trigger('tray.loaderShow', {
                    loadingString: 'Loading'
                });
            }

            if (!this.model.has('urgency')) {
                this.model.set('urgency', '9');
            }
        },
        retrieveConsultNames: function(collection) {
            this.ui.consultName.trigger('control:picklist:set', [collection]);
            var consultName;
            if (this.taskModel || this.isFromOrdersSearchBar || this.draftActivity) {
                this.ui.consultName.find('select').trigger('change.select2');
            }
        },
        retrievePreReqs: function(collection) {
            var self = this;
            var model = collection.at(0);

            if (model.has('questions')) {
                this.model.get('preReqQuestions').reset(model.get('questions'));
            } else {
                this.model.get('preReqQuestions').reset();
            }

            if (model.has('orders')) {
                // preReqOrders gets updated
                this.model.get('preReqOrders').reset(model.get('orders'));
            } else {
                this.model.get('preReqOrders').reset();
            }

            this.showPreReqs();

        },
        events: {
            'consult-add-confirm-delete': function(e) {
                this.fireDelete();
            },
            'click #consult-add-save-button': 'fireSaveEvent',
            'click #consult-add-edit-save-button': 'fireSaveEvent',
            'click #consult-add-accept-button': 'fireAcceptEvent',
            'click #consult-add-begin-workup-button': 'fireBeginWorkupEvent',
            'consult-add-confirm-cancel': 'cancelOut',
            'click @ui.instructions': 'showInstructions',
            'click [data-label]': 'onClickDataLabel'
        },
        onClickDataLabel: function(e) {
            var intentResult = getIntentResult(this.$(e.currentTarget).data('label'), this.model.get('preReqOrders').models);

            if (intentResult.get('domain') === 'lab') {
                this.showLabResults(e);
            }
        },
        updateFormForEdit: function() {
            this.ui.consultName.trigger('control:hidden', this.showEdit);
            this.$el.find('.edit_order_header').trigger('control:hidden', !this.showEdit);
            this.$(this.ui.consultAddDeleteButton.selector).trigger('control:hidden', this.showEdit);
            this.$el.find('#consult-add-save-button').parent().trigger('control:hidden', this.showEdit);
            this.$el.find('#consult-add-begin-workup-button').parent().trigger('control:hidden', this.showEdit);
            this.$el.find('#consult-add-accept-button').parent().trigger('control:hidden', this.showEdit);
            this.$el.find('#consult-add-edit-save-button').parent().trigger('control:hidden', !this.showEdit);
        },
        checkForLabResults: function() {
            if (this.model.get('preReqOrders').length) {
                this.model.get('preReqOrders').each(ConsultUtils.getLabOrdersUID);
            }
        },
        showLabResults: function(e) {
            var label = this.$(e.currentTarget).data('label');
            var model = this.$el.data(label);
            if (_.isUndefined(model)) {
                initLabModalAlert('<p>This lab result can not be shown at this time.</p>');
                return;
            }

            var fetchOptions = {
                resourceTitle: 'patient-record-lab',
                criteria: {
                    filter: 'eq("typeCode", "' + model.type_code + '")',
                    limit: 1
                },
                cache: true,
                viewModel: {
                    parse: LabGridHelper.parseLabResponse
                },
                onSuccess: function(collection, response) {
                    ADK.Messaging.getChannel('consultOrder').trigger('showLabModel', {
                        model: collection.at(0)
                    });
                },
                onError: function() {
                    initLabModalAlert('<p>This lab result can not be shown at this time.</p>');
                }
            };

            ADK.PatientRecordService.fetchCollection(fetchOptions);
        },
        showInstructions: function() {
            var workflow = new ADK.UI.Workflow({
                title: 'Instructions',
                size: 'medium',
                steps: {
                    view: Backbone.Marionette.ItemView.extend({
                        template: InstructionsTemplate
                    }),
                    viewModel: new Backbone.Model({
                        instructions: this.model.get('instructions')
                    })
                }
            });

            workflow.show();
        },
        cancelOut: function(e) {
            EventHandler.closeModal(e);
        },
        activateAcceptButton: function(obj) {
            // Used locally to extract data from specific variables
            function extractUID(data) {
                if (typeof data === 'object' && data !== null) {
                    return $.trim(data.uid);
                } else {
                    return $.trim(data);
                }
            }

            var orderAns = this.model.get('preReqOrders').groupBy(function(model) {
                return model.get('value');
            });
            var quesAns = this.model.get('preReqQuestions').groupBy(function(model) {
                return model.get('value');
            });

            var question = $.trim(_.get(obj, 'requestReason', '')) !== '';
            var urgency = $.trim(_.get(obj, 'urgency', ''));
            var destinationFacility = extractUID(obj.destinationFacility);
            var hasAcceptingProvider = extractUID(obj.acceptingProvider) !== '';

            var baseCheck = question && destinationFacility;
            var result = false;

            if (urgency === '') {
                result = false;
            } else if (ConsultUtils.isEmergent(urgency)) {
                if (hasAcceptingProvider && baseCheck) {
                    result = true;
                }
            } else { // NOT EMERGENT
                var CDSNanValue = 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3';
                // Pass if there is no questions || there is no "no's" selected && none are left blank
                var quesPass = _.isEmpty(quesAns) ||
                    (!quesAns.hasOwnProperty(CDSNanValue) && !quesAns.hasOwnProperty('No') &&
                        !quesAns.hasOwnProperty('undefined') && !quesAns.hasOwnProperty(''));

                // Pass if there are no orders || nothing needs to be ordered && none are left blank
                var ordersPass = _.isEmpty(orderAns) ||
                    (!orderAns.hasOwnProperty('Order') && !orderAns.hasOwnProperty('Failed') &&
                        !orderAns.hasOwnProperty('undefined') && !orderAns.hasOwnProperty(''));

                //  Check that required override fields are populated
                var overridePass = !this.$('.control.textarea-control.overrideReason').is(':hidden') && $.trim(obj.overrideReason) !== '';
                // Pass if there are no pre-reqs || no "override" was selected || it is override compliant
                var overrideCompliant = (_.isEmpty(orderAns) && _.isEmpty(quesAns)) || (!quesAns.hasOwnProperty('Override') && !orderAns.hasOwnProperty('Override')) || overridePass;

                //  Check that required orderResultComment fields are populated
                var orderResultCommentPass = !this.$('.control.textarea-control.orderResultComment').is(':hidden') && $.trim(obj.orderResultComment) !== '';
                // Pass if there are no pre-reqs orders || no "satisfied" was selected || it is satisfied compliant
                var orderResultCommentCompliant = _.isEmpty(orderAns) || !orderAns.hasOwnProperty('Satisfied') || orderResultCommentPass;

                if (quesPass && ordersPass && overrideCompliant && orderResultCommentCompliant && baseCheck) {
                    result = true;
                }
            }

            return result;
        },
        activateWorkupButton: function(obj) {
            var CDSNanValue = 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3';
            var urgency = $.trim(obj.urgency);

            var isAcceptForm = _.get(obj, 'name') === 'Accept';
            var isInvalidUrgency = ConsultUtils.isEmergent(urgency) || urgency === '';

            // Cannot order labs on Accept form or urgency of Emergent
            if (isAcceptForm || isInvalidUrgency) {
                return false;
            }

            // Required fields
            var override = this.$('.control.textarea-control.overrideReason');
            var isOverrideCompliant = override.is(':hidden') || $.trim(obj.overrideReason) !== '';

            var orderResultComment = this.$('.control.textarea-control.orderResultComment');
            var isOrderResultCommentCompliant = orderResultComment.is(':hidden') || $.trim(obj.orderResultComment) !== '';

            var isRequestCompliant = $.trim(obj.requestReason) !== '';
            var isDestinationFacilityCompliant = $.trim(obj.destinationFacility) !== '';

            var ques = obj.preReqQuestions.groupBy(function(model) {
                return model.get('value');
            });
            var isQuesCompliant = !ques.hasOwnProperty(CDSNanValue) &&
                !ques.hasOwnProperty('No') && !ques.hasOwnProperty('undefined') && !ques.hasOwnProperty('');

            var orders = obj.preReqOrders.groupBy(function(model) {
                return model.get('value');
            });
            var isOrdersCompliant = !orders.hasOwnProperty('Failed') &&
                !orders.hasOwnProperty('') && !orders.hasOwnProperty('undefined');

            // Activation logic
            var isAllReqFields = isOverrideCompliant && isOrderResultCommentCompliant && isRequestCompliant && isDestinationFacilityCompliant;
            var isAllPreReqs = isQuesCompliant && isOrdersCompliant;

            if (isAllReqFields && isAllPreReqs) {
                return true;
            }
            return false;
        },
        onModelChange: function() {
            this.$('#earliestDate').trigger('control:endDate', this.model.get('latestDate'));
            this.$('#latestDate').trigger('control:startDate', this.model.get('earliestDate'));
            this.$el.find('#consult-add-begin-workup-button').parent().trigger('control:disabled', true);
            this.$el.find('#consult-add-accept-button').parent().trigger('control:disabled', true);
            this.$el.find('#consult-add-edit-save-button').parent().trigger('control:disabled', true);

            var consultName = $.trim(this.model.get('consultName'));

            if (consultName === '') {
                return;
            }

            if (this.activateAcceptButton(this.model.toJSON())) {
                this.$el.find('#consult-add-accept-button').parent().trigger('control:disabled', false);
                this.$el.find('#consult-add-edit-save-button').parent().trigger('control:disabled', false);
            } else if (this.activateWorkupButton(this.model.toJSON())) {
                this.$el.find('#consult-add-begin-workup-button').parent().trigger('control:disabled', false);
                this.$el.find('#consult-add-edit-save-button').parent().trigger('control:disabled', false);
            }
        },
        onShow: function() {
            var self = this;
            this.onModelChange();
            this.showPreReqs();
            this.onInstructionsChange();

            if (this.showEdit && ConsultUtils.isEmergent(this.model.get('urgency') + '')) {
                this.ui.urgency.trigger('control:disabled', true);
                this.ui.earliestDate.trigger('control:disabled', true);
                this.ui.latestDate.trigger('control:disabled', true);
            }
        },
        fireDelete: function(e) {
            this.blockUI('Deleting');
            EventHandler.deleteTask(e, this.model);
        },
        fireSaveEvent: function(e) {
            if (this.showEdit) {
                if (!this.model.isValid()) {
                    return;
                }
            }
            var isPreWorkup = this.model.get('subState') === 'Pre-order Workup';
            if (ConsultUtils.isEmergent(this.model.get('urgency')) && !isPreWorkup) {
                initAlert();
            } else {
                this.blockUI(this.showEdit ? 'Editing' : 'Drafting');
                if (this.draftActivity) {
                    var self = this;
                    var params;
                    var trayResetFnc = function() {
                        self.$el.trigger('tray.reset');
                    };

                    if (this.showEdit) {
                        // Save for non-draft EDIT
                        var processInstanceId = Number(this.draftActivity.processInstanceId) || null;
                        params = EventHandler.editParamHelper(this);
                        return EventHandler.sendSignalPost(e, this.draftActivity.deploymentId, processInstanceId, params, 'EDIT', trayResetFnc);
                    }
                    // Save for Drafts
                    this.model.set('sendActivitySignal', true);
                    params = EventHandler.paramHelper(this, 'saved');
                    params = {
                        out_order: params.consultOrder
                    };

                    EventHandler.sendSignal(e, this.model, params, 'EDIT', trayResetFnc);

                } else if (this.taskModel) {
                    this.model.set('sendActivitySignal', true);
                    EventHandler.saveTask.call(this, e);
                } else {
                    EventHandler.startConsult(e, this, 'saved');
                }
            }
        },
        fireAcceptEvent: function(e) {
            this.model.unset('errorMessage');

            if (!this.model.isValid()) {
                return;
            }

            /*
             * If urgency equal 'emergent' and there are orders to be placed, place the orders and allow the accept event to be fired.
             */

            if (ConsultUtils.isEmergent(this.model.get('urgency')) + '' && _.get(this.model.toJSON(), 'name') !== 'Accept') {

                var orderAns = this.model.get('preReqOrders').groupBy(function(model) {
                    return model.get('value');
                });

                var ordersPass = _.isEmpty(orderAns) ||
                    !orderAns.hasOwnProperty('Order');

                if (!ordersPass) {
                    ConsultUtils.prepareOrdersTobePlaced.call(this, 'acceptEvent');
                } else {

                    this.acceptEvent(e);
                }
            } else {
                this.acceptEvent(e);
            }
        },
        acceptEvent: function(e) {
            this.blockUI('Accepting');
            if (this.draftActivity) {

                var self = this;

                this.model.set('sendActivitySignal', true);
                var params = EventHandler.paramHelper(this, 'accepted');
                params = {
                    out_order: params.consultOrder
                };

                EventHandler.sendSignal(e, this.model, params, 'EDIT', function() {
                    self.$el.trigger('tray.reset');
                });

            } else if (this.taskModel) {
                EventHandler.completeTask.call(this, e, 'accepted');
            } else {
                EventHandler.startConsult(e, this, 'accepted');
            }
        },
        fireBeginWorkupEvent: function(e) {
            if (!this.model.isValid()) {
                return;
            }
            ConsultUtils.prepareOrdersTobePlaced.call(this, 'ordersHaveBeenPlaced');
        },
        ordersHaveBeenPlaced: function(e) {
            if (this.draftActivity || this.taskModel) {
                this.model.set('sendActivitySignal', true);
                EventHandler.beginWorkup.call(this, e);
            } else {
                EventHandler.startConsult(e, this, 'workup');
            }
        },
        ordersError: function() {
            this.unBlockUI();
            AlertItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '<p>There was an error with placing an order/orders for this consult.</p>'
                ].join('\n'))
            });

            AlertFooterItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '{{ui-button "Ok" classes="btn-primary alert-continue" title="Press enter to close"}}'
                ].join('\n')),
                events: {
                    'click button': function() {
                        ADK.UI.Alert.hide();
                    }
                }
            });

            alertView = new ADK.UI.Alert({
                title: "Error",
                icon: "icon-circle-exclamation",
                messageView: AlertItemView,
                footerView: AlertFooterItemView
            });

            alertView.show();
        }
    });

    return {
        form: ProvideTaskForm,
        model: ProvideTaskModel
    };
});
