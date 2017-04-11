define([
    "underscore",
    "app/applets/task_forms/common/utils/eventHandler",
    "app/applets/task_forms/common/utils/utils",
    "app/applets/orders/writeback/consults/consultUtils"
], function(_, EventHandler, Utils, ConsultUtils) {
    "use strict";

    var fetchHelper = function(e, taskModel, state, parameterObj, onSuccess) {
        var fetchOptions = {
            resourceTitle: 'tasks-update',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentid: taskModel.get('deploymentId'),
                processDefId: taskModel.get('processDefId'),
                taskid: String(taskModel.get('taskId')),
                state: state,
                icn: taskModel.get('patientIcn'),
                parameter: parameterObj
            },
            onSuccess: onSuccess
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    function getUIText(uiElement, selector) {
        if (uiElement && uiElement.find(selector).length) {
            return uiElement.find(selector).text();
        } else if (uiElement && uiElement.find('option:selected').length) {
            return uiElement.find('option:selected').text();
        }
        return '';
    }

    function getUIVal(uiElement, selector) {
        if (uiElement && uiElement.find(selector).length) {
            return uiElement.find(selector).val();
        } else if (uiElement && uiElement.find('option:selected').length) {
            return uiElement.find('option:selected').val();
        }
        return '';
    }

    function setSpecialField(formModelValue, obj) {
        if (formModelValue && typeof formModelValue === 'object') {
            return formModelValue;
        }
        return obj;
    }

    function paramHelper(form, formAction) {
        formAction = formAction || "";
        var now = moment(new Date()).format('YYYYMMDDHHmmss');
        var patientInfo = ADK.PatientRecordService.getCurrentPatient().toJSON();
        var userInfo = ADK.UserService.getUserSession().toJSON();
        var formModel = form.model;
        var orderable = formModel && formModel.get('orderableData') || {};

        var obj = {
            consultOrder: {
                objectType: 'consultOrder',
                acceptingClinic: setSpecialField(formModel.get('clinic'), {
                    code: formModel.get('clinic'),
                    name: getUIText(_.get(form, 'ui.clinic'), '#select2-clinic-container'),
                }),
                acceptingProvider: setSpecialField(formModel.get('provider'), {
                    displayName: getUIText(_.get(form, 'ui.provider'), '#select2-provider-container'),
                    uid: formModel.get('provider')
                }),
                communityCareStatus: formModel.get('communityCareStatus'),
                communityCareType: formModel.get('communityCare'),
                conditions: [
                    setSpecialField(_.get(formModel.get('conditions'), ['0']), {
                        code: getUIVal(_.get(form, 'ui.condition'), '#select2-condition-container'),
                        name: getUIText(_.get(form, 'ui.condition'), '#select2-condition-container')
                    })
                ],
                consultName: _.escape(formModel.get('consultName')),
                contactAttempt: formModel.get('contactAttempt'),
                deploymentId: formModel.get('deploymentId'),
                destinationFacility: setSpecialField(formModel.get('destinationFacility'), {
                    code: formModel.get('destinationFacility'),
                    name: getUIText(_.get(form, 'ui.destinationFacility'), '#select2-destinationFacility-container')
                }),
                earliestDate: formModel.get('earliestDate'),
                formAction: formAction,
                formComment: formModel.get('comment') || formModel.get('question'),
                instructions: formModel.get('instructions'),
                latestDate: formModel.get('latestDate'),
                orderingFacility: {
                    code: userInfo.division,
                    name: userInfo.facility
                },
                orderingProvider: {
                    displayName: userInfo.lastname + ', ' + userInfo.firstname,
                    uid: userInfo.duz[userInfo.site]
                },
                overrideReason: formModel.get('overrideReason'),
                preReqOrders: outOrderPreReqOrders(formModel),
                preReqQuestions: outOrderPreReqQues(formModel),
                processDefId: formModel.get('processDefId'),
                requestReason: formModel.get('requestReason'),
                requestComment: formModel.get('requestComment'),
                scheduledDate: formModel.get('scheduledDate'),
                teamFocus: _.get(formModel.get('orderableData'), "data.teamFocus"),
                urgency: form.model.get('urgency'),
                visit: {
                    location: patientInfo.visit.locationUid,
                    serviceCategory: patientInfo.visit.serviceCategory,
                    dateTime: patientInfo.visit.dateTime,
                }
            }

        };

        if (formModel.get('firstTimeStart')) {
            $.extend(obj, {
                orderable: JSON.stringify(formModel.get('orderableData')),
                cdsIntentResult: formModel.has('cdsIntent') ? JSON.stringify(formModel.get('cdsIntent')) : '',
                assignedTo: Utils.buildAssignedTo({
                    name: getUIText(_.get(form, 'ui.destinationFacility', '#select2-ordringFacility-container')),
                    code: form.model.get('destinationFacility')
                }, form.model.get('orderableData').data.teamFocus),
                domain: orderable.domain,
                icn: patientInfo.pid,
                instanceName: orderable.name,
                subDomain: orderable.subDomain,
                type: 'Order',
                urgency: form.model.get('urgency')
            });
        }

        return obj;
    }

    var sendSignal = function(e, taskModel, parameterObj, signalAction, onSuccess) {
        // Fetch jbpm deployments
        var fetchOptions = {
            resourceTitle: 'activities-available',
            fetchType: 'GET',
            viewModel: {
                parse: function(response) {
                    // Add a unique identifier to the activities
                    response.uniqueId = _.uniqueId();
                    return response;
                },
                idAttribute: 'uniqueId'
            },
            onSuccess: function(collection) {
                // Find the newest consult deployment
                var newestConsult = Utils.findLatestConsult(collection, 'Order.Consult');
                sendSignalPost(e, newestConsult, taskModel, parameterObj, signalAction, onSuccess);
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sendSignalPost = function(e, newestDeploy, taskModel, parameterObj, signalAction, onSuccess) {
        signalAction = signalAction || '';
        var processInstanceId = Number(taskModel.get('processInstanceId')) || Number(taskModel.get('activity').processInstanceId);

        var fetchOptions = {
            resourceTitle: 'activities-signal',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: newestDeploy.get('deploymentId'),
                processInstanceId: processInstanceId,
                signalName: signalAction,
                parameter: parameterObj
            },
            onSuccess: function() {
                onSuccess();
                modalCloseAndRefresh(e);
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var signOrder = function(e, taskModel, userSession) {
        var fetchOptions = {
            resourceTitle: 'consult-orders-sign',
            fetchType: 'POST',
            criteria: {
                deploymentid: taskModel.get('deploymentId'),
                processDefId: taskModel.get('processDefId'),
                taskid: String(taskModel.get('taskId')),
                pid: taskModel.get('patientIcn'),
                signature: taskModel.get('signature_code'),
                session: userSession
            },
            onSuccess: function(req, res) {
                var Form = Backbone.View.extend({
                    initialize: function() {
                        this.model = taskModel;
                    }
                });
                fetchHelper(e, taskModel, 'complete', paramHelper(new Form(), 'accepted'), function(e) {
                    var signSuccessView = new ADK.UI.Notification({
                        title: 'Sign Consult Order',
                        icon: 'fa-check',
                        message: 'Consult Order Successfully Signed.',
                        type: "success"
                    });
                    signSuccessView.show();
                    modalCloseAndRefresh(e);
                });
            },
            onError: function(req, res) {
                taskModel.trigger('sign:error', taskModel, res, {});
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var setFormComment = function(formModel) {
        var action = formModel && formModel.get('action');
        if (action && action !== 'clarification') {
            return formModel.get('comment');
        } else {
            return formModel.get('question');
        }
    };

    // Close the modal and refresh the todo list and actions tray
    var modalCloseAndRefresh = function(e) {
        EventHandler.fireCloseEvent(e);
        ADK.Messaging.trigger('refresh:applet:todo_list');
    };

    var outOrderPreReqQues = function(formModel) {
        var preReqQues = formModel && formModel.get('preReqQuestions');
        if (preReqQues && preReqQues.length) {
            preReqQues = preReqQues.toJSON ? preReqQues.toJSON() : preReqQues;
            preReqQues = _.map(preReqQues, function(obj) {
                return {
                    question: obj.label,
                    answer: ConsultUtils.mapQuestionCode('getCode', obj.value)
                };
            });
            return preReqQues;
        }
        return [];
    };

    var outOrderPreReqOrders = function(formModel) {
        var preReqOrders = formModel && formModel.get('preReqOrders');
        if (preReqOrders && preReqOrders.length) {
            preReqOrders = preReqOrders.toJSON ? preReqOrders.toJSON() : preReqOrders;
            preReqOrders = _.map(preReqOrders, function(obj) {
                return {
                    orderName: obj.label,
                    statusDate: obj.statusDate,
                    status: obj.value,
                    uid: obj.draftOrderUID || null,
                    signalRegistered: ""

                };
            });
            return preReqOrders;
        }
        return [];
    };

    // Given the key, get and return the proper value
    var outOrderValueHelper = function(formModel, taskVar, key) {
        var value = taskVar[key];
        if (formModel && formModel.get(key)) {
            value = formModel.get(key);
        }
        return value || '';
    };

    var startConsultPost = function(params) {
        var userSession = ADK.UserService.getUserSession().attributes;
        var patientContext = ADK.PatientRecordService.getCurrentPatient();

        // Set the deploymentId in the form model
        // Set initial values to start a consult
        params.form.model.set({
            'deploymentId': params.latestConsult.get('deploymentId'),
            'processDefId': 'Order.Consult',
            'firstTimeStart': true
        }, {
            silent: true
        });
        
        var fetchOptions = {
            resourceTitle: 'activities-start',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: params.latestConsult.get('deploymentId'),
                processDefId: params.latestConsult.get('id'),
                parameter: paramHelper(params.form, params.formAction)
            },
            onSuccess: function() {
                modalCloseAndRefresh(params.e);
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    function compileQuestions(model) {
        var orig = model.get('orderableData');
        if (!_.get(orig, 'prerequisites.ehmp-questionnaire')) {
            return orig;
        } else {
            orig = _.get(orig, 'prerequisites.ehmp-questionnaire');
        }

        var ques = model.get('preReqQuestions');

        _.each(orig['observation-results'], function(result, i) {
            result['observation-result'].value = ques.at(i).get('value');
        });

        return {
            'ehmp-questionnaire': orig
        };
    }

    function compileOrders(model) {
        var map = {
            '': 0,
            'Order': 1,
            'Override': 2,
            'Satisfied': 3
        };

        var obj = [];
        var orig = model.get('cdsIntent').data.results;
        var orders = model.get('preReqOrders');

        _.each(orig, function(prereq, i) {
            var ob = {
                "prerequisite": {
                    prerequisite: prereq
                },
                "action": {
                    "id": map[orders.at(i).get('value')],
                    "value": orders.at(i).get('value')
                },
                "order": {
                    "clinicalObjectUid": " ",
                    "status": " ",
                    "statusDate": "",
                    "activityListenerId": ""
                }
            };

            obj.push(ob);
        });

        return obj;
    }

    var eventHandler = {
        startConsult: function(e, form, formAction) {
            var params = {
                e: e,
                form: form,
                formAction: formAction
            };

            Utils.getLatestConsult('Order.Consult', params, startConsultPost);
        },
        closeModal: function(e) {
            modalCloseAndRefresh(e);
        },
        claimTask: function(formModel) {
            fetchHelper(null, formModel, 'start');
        },
        releaseTask: function(e, formView) {
            fetchHelper(e, formView.model, 'release', null, function() {
                modalCloseAndRefresh(e);
            });
        },
        saveTask: function(e, formView) {
            if (formView.model.get('sendActivitySignal')) {
                sendSignal(e, formView.model, paramHelper(formView, 'saved'), 'saved', function() {
                    modalCloseAndRefresh(e);
                });
            } else {
                this.taskProcessing(e, formView, 'saved', function() {
                    modalCloseAndRefresh(e);
                });
            }
        },
        signTask: function(e, formModel) {
            var userSession = ADK.UserService.getUserSession().attributes;
            signOrder(e, formModel, userSession);
        },
        beginWorkup: function(e, formView) {
            if (formView.model.get('sendActivitySignal')) {
                sendSignal(e, formView.model, paramHelper(formView, 'workup'), 'EDIT', function() {
                    modalCloseAndRefresh(e);
                });
            } else {
                this.taskProcessing(e, formView, 'workup', function() {
                    modalCloseAndRefresh(e);
                });
            }
        },
        completeTask: function(e, formView, orderAction) {
            // Set the formAction based on the form action selected
            var action = formView.model && formView.model.get('action');
            if (action) {
                this.taskProcessing(e, formView, action, function() {
                    modalCloseAndRefresh(e);
                });
            } else {
                this.taskProcessing(e, formView, orderAction, function() {
                    modalCloseAndRefresh(e);
                });
            }
        },
        deleteTask: function(e, formModel) {
            sendSignal(e, formModel, {
                signalBody: {
                    objectType: 'signalBody',
                    comment: 'Abort Process',
                    reason: 'Delete',
                    actionText: 'Delete',
                    executionUserId: formModel.attributes.orderingProvider,
                    executionUserName: ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname')
                }
            }, 'END', function() {
                modalCloseAndRefresh(e);
            });
        },
        fetchHelper: fetchHelper,
        sendSignal: sendSignal,
        paramHelper: paramHelper,
        // Flexible call that exposes all options
        taskProcessing: function(e, formView, outFormStatus, onSuccess) {
            fetchHelper(e, formView.model, 'complete', paramHelper(formView, outFormStatus), onSuccess);
        }
    };

    return eventHandler;
});
