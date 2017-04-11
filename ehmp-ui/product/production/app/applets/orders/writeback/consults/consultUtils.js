define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/orders/writeback/consults/formFields',
    'async'
], function(Backbone, Marionette, _, Handlebars, FormFields, Async) {
    'use strict';

    var consultUtils = {
        urgencyMap: {
            emergent: ['0', '1', '2', '3'],
            urgent: ['4', '5', '6'],
            routine: ['7', '8', '9', '10']
        },
        isEmergent: function(urgency) {
            return _.contains(this.urgencyMap.emergent, urgency);
        },
        isUrgent: function(urgency) {
            return _.contains(this.urgencyMap.urgent, urgency);
        },
        isRoutine: function(urgency) {
            return _.contains(this.urgencyMap.routine, urgency);
        },
        fetchInitialResources: function() {
            this.blockUI('Loading...');

            var consultName = $.Deferred();
            var conditions = $.Deferred();
            var facilities = $.Deferred();

            var self = this;
            var retrieveProviderList = consultUtils.retrieveProviderList.call(self);
            var retrieveConsultNames = consultUtils.retrieveConsultNames.call(self, consultName);
            var retrieveFacilities = consultUtils.retrieveFacilities.call(self, true, facilities);

            var fetchOptions = $.extend(true, {}, ADK.Messaging.getChannel('problems').request('finalizeConsultOrder').fetchOptions);
            fetchOptions.viewModel.parse = function(response) {
                if (!response.snomedCode) {
                    if (response.uid) {
                        response.snomedCode = response.uid;
                    }
                }
                //convert to title case
                response.problemText = _.startCase(response.problemText.toLowerCase());
                return response;
            };
            fetchOptions.viewModel.idAttribute = 'problemText';

            this.problemsCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);

            this.listenToOnce(this.problemsCollection, 'sync', function(col, response) {
                //remove duplicate problem list
                var list = _.uniq(col.models, function(model) {
                    return model.get('problemText');
                });

                self.ui.condition.trigger('control:picklist:set', [list]);
                conditions.resolve();
            });


            $.when(retrieveProviderList, consultName, conditions, facilities)
                .done(function() {
                    self.unBlockUI();
                });



        },
        retrieveProviderList: function() {
            var self = this;
            var people = new ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility();

            this.listenToOnce(people, 'read:success', function(collection, response) {
                if (response && response.data) {
                    var items = _.sortBy(response.data, 'name');

                    // Replace all the semicolons with colons to build proper urn's
                    _.map(items, function(obj) {
                        obj.personID = obj.personID.replace(/;/g, ':');
                    });
                    self.ui.acceptingProvider.trigger('control:picklist:set', [items]);
                }
            });

            return people.fetch({
                facilityID: ADK.UserService.getUserSession().get('division')
            });
        },
        retrieveConsultNames: function($deferred) {
            var self = this;


            var callback = {
                success: function(collection, response, options) {
                    ADK.Messaging.trigger('retrieveConsultNames:' + self.cid, collection);
                    $deferred.resolve({
                        status: 'success'
                    });
                }
            };

            var fetchOptions = {
                pageable: false,
                resourceTitle: 'enterprise-orderable-search',
                cache: false,
                onSuccess: callback.success,
                viewModel: {
                    parse: function(response) {
                        response.value = response.label = response.name;
                        return response;
                    }
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

            return $deferred;
        },
        retrieveFacilities: function(withLocation, deferred) {
            var self = this;
            var site = ADK.UserService.getUserSession().toJSON();

            var fetchOptions = {
                type: 'GET',
                resourceTitle: 'authentication-list',
                cache: true
            };

            var facilitiesCollection = ADK.ResourceService.fetchCollection(fetchOptions);


            this.listenToOnce(facilitiesCollection, 'sync', function(collection, response, xhr) {
                if (response.status === 200) {
                    deferred.resolve();
                    var data = response.data;
                    var isMatch;

                    var div = _.get(site, 'division');

                    isMatch = collection.find(function(model) {
                        return div === model.get('division');
                    });


                    self.ui.destinationFacility.trigger('control:picklist:set', [collection]);

                    // Make sure focus remains on the select component after selecting.
                    var consultNameSelect = self.$el.find('#select2-consultName-container');
                    if (!_.isEmpty(consultNameSelect)) {
                        self.$el.find('#select2-consultName-container').closest('.select2-selection').focus();
                    }

                    if (isMatch && !self.taskModel && !self.draftActivity) {
                        self.model.set('destinationFacility', isMatch.get('division'));
                        self.ui.destinationFacility.find('select').trigger('change.select2');
                        return;
                    }

                    if (!withLocation) {
                        self.model.set('destinationFacility', '');
                        self.ui.destinationFacility.find('select').trigger('change.select2');
                    }
                } else {
                    var errorView = new ADK.UI.Notification({
                        title: 'Error',
                        message: 'Could not retrieve locations for consultation',
                        type: 'info'
                    });
                    errorView.show();
                    deferred.resolve();
                }

            });

            return deferred;

        },
        retrievePreReqs: function() {
            var self = this;


            var callback = {
                success: function(collection, response) {
                    var obj = collection.at(0).toJSON();
                    self.model.set({
                        'orderableData': obj
                    }, {
                        silent: true
                    });
                    if (_.get(obj, 'data.prerequisites.cdsIntent')) {
                        self.blockUI('Loading...');
                        var callback = _.partialRight(_.bind(retrieveOrdersSuccess, self), collection);

                        consultUtils.retrieveOrders(_.get(obj, 'data.prerequisites.cdsIntent'), callback, function() {
                            self.$el.trigger('tray.reset');
                        });
                    } else {
                        ADK.Messaging.trigger('retrievePreReqs:' + self.cid, collection);
                        self.model.unset('cdsIntent');

                    }


                }
            };

            var fetchOptions = {
                pageable: false,
                resourceTitle: 'enterprise-orderable-search',
                cache: false,
                criteria: {
                    name: self.model.get('consultName')
                },
                onSuccess: callback.success,
                viewModel: {
                    parse: function(response) {
                        if (_.get(response, 'data.prerequisites.ehmp-questionnaire.observation-results')) {
                            response.questions = FormFields.mapPreReqQuestions(response.data.prerequisites['ehmp-questionnaire']['observation-results'], FormFields.fromCDSQuestionsMapping);
                        }

                        if (_.get(response, 'data.instructions')) {

                            self.model.set('instructions', _.get(response, 'data.instructions'));
                        } else {
                            self.model.unset('instructions');
                        }

                        return response;
                    }
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

            function retrieveOrdersSuccess(collection, response, originalCollection) {
                this.unBlockUI(); // jshint ignore:line
                this.model.set('cdsIntent', response); // jshint ignore:line
                originalCollection.at(0).set('orders', consultUtils.outputForOrders(collection, response));
                ADK.Messaging.trigger('retrievePreReqs:' + self.cid, originalCollection);

            }
        },
        outputForOrders: function(collection, response) {

            var model = collection.at(0);
            var results = model.get('results');

            return _.map(results, function(result) {
                var ien = result.remediation.coding.code;
                var index = ien.lastIndexOf(':');
                var detail = result.detail;
                var dateOfCompletion = detail.issued ? detail.issued : '';
                var labName = _.get(detail, 'code.text') || detail.comments;
                return consultUtils.augmentPreReqOrder({
                    label: labName,
                    value: result.status,
                    name: labName,
                    status: result.status,
                    statusDate: dateOfCompletion,
                    ien: ien.slice(index + 1)
                }, result.remediation);
            });
        },
        retrieveOrders: function(intentSet, successCallBack, errorCallBack) {

            var self = this;

            errorCallBack = errorCallBack || function() {};

            var patientInfo = ADK.PatientRecordService.getCurrentPatient().toJSON();
            var userInfo = ADK.UserService.getUserSession().toJSON();

            var fetchOptions = {
                pageable: false,
                resourceTitle: 'activities-cds-intent-service',
                cache: false,
                fetchType: 'POST',
                criteria: {
                    "context": {
                        "location": {
                            "entityType": "Location",
                            "id": userInfo.site,
                            "name": userInfo.facility
                        },
                        "subject": {
                            "entityType": "Subject",
                            "id": patientInfo.pid,
                            "name": patientInfo.fullName
                        },
                        "user": {
                            "entityType": "User",
                            "id": userInfo.site + ";" + userInfo.duz[userInfo.site],
                            "name": userInfo.lastname + ", " + userInfo.firstname || ''
                        }
                    },
                    "target": {
                        "intentsSet": [
                            intentSet
                        ],
                        "mode": "Normal",
                        "type": "Direct"
                    }
                },
                viewModel: {
                    parse: function(response) {
                        response.results = _.get(response, 'results[0].body.prerequisites');
                        return response;
                    }
                },
                onSuccess: function(collection, response) {
                    if (_.isUndefined(response.data)) {
                        fetchOptions.onError.call(this);
                        return;
                    }
                    successCallBack.apply(self, arguments);
                },
                onError: function(model, response) {
                    errorCallBack(model, response);
                    var errorView = new ADK.UI.Alert({
                        title: 'Error',
                        icon: 'fa-exclamation-triangle font-size-18 color-red',
                        messageView: Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile('Unable to proceed at this time due to a system error. Try again later.'),
                            tagName: 'p'
                        }),
                        footerView: Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm" title="Press enter to close."}}'),
                            events: {
                                'click .btn-primary': function() {
                                    ADK.UI.Alert.hide();
                                }
                            },
                            tagName: 'span'
                        })
                    });
                    errorView.show();

                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

            // retrieveModel.save();
        },
        prepareOrdersTobePlaced: function(nameOfFormFunction /*Name of form function to run after orders have been placed*/ ) {

            var self = this;

            var orders = this.model.get('preReqOrders').where({
                'value': 'Order'
            });

            var tasks = [];

            var PostModel = Backbone.Model.extend({
                url: '/resource/write-health-data/patient/' + ADK.PatientRecordService.getCurrentPatient().toJSON().pid + '/orders/save-draft-lab?',
                defaults: {
                    "authorUid": consultUtils.getAuthorUID(),
                    "data": {
                        "availableLabTests": "",
                        "labTestText": "",
                        "collectionDate": "",
                        "collectionType": "",
                        "collectionSample": "",
                        "specimen": "",
                        "urgency": "",
                        "urgencyText": self.model.get('urgency').toUpperCase(),
                        "notificationDate": "",
                        "pastDueDate": "",
                        "collectionTime": "",
                        "otherCollectionSample": "",
                        "immediateCollectionDate": "",
                        "immediateCollectionTime": "",
                        "collectionDateTimePicklist": "",
                        "howOften": "",
                        "howLong": "",
                        "otherSpecimen": "",
                        "forTest": "",
                        "doseDate": "",
                        "doseTime": "",
                        "drawDate": "",
                        "drawTime": "",
                        "orderComment": "",
                        "anticoagulant": "",
                        "sampleDrawnAt": "",
                        "urineVolume": "",
                        "additionalComments": "",
                        "annotation": "",
                        "problemRelationship": "",
                        "activity": "",
                        "isActivityEnabled": ""
                    },
                    "displayName": "",
                    "domain": "ehmp-order",
                    "ehmpState": "draft",
                    "patientUid": ADK.PatientRecordService.getCurrentPatient().toJSON().uid,
                    "subDomain": "laboratory",
                    "visit": consultUtils.getVisitInfo(),
                    "uid": "",
                    referenceId: ""

                }
            });

            _.each(orders, function(order) {
                var updatedDefaultData = $.extend(true, {}, PostModel.prototype.defaults.data, {
                    "availableLabTests": order.get('ien'),
                    "labTestText": order.get('label'),
                });

                var postModel = new PostModel({
                    "data": updatedDefaultData,
                    "displayName": order.get('label'),
                });



                var task = function(callback) {
                    postModel.save({}, {
                        success: function(model, resp) {
                            var uid = resp.data.headers.location;
                            var index = uid.lastIndexOf('/');
                            uid = uid.slice(index + 1);
                            order.set({
                                'uid': uid
                            }, {
                                silent: true
                            });

                            var confirmationView = new ADK.UI.Notification({
                                title: 'Laboratory Draft Order',
                                icon: 'fa-exclamation-triangle',
                                message: order.get('label') + ' Successfully saved',
                                type: 'success'
                            });
                            confirmationView.show();
                            callback(null, resp);
                        },
                        error: function(model, resp, options) {
                            callback(resp);
                        }
                    });
                };


                tasks.push(task);
            });

            Async.parallel(tasks, function(err, results) {
                if (err) {
                    self.ordersError();
                } else {
                    self[nameOfFormFunction]();
                }
            });

            this.blockUI('Beginning workup');


            //end of prepareOrdersTobePlaced
        },
        getVisitInfo: function() {
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
            var site = ADK.UserService.getUserSession().get('site');
            var location = visitInfo.locationUid.split(':').pop();
            return {
                "location": location,
                "serviceCategory": visitInfo.serviceCategory,
                "dateTime": visitInfo.dateTime
            };

        },
        getAuthorUID: function() {
            var user = ADK.UserService.getUserSession().toJSON();
            return 'urn:va:user:' + user.site + ':' + user.duz[user.site];
        },
        mapQuestionCode: function(getCodeOrGetText /* string getCode will get the code, getText will get the text*/ , value) {

            var mapping = {
                'Yes': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                'No': 'd58a8003-b801-3da2-83c1-e09497c9bb53',
                'Override': '3E8DD206-FBDF-4478-9B05-7638682DD102'
            };

            var output;

            switch (getCodeOrGetText) {
                case 'getCode':
                    output = _.get(mapping, value);
                    break;
                case 'getText':
                    output = _.get(_.invert(mapping), value);
                    break;
            }

            return output;
        },
        getLabOrdersUID: function(model) {
            var value = model.get('value');
            if (value.match(':comp') || value.match('Passed')) {

                var searchTerm = model.get('label');
                var fetchOptions = {
                    resourceTitle: 'patient-record-search-text',
                    criteria: {
                        types: 'lab',
                        query: searchTerm
                    },
                    onSuccess: function(collection, response) {
                        if (collection.length) {
                            ADK.Messaging.getChannel('consultOrder').trigger('getLabOrdersUID', {
                                collection: collection,
                                lab: searchTerm
                            });
                        }
                    }
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions);


            }
            return;
        },
        augmentPreReqOrder: function(preReqOrder, orderRemediation) {
            if (_.isEmpty(orderRemediation)) {
                return preReqOrder;
            }
            return _.extend(preReqOrder, {
                domain: orderRemediation.domain,
                action: orderRemediation.action
            });
        },
        getOrderRemediation: function(order, cdsIntentResults) {
            var matchingResult = _.find(cdsIntentResults, function(result) {
                return order.orderName === _.get(result.detail, 'code.text') ||
                    order.orderName === _.get(result.detail, 'comments');
            });
            return _.isEmpty(matchingResult) ? null : matchingResult.remediation;
        }
    };


    return consultUtils;
});