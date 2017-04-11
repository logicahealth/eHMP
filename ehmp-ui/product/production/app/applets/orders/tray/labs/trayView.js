define([
    'main/ADK',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/orders/viewUtils',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/writeback/labs/labUtils',
    'app/applets/orders/writeback/labs/formFields',
    'app/applets/orders/writeback/labs/formUtils',
    'app/applets/orders/behaviors/draftOrder'
], function(ADK, Backbone, Marionette, $, Handlebars, ViewUtils, Utils, LabUtils, FormFields, FormUtils, DraftBehavior) {
    "use strict";

    var FormModel = Backbone.Model.extend({
        defaults: {
            additionalComments: '',
            alertMessage: '',
            anticoagulant: '',
            availableLabTests: '',
            acceptDrpDwnContainer: '',
            collectionDateTime: '',
            collectionSample: '',
            collectionType: '',
            doneDate: '',
            drawTime: '',
            howLong: '',
            howOften: '',
            sampleDrawnAt: '',
            specimen: '',
            theoSection: '',
            urgency: '',
            activity: ''
        }
    });

    var formView = ADK.UI.Form.extend({
        model: FormModel,
        ui: {
            "inProgressContainer": ".inProgressContainer",
            "availableLabTests": ".availableLabTests",
            "urgency": ".urgency",
            "activity": ".activity",
            "howOften": ".howOften",
            "howLong": ".howLong",
            "collectionType": ".collectionType",
            "collectionDateTimePicklist": ".collectionDateTimePicklist",
            "collectionDate": ".collectionDate",
            "collectionTime": ".collectionTime",
            "specimen": ".specimen",
            "otherSpecimen": ".otherSpecimen",
            "otherSpecimenContainer": ".otherSpecimenContainer",
            "collectionSample": ".collectionSample",
            "otherCollectionSample": ".otherCollectionSample",
            "anticoagulant": ".anticoagulant",
            "sampleDrawnAt": ".sampleDrawnAt",
            "sampleDrawnAtContainer": ".sampleDrawnAtContainer",
            "additionalComments": ".additionalComments",
            "orderComment": ".orderComment",
            "doseContainer": ".doseContainer",
            "drawContainer": ".drawContainer",
            "urineVolume": ".urineVolume",
            "doseDate": ".doseDate",
            "doseTime": ".doseTime",
            "drawDate": ".drawDate",
            "drawTime": ".drawTime",
            "immediateCollectionContainer": ".immediateCollectionContainer",
            "immediateCollection": ".immediateCollection",
            "immediateCollectionDate": ".immediateCollectionDate",
            "immediateCollectionTime": ".immediateCollectionTime",
            "futureLabCollectTimesContainer": ".futureLabCollectTimesContainer",
            "futureLabCollectDate": ".futureLabCollectDate",
            "futureLabCollectTime": ".futureLabCollectTime",
            "futureLabCollectInProgress": ".futureLabCollectInProgress",
            "problemRelationship": ".problemRelationship",
            "acceptDrpDwnContainer": "#acceptDrpDwnContainer",
            "acceptButton": "#acceptDrpDwnContainer-accept",
            "acceptAddAnotherButton": "#acceptDrpDwnContainer-accept-add",
            "cancelButton": "#cancelButton",
            "saveButton": "#saveButton",
            "deleteButton": "#deleteButton",
            "errorMessage": ".errorMessage",
            "notificationDate": ".notificationDate",
            "dynamicFields": ".anticoagulant, .sampleDrawnAtContainer, .additionalComments, .orderComment, .urineVolume, .doseContainer, .drawContainer, .immediateCollectionContainer, .futureLabCollectTimesContainer, .otherSpecimenContainer, .otherCollectionSample",
            "dynamicRequiredFields": ".collectionDate, .collectionTime,.collectionDateTimePicklist, .otherCollectionSample, .otherSpecimen, .futureLabCollectDate, .futureLabCollectTime, .howLong, .immediateCollectionDate, .immediateCollectionTime, .sampleDrawnAt, .doseDate, .doseTime, .drawDate, .drawTime",
            "doseDrawDateTime": ".doseDate, .doseTime, .drawDate, .drawTime",
            "inputFields": ".urgency, .collectionType, .collectionDateTimePicklist, .collectionDate, .collectionTime, .otherSpecimen, .collectionSample, .otherCollectionSample, .anticoagulant, .sampleDrawnAt, .additionalComments, .immediateCollection, .immediateCollectionDate, .immediateCollectionTime, .orderComment, .urineVolume, .doseDate, .doseTime, .drawDate, .drawTime .notificationDate"
        },
        fields: FormFields,
        onInitialize: function() {
            this.listenToOnce(ADK.Messaging.getChannel('addOrders'), 'visit:ready', function() {
                LabUtils.retrieveLabSpecimens.apply(this);
                LabUtils.retrieveAllCollectionSamples.apply(this);
                LabUtils.retrieveAllSpecimens.apply(this);
                if (this.model.orderModel) {
                    //hard code semicolon and 1 for now
                    var orderId = this.model.orderModel.get('orderNumber') + ";1";
                    this.model.set('orderId', orderId);
                }
                LabUtils.retrieveOrderableItems.apply(this);
                LabUtils.retrieveCollectionTypesUrgencyAndSchedules.apply(this);
                LabUtils.retrieveProblemRelationships.apply(this);
                LabUtils.retrieveServerTime.apply(this);
            });
        },
        onRender: function() {
            this.enableFooterButtons(false);
            this.enableCancelButton(true);
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
        },
        onDestroy: function() {
            this.unregisterChecks();
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'lab-order-writeback-in-progress',
                label: 'Lab Order',
                failureMessage: 'Lab Order Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function(model) {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'lab-order-writeback-in-progress'
            });
        },
        events: {
            "click @ui.acceptButton": function(e) {
                this.ui.acceptDrpDwnContainer.text("Accept").trigger('click');
            },
            "click @ui.acceptAddAnotherButton": function(e) {
                this.ui.acceptDrpDwnContainer.text("Accept & Add Another").trigger('click');
            },
            "click @ui.cancelButton": function(e) {
                e.preventDefault();
                var closeAlertView = new ViewUtils.DialogBox({
                    title: 'Cancel',
                    message: 'All unsaved changes will be lost. Are you sure you want to cancel?',
                    confirmButton: 'Yes',
                    cancelButton: 'No',
                    confirmTitle: 'Press enter to cancel',
                    cancelTitle: 'Press enter to go back',
                    onConfirm: function() {
                        var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                        if (TrayView) {
                            TrayView.$el.trigger('tray.reset');
                        }
                    }
                });
                closeAlertView.show();
            },
            "click @ui.saveButton": function(e) {
                this.saveDraft();
            },
            "click @ui.deleteButton": function(e) {
                this.deleteDraft();
            },
            "submit": function(e) {
                e.preventDefault();
                this.submitForm();
                return false;
            }
        },
        submitForm: function() {
            this.model.unset('errorMessage');
            this.model.set('immediateCollectionIsComplete', true);
            if (this.model.isValid()) {
                this.enableInputFields(false);
                this.enableCancelButton(false);
                this.showInProgress('Validating...');
                this.ui.inProgressContainer.removeClass('hidden');
                this.enableFooterButtons(false);

                var dateTimeSelected = new Date(this.model.get('immediateCollectionDate') + ' ' + this.model.get('immediateCollectionTime')).toString('yyyyMMddHHmmss');

                var siteCode = ADK.UserService.getUserSession().get('site');
                var pid = ADK.PatientRecordService.getCurrentPatient().get("pid");

                if (this.model.get('collectionType') === 'I') {
                    var validDateTime = new ADK.UIResources.Writeback.Orders.LabSupportData();

                    this.listenTo(validDateTime, 'read:success', function(model, resp) {
                        if (!model.get('isValid')) {
                            this.model.set('errorMessage', '[Immediate Collection Times] - ' + model.get('validationMessage'));
                        }
                        this.checkServerSideValidations();
                    });

                    this.listenTo(validDateTime, 'read:error', function(model, resp) {
                        this.model.set('errorMessage', '[Immediate Collection Times] - Error occurred validating.');
                        this.checkServerSideValidations();
                    });

                    validDateTime.fetch({
                        params: {
                            type: 'lab-valid-immediate-collect-time',
                            timestamp: dateTimeSelected,
                            site: siteCode,
                            pid: pid,
                        }
                    });
                }
                else if (this.model.get('collectionType') === 'LC') {
                    var validDays = new ADK.UIResources.Writeback.Orders.LabSupportData();
                    this.listenTo(validDays, 'read:success', function(model, resp) {
                        var maxDays = model.get('maxDays');
                        var futureLabCollectDateTime = moment(this.model.get('futureLabCollectDate'));
                        var difference = futureLabCollectDateTime.diff(moment(), 'days');
                        if (difference >= maxDays) {
                            this.model.set('errorMessage', '[Lab Future Collect Days] - A lab collection cannot be ordered more than ' + maxDays + ' days in advance.');
                        }
                        this.checkServerSideValidations();
                    });

                    this.listenTo(validDays, 'read:error', function(model, resp) {
                        this.model.set('errorMessage', '[Lab Future Collect Days] - Error occurred validating.');
                        this.checkServerSideValidations();
                    });
                    var location;
                    if (ADK.PatientRecordService.getCurrentPatient().get('visit')) {
                        location = ADK.PatientRecordService.getCurrentPatient().get('visit').locationUid.split(':').pop();
                    }
                    validDays.fetch({
                        params: {
                            type: 'lab-future-lab-collects',
                            site: siteCode,
                            location: location,
                        }
                    });
                }
                else {
                    this.checkServerSideValidations();
                }
            }
        },
        checkServerSideValidations: function() {
            //Check for an occurrence of a server side error. If we don't check for the error, the
            //validation loop will spin out of control and never stop. Eventually, we can replace
            //this with the Deferred "fail()" check mechanism.
            if (this.model.get('serverSideError')) {
                return;
            }
            var errorMessage = this.model.get('errorMessage');
            if (errorMessage === undefined) {
                this.proceedToSave();
            } else {
                this.enableInputFields(true);
                this.hideInProgress();
                this.enableFooterButtons(true);
                this.enableCancelButton(true);
            }
        },
        onServerSideError: function() {
            // Once a server-side errorez occurs, we disable everything except the cancel button. We also stop
            // listening to "enable" messages on all the form controls, since the server data retrieval code
            // implements a parallel asynchronous callback handler scheme which might cause fields to be
            // enabled over the top of this code. Eventually, we should move this into a mixin or a behavior.
            this.ui.inputFields.trigger('control:disabled', true);
            this.ui.availableLabTests.trigger('control:disabled', true);
            this.enableFooterButtons(false);
            this.enableCancelButton(false);
            this.ui.errorMessage.trigger('control:title', 'System Error');
            this.ui.errorMessage.trigger('control:icon', 'fa-exclamation-circle');
            this.hideInProgress();

            var message = LabUtils.getServerSideErrorMessage(this.model.get('serverSideError'));
            this.model.set('errorMessage', message);
        },
        proceedToSave: function() {
            var form = this;
            var componentList = form.model.get('componentList');
            form.model.set('componentList', {});

            var patient = ADK.PatientRecordService.getCurrentPatient();
            var localId = patient.get('localId');
            var uid = patient.get('uid');
            var pid = patient.get("pid");

            var session = ADK.UserService.getUserSession();
            var siteCode = session.get('site');
            var provider = session.get('duz')[siteCode];


            this.listenTo(form.model, 'save:error', function(model, resp) {
                var errorMessage = JSON.parse(resp.responseText).message;

                if (errorMessage) {
                    form.model.set('errorMessage', errorMessage);
                }
                model.set('componentList', componentList);
                console.log('Failed to accept lab order: ' + JSON.stringify(resp));
                model.set("formStatus", {
                    status: "error",
                    message: "Failed to accept lab order: " + resp.responseText
                });
                form.enableInputFields(true);
                form.enableCancelButton(false);
                form.hideInProgress();
                form.ui.availableLabTests.trigger('control:disabled', false);
                form.enableFooterButtons(true);
                this.stopListeningSaveCallback();
            });

            this.listenTo(form.model, 'save:success', function(model, resp) {
                // create activity service
                var actList = model.get('activityList');
                var availAct = model.get('activity');

                if (actList && availAct) {
                    var activity = actList.get(availAct).attributes;
                    var fetchOptions = {
                        resourceTitle: 'activities-start',
                        fetchType: 'POST',
                        criteria: {
                            deploymentId: activity.deploymentId,
                            processDefId: activity.id,
                            parameter: {
                                icn: model.get('pid'),
                                labOrderId: model.get('availableLabTests')
                            }
                        }
                    };
                    fetchOptions.onError = function(collection, resp) {
                        console.log('Failed to initiate activity service: ' + JSON.stringify(resp));
                    };
                    fetchOptions.onSuccess = function(collection, resp) {
                        // placeholder for successful activity save
                        // this is where you will us activityCollection
                    };
                    var activityCollection = ADK.ResourceService.fetchCollection(fetchOptions);
                }

                model.set('componentList', componentList);
                form.enableInputFields(true);
                form.enableCancelButton(true);
                form.hideInProgress();
                var SignListModel = Backbone.Model.extend({});
                var ordersModel = new SignListModel({});

                if (model.get('orderCheckList').length > 0) {
                    var alertView = new ViewUtils.DialogBox({
                        title: 'Order Check Warning',
                        message: [
                            '<h5 class="all-margin-no">Duplicate Order:</h5>',
                            '<ul class="list-inline">',
                            '  {{#each orderCheckResponse}}<li>{{this.orderCheck}}</li>{{/each}}',
                            '</ul>'
                        ].join('\n'),
                        confirmButton: 'Accept Order',
                        cancelButton: 'Cancel Order',
                        confirmButtonClasses: 'btn-primary btn-sm',
                        cancelButtonClasses: 'btn-danger btn-sm',
                        onConfirm: function() {
                            model.set('orderCheckList', model.get('orderCheckOriginalList'));
                            form.saveOrder(model, form);
                        },
                        onCancel: function() {
                            var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                            if (TrayView) {
                                TrayView.$el.trigger('tray.reset');
                            }
                        }
                    });
                    alertView.show(form, {
                        model: new Backbone.Model({
                            orderCheckResponse: model.get('orderCheckList')
                        })
                    });
                } else {
                    ordersModel.set('items', model.get('items'));
                    var saveAlertView = new ADK.UI.Notification({
                        title: 'Lab Order Submitted',
                        icon: 'fa-check',
                        message: 'Lab order successfully accepted with no errors.',
                        type: "success"
                    });
                    saveAlertView.show();
                    model.trigger('draft:reset');
                    this.unregisterChecks();
                    if (form.ui.acceptDrpDwnContainer.text() === ("Accept")) {
                        ADK.UI.Alert.hide();
                        form.workflow.close();
                    } else if (form.ui.acceptDrpDwnContainer.text() === ("Accept & Add Another")) {
                        FormUtils.resetForm(form);
                        this.model.unset('availableLabTests');
                        ADK.UI.Alert.hide();
                        form.hideInProgress();
                        this.enableInputFields(false);
                        form.isDraftLoaded = false;
                        form.ui.availableLabTests.trigger('control:disabled', false);
                        form.enableFooterButtons(false);
                        form.enableCancelButton(true);
                        this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
                    }
                    this.model.unset('orderCheckList');
                    this.stopListeningSaveCallback();
                    Utils.refreshApplet();
                }
            });

            this.showInProgress('Saving...');

            this.model.set({
                pid: pid,
                dfn: localId,
                provider: provider,
                orderDialog: 'LR OTHER LAB TESTS',
                quickOrderDialog: '2',
                displayGroup: '6',
                inputList: this.model.generateInputList(this.model),
                commentList: this.model.generateCommentList(this.model),
                localId: localId,
                uid: uid,
                kind: 'Laboratory'
            });

            this.model.trigger('draft:copyToModel');

            this.ui.availableLabTests.trigger('control:disabled', true);
            this.saveOrder(this.model, form);
            this.model.unset("formStatus");
        },
        saveOrder: function(model, form) {
            var order = new ADK.UIResources.Writeback.Orders.Model();
            order.set(model.attributes);
            var callback = {
                params: {
                    'pid': this.model.get("pid")
                },
                validate: false,
                success: function(model, resp) {
                    form.model.trigger('save:success', model, resp);
                },
                error: function(model, resp) {
                    form.model.trigger('save:error', model, resp);
                }.bind(this),
            };
            order.save(null, callback);
        },
        hideDynamicFields: function() {
            this.ui.dynamicFields.trigger('control:hidden', true);
        },
        enableCancelButton: function(isEnabled){
            this.$(this.ui.cancelButton.selector).trigger('control:disabled', !isEnabled);
        },
        resetDynamicRequiredFields: function() {
            this.ui.dynamicRequiredFields.trigger('control:required', false);
        },
        enableInputFields: function(enabled) {
            this.ui.inputFields.trigger('control:disabled', !enabled);
            if (enabled) {
                this.checkStateCollectionSample();
                this.checkStateUrgency();
                this.checkOtherSpecimen();
            }
        },
        enableFooterButtons: function(isEnabled) {
            this.ui.acceptDrpDwnContainer.trigger('control:disabled', !isEnabled);
            this.$(this.ui.saveButton.selector).trigger('control:disabled', !isEnabled);
            this.$(this.ui.deleteButton.selector).trigger('control:disabled', !(isEnabled && this.isDraftLoaded));
        },
        stopListeningSaveCallback: function() {
            this.stopListening(this.model, 'save:success save:error');
        },
        checkStateCollectionSample: function() {
            if (this.model.get('collectionSampleDisabled') === true) {
                this.ui.collectionSample.trigger('control:disabled', true);
            }
        },
        checkStateUrgency: function() {
            if (this.model.get('urgencyDisabled')) {
                this.ui.urgency.trigger('control:disabled', true);
            }
        },
        checkOtherSpecimen: function() {
            if (_.isUndefined(this.model.get('otherCollectionSample')) || _.isEmpty(this.model.get('otherCollectionSample'))) {
                this.ui.otherSpecimen.trigger('control:disabled', true);
            }
        },
        showInProgress: function(message) {
            this.model.set('inProgressMessage', message);
            this.ui.inProgressContainer.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inProgressContainer.trigger('control:hidden', true);
            this.model.unset('inProgressMessage');
        },
        handleCollectionTypeListCache: function() {
            var immediateCollectionType = _.find(this.model.get('collectionTypeListCache'), {code: 'I'});
            if (!_.isUndefined(immediateCollectionType)) {
                LabUtils.retrieveImmediateCollection.apply(this);
            }
        },
        handleCollectionDateTime: function() {
            FormUtils.handleCollectionDateTime(this);
        },
        handleEnableActivity: function() {
            FormUtils.handleEnableActivity.apply(this);
        },
        modelEvents: {
            'change:sampleDrawnAt': function(model) {
                FormUtils.handleSampleDrawnAt(this);
            },
            'change:anticoagulant': function(model) {
                FormUtils.handleAnticoagulant(this);
            },
            'change:orderComment': function(model) {
                FormUtils.handleOrderComment(this);
            },
            'change:doseDate': function(model) {
                FormUtils.handleDoseDrawTimes(this);
            },
            'change:doseTime': function(model) {
                FormUtils.handleDoseDrawTimes(this);
            },
            'change:drawDate': function(model) {
                FormUtils.handleDoseDrawTimes(this);
            },
            'change:drawTime': function(model) {
                FormUtils.handleDoseDrawTimes(this);
            },
            'change:futureLabCollectDate': function(model) {
                FormUtils.handleFutureLabCollectDate(this);
            },
            'change:urgency': function(model) {
                FormUtils.handleUrgency(this);
            },
            'change:activity': function(model) {
                FormUtils.handleActivity(this);
            },
            'change:specimen': function(model) {
                FormUtils.handleSpecimen(this);
            },
            'change:otherSpecimen': function(model) {
                FormUtils.handleOtherSpecimen(this);
            },
            'change:collectionType': function(model) {
                FormUtils.handleCollectionType(this);
            },
            'change:collectionTypeListCache': 'handleCollectionTypeListCache',
            'change:collectionDate': 'handleCollectionDateTime handleEnableActivity',
            'change:collectionTime': 'handleCollectionDateTime',
            'change:collectionDateTimePicklist': function(model) {
                FormUtils.handleCollectionDateTimePicklist(this);
            },
            'change:collectionSample': function(model) {
                FormUtils.handleCollectionSample(this);
            },
            'change:otherCollectionSample': function(model) {
                FormUtils.handleOtherCollectionSample(this);
            },
            'change:isActivityEnabled': 'handleEnableActivity',
            'change:notificationDate': function(model) {
                FormUtils.handleNotificationDate.apply(this);
            },
            'change:orderable-items-loaded': function(model) {
                var contextIen = model.get('contextIen');
                if (!_.isUndefined(contextIen)){
                    model.set('availableLabTests', contextIen);
                }
            },
            'change:availableLabTests': function(model) {
                var ien = model.get('availableLabTests');
                if (!_.isEmpty(ien)) {
                    this.showInProgress('Loading...');
                    var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                    if (visit) {
                        if (visit.locationUid) {
                            this.model.set('location', visit.locationUid);
                        }
                    }
                    FormUtils.resetForm(this);
                    if (_.isUndefined(model.get('collectionDate'))) {
                        FormUtils.setInitialCollectionDateTimeValues(this);
                    }
                    this.enableInputFields(false);
                    LabUtils.retrieveOrderableItemLoad.apply(this);
                }
            },
            'change:draft-data': 'onChangeDraftData',
            'change:serverSideError': 'onServerSideError'
        },
        behaviors: {
            draft: {
                behaviorClass: DraftBehavior,
                type: 'laboratory',
                preloadEvents: ['orderable-items-loaded']
            }
        },
        onChangeDraftData: function(model, payload) {
            // Trigger the population of the lab order form with draft information by triggering a Model update
            // on the 'availableLabTests' attribute.
            var labTestIen = payload.availableLabTests;
            delete payload.availableLabTests;

            if (!_.isEmpty(labTestIen)) {
                this.model.set('availableLabTests', labTestIen);
            }
        },
        saveDraft: function(options) {
            this.model.trigger('draft:save', options);
        },
        deleteDraft: function(options) {
            this.model.trigger('draft:delete', options);
        },

        onBeforeDraftSave: _.partial(FormUtils.onBeforeDraftEvent, 'Saving'),
        onDraftSaveSuccess: FormUtils.onDraftSuccessEvent,
        onDraftSaveError: FormUtils.onDraftErrorEvent,

        onBeforeDraftRead: _.partial(FormUtils.onBeforeDraftEvent, 'Loading'),
        onDraftReadSuccess: FormUtils.onDraftReadSuccess,
        onDraftReadError: FormUtils.onDraftErrorEvent,

        onBeforeDraftDelete: _.partial(FormUtils.onBeforeDraftEvent, 'Deleting'),
        onDraftDeleteSuccess: FormUtils.onDraftSuccessEvent,
        onDraftDeleteError: FormUtils.onDraftErrorEvent,
    });

    return formView;

});
