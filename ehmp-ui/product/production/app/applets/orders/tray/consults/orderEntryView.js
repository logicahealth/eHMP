define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/orders/writeback/consults/consultUtils',
    'app/applets/orders/writeback/consults/formFields',
    'hbs!app/applets/orders/writeback/consults/instructionsTemplate',
    'app/applets/problems/applet'
], function(Backbone, Marionette, _, Handlebars, Utils, EventHandler, ConsultUtils, FormFields, InstructionsTemplate) {
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

    var ProvideTaskModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            this.errorModel.clear();

            var earliestDate = this.get('earliestDate');
            var latestDate = this.get('latestDate');

            if (moment(earliestDate).isAfter(latestDate)) {
                this.errorModel.set({
                    earliestDate: 'The earliest date can not come after the latest date'
                });
            }

            if (moment(latestDate).isBefore(earliestDate)) {
                this.errorModel.set({
                    latestDate: 'The latest date can not come before the earliest date'
                });
            }

            if (!_.isEmpty(_.compact(this.errorModel.toJSON())))
                return "Validation errors. Please fix.";
        }
    });

    var ProvideTaskForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: FormFields.orderEntryFields,
        modelEvents: {
            'change:consultName': 'onConsultNameChange',
            'change': 'onModelChange showOverRide showOrderResultComment',
            'change:instructions': 'onInstructionsChange'
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
            'beginWorkupButton': '#modal-begin-workup-button',
            'acceptButton': '#modal-accept-button',
            'cancelButton': '#modal-cancel-button',
            'consultName': '.control.select-control.consultName',
            'restOfTheForm': '.the_rest_of_the_form',
            'instructions': '[data-instructions]',
            'instructionsContainer': '.instructions-container',
            'inProgressContainer': '.inProgressContainer',
            'destinationFacility': '.control.select-control.destinationFacility',
            'acceptingProvider': '.control.select-control.acceptingProvider',
            'condition': '.control.select-control.condition'
        },
        blockUI: function() {
            var self = this;
            this.model.set('inProgressMessage', 'Loading..');
            this.ui.inProgressContainer.trigger('control:hidden', false);
            this.$(':input')
                .each(function() {
                    var $this = $(this);
                    var $control = $this.parents('.control');
                    var data = $control.data() || $this.data();

                    var disabled = $this.attr('disabled');
                    if (data.hasOwnProperty('uiblock') || disabled === 'disabled') {
                        return;
                    }
                    if (disabled === undefined) {
                        disabled = 'undefined';
                    }
                    if ($control.length) {
                        $control.trigger('control:disabled', true).data('uiblock', disabled);
                    } else {

                        $this.attr('disabled', true).data('uiblock', disabled);
                    }

                });
        },
        unBlockUI: function() {
            this.model.unset('inProgressMessage');
            this.ui.inProgressContainer.trigger('control:hidden', true);
            this.$(':input')
                .each(function() {
                    var $this = $(this);
                    var $control = $this.parents('.control');
                    var data = $control.data() || $this.data();
                    var disabled = _.get(data, 'uiblock');

                    if (!data.hasOwnProperty('uiblock')) {
                        return;
                    }

                    if (disabled === 'undefined') {
                        if ($control.length) {
                            $control.trigger('control:disabled', false).removeData('uiblock');
                        } else {
                            $this.removeAttr('disabled').removeData('uiblock');
                        }
                    }
                });
        },
        onConsultNameChange: function(model, value, options) {
            var val = $.trim(value);
            var previousConsultName = model.previous('consultName');


            model.set('specialty', val);


            if (val !== '' && this.ui.restOfTheForm.is(':hidden')) {
                this.ui.restOfTheForm.show();
            }

            if ((previousConsultName) || (!previousConsultName && !this.taskModel && !this.isFromOrdersSearchBar && !this.isFromDraft)) {
                ConsultUtils.retrievePreReqs.call(this);
            }


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
        },
        // Update the datepickers based on the urgency
        updateDates: function() {
            this.stopListening(this.model, 'change:earliestDate change:latestDate');
            Utils.resetFields.call(this, ['acceptingProvider']);
            var urgency = this.model.get('urgency');
            if (!urgency) {
                return;
            }

            urgency = urgency && urgency.toLowerCase();
            var date = moment();

            if (urgency === '2') {
                Utils.activateField.call(this, 'acceptingProvider');
                this.setDates(date.format('L'), date.add(24, 'h').format('L'));
            } else if (urgency === '4') {
                this.setDates(date.format('L'), date.add(7, 'd').format('L'));
            } else if (urgency === '9') {
                this.setDates(date.format('L'), date.add(30, 'd').format('L'));
            }
            this.listenTo(this.model, 'change:earliestDate change:latestDate', this.updateUrgency);
        },
        // Set the dates for the earliest and latest date fields
        setDates: function(earliestDate, latestDate) {
            this.model.set('earliestDate', earliestDate);
            this.model.set('latestDate', latestDate);
        },
        onInitialize: function(options) {
            var self = this;
            if (this.model.errorModel) {
                this.model.errorModel.clear();
            }
            // this.fields = Fields.orderEntryFields(this.model);
            if (this.taskModel) {
                EventHandler.claimTask(this.model);
            }

            if (this.isFromDraft) {
                this.listenToOnce(this.model, 'sync', function(model, resp, options) {

                    this.consultName = model.get('consultName');
                    this.destinationFacility = model.get('destinationFacility');

                    if (model.has('questions') && model.get('questions').length) {
                        var preReqQues = FormFields.mapPreReqQuestions(model.get('questions'), {
                            'label': 'question',
                            'name': 'question',
                            'value': 'answer'
                        });

                        _.each(preReqQues, function(ques) {
                            ques.value = ConsultUtils.mapQuestionCode('getText', ques.value);
                        });


                        model.get('preReqQuestions').add(preReqQues);

                    }

                    if (model.has('orderResults') && model.get('orderResults').length) {
                        var preReqOrd = FormFields.mapPreReqOrders(model.get('orderResults'), {
                            'label': 'orderName',
                            'name': 'orderName',
                            'value': 'status'
                        });

                        model.get('preReqOrders').add(preReqOrd);
                        if (this.model.has('specialty') || this.model.has('consultName')) {
                            ConsultUtils.retrieveFacilities.call(this, true);
                        }

                    }
                    this.showPreReqs();
                    this.onInstructionsChange();

                });

                this.model.fetch();
            }


            this.providerHasBeenLoaded = false;
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
        },
        onRender: function(e) {
            this.listenToOnce(ADK.Messaging.getChannel('loadConsult'), 'visit:ready', function() {
                var taskVar = {};
                var model = this.model;



                // Disable consult name from being editable if coming from draft or process
                if (this.isFromDraft || this.taskModel) {
                    // this.ui.consultName.trigger('control:disabled', true);
                }
                if (_.get(this.model.toJSON(), 'name') === 'Accept') {
                    this.ui.inputPreReqOrders.trigger('control:disabled', true);
                    this.ui.inputPreReqQuestions.trigger('control:disabled', true);
                    this.$('#modal-begin-workup-button, #modal-save-button').attr('disabled', true);
                }

                if (!this.taskModel && !this.isFromDraft) {
                    this.$('#modal-delete-button').attr('disabled', true);

                }

                taskVar = model.toJSON();

                var specialty;
                var key;
                var consultNameList;
                if (!this.isFromOrdersSearchBar && !this.taskModel && !this.isFromDraft) {
                    this.ui.restOfTheForm.hide();
                }

                ConsultUtils.fetchInitialResources.call(this);


                // Initialize the form fields from model
                var date = moment();

                Utils.onEntryViewRender.call(this, date, taskVar);

                this.listenTo(ADK.Messaging, 'retrievePreReqs:' + this.cid, this.retrievePreReqs);
                this.listenTo(ADK.Messaging, 'retrieveConsultNames:' + this.cid, this.retrieveConsultNames);
                this.listenTo(this.model, 'change:earliestDate change:latestDate', this.updateUrgency);
                this.listenTo(this.model, 'change:urgency', this.updateDates);
                if (!this.model.has('urgency')) {
                    this.model.set('urgency', '9');
                }
                this.listenToOnce(this.model, 'change.inputted', this.registerChecks);

            });


        },
        retrieveConsultNames: function(collection) {
            this.ui.consultName.trigger('control:picklist:set', [collection]);
            var consultName;
            if (this.taskModel || this.isFromOrdersSearchBar || this.isFromDraft) {
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

            if (model.has('orders') && model.get('name') !== 'Physical Therapy Consult') {
                this.model.get('preReqOrders').reset(model.get('orders'));
            } else {
                this.model.get('preReqOrders').reset();
            }

            this.showPreReqs();

        },
        events: {
            'click #modal-delete-button': 'fireDelete',
            'click #modal-save-button': 'fireSaveEvent',
            'click #modal-accept-button': 'fireAcceptEvent',
            'click #modal-begin-workup-button': 'fireBeginWorkupEvent',
            'click @ui.cancelButton': 'cancelOut',
            'click @ui.instructions': 'showInstructions'
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
            var alert = new ADK.UI.Alert({
                title: 'Cancel',
                icon: "icon-cancel",
                messageView: Backbone.Marionette.ItemView.extend({
                    template: '<p>All unsaved changes will be lost. Are you sure you want to cancel?</p>'
                }),
                footerView: Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('{{ui-button "No" classes="btn btn-default" title="Press enter to go back"}} {{ui-button "Yes" classes="btn btn-primary" title="Press enter to cancel"}}'),
                    ui: {
                        'cancel': '.btn.btn-default',
                        'continue': '.btn.btn-primary'
                    },
                    events: {
                        'click @ui.cancel': 'cancel',
                        'click @ui.continue': 'continue'
                    },
                    cancel: function(e) {
                        ADK.UI.Alert.hide();
                    },
                    continue: function(e) {
                        ADK.UI.Alert.hide();
                        EventHandler.closeModal(e);
                    }
                })
            });
            alert.show();
        },
        activateAcceptButton: function(obj) {
            var orderAns = this.model.get('preReqOrders').groupBy(function(model) {
                return model.get('value');
            });
            var quesAns = this.model.get('preReqQuestions').groupBy(function(model) {
                return model.get('value');
            });


            var question = $.trim(obj.requestReason);
            var urgency = $.trim(obj.urgency);
            var acceptingProvider = $.trim(obj.acceptingProvider);
            var result = false;

            if (urgency === '') {
                return false;
            } else if (urgency === '2') {
                if (acceptingProvider && question) {
                    result = true;
                }
            } else { // NOT EMERGENT
                // Pass if there is no questions || there is no "no's" selected && none are left blank
                var quesPass = _.isEmpty(quesAns) ||
                    (!quesAns.hasOwnProperty('No') && !quesAns.hasOwnProperty('undefined') && !quesAns.hasOwnProperty(''));

                // Pass if there are no orders || nothing needs to be ordered && none are left blank
                var ordersPass = _.isEmpty(orderAns) ||
                    (!orderAns.hasOwnProperty('Order') && !orderAns.hasOwnProperty('undefined') && !orderAns.hasOwnProperty(''));

                //  Check that required override fields are populated
                var overridePass = !this.$('.control.textarea-control.overrideReason').is(':hidden') && $.trim(obj.overrideReason) !== '';
                // Pass if there are no pre-reqs || no "override" was selected || it is override compliant
                var overrideCompliant = (_.isEmpty(orderAns) && _.isEmpty(quesAns)) || (!quesAns.hasOwnProperty('Override') && !orderAns.hasOwnProperty('Override')) || overridePass;


                //  Check that required orderResultComment fields are populated
                var orderResultCommentPass = !this.$('.control.textarea-control.orderResultComment').is(':hidden') && $.trim(obj.orderResultComment) !== '';
                // Pass if there are no pre-reqs orders || no "satisfied" was selected || it is satisfied compliant
                var orderResultCommentCompliant = _.isEmpty(orderAns) || !orderAns.hasOwnProperty('Satisfied') || orderResultCommentPass;


                if (quesPass && ordersPass && overrideCompliant && orderResultCommentCompliant && question) {
                    result = true;
                }
            }

            return result;
        },
        activateWorkupButton: function(obj) {
            var urgency = $.trim(obj.urgency);
            if (urgency === '2' || urgency === '') {
                return false;
            }

            var override = this.$('.control.textarea-control.overrideReason');
            var orderResultComment = this.$('.control.textarea-control.orderResultComment');
            var isOverRideCompliant = override.is(':hidden') || $.trim(obj.overrideReason) !== '';
            var isOrderResultCommentCompliant = orderResultComment.is(':hidden') || $.trim(obj.orderResultComment) !== '';
            var nosQues = obj.preReqQuestions.find(function(model) {
                return model.get('value') === 'No' || !model.get('value');
            }) || false;
            var nosOrders = obj.preReqOrders.find(function(model) {
                return !model.get('value');
            }) || false;
            var isRequest = $.trim(obj.requestReason) !== '';

            if (_.get(obj, 'name') === 'Accept') {
                return false;
            }

            if (isOverRideCompliant && isOrderResultCommentCompliant && !nosQues && !nosOrders && isRequest) {
                return true;
            }

            return false;
        },
        onModelChange: function() {
            this.$('#earliestDate').datepicker('setEndDate', this.model.get('latestDate'));
            this.$('#latestDate').datepicker('startDate', this.model.get('earliestDate'));
            this.$el.find('#modal-begin-workup-button').parent().trigger('control:disabled', true);
            this.$el.find('#modal-accept-button').parent().trigger('control:disabled', true);

            if (this.activateAcceptButton(this.model.toJSON())) {
                this.$el.find('#modal-accept-button').parent().trigger('control:disabled', false);
            } else if (this.activateWorkupButton(this.model.toJSON())) {
                this.$el.find('#modal-begin-workup-button').parent().trigger('control:disabled', false);
            }
        },
        onShow: function() {
            var self = this;
            this.onModelChange();
            this.showPreReqs();
            this.onInstructionsChange();
        },
        onBeforeDestroy: function() {
            this.problemsCollection.reset();
            delete this.problemsCollection;
        },
        fireDelete: function(e) {
            this.blockUI();
            EventHandler.deleteTask(e, this.model);
        },
        fireSaveEvent: function(e) {
            if (!this.model.isValid()) {
                return;
            }
            if (this.model.get('urgency') === '2') {
                initAlert();
            } else {
                this.blockUI();
                if (this.isFromDraft) {
                    var self = this;

                    this.model.set('sendActivitySignal', true);
                    var params = EventHandler.paramHelper(this, 'saved');
                    params = {
                        out_order: params.consultOrder
                    };

                    EventHandler.sendSignal(e, this.model, params, 'EDIT', function() {
                        self.$el.trigger('tray.reset');
                    });

                } else if (this.taskModel) {
                    this.model.set('sendActivitySignal', true);
                    EventHandler.saveTask(e, this);
                } else {
                    EventHandler.startConsult(e, this, 'saved');
                }
            }
        },
        fireAcceptEvent: function(e) {
            if (!this.model.isValid()) {
                return;
            }

            /*
             * If urgency equal 'emergent' and there are orders to be placed, place the orders and allow the accept event to be fired.
             */

            if ((this.model.get('urgency') + '' === '2')) {

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
            this.blockUI();
            if (this.isFromDraft) {
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
                EventHandler.completeTask(e, this, 'accepted');
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
            if (this.isFromDraft || this.taskModel) {
                this.model.set('sendActivitySignal', true);
                EventHandler.beginWorkup(e, this);
            } else {
                EventHandler.startConsult(e, this, 'workup');
            }
        },
        ordersError: function() {
            AlertItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '<p>There was an error with placing an order/orders for this consult.</p>'
                ].join('\n'))
            });

            AlertFooterItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '{{ui-button "Ok" classes="btn-primary alert-continue" title="Press enter to continue"}}'
                ].join('\n')),
                events: {
                    'click button': function() {
                        ADK.UI.Alert.hide();
                    }
                }
            });

            alertView = new ADK.UI.Alert({
                title: "Alert",
                icon: "icon-error",
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