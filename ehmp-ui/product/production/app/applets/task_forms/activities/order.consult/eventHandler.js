define([
    "underscore",
    "moment",
    "app/applets/task_forms/common/utils/eventHandler",
    "app/applets/task_forms/common/utils/utils",
    "app/applets/orders/writeback/consults/consultUtils"
], function(_, moment, EventHandler, Utils, ConsultUtils) {
    "use strict";

    var fetchHelper = function(e, taskModel, state, parameterObj, onSuccess) {
        var fetchOptions = {
            resourceTitle: 'tasks-update',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: taskModel.get('deploymentId'),
                processDefId: taskModel.get('processDefId'),
                taskid: String(taskModel.get('taskId')),
                state: state,
                pid: taskModel.get('patientIcn'),
                parameter: parameterObj
            },
            onSuccess: onSuccess,
            onError: function(err, resp) {
                var error = resp.responseText.replace(/\'/g, '');
                try {
                    error = JSON.parse(error);
                } catch (e) {
                    return;
                }

                var errMsgType = error.message.split(' ');
                if (errMsgType.length > 0 && errMsgType[0] === 'PermissionDeniedException') {
                    taskModel.listenToOnce(ADK.Messaging.getChannel('consult_eventHandler'), 'permissionDeniedModal', function(params) {
                        // Create and load the modal
                        var taskModel = params.taskModel;
                        var AlertView = Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile([
                                'This task is now being completed by',
                                params.facilityName + ':',
                                taskModel.get('actualOwnerName').replace(',', ', ')
                            ].join(' '))
                        });
                        var AlertFooterView = Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile('{{ui-button "Close" classes="btn-default alert-close" title="Click to close"}}'),
                            events: {
                                'click button': function() {
                                    modalCloseAndRefresh(e);
                                    ADK.UI.Alert.hide();
                                }
                            }
                        });
                        var alertView = new ADK.UI.Alert({
                            title: 'Unable to complete task',
                            messageView: AlertView,
                            footerView: AlertFooterView
                        });
                        alertView.show();
                    });

                    // Make resource call to retrieve updated task information and show modal
                    var taskId = taskModel.get('taskId') * 1;
                    var onSuccess = function(taskDataCollection) {
                        var taskModel = taskDataCollection.first();
                        var owner = taskModel.get('actualOwnerId').split(';');
                        var userSession = ADK.UserService.getUserSession().toJSON();
                        var userId = _.get(userSession, 'duz.' + userSession.site);
                        if (owner.length > 1) {
                            if (userId !== owner[1]) {
                                var facilityId = owner[0];
                                Utils.getFacilities(function(facilityCollection) {
                                    var facility = facilityCollection.find(function(model) {
                                        return model.get('siteCode') === facilityId;
                                    });
                                    ADK.Messaging.getChannel('consult_eventHandler').trigger('permissionDeniedModal', {
                                        taskModel: taskModel,
                                        facilityName: facility.get('name')
                                    });
                                });
                            }
                        } else {
                            console.error('ActualOwnerId is undefined');
                        }
                    };
                    Utils.getTaskData(taskId, onSuccess);
                }
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    function getUIText(uiElement, selector) {
        if (uiElement && uiElement.find('option:selected').length) {
            return uiElement.find('option:selected').text();
        } else if (uiElement && uiElement.find(selector).length) {
            return uiElement.find(selector).text();
        }
        return '';
    }

    function getUIVal(uiElement, selector) {
        if (uiElement && uiElement.find('option:selected').length) {
            return uiElement.find('option:selected').val();
        } else if (uiElement && uiElement.find(selector).length && $.trim(uiElement.find(selector).val()) !== '') {
            return uiElement.find(selector).val();
        }
        return '';
    }

    function setSpecialField(formModelValue, obj) {
        if (formModelValue && typeof formModelValue === 'object') {
            return formModelValue;
        }
        return obj;
    }

    function pickAcceptingProvider(form) {
        var formModel = form.model;

        if (formModel.has('provider') && !_.isUndefined(form.ui.provider)) {
            return setSpecialField(formModel.get('provider'), {
                displayName: getUIText(_.get(form, 'ui.provider'), '#select2-provider-container'),
                uid: 'urn:va:user:' + formModel.get('provider')
            });
        } else if (formModel.has('acceptingProvider')) {
            return setSpecialField(formModel.get('acceptingProvider'), {
                displayName: getUIText(_.get(form, 'ui.acceptingProvider'), '#acceptingProvider'),
                uid: 'urn:va:user:' + formModel.get('acceptingProvider')
            });
        }
    }


    function getCondition(form) {
        var conditions = {};
        var formModel = form.model;
        if (form.taskModel || form.draftActivity || form.showEdit || _.get(formModel.toJSON(), 'firstTimeStart') === true) {
            conditions.code = formModel.get('condition');
            conditions.name = getUIText(_.get(form, 'ui.condition'), '#select2-condition-container');
        } else {
            conditions = _.get(formModel.get('conditions'), ['0'], {});
        }

        return conditions;
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
                acceptingProvider: pickAcceptingProvider(form),
                communityCareStatus: formModel.get('communityCareStatus'),
                communityCareType: formModel.get('communityCare'),
                conditions: getCondition(form),
                consultName: _.escape(formModel.get('consultName')),
                contactAttempt: formModel.get('contactAttempt'),
                deploymentId: formModel.get('deploymentId'),
                destinationFacility: setSpecialField(formModel.get('destinationFacility'), {
                    code: formModel.get('destinationFacility'),
                    name: getUIText(_.get(form, 'ui.destinationFacility'), '#select2-destinationFacility-container')
                }),
                earliestDate: formModel.get('earliestDate'),
                executionUserId: userInfo.uid,
                executionUserName: userInfo.lastname + ', ' + userInfo.firstname,
                formAction: formAction,
                formComment: formModel.get('comment') || formModel.get('question'),
                instructions: formModel.get('instructions'),
                latestDate: formModel.get('latestDate'),
                orderingFacility: formModel.has('orderingFacility') ? formModel.get('orderingFacility') : {
                    code: userInfo.division,
                    name: userInfo.facility
                },
                orderingProvider: formModel.has('orderingProvider') ? formModel.get('orderingProvider') : {
                    displayName: userInfo.lastname + ', ' + userInfo.firstname,
                    uid: userInfo.uid
                },
                overrideReason: formModel.get('overrideReason'),
                orderResultComment: formModel.get('orderResultComment'),
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
                    locationDesc: patientInfo.visit.locationDisplayName
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

    var editParamHelper = function(form) {
        var patientInfo = ADK.PatientRecordService.getCurrentPatient().toJSON();
        var formModel = form.model;
        var provider = formModel.get('provider') || formModel.get('acceptingProvider');
        var param = {
            'signalBody': {
                'objectType': 'signalBody',
                'urgency': formModel.get('urgency'),
                'acceptingProvider': pickAcceptingProvider(form),
                'earliestDate': formModel.get('earliestDate'),
                'latestDate': formModel.get('latestDate'),
                'facility': setSpecialField(formModel.get('destinationFacility'), {
                    code: formModel.get('destinationFacility'),
                    name: getUIText(_.get(form, 'ui.destinationFacility'), '#select2-destinationFacility-container')
                }),
                'conditions': getCondition(form),
                'request': formModel.get('requestReason'),
                'comment': formModel.get('requestComment'),
                'orderResultComment': formModel.get('orderResultComment'),
                'overrideReason': formModel.get('overrideReason'),
                'questions': outOrderPreReqQues(formModel),
                'ordersResults': outOrderPreReqOrders(formModel),
                'action': formModel.get('formAction'),
                'visit': {
                    location: patientInfo.visit.locationUid,
                    serviceCategory: patientInfo.visit.serviceCategory,
                    dateTime: patientInfo.visit.dateTime,
                    locationDesc: patientInfo.visit.locationDisplayName
                }
            }
        };
        return param;
    };

    var sendSignal = function(e, taskModel, parameterObj, signalAction, onSuccess, leaveOpen) {
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
                var processInstanceId = Number(taskModel.get('processInstanceId')) || Number(taskModel.get('activity').processInstanceId);
                sendSignalPost(e, newestConsult.get('deploymentId'), processInstanceId, parameterObj, signalAction, onSuccess, leaveOpen);
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sendSignalPost = function(e, deploymentId, processInstanceId, parameterObj, signalAction, onSuccess, leaveOpen) {
        signalAction = signalAction || '';

        var fetchOptions = {
            resourceTitle: 'activities-signal',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: deploymentId,
                processInstanceId: processInstanceId,
                signalName: signalAction,
                parameter: parameterObj
            },
            onSuccess: function() {
                onSuccess();
                if (!leaveOpen) {
                    modalCloseAndRefresh(e);
                }
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var signOrder = function(e, taskModel, userSession) {
        var fetchOptions = {
            resourceTitle: 'consult-orders-sign',
            fetchType: 'POST',
            criteria: {
                deploymentId: taskModel.get('deploymentId'),
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
                        title: 'Success',
                        message: 'Consult Order Signed',
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
        ADK.Messaging.getChannel('orders').trigger('applet:refresh');
        ADK.Messaging.getChannel('activities').trigger('create:success');
        ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');
    };

    var outOrderPreReqQues = function(formModel) {
        var preReqQues = formModel && formModel.get('preReqQuestions');
        if (preReqQues && preReqQues.length) {
            preReqQues = preReqQues.toJSON ? preReqQues.toJSON() : preReqQues;

            if (!preReqQues[0].hasOwnProperty('label')) {
                return preReqQues;
            }

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

            if (!preReqOrders[0].hasOwnProperty('label')) {
                return preReqOrders;
            }


            preReqOrders = _.map(preReqOrders, function(obj) {
                return {
                    orderName: obj.label,
                    statusDate: obj.statusDate,
                    status: obj.value,
                    uid: obj.uid || null,
                    signalRegistered: "",
                    ien: obj.ien || null

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
            },
            onError: function(req, res) {
                var errorMessage = JSON.parse(res.responseText).message;

                if (errorMessage) {
                    params.form.model.set('errorMessage', errorMessage);
                }
                params.form.unBlockUI();
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
        claimTask: function(formModel, onSuccess) {
            fetchHelper(null, formModel, 'claim', null, onSuccess);
        },
        startTask: function(formModel) {
            fetchHelper(null, formModel, 'start');
        },
        startClaimedTask: function(formModel, onSuccess) {
            fetchHelper(null, formModel, 'start', null, onSuccess);
        },
        releaseTask: function(e, formView) {
            fetchHelper(e, formView.model, 'release', null, function() {
                modalCloseAndRefresh(e);
            });
        },
        saveTask: function(e) {
            var formView = this;
            this.listenToOnce(ADK.Messaging.getChannel('task-event'), 'save', function() {
                if (formView.model.get('sendActivitySignal')) {
                    sendSignal(e, formView.model, paramHelper(formView, 'saved'), 'saved', function() {
                        modalCloseAndRefresh(e);
                    });
                } else {
                    eventHandler.taskProcessing.call(this, e, 'saved', function() {
                        modalCloseAndRefresh(e);
                    }, true);
                }
            });


            if (formView.model.get('sendActivitySignal')) {
                ADK.Messaging.getChannel('task-event').trigger('save');
            } else {
                eventHandler.startClaimedTask(formView.model, function() {
                    ADK.Messaging.getChannel('task-event').trigger('save');
                });
            }

        },
        signTask: function(e) {
            var formModel = this.model;
            var userSession = ADK.UserService.getUserSession().attributes;
            signOrder(e, formModel, userSession);
        },
        beginWorkup: function(e) {
            var formView = this;
            this.listenToOnce(ADK.Messaging.getChannel('task-event'), 'begin', function() {
                if (formView.model.get('sendActivitySignal')) {
                    sendSignal(e, formView.model, paramHelper(formView, 'workup'), 'EDIT', function() {
                        modalCloseAndRefresh(e);
                    });
                } else {
                    eventHandler.taskProcessing.call(this, e, 'workup', function() {
                        modalCloseAndRefresh(e);
                    }, true);
                }
            });

            if (formView.model.get('sendActivitySignal')) {
                ADK.Messaging.getChannel('task-event').trigger('begin');
            } else {
                eventHandler.startClaimedTask(formView.model, function() {
                    ADK.Messaging.getChannel('task-event').trigger('begin');
                });
            }

        },
        completeTask: function(e, orderAction) {
            var formView = this;
            this.listenToOnce(ADK.Messaging.getChannel('task-event'), 'complete', function() {
                // Set the formAction based on the form action selected
                var action = formView.model && formView.model.get('action');
                if (action) {
                    eventHandler.taskProcessing.call(this, e, action, function() {
                        modalCloseAndRefresh(e);
                    }, true);
                } else {
                    eventHandler.taskProcessing.call(this, e, orderAction, function() {
                        modalCloseAndRefresh(e);
                    }, true);
                }
            });

            eventHandler.startClaimedTask(formView.model, function() {
                ADK.Messaging.getChannel('task-event').trigger('complete');
            });
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
        sendSignalPost: sendSignalPost,
        paramHelper: paramHelper,
        editParamHelper: editParamHelper,
        modalCloseAndRefresh: modalCloseAndRefresh,
        // Flexible call that exposes all options
        taskProcessing: function(e, outFormStatus, onSuccess, ignoreStartCall) {
            var formView = this;
            this.listenToOnce(ADK.Messaging.getChannel('task-event'), 'process', function() {
                fetchHelper(e, formView.model, 'complete', paramHelper(formView, outFormStatus), onSuccess);
            });

            if (ignoreStartCall) {
                ADK.Messaging.getChannel('task-event').trigger('process');
            } else {
                eventHandler.startClaimedTask(formView.model, function() {
                    ADK.Messaging.getChannel('task-event').trigger('process');
                });
            }
        }
    };

    return eventHandler;
});
