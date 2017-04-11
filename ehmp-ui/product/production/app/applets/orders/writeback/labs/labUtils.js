define([
    "backbone",
    "marionette",
    "underscore",
    "moment",
    'app/applets/orders/writeback/labs/formUtils'
], function(Backbone, Marionette, _, moment, FormUtils) {
    "use strict";

    var SERVER_SIDE_ERROR_ACTIONS = {
        'pick-list': 'auto-fill form',
        'invalid-response': 'validate data',
        'generic': 'complete your action'
    };

    //temporary location until functions are moved to the formModel.js
    var AVAILABLE_LAB_TEST = '4';
    var COLLECTION_DATE_TIME = '6';
    var COMMENTS = '15';
    var COLLECTION_TYPE = '28';
    var COLLECTION_SAMPLES = '126';
    var SPECIMEN = '127';
    var URGENCY = '180';

    var componentList = {};

    function splitDateTime(dateTimeString) {
        var dateTime = dateTimeString.split(' ');
        return {
            date: (dateTime[0] || ''),
            time: (dateTime[1] || '0:00')
        };
    }

    var addLabUtils = {
        getServerSideErrorMessage: function(errorType) {
            errorType = errorType || 'generic';
            var action = SERVER_SIDE_ERROR_ACTIONS[errorType] || SERVER_SIDE_ERROR_ACTIONS.generic;
            return ('Unable to ' + action + ' at this time due to a system error. Try again later.');
            
        },
        processExistingLabOrder: function(form) {
            var existingOrder = form.model.get('existingOrder');
            if (!_.isEmpty(existingOrder)) {
                var collectionDateTimeValue = null;
                var collectionTypeId = null;
                var collectionSampleId = null;
                var specimenId = null;
                var urgencyId = null;
                var attributes = {};
                existingOrder.forEach(function(entry) {
                    switch (entry.keyId) {
                        case COLLECTION_DATE_TIME:
                            collectionDateTimeValue = entry.valueName;
                            break;
                        case COMMENTS:
                            var parsedComments = entry.valueName.split('\r\n');
                            if (parsedComments && parsedComments.length > 0) {
                                var dynamicFieldType = '';
                                parsedComments.forEach(function(comment) {
                                    if (comment !== '') {
                                        if (comment.indexOf('~For Test:') !== -1) {
                                            attributes.forTest = comment;
                                        } else if (comment.indexOf('~Last dose:') !== -1) {
                                            //todo: parse out the date time
                                            var doseDrawDateTime = comment.replace('~Last dose: ', '').split(' draw time: ');
                                            if (doseDrawDateTime.length > 0) {
                                                var doseString = doseDrawDateTime[0];
                                                var doseDateTime = splitDateTime(doseString);
                                                attributes.doseDate = doseDateTime.date;
                                                attributes.doseTime = doseDateTime.time;
                                            }
                                            if (doseDrawDateTime.length > 1) {
                                                var drawString = doseDrawDateTime[1];
                                                var drawDateTime = splitDateTime(drawString);
                                                attributes.drawDate = drawDateTime.date;
                                                attributes.drawTime = drawDateTime.time;
                                            }
                                        } else if (comment.indexOf('~ANTICOAGULANT:') !== -1) {
                                            attributes.anticoagulant = comment.replace('~ANTICOAGULANT: ', '');
                                        } else if (comment.indexOf('~Dose is expected to be at') !== -1) {
                                            attributes.sampleDrawnAt = comment;
                                            dynamicFieldType = 'sampleDrawnAt';
                                        } else if (dynamicFieldType === 'sampleDrawnAt') {
                                            attributes.additionalComments = comment;
                                        } else {
                                            attributes.orderComment = comment.substring(1);
                                        }
                                    }
                                });
                            }

                            break;
                        case COLLECTION_TYPE:
                            collectionTypeId = entry.valueId;
                            break;
                        case COLLECTION_SAMPLES:
                            collectionSampleId = entry.valueId;
                            break;
                        case SPECIMEN:
                            specimenId = entry.valueId;
                            break;
                        case URGENCY:
                            urgencyId = entry.valueId;
                            break;
                    }
                });
                if (collectionTypeId) {
                    attributes.collectionType = collectionTypeId;
                    switch (collectionTypeId) {
                        case 'SP':
                        case 'WC':
                            if (collectionDateTimeValue === 'TODAY') {
                                this.setInitialCollectionDateTimeValues(form);
                            } else {
                                var dateTime = splitDateTime(collectionDateTimeValue);
                                attributes.collectionDate = dateTime.date;
                                attributes.collectionTime = dateTime.time;
                            }
                            break;
                        case 'LC':
                            attributes.collectionDateTimePicklist = ('L' + collectionDateTimeValue);
                            break;
                        case 'I':
                            var immediateCollectDateTime = splitDateTime(collectionDateTimeValue);
                            attributes.immediateCollectionDate = immediateCollectDateTime.date;
                            attributes.immediateCollectionTime = immediateCollectDateTime.time;
                            break;
                    }
                }

                attributes.urgency = urgencyId;

                if (collectionSampleId) {
                    if (form.model.get('collectionSample') === '0') {
                        attributes.otherCollectionSample = collectionSampleId;
                    } else {
                        attributes.collectionSample = collectionSampleId;
                    }
                }
                if (specimenId) {
                    if (form.model.get('specimen') === '0') {
                        attributes.otherSpecimen = specimenId;
                    } else {
                        attributes.specimen = specimenId;
                    }
                }
                form.ui.availableLabTests.trigger('control:disabled', false);
                form.model.set(attributes);
                form.model.unset('existingOrder', {
                    silent: true
                });
            }
        },
        processDraftLabOrder: function(form, draftData) {
            form.isDraftLoading = true;
            var attributes = _.pick(draftData, function(val) {
                return (!_.isEmpty(val) || _.isBoolean(val) || _.isNumber(val));
            });

            var attributeLoadingOrder = ["collectionSample", "otherCollectionSample", "specimen", "otherSpecimen"];
            //set specific attributes in order if the value exists in the saved draft object
            _.each(attributeLoadingOrder, function(orderDependentAttribute) {
                if (_.has(attributes, orderDependentAttribute)) {
                    form.model.set(orderDependentAttribute, attributes[orderDependentAttribute]);
                }
            });
            var remainingAttributes = _.omit(attributes, attributeLoadingOrder);
            form.model.set(remainingAttributes);

            delete form.isDraftLoading;
            form.ui.availableLabTests.trigger('control:disabled', false);
        },
        retrieveCollectionTypesUrgencyAndSchedules: function() {
            var orderDialogsDef = new ADK.UIResources.Picklist.Lab_Orders.OrderDialogDef();
            var location = !_.isEmpty(ADK.PatientRecordService.getCurrentPatient().get('visit')) ? ADK.PatientRecordService.getCurrentPatient().get('visit').locationUid.split(':').pop() : '';
            this.listenTo(orderDialogsDef, 'read:success', function(collection) {
                if (!_.isEmpty(collection)) {
                    //collection types
                    var collectionTypes = collection.findWhere({
                        'categoryName': 'Collection Types'
                    });

                    this.ui.collectionType.trigger('control:picklist:set', [collectionTypes.get('values')]);
                    var defaultCollectionType = 'SP';
                    if (!_.isEmpty(collectionTypes.get('default'))) {
                        defaultCollectionType = collectionTypes.get('default').code;
                    } else if (ADK.PatientRecordService.getCurrentPatient().patientStatusClass() === 'Inpatient') {
                        defaultCollectionType = 'LC';
                    }
                    this.model.set({
                        collectionTypeListCache: collectionTypes.get('values'),
                        collectionTypeDefault: defaultCollectionType
                    });

                    //default urgency
                    var defaultUrgency = collection.findWhere({
                        'categoryName': 'Default Urgency'
                    });

                    var urgencyList = [];
                    if (!_.isEmpty(defaultUrgency.get('values'))) {
                        urgencyList.push({
                            code: _.first(defaultUrgency.get('values')).code,
                            name: _.first(defaultUrgency.get('values')).name
                        });
                    } else {
                        this.model.set('serverSideError', 'invalid-response');
                        return;
                    }
                    this.model.set({
                        urgencyListCache: urgencyList,
                        urgencyDefaultCache: defaultUrgency.get('default').code
                    });
                    this.ui.urgency.trigger('control:picklist:set', urgencyList);

                    //collection times
                    var LabCollectionTimes = collection.findWhere({
                        'categoryName': 'Lab Collection Times'
                    });

                    this.model.set('collectionDateTimeLC', LabCollectionTimes.get('values'));

                    //ward collection times
                    var wardCollectionTimes = collection.findWhere({
                        'categoryName': 'Ward Collection Times'
                    });

                    this.model.set('collectionDateTimeWC', wardCollectionTimes.get('values'));

                    //send patient times
                    var sendPatientTimes = collection.findWhere({
                        'categoryName': 'Send Patient Times'
                    });
                    this.model.set('collectionDateTimeSP', sendPatientTimes.get('values'));
                } else {
                    this.model.set('serverSideError', 'invalid-response');
                }
            });
            this.listenTo(orderDialogsDef, 'read:error', function() {
                this.model.set('serverSideError', 'pick-list');
            });
            orderDialogsDef.fetch({
                params: {
                    location: location,
                    division: ADK.UserService.getUserSession().get('division'),
                    site: ADK.UserService.getUserSession().get('site')
                }
            });
        },
        retrieveOrderableItems: function() {
            this.ui.availableLabTests.trigger('control:disabled', true);

            var orderableItems = new ADK.UIResources.Picklist.Lab_Orders.OrderableItems();
            this.listenTo(orderableItems, 'read:success', function(collection) {
                this.ui.availableLabTests.trigger('control:picklist:set', [collection.toPicklist()]);
                if (!this.model.get('orderId')) {
                    this.ui.availableLabTests.trigger('control:disabled', false);
                }
                this.model.set('orderable-items-loaded', true);

                // Hide the form progress indicator only if this is a 'new' lab order, otherwise, the lab form will be
                // exposed before it is ready. An order is 'new' if it doesn't have a draft ID or an assigned test IEN.
                var isNewLabOrder = _.isEmpty(_.get(this.model.get('draft'), 'id')) && _.isEmpty(this.model.get('availableLabTests'));
                isNewLabOrder && this.hideInProgress();
            });

            this.listenTo(orderableItems, 'read:error', function(collection) {
                this.model.set('serverSideError', 'pick-list');
                this.hideInProgress();
            });

            orderableItems.fetch();
        },
        retrieveOrderableItemLoad: function() {
            var ien = this.model.get('availableLabTests');
            var orderableItems = new ADK.UIResources.Picklist.Lab_Orders.LabSampleSpecimenUrgency();

            this.listenTo(orderableItems, 'read:success', function(collection) {
                var collectionSampleListFound = false;
                var specimenListFound = false;
                var collectionSampleDefault;
                var urgencyListFound = false;
                var specimenDefault = null;

                var testName = collection.findWhere({
                    'categoryName': 'Test Name'
                });
                if (testName) {
                    this.model.set('labTestText', testName.get('default').name);
                }

                var itemID = null;
                var itemId = collection.findWhere({
                    'categoryName': 'Item ID'
                });
                if (itemId) {
                    itemID = itemId.get('default');
                }

                var uniqueCollSamp = collection.findWhere({
                    'categoryName': 'Unique CollSamp'
                });
                if (uniqueCollSamp) {
                    this.model.set('collectionSampleDisabled', true);
                }

                var defaultCollSamp = collection.findWhere({
                    'categoryName': 'Default CollSamp'
                });
                if (defaultCollSamp) {
                    this.model.set('defaultCollSamp', defaultCollSamp.get('default').value);
                }

                var labCollSamp = collection.findWhere({
                    'categoryName': 'Lab CollSamp'
                });
                if (labCollSamp) {
                    this.model.set('labCollSampDefault', labCollSamp.get('default').value);
                }

                var collSamp = collection.findWhere({
                    'categoryName': 'CollSamp'
                });

                var specimens = collection.findWhere({
                    'categoryName': 'Specimens'
                });

                var labSpecimenListCache  = [];
                if (specimens) {
                    labSpecimenListCache = specimens.get('values');
                    this.model.unset('specimen');
                    this.ui.specimen.trigger('control:picklist:set', [specimens.get('values')]);
                    specimenListFound = true;
                }
                labSpecimenListCache.push({
                    ien: '0',
                    name: 'Other'
                });
                this.model.set('labSpecimenListCache', labSpecimenListCache);

                var urgencyDefault = null;
                var urgencyDefaultObj = collection.findWhere({
                    'categoryName': 'Default Urgency'
                });
                if (urgencyDefaultObj) {
                    urgencyDefault = urgencyDefaultObj.get('default');
                }

                var urgencyList = collection.findWhere({
                    'categoryName': 'Urgencies'
                });
                if (urgencyList) {
                    this.model.set('urgencyList', urgencyList.get('values'));
                    if (urgencyList) {
                        urgencyListFound = true;
                    }
                }

                var oiMessage = collection.findWhere({
                    'categoryName': 'OIMessage'
                });
                if (!_.isEmpty(oiMessage) && oiMessage.get('values').length > 0) {
                    FormUtils.handleAlertMessage(this, oiMessage.get('values'));
                }

                var reqCom = collection.findWhere({
                    'categoryName': 'ReqCom'
                });

                //check reqCom
                if (reqCom) {
                    FormUtils.handleReqCom(this, reqCom.get('default').name);
                }

                //collection sample
                collectionSampleDefault = this.model.get('defaultCollSamp');
                if (_.isUndefined(uniqueCollSamp) && !_.isUndefined(this.model.get('labCollSampDefault'))) {
                    collectionSampleDefault = this.model.get('labCollSampDefault');
                }

                var collectionSampleList = [];
                if (collSamp) {
                    collectionSampleList = FormUtils.generateCollectionSamplePicklist(collSamp.get('values'));
                    this.model.set('collectionSampleListCache', collectionSampleList);
                    collectionSampleListFound = true;
                }
                var userHasLrLabKey = false; //placeholder until LR Lab Key is implemented
                if (!collectionSampleListFound || itemID.name !== 'CH' || userHasLrLabKey) {
                    collectionSampleList.push({
                        ien: '0',
                        displayName: 'Other'
                    });
                }
                this.ui.collectionSample.trigger('control:picklist:set', [collectionSampleList]);

                if (collectionSampleListFound) {
                    var collectionSampleListCache = this.model.get('collectionSampleListCache');
                    if (collectionSampleDefault) {
                        var selectedCollectionSample = _.filter(collectionSampleListCache, function(e) {
                            return e.n == collectionSampleDefault;
                        });
                        if (_.isEmpty(selectedCollectionSample)) {
                            this.model.set('collectionSample', collectionSampleListCache[0].ien);
                        } else {
                            this.model.set('collectionSample', selectedCollectionSample[0].ien);
                        }
                    } else {
                        this.model.set('collectionSample', collectionSampleListCache[0].ien);
                    }
                } else {
                    this.model.set('collectionSample', '0');
                }

                if (specimenListFound) {
                    if (specimenDefault) {
                        this.model.set('specimen', specimenDefault);
                    }
                    this.ui.otherSpecimenContainer.trigger('control:hidden', true);
                }

                //check collectionType
                var collectionTypes = this.model.get('collectionTypeListCache');
                this.model.unset('collectionType');

                if (this.model.get('collectionTypeDefault') === 'LC' || this.model.get('collectionTypeDefault') === 'I') {
                    if (this.model.get('labCanCollect')) {
                        this.model.set('collectionType', this.model.get('collectionTypeDefault'));
                    } else {
                        this.model.set('collectionType', 'WC');
                    }
                } else {
                    this.model.set('collectionType', this.model.get('collectionTypeDefault'));
                }

                //check urgency
                this.model.unset('urgency');
                if (!urgencyListFound && urgencyDefault) {
                    var filteredUrgencyListCache = _.filter(this.model.get('urgencyListCache'), function(item) {
                        return item.ien === urgencyDefault.ien;
                    }, this);
                    if (filteredUrgencyListCache.length > 0) {
                        this.model.set('urgencyList', this.model.get('urgencyListCache'));
                    } else {
                        this.model.set('urgencyList', [urgencyDefault]);
                    }
                }
                this.ui.urgency.trigger('control:picklist:set', [this.model.get('urgencyList')]);
                if (urgencyDefault) {
                    this.model.set({
                        urgency: urgencyDefault.ien,
                        urgencyDisabled: true
                    });
                } else {
                    this.model.set('urgency', this.model.get('urgencyDefaultCache'));
                }

                //specimen
                if (this.model.get('existingOrder')) {
                    addLabUtils.processExistingLabOrder(this);
                }

                // Handle loading of a draft lab order.  This procedure mirrors the 'load/process existing order'
                // workflow, but is much simpler, since the lab order payload is already parsed and set in the
                // view Model, having been processed by the draft order Behavior.
                var draftData = this.model.get('draft-data');
                if (!_.isUndefined(draftData)) {
                    addLabUtils.processDraftLabOrder(this, draftData);
                    this.model.unset('draft-data', {
                        silent: true
                    });
                }
                this.hideInProgress();
                this.enableInputFields(true);
                this.enableFooterButtons(true);
                // Make sure focus remains on the select component after selecting an available test.
                this.$el.find('#select2-availableLabTests-container').closest('.select2-selection').focus();
            });

            this.listenTo(orderableItems, 'read:error', function(collection) {
                this.model.set('serverSideError', 'pick-list');
                this.hideInProgress();
            });

            orderableItems.fetch({
                params: {
                    labTestIEN: ien
                }
            });
        },
        retrieveAllCollectionSamples: function() {
            var labSamples = new ADK.UIResources.Picklist.Lab_Orders.Samples();

            this.listenTo(labSamples, 'read:success', function(collection) {
                this.model.unset('otherCollectionSample');
                var samples = collection.toPicklist();
                var collSamp = _.find(samples, function(obj) {
                    return obj.group === 'CollSamp';
                }).pickList;
                if (!_.isEmpty(collSamp)) {
                    this.model.set('otherCollectionSampleListCache', collSamp);
                    this.ui.otherCollectionSample.trigger('control:picklist:set', [collSamp]);
                } else {
                    this.model.set('serverSideError', 'invalid-response');
                }
            });

            this.listenTo(labSamples, 'read:error', function() {
                this.model.set('serverSideError', 'pick-list');
            });

            labSamples.fetch();
        },
        retrieveAllSpecimens: function() {
            var specimens = new ADK.UIResources.Picklist.Lab_Orders.Specimens();

            this.listenTo(specimens, 'read:success', function(collection) {
                var otherSpecimen = collection.toPicklist();
                this.model.unset('otherSpecimen');
                this.model.set('allSpecimensListCache', otherSpecimen);
                this.ui.otherSpecimen.trigger('control:picklist:set', [otherSpecimen]);
            });

            this.listenTo(specimens, 'read:error', function(collection) {
                this.model.set('serverSideError', 'pick-list');
            });

            specimens.fetch();
        },
        retrieveImmediateCollection: function() {
            var immediateCollection = new ADK.UIResources.Picklist.Lab_Orders.LabCollectTimes();

            this.listenTo(immediateCollection, 'read:success', function(collection) {
                var immediateCollection = [];
                if (!_.isEmpty(collection)) {
                    _.each(collection.models, function(m, i) {
                        immediateCollection.push(m.get('text' + i).trim());
                    });
                } else {
                    this.model.set('serverSideError', 'invalid-response');
                    return;
                }
                this.model.set('immediateCollection', immediateCollection);
            });

            this.listenTo(immediateCollection, 'read:error', function(collection) {
                this.model.set('serverSideError', 'pick-list');
            });

            immediateCollection.fetch();
        },
        retrieveLabSpecimens: function() {
            var labSpecimens = new ADK.UIResources.Writeback.Orders.LabSupportData();
            this.listenTo(labSpecimens, 'read:success', function(model, resp) {
                this.model.set('otherSpecimenCache', model.get('labSpecimens'));
            });

            this.listenTo(labSpecimens, 'read:error', function(model, resp) {
                this.model.set('serverSideError', 'pick-list');
            });

            labSpecimens.fetch({
                params: {
                    type: 'lab-specimens',
                    site: ADK.UserService.getUserSession().get('site'),
                }
            });
        },
        retrieveProblemRelationships: function() {
            var problemRelationships = new ADK.UIResources.Picklist.Notes.Problems();
            this.listenTo(problemRelationships, 'read:success', function(collection) {
                this.ui.problemRelationship.trigger('control:picklist:set', [collection.toPicklist()]);
                this.ui.problemRelationship.trigger('control:disabled', false);
            });

            this.listenTo(problemRelationships, 'read:error', function(collection) {
                this.model.set('serverSideError', 'pick-list');
            });
            problemRelationships.fetch();
        },
        retrieveServerTime: function() {
            var serverTimeResource = new ADK.UIResources.Writeback.Orders.LabSupportData();
            this.listenTo(serverTimeResource, 'read:success', function(model, resp) {
                if (!_.isEmpty(resp.data)) {
                    var serverTime = moment(resp.data[0].currentTime, 'YYYYMMDDhhmmss');
                    var serverDifference = serverTime.diff(moment(), 'milliseconds');
                    this.model.set('serverTimeDifference', serverDifference);
                }
                else {
                    this.model.set({ serverTimeDifference: 0,
                        serverSideError: 'invalid-response'
                    });
                    return;
                }
            });

            this.listenTo(serverTimeResource, 'read:error', function(model, resp) {
                this.model.set('serverSideError', 'pick-list');
            });

            serverTimeResource.fetch({
                params: {
                    type: 'lab-current-time',
                    site: ADK.UserService.getUserSession().get('site'),
                }
            });
        }
    };

    return addLabUtils;
});
