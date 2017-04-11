define([
    'app/applets/orders/writeback/consults/formFields',
    'app/applets/orders/tray/consults/orderEntryView',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/writeback/consults/consultUtils',
    'moment'
], function(Fields, OrderEntryView, WritebackUtils, ConsultUtils, moment) {
    'use strict';

    var launchOrderEntryTrayForm = function(options) {
        // Used internally for accepting provider
        function buildAcceptingProvider(uid) {
            var acceptingProvider = uid || '';
            var index = acceptingProvider.lastIndexOf('user:');
            return acceptingProvider.substring(index + 5);
        }

        options = options || {};

        var patientContext = ADK.PatientRecordService.getCurrentPatient();
        var formModel = new OrderEntryView.model();
        var preReqQues;
        var preReqOrd;
        var preReqQuesCollection;
        var preReqOrdersCollection;
        var consultOrderRecord;

        if (options.draftUid) {

            var alertError = new ADK.UI.Notification({
                title: 'There was an error loading this draft.',
                type: 'error'
            });

            if (!options.processInstanceId) {
                alertError.show();
                console.error('This draft does not have a process instance id.');
                return;
            }
            var fetchOptions = {
                resourceTitle: 'activity-instance-byid',
                fetchType: 'POST',
                cache: false,
                viewModel: {
                    parse: function(response) {
                        var activityRecord = response.consultOrder;
                        if (activityRecord) {
                            activityRecord.condition = _.get(activityRecord, 'conditions[0].code');
                            activityRecord.destinationFacility = _.get(activityRecord, 'destinationFacility.code');
                            var stateTokens = response.state.split(':');
                            activityRecord.state = stateTokens[0];
                            activityRecord.subState = stateTokens[1];
                            activityRecord.orderable = response.orderable;
                            activityRecord.cdsIntentResult = JSON.parse(response.consultClinicalObject.data.consultOrders[0].cdsIntentResult);
                            activityRecord.formAction = response.formAction;
                            activityRecord.acceptingProvider = buildAcceptingProvider(_.get(activityRecord, 'acceptingProvider.uid'));

                            // Augment preReqOrder with domain and order action information
                            activityRecord.preReqOrders = _.map(activityRecord.preReqOrders, function(order) {
                                var orderRemediation = ConsultUtils.getOrderRemediation(order, _.get(activityRecord.cdsIntentResult, 'data.results'));
                                return ConsultUtils.augmentPreReqOrder(order, orderRemediation);
                            });
                        }
                        return activityRecord;
                    }
                },
                criteria: {
                    deploymentId: options.deploymentId,
                    processInstanceId: options.processInstanceId * 1
                },
                onSuccess: function(collection) {
                    ADK.Messaging.getChannel('consult_draft').trigger('draft_loaded', {
                        collection: collection,
                        draftActivity: self.draftActivity
                    });
                }
            };

            formModel.listenToOnce(ADK.Messaging.getChannel('consult_draft'), 'draft_loaded', function(params) {
                var model = _.extend({}, params.collection.at(0).toJSON(), params.draftActivity);

                if (model.preReqQuestions && model.preReqQuestions.length) {
                    preReqQues = Fields.mapPreReqQuestions(model.preReqQuestions, {
                        'label': 'question',
                        'name': 'question',
                        'value': 'answer'
                    });
                }

                if (model.preReqOrders && model.preReqOrders.length) {
                    preReqOrd = Fields.mapPreReqOrders(model.preReqOrders, Fields.fromJBPMOrdersMapping);
                }

                model = _.omit(model, ['preReqQuestions', 'preReqOrders']);
                model.processInstanceId = options.processInstanceId || null;
                formModel.set(model);
                prepareWorkflow();
            });

            ADK.ResourceService.fetchCollection(fetchOptions);
            return;
        }

        if (options.formModel) {
            var repopulate = options.formModel.get('consultOrder');
            var cdsIntentResults = options.formModel.get('cdsIntentResults');
            preReqQues = Fields.mapPreReqQuestions(repopulate.preReqQuestions);

            preReqOrd = repopulate.preReqOrders;

            preReqOrd = _.map(preReqOrd, function(order) {
                var orderRemediation = ConsultUtils.getOrderRemediation(order, cdsIntentResults);
                return ConsultUtils.augmentPreReqOrder(order, orderRemediation);
            });


            preReqOrd = Fields.mapPreReqOrders(preReqOrd, Fields.fromJBPMOrdersMapping);

            if (_.get(options, 'taskName') === 'Accept') {

                repopulate.name = 'Accept';
            }

            repopulate.destinationFacility = _.get(repopulate, 'destinationFacility.code') || _.get(repopulate, 'facility.code');
            repopulate.acceptingProvider = buildAcceptingProvider(_.get(repopulate, 'acceptingProvider.uid'));
            repopulate.condition = _.get(repopulate, 'conditions[0].code');
            repopulate.urgency = repopulate.urgency + '';
            repopulate.orderableData = {
                data: {
                    teamFocus: repopulate.teamFocus
                }
            };

            formModel.set(_.extend({}, _.omit(repopulate, ['preReqQuestions', 'preReqOrders']), _.omit(options.formModel.attributes, 'consultOrder')));

            prepareWorkflow();
            return;
        }

        if (options.cdsModel) {
            var lastConsultOrder = options.cdsModel.toJSON().data.consultOrders.length - 1;
            formModel.set('consultName', options.cdsModel.toJSON().data.consultOrders[lastConsultOrder].name);

            var data = options.cdsModel.get('data').consultOrders[lastConsultOrder].data;
            formModel.set('orderableData', options.cdsModel.get('data').consultOrders[lastConsultOrder]);

            var instructions = _.get(data, 'instructions');
            var obsResults = _.get(data, 'prerequisites.ehmp-questionnaire.observation-results');
            var orders = _.get(data, 'codes');
            var cdsIntent = _.get(data, 'prerequisites.cdsIntent');

            if (instructions) {
                formModel.set('instructions', instructions);
            }

            if (obsResults) {
                preReqQues = Fields.mapPreReqQuestions(obsResults, Fields.fromCDSQuestionsMapping);
                _.forEach(preReqQues, function(ques) {
                    ques.value = "";
                });
            }

            if (cdsIntent) {
                ConsultUtils.retrieveOrders(cdsIntent, retrieveOrdersSuccessCallback);

            } else {
                prepareWorkflow();
                return;
            }
        }

        if (!options.draftUid && !options.cdsModel && !options.model) {
            prepareWorkflow();
            return;
        }

        function prepareWorkflow() {
            if (preReqQues) {
                _.each(preReqQues, function(ques) {
                    ques.value = ConsultUtils.mapQuestionCode('getText', ques.value);
                });
            }

            if (options.showEdit || (formModel.has('name') && formModel.get('name').toLowerCase() === 'accept')) {
                _.each(preReqOrd, function(ord) {
                    if (ord.value.toLowerCase() !== 'order') {
                        ord.orderDisabled = true;
                    }
                });
            }

            preReqQuesCollection = new Fields.PreReqCollection(preReqQues || []);
            preReqOrdersCollection = new Fields.PreReqCollection(preReqOrd || []);

            formModel.set('preReqQuestions', preReqQuesCollection);
            formModel.set('preReqOrders', preReqOrdersCollection);

            var date = moment();

            if (!formModel.has('urgency')) {
                formModel.set('urgency', '9');
                setDates(date.format('L'), date.add(30, 'd').format('L'));
            }

            function setDates(earliestDate, latestDate) {
                formModel.set({
                    'earliestDate': earliestDate,
                    'latestDate': latestDate
                });
            }

            var workflowOptions = {
                onBeforeShow: function() {
                    ADK.Messaging.getChannel('loadConsult').trigger('visit:ready');
                },
                helpMapping: 'consult_order_form'
            };

            var view = OrderEntryView.form.extend({
                taskModel: options.model || options.formModel ? true : false,
                isFromOrdersSearchBar: options.cdsModel ? true : false,
                draftActivity: options.draftUid ? {
                    deploymentId: options.deploymentId,
                    processInstanceId: options.processInstanceId
                } : null,
                showEdit: options.showEdit,
                initalLoadFromDraft: options.draftUid ? true : false
            });

            WritebackUtils.launchWorkflow(formModel, view, workflowOptions, options.showEdit ? 'Edit Consult' : 'Consult Order', 'actions', options.visitNotRequired);
        }

        function reformatTaskModel(model) {
            var modelData = model.toJSON();
            formModel.unset();
            formModel.set(modelData.data);
            formModel.set('pjdsRecord', _.omit(modelData, ['data']));
        }

        function retrieveOrdersSuccessCallback(collection, response) {
            preReqOrd = ConsultUtils.outputForOrders(collection, response);
            formModel.set('cdsIntent', response);
            prepareWorkflow();
        }
    };

    /**
     * Launch the consult order tray UI form for a new consult order.
     */
    var launchOrderEntryForm = function(options) {
        launchOrderEntryTrayForm(options);
    };

    return {
        launchOrderEntryForm: launchOrderEntryForm
    };
});
