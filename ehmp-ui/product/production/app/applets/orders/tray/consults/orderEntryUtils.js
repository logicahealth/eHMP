/* global ADK */
define([
    'underscore',
    'app/applets/orders/writeback/consults/formFields',
    'app/applets/orders/tray/consults/orderEntryView',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/writeback/consults/consultUtils',
    'moment'
], function (_, Fields, OrderEntryView, WritebackUtils, ConsultUtils, moment) {
    'use strict';

    var launchOrderEntryTrayForm = function (options) {
        // Used internally for accepting provider
        function buildAcceptingProvider(uid) {
            var acceptingProvider = uid || '';
            var index = acceptingProvider.lastIndexOf('user:');
            return acceptingProvider.substring(index + 5);
        }

        options = options || {};

        var formModel = new OrderEntryView.model();
        var preReqQues;
        var preReqOrd;
        var preReqQuesCollection;
        var preReqOrdersCollection;

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
                cache: false,
                criteria: {
                    deploymentId: options.deploymentId,
                    processInstanceId: options.processInstanceId * 1
                },
                onSuccess: function (collection) {
                    ADK.Messaging.getChannel('consult_draft').trigger('draft_loaded', {
                        collection: collection,
                        draftActivity: self.draftActivity
                    });
                }
            };

            formModel.listenToOnce(ADK.Messaging.getChannel('consult_draft'), 'draft_loaded', function (params) {
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
            var collection = new ADK.UIResources.Fetch.Activities.InstanceCollection();
            collection.fetchCollection(fetchOptions);
            return;
        }

        if (options.formModel) {
            var repopulate = options.formModel.get('consultOrder');
            var cdsIntentResults = options.formModel.get('cdsIntentResults');
            preReqQues = Fields.mapPreReqQuestions(repopulate.preReqQuestions);

            preReqOrd = repopulate.preReqOrders;

            preReqOrd = _.map(preReqOrd, function (order) {
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
            var cdsIntent = _.get(data, 'prerequisites.cdsIntent');

            if (instructions) {
                formModel.set('instructions', instructions);
            }

            if (obsResults) {
                preReqQues = Fields.mapPreReqQuestions(obsResults, Fields.fromCDSQuestionsMapping);
                _.forEach(preReqQues, function (ques) {
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
        }

        function prepareWorkflow() {
            if (preReqQues) {
                _.each(preReqQues, function (question) {
                    question.value = ConsultUtils.mapQuestionCode('getText', question.value);
                });
            }

            if (options.showEdit || (formModel.has('name') && formModel.get('name').toLowerCase() === 'accept')) {
                _.each(preReqOrd, function (ord) {
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
                onBeforeShow: function () {
                    ADK.Messaging.getChannel('loadConsult').trigger('visit:ready');
                },
                helpMapping: 'consult_order_form'
            };

            // TODO initial is mispelled here in initalLoadFromDraft
            var view = OrderEntryView.form.extend({
                taskModel: Boolean(options.model || options.formModel),
                isFromOrdersSearchBar: Boolean(options.cdsModel),
                draftActivity: options.draftUid ? {
                    deploymentId: options.deploymentId,
                    processInstanceId: options.processInstanceId
                } : null,
                showEdit: options.showEdit,
                initalLoadFromDraft: Boolean(options.draftUid)
            });

            WritebackUtils.launchWorkflow(formModel, view, workflowOptions, options.showEdit ? 'Edit Consult' : 'Consult Order', 'actions', options.visitNotRequired);
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
    var launchOrderEntryForm = function (options) {
        launchOrderEntryTrayForm(options);
    };

    return {
        launchOrderEntryForm: launchOrderEntryForm
    };
});
