define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/orders/writeback/consults/formFields'
], function(Backbone, Marionette, _, Handlebars, FormFields) {
    'use strict';

    var consultUtils = {
        fetchInitialResources: function() {
            var consultName = $.Deferred();
            var conditions = $.Deferred();

            var self = this;
            var retrieveProviderList = consultUtils.retrieveProviderList.call(self);
            var retrieveConsultNames = consultUtils.retrieveConsultNames.call(self, consultName);

            var fetchOptions = ADK.Messaging.getChannel('problems').request('finalizeConsultOrder');
            this.problemsCollection = ADK.PatientRecordService.fetchCollection(fetchOptions.fetchOptions);
            this.listenToOnce(this.problemsCollection, 'sync', function(col, response) {
                col.each(function(model){
                    if(!model.has('snomedCode')){
                        if(model.has('uid')){
                             model.set('snomedCode' , model.get('uid'));
                        }
                       
                    }
                });
                self.ui.condition.trigger('control:picklist:set', [col]);
                conditions.resolve();
            });

            self.blockUI();

            $.when(retrieveConsultNames, retrieveProviderList, conditions).done(function() {
                self.unBlockUI();
            });

        },
        retrieveProviderList: function() {
            var self = this;
            var people = new ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility();

            this.listenToOnce(people, 'read:success', function(collection, response) {
                if (response && response.data) {
                    var items = _.sortBy(response.data, 'name');
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
        retrieveFacilities: function(withLocation) {
            var self = this;
            var facilities = new ADK.UIResources.Picklist.Team_Management.Facilities();
            var site = ADK.UserService.getUserSession().toJSON();

            this.listenToOnce(facilities, 'read:success', function(collection, response) {
                var data = response.data;
                var isMatch;


                isMatch = _.find(data, function(obj) {
                    var div = _.get(site, 'data.division');
                    return div === obj.facilityID;
                });


                self.unBlockUI();
                self.ui.destinationFacility.trigger('control:picklist:set', [collection]);

                if (isMatch && !self.taskModel && !self.isFromDraft) {
                    self.model.set('destinationFacility', isMatch.facilityID);
                    self.ui.destinationFacility.find('select').trigger('change.select2');
                    return;
                }

                if (!withLocation) {
                    self.model.set('destinationFacility', '');
                    self.ui.destinationFacility.find('select').trigger('change.select2');
                }

            });

            this.listenToOnce(facilities, 'read:error', function(collection, xhr, options) {
                self.unBlockUI();
                var errorView = new ADK.UI.Notification({
                    title: 'There was an error retrieving locations for consultation',
                    icon: 'fa-exclamation-triangle',
                    message: xhr.statusText,
                    type: 'danger'
                });
                errorView.show();
            });

            this.blockUI();

            facilities.fetch({
                teamFocus: this.model.get('consultName') || this.model.get('specialty')
            });

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
                        self.blockUI();
                        var callback = _.partialRight(_.bind(retrieveOrdersSuccess, self), collection);

                        consultUtils.retrieveOrders(_.get(obj, 'data.prerequisites.cdsIntent'), callback, function() {
                            self.unBlockUI();
                        });
                    } else {
                        ADK.Messaging.trigger('retrievePreReqs:' + self.cid, collection);
                        consultUtils.retrieveFacilities.call(self);
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

                consultUtils.retrieveFacilities.call(this); // jshint ignore:line
            }
        },
        outputForOrders: function(collection, response) {

            var model = collection.at(0);
            var results = model.get('results');
            var output = [];

            _.each(results, function(result) {
                var ien = result.remediation.coding.code;
                var index = ien.lastIndexOf(':');
                var detail = result.detail;
                var dateOfCompletion = detail.issued ? detail.issued : '';
                var labName = _.get(detail, 'code.text') || detail.comments;
                var obj = {
                    label: labName,
                    value: result.status,
                    name: labName,
                    status: result.status,
                    statusDate: dateOfCompletion,
                    ien: ien.slice(index + 1)
                };

                output.push(obj);
            });

            return output;
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
                            "name": userInfo.lastname + ", " + userInfo.firstName || ''
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
                        response.results = response.results[0].body.prerequisites;
                        return response;
                    }
                },
                onSuccess: function(collection, response) {
                    successCallBack.apply(self, arguments);
                },
                onError: function(model, response) {
                    errorCallBack(model, response);
                    var errorView = new ADK.UI.Notification({
                        title: 'There was an error making the resource call',
                        icon: 'fa-exclamation-triangle',
                        message: response.statusText,
                        type: 'danger'
                    });
                    errorView.show();

                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

            // retrieveModel.save();
        },
        prepareOrdersTobePlaced: function(nameOfFormFunction /*Name of form function to run after orders have been placed*/) {

            var self = this;

            var orders = this.model.get('preReqOrders').where({
                'value': 'Order'
            });

            var ordersError = false;

            var readyToOrder = true;
            var orderCount = 0;

            this.blockUI();


            var interval = setInterval(function() {
                if (orders.length === orderCount) {
                    clearInterval(interval);

                    self.unBlockUI();

                    if (ordersError) {

                        self.ordersError();

                        return;
                    }
                    self[nameOfFormFunction]();

                } else {
                    if (readyToOrder) {
                        readyToOrder = false;

                        var currentOrderToPlace = orders[orderCount];

                        var PostModel = Backbone.Model.extend({
                            url: '/resource/write-health-data/patient/' + ADK.PatientRecordService.getCurrentPatient().toJSON().pid + '/orders/save-draft-lab?',
                            defaults: {
                                "authorUid": consultUtils.getAuthorUID(),
                                "data": {
                                    "availableLabTests": currentOrderToPlace.get('ien'),
                                    "labTestText": currentOrderToPlace.get('label'),
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
                                "displayName": currentOrderToPlace.get('label'),
                                "domain": "ehmp-order",
                                "ehmpState": "draft",
                                "patientUid": ADK.PatientRecordService.getCurrentPatient().toJSON().uid,
                                "subDomain": "laboratory",
                                "visit": consultUtils.getVisitInfo(),
                                "uid": "",
                                referenceId: ""

                            }
                        });

                        var postModel = new PostModel();

                        postModel.save({}, {
                            success: function(model, resp) {
                                var uid = resp.data.headers.location;
                                var index = uid.lastIndexOf('/');
                                uid = uid.slice(index + 1);
                                currentOrderToPlace.set({
                                    'draftOrderUID': uid
                                }, {
                                    silent: true
                                });

                                orderCount++;

                                var confirmationView = new ADK.UI.Notification({
                                    title: 'Laboratory Draft Order',
                                    icon: 'fa-exclamation-triangle',
                                    message: currentOrderToPlace.get('label') + ' Successfully saved',
                                    type: 'success'
                                });
                                confirmationView.show();

                                readyToOrder = true;

                            },
                            error: function(model, response, options) {

                                orderCount = orders.length;
                                ordersError = true;
                            }
                        });

                    }
                }

            }, 100);



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
        }

    };


    return consultUtils;
});
