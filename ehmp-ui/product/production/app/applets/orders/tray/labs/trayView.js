define([
    'main/ADK',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/orders/viewUtils',
    'app/applets/orders/writeback/orderCheck',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/writeback/labs/labUtils',
    'app/applets/orders/writeback/labs/formFields',
    'app/applets/orders/writeback/labs/formUtils',
    'app/applets/orders/behaviors/draft'
], function(ADK, Backbone, Marionette, $, Handlebars, ViewUtils, OrderCheck, Utils, LabUtils, FormFields, FormUtils, DraftBehavior) {
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

    var CloseAlertView = new ViewUtils.DialogBox({
        icon: 'fa-exclamation-triangle font-size-16 color-red',
        title: 'Closing Lab Order Form',
        message: 'You will lose all work in progress if you close this lab order. Would you like to proceed?',
        confirmButton: 'Close',
        onConfirm: function() {
            this.saveDraft({resetTray: true});
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
            "otherCollectionSampleContainer": ".otherCollectionSampleContainer",
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
            "acceptDrpDwnContainer": "#acceptDrpDwnContainer",
            "cancelButton": ".cancelButton",
            "deleteButton": ".deleteButton",
            "errorMessage": ".errorMessage",
            "dynamicFields": ".anticoagulant, .sampleDrawnAtContainer, .additionalComments, .orderComment, .urineVolume, .doseContainer, .drawContainer, .immediateCollectionContainer, .futureLabCollectTimesContainer, .otherSpecimenContainer, .otherCollectionSampleContainer",
            "dynamicRequiredFields": ".collectionDate, .collectionTime,.collectionDateTimePicklist, .otherCollectionSample, .otherSpecimen, .futureLabCollectDate, .futureLabCollectTime, .howLong, .immediateCollectionDate, .immediateCollectionTime, .sampleDrawnAt, .doseDate, .doseTime, .drawDate, .drawTime",
            "doseDrawDateTime": ".doseDate, .doseTime, .drawDate, .drawTime",
            "inputFields": ".urgency, .howOften, .howLong, .collectionType, .collectionDateTimePicklist, .collectionDate, .collectionTime, .otherSpecimen, .collectionSample, .otherCollectionSample, .anticoagulant, .sampleDrawnAt, .additionalComments, .immediateCollection, .immediateCollectionDate, .immediateCollectionTime, .orderComment, .urineVolume, .doseDate, .doseTime, .drawDate, .drawTime"
        },
        fields: FormFields,
        onInitialize: function() {
            var self = this;
            this.listenTo(ADK.Messaging.getChannel('addOrders'), 'visit:ready', function(model) {
                self.updateVisit();
            });
        },
        updateVisit: function() {
            LabUtils.retrieveMaxDays(this);
        },
        onRender: function() {
            this.ui.acceptDrpDwnContainer.trigger('control:disable', true);
            this.enableFooterButtons(false);
            LabUtils.retrieveAllCollectionSamples(this);
            LabUtils.retrieveAllSpecimens(this);
            if (this.model.orderModel) {
                //hard code semicolon and 1 for now
                var orderId = this.model.orderModel.get('orderNumber') + ";1";
                this.model.set('orderId', orderId);
            }
            LabUtils.retrieveOrderableItems(this);
            LabUtils.retrieveCollectionTypesUrgencyAndSchedules(this);
            LabUtils.retrieveImmediateCollection(this);
            if (this.model.get('orderId')) {
                LabUtils.retrieveExisting(this);
            }
        },
        events: {
            "click #acceptDrpDwnContainer-accept": function(e) {
                this.ui.acceptDrpDwnContainer.text("Accept");
            },
            "click #acceptDrpDwnContainer-accept-sign": function(e) {
                this.ui.acceptDrpDwnContainer.text("Accept & Sign");
            },
            "click #acceptDrpDwnContainer-accept-add": function(e) {
                this.ui.acceptDrpDwnContainer.text("Accept & Add Another");
            },
            "click @ui.cancelButton": function(e) {
                this.saveDraft({resetTray: true});
            },
            "submit": function(e) {
                e.preventDefault();

                var existingVisit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                this.model.unset('errorMessage');
                this.model.set('immediateCollectionIsComplete', true);
                this.model.set('howLongIsComplete', true);
                if (this.model.isValid()) {
                    this.enableInputFields(false);
                    this.showInProgress('Validating...');
                    this.ui.inProgressContainer.removeClass('hidden');
                    this.ui.acceptDrpDwnContainer.trigger('control:disable', true);
                    this.enableFooterButtons(false);

                    var validDateTime, validHowLong;

                    if (this.model.get('collectionType') === 'I') {
                        this.model.set('immediateCollectionIsComplete', false);
                        validDateTime = this.model.validateImmediateCollectDateTime(this);
                        if (!validDateTime) {
                            validDateTime = new $.Deferred();
                            validDateTime.resolve();
                        }
                    } else {
                        validDateTime = new $.Deferred();
                        validDateTime.resolve();
                    }
                    if (!_.isUndefined(this.model.get('howLong'))) {
                        this.model.set('howLongIsComplete', false);
                        validHowLong = this.model.validateHowLong(this);
                    } else {
                        validHowLong = new $.Deferred();
                        validHowLong.resolve();
                    }
                    // Since this takes a while I would put some some of visual clue that it is processing
                    $.when(validDateTime, validHowLong).done(_.bind(this.checkServerSideValidations, this));
                }
                return false;
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
                this.ui.acceptDrpDwnContainer.trigger('control:disable', false);
                this.enableFooterButtons(true);
            }
        },
        onServerSideError: function() {
            // Once a server-side error occurs, we disable everything except the cancel button. We also stop
            // listening to "enable" messages on all the form controls, since the server data retrieval code
            // implements a parallel asynchronous callback handler scheme which might cause fields to be
            // enabled over the top of this code. Eventually, we should move this into a mixin or a behavior.
            this.ui.inputFields.trigger('control:disabled', true);
            this.ui.availableLabTests.trigger('control:disabled', true);

            this.ui.acceptDrpDwnContainer.trigger('control:disable', true);
            this.enableFooterButtons(false);
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

            var callback = {
                validate: false,
                success: function(model, resp) {
                    form.model.trigger('save:success', model, resp);
                },
                error: function(model, resp) {
                    form.model.trigger('save:error', model, resp);
                }.bind(this),
            };

            this.listenTo(form.model, 'save:error', function(model, resp) {
                var errorMessage = JSON.parse(resp.responseText).message;

                if (errorMessage) {
                    model.set('errorMessage', errorMessage);
                }
                model.set('componentList', componentList);
                console.log('Failed to accept lab order: ' + JSON.stringify(resp));
                model.set("formStatus", {
                    status: "error",
                    message: "Failed to accept lab order: " + resp.responseText
                });
                form.enableInputFields(true);
                form.hideInProgress();
                form.ui.availableLabTests.trigger('control:disabled', false);
                form.ui.acceptDrpDwnContainer.trigger('control:disable', false);
                this.stopListeningSaveCallback();
            });

            this.listenTo(form.model, 'save:success', function(model, resp) {
                // create activity service
                var actList = model.get('activityList');
                var availAct = model.get('activity');

                if (actList && availAct) {
                    var activity = actList.get(availAct).attributes;
                    var fetchOptions = {
                        resourceTitle: 'tasks-startprocess',
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
                form.hideInProgress();
                var SignListModel = Backbone.Model.extend({});
                var ordersModel = new SignListModel({});
                var labOrders = [JSON.parse(resp.data.data)];

                if (labOrders[0].orderCheckList) {
                    var orderCheckList = _.map(labOrders, function(v, i) {
                        var size = v.orderCheckList.length;
                        return _.map(v.orderCheckList, function(v, i) {
                            /*Commented below code out to make duplicate order check accept and display*/
                            //v.orderCheck = v.orderCheck.replace("Duplicate order:", "");
                            return '('.concat(i + 1).concat(' of ').concat(size).concat(') ').concat(v.orderCheck.split('^')[3]);
                        });
                    });

                    if (orderCheckList[0].length > 0) {
                        var FooterView = Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile('{{ui-button "Cancel Order" classes="btn-default btn-sm" title="Press enter to cancel."}}{{ui-button "Accept Order" classes="btn-primary btn-sm" title="Press enter to continue."}}'),
                            events: {
                                'click .btn-primary': function() {
                                    ADK.UI.Modal.hide();
                                    model.set('orderCheckList', labOrders[0].orderCheckList);
                                    LabUtils.save(model, callback);
                                },
                                'click .btn-default': function() {
                                    ADK.UI.Modal.hide();
                                    ADK.UI.Workflow.hide();
                                }
                            },
                            tagName: 'span'
                        });

                        var HeaderView = Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile('<div><i class="fa fa-exclamation-triangle font-size-18 color-red"></i>ORDER CHECKING</div>')
                        });

                        var modalOptions = {
                            'size': "medium",
                            'backdrop': true,
                            'keyboard': true,
                            'callShow': true,
                            'footerView': FooterView,
                            'headerView': HeaderView
                        };

                        var FormModel = Backbone.Model.extend({
                            defaults: {
                                orderCheckResponse: orderCheckList[0],
                            }
                        });

                        var orderCheckFormView = new OrderCheck({
                            model: new FormModel()
                        });

                        var modalView = new ADK.UI.Modal({
                            view: orderCheckFormView,
                            icon: 'fa-exclamation-triangle',
                            options: modalOptions
                        });

                        modalView.show();
                    }

                } else {
                    ordersModel.set('items', labOrders);
                    var saveAlertView = new ADK.UI.Notification({
                        title: 'Lab Order Submitted',
                        icon: 'fa-check',
                        message: 'Lab order successfully accepted with no errors.',
                        type: "success"
                    });
                    saveAlertView.show();
                    model.trigger('draft:reset');
                    if (form.ui.acceptDrpDwnContainer.text() === ("Accept")) {
                        ADK.UI.Alert.hide();
                        form.workflow.close();
                    } else if (form.ui.acceptDrpDwnContainer.text() === ("Accept & Add Another")) {
                        FormUtils.resetForm(form);
                        model.unset('availableLabTests');
                        ADK.UI.Alert.hide();
                        form.hideInProgress();
                        this.enableInputFields(false);
                        form.ui.availableLabTests.trigger('control:disabled', false);
                        form.ui.acceptDrpDwnContainer.trigger('control:disable', true);
                        form.enableFooterButtons(false);
                    }
                    model.unset('orderCheckList');
                    this.stopListeningSaveCallback();
                    Utils.refreshApplet();
                }
            });

            this.showInProgress('Saving...');
            var patient = ADK.PatientRecordService.getCurrentPatient();
            var localId = patient.get('localId');
            var uid = patient.get('uid');

            var session = ADK.UserService.getUserSession();
            var siteCode = session.get('site');
            var provider = session.get('duz')[siteCode];

            this.model.set({
                pid: patient.get("pid"),
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

            this.ui.availableLabTests.trigger('control:disabled', true);
            LabUtils.save(this.model, callback);
            this.model.unset("formStatus");
        },
        hideDynamicFields: function() {
            this.ui.dynamicFields.trigger('control:hidden', true);
        },
        resetDynamicRequiredFields: function() {
            this.ui.dynamicRequiredFields.trigger('control:required', false);
        },
        enableInputFields: function(enabled) {
            this.ui.inputFields.trigger('control:disabled', !enabled);
            if (enabled) {
                this.checkStateHowOften();
                this.checkStateHowLong();
                this.checkStateCollectionSample();
                this.checkStateUrgency();
            }
        },
        enableFooterButtons: function(isEnabled) {
            this.ui.cancelButton.trigger('control:disabled', !isEnabled);
            this.ui.deleteButton.trigger('control:disabled', !isEnabled);
        },
        checkStateHowOften: function() {
            if (this.model.get('howOftenAlwaysDisabled') !== true) {
                this.ui.howOften.trigger('control:disabled', false);
            } else {
                this.ui.howOften.trigger('control:disabled', true);
            }
        },
        checkStateHowLong: function() {
            var self = this;
            var selectedHowOften = _.filter(this.model.get('howOftenListCache'), function(e) {
                return e.code === self.model.get('howOften');
            });
            if (selectedHowOften && selectedHowOften[0]) {
                if (selectedHowOften[0].frequencyType === "O") {
                    this.ui.howLong.trigger('control:disabled', true);
                    this.model.unset('howLong');
                    this.ui.howLong.trigger('control:required', false);
                } else {
                    this.ui.howLong.trigger('control:disabled', false);
                    this.ui.howLong.trigger('control:required', true);
                }
                if (this.model.get('howOften') !== '28') { //ONE TIME
                    this.model.set('howOftenText', selectedHowOften[0].name);
                }
            }
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
        showInProgress: function(message) {
            this.model.set('inProgressMessage', message);
            this.ui.inProgressContainer.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inProgressContainer.trigger('control:hidden', true);
            this.model.unset('inProgressMessage');
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
                FormUtils.handleDoseDate(this);
            },
            'change:doseTime': function(model) {
                FormUtils.handleDoseDrawTimes(this);
                FormUtils.handleDoseTime(this);
            },
            'change:drawDate': function(model) {
                FormUtils.handleDoseDrawTimes(this);
                FormUtils.handleDrawDate(this);
            },
            'change:drawTime': function(model) {
                FormUtils.handleDoseDrawTimes(this);
                FormUtils.handleDrawTime(this);
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
                FormUtils.handleSpecimen(this);
            },
            'change:howOften': function(model) {
                this.checkStateHowLong();
            },
            'change:collectionType': function(model) {
                FormUtils.handleCollectionType(this);
            },
            'change:collectionDate': function(model) {
                FormUtils.handleCollectionDateTime(this);
            },
            'change:collectionTime': function(model) {
                FormUtils.handleCollectionDateTime(this);
            },
            'change:collectionDateTimePicklist': function(model) {
                FormUtils.handleCollectionDateTimePicklist(this);
            },
            'change:collectionSample': function(model) {
                FormUtils.handleCollectionSample(this);
            },
            'change:otherCollectionSample': function(model) {
                FormUtils.updateCollectionSampleText(this);
            },
            'change:availableLabTests': function(model) {
                var ien = model.get('availableLabTests');
                if (!_.isEmpty(ien)) {
                    this.showInProgress('Loading...');
                    var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                    if (visit) {
                        this.model.set('location', visit.localId);
                    }
                    FormUtils.resetForm(this);
                    if (_.isUndefined(model.get('collectionDate'))) {
                        FormUtils.setInitialCollectionDateTimeValues(this);
                    }
                    this.enableInputFields(false);
                    LabUtils.retrieveOrderableItemLoad(this, ien);
                }
            },
            'change:serverSideError': 'onServerSideError'
        },
        behaviors: {
            draft: {
                behaviorClass: DraftBehavior,
                type: 'laboratory'
            }
        },
        saveDraft: function(options) {
            this.showInProgress('Saving draft...');
            this.model.trigger('draft:save', options);
        },
        onDraftSaveSuccess: function(options) {
            this.hideInProgress();
            if (_.get(options, 'resetTray')) {
                this.$el.trigger('tray.reset');
            }
        },
        onDraftSaveError: function(options) {
            this.hideInProgress();
        }
    });

    return formView;

});
