define([
    'app/applets/orders/writeback/consults/formFields',
    'app/applets/orders/tray/consults/orderEntryView',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/orders/writeback/consults/consultUtils'
], function(Fields, OrderEntryView, WritebackUtils, EventHandler, ConsultUtils) {
    'use strict';

    var launchOrderEntryTrayForm = function(options) {
        options = options || {};

        var patientContext = ADK.PatientRecordService.getCurrentPatient();
        var formModel = new OrderEntryView.model();
        var preReqQues;
        var preReqOrd;
        var preReqQuesCollection;
        var preReqOrdersCollection;
        var consultOrderRecord;

        //Clinical Object Fetch Call for Future Form Loading.
        if (options.draftUid) {
            // Fetch clinic list and populate the clinic dropdown
            var url = ADK.ResourceService.buildUrl('clinical-object-read', {});
            var params = {
                pid: patientContext.get('pid'),
                resourceId: options.draftUid
            };
            url = ADK.ResourceService.replaceURLRouteParams(unescape(url), params);

            formModel.url = url;
            formModel.parse = function(r) {

                var lastConsultOrder = r.data ? _.get(r, 'data.data.consultOrders.length') : 0;
                if (lastConsultOrder) {
                    

                    lastConsultOrder -= 1;
                    var userSession = ADK.UserService.getUserSession().toJSON();
                    var formRecord = $.extend(true, {}, r.data.data.consultOrders[lastConsultOrder]);
                    formRecord.consultName = r.data.displayName;
                    formRecord.destinationFacility = _.get(formRecord, 'destinationFacility.code') || _.get(formRecord, 'facility.code');
                    formRecord.acceptingProvider = _.get(formRecord, 'acceptingProvider.uid');
                    formRecord.orderingProvider = _.get(formRecord, 'orderingProvider.uid');
                    formRecord.requestReason = _.get(formRecord, 'request');
                    formRecord.condition = _.get(formRecord, 'conditions[0].code');
                    formRecord.urgency = formRecord.urgency + '';
                    formRecord.instructions = _.get(formRecord, 'orderable.data.instructions');
                    formRecord.orderableData = {
                        data: {
                            teamFocus: formRecord.teamFocus
                        }
                    };

                    formRecord.processInstanceId = r.data.data.activity.processInstanceId;

                    return formRecord;

                }
            };

            
            prepareWorkflow();
            return;
        }

        if (options.formModel) {
            var repopulate = options.formModel.toJSON();
            preReqQues = Fields.mapPreReqQuestions(options.formModel.get('preReqQuestions'));
            preReqOrd = Fields.mapPreReqOrders(options.formModel.get('preReqOrders'), Fields.fromJBPMOrdersMapping);

            if (_.get(options, 'taskName') === 'Accept') {

                repopulate.name = 'Accept';
            }

            repopulate.destinationFacility = _.get(repopulate, 'destinationFacility.code') || _.get(repopulate, 'facility.code');
            repopulate.acceptingProvider = _.get(repopulate, 'acceptingProvider.uid');
            repopulate.orderingProvider = _.get(repopulate, 'orderingProvider.uid');
            repopulate.condition = _.get(repopulate, 'conditions[0].code');
            repopulate.urgency = repopulate.urgency + '';
            repopulate.orderableData = {
                data: {
                    teamFocus: repopulate.teamFocus
                }
            };



            formModel.set(_.omit(repopulate, ['preReqQuestions', 'preReqOrders']));

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
            preReqQuesCollection = new Fields.PreReqCollection(preReqQues || []);
            preReqOrdersCollection = new Fields.PreReqCollection(preReqOrd || []);

            formModel.set('preReqQuestions', preReqQuesCollection);
            formModel.set('preReqOrders', preReqOrdersCollection);

            var workflowOptions = {
                onBeforeShow: function() {
                    ADK.Messaging.getChannel('loadConsult').trigger('visit:ready');
                }
            };

            var view = OrderEntryView.form.extend({
                taskModel: options.model || options.formModel ? true : false,
                isFromOrdersSearchBar: options.cdsModel ? true : false,
                isFromDraft: options.draftUid ? true : false,
            });

            WritebackUtils.launchWorkflow(formModel, view, workflowOptions, 'Consult Order', 'actions');
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