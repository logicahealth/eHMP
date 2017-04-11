define([
    "backbone",
    "marionette",
    "underscore",
    "moment",
    'app/applets/orders/writeback/labs/formUtils'
], function(Backbone, Marionette, _, Moment, FormUtils) {
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
    var HOW_OFTEN = '29';
    var HOW_LONG = '153';
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
        save: function(model, saveCallback) {
            var attributes = {
                contentType: "application/json"
            };
            if ($('#acceptDrpDwnContainer').attr('action') === 'edit') {
                var siteCode = ADK.UserService.getUserSession().get('site');
                model.url = '/resource/write-health-data/patient/' + model.get("pid") + '/orders/' + model.get('orderId') + '?site=' + siteCode + '&pid=' + model.get("pid");
                //set dummy id to trigger backbone http PUT request
                model.set('id', 1);
            } else {
                //hard coded url for now
                model.url = '/resource/write-health-data/patient/' + model.get('pid') + '/orders?pid=' + model.get('pid');
            }
            model.save(attributes, saveCallback);
        },
        getServerSideErrorMessage: function(errorType) {
            errorType = errorType || 'generic';
            var action = SERVER_SIDE_ERROR_ACTIONS[errorType] || SERVER_SIDE_ERROR_ACTIONS.generic;
            return ('Unable to ' + action + ' at this time due to a system error. Please try again later.');
        },
        processExistingLabOrder: function(form) {
            var existingOrder = form.model.get('existingOrder');
            if (!_.isEmpty(existingOrder)) {
                var collectionDateTimeValue = null;
                var collectionTypeId = null;
                var howOftenId = null;
                var howLong = null;
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
                                            atrributes.forTest = comment;
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
                        case HOW_OFTEN:
                            howOftenId = entry.valueId;
                            break;
                        case HOW_LONG:
                            howLong = entry.valueId;
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
                attributes.howOften = howOftenId;
                attributes.howLong = howLong;

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
                form.model.unset('existingOrder', {silent: true});
            }
        },
        retrieveCollectionTypesUrgencyAndSchedules: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    if (!_.isEmpty(resp.data)) {
                        resp.data.forEach(function(entry) {
                            switch (entry.categoryName) {
                                case "Collection Types":
                                    var defaultCollectionType = 'SP';
                                    form.ui.collectionType.trigger('control:picklist:set', [entry.values]);
                                    if (entry.default) {
                                        defaultCollectionType = entry.default.code;
                                    }
                                    else if (ADK.PatientRecordService.getCurrentPatient().get('patientStatusClass') === 'Inpatient') {
                                        defaultCollectionType = 'LC';
                                    }
                                    form.model.set({
                                        collectionTypeListCache: entry.values,
                                        collectionTypeDefault: defaultCollectionType
                                    });
                                    break;
                                case "Default Urgency":
                                    var urgencyList = [];
                                    if (!_.isEmpty(entry.values)) {
                                        entry.values.forEach(function(urgency) {
                                            urgencyList.push({
                                                ien: urgency.code,
                                                name: urgency.name
                                            });
                                        });
                                    }
                                    else {
                                        form.model.set('serverSideError', 'invalid-response');
                                        return;
                                    }
                                    form.model.set({
                                        urgencyListCache: urgencyList,
                                        urgencyDefaultCache: entry.default.code
                                    });
                                    form.ui.urgency.trigger('control:picklist:set', urgencyList);
                                    break;
                                case "Schedules":
                                    form.model.set({
                                        howOftenListCache: entry.values,
                                        howOftenDefaultCache: entry.default.code
                                    });
                                    //form.ui.howOften.trigger('control:picklist:set', [entry.values]);
                                    break;
                                case "Lab Collection Times":
                                    form.model.set('collectionDateTimeLC', entry.values);
                                    break;
                                case "Ward Collection Times":
                                    form.model.set('collectionDateTimeWC', entry.values);
                                    break;
                                case "Send Patient Times":
                                    form.model.set('collectionDateTimeSP', entry.values);
                                    break;
                            }
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                    }
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var location;
            if (ADK.PatientRecordService.getCurrentPatient().get('visit')) {
                location = ADK.PatientRecordService.getCurrentPatient().get('visit').localId;
            }
            var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-order-dialog-def&location=' + location;
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveOrderableItems: function(form) {
            form.ui.availableLabTests.trigger('control:disabled', true);
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    form.model.unset('availableLabTests');
                    form.ui.availableLabTests.trigger('control:picklist:set', [resp.data]);
                    if (!form.model.get('orderId')) {
                        form.ui.availableLabTests.trigger('control:disabled', false);
                    }
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/write-pick-list?type=lab-order-orderable-items&labType=S.LAB&site=' + siteCode;
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveExisting: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'generic');
                },
                success: function(model, resp) {
                    form.model.set('existingOrder', resp.data.items);
                    var availableLabTestIen;
                    if (!_.isEmpty(resp.data)) {
                        resp.data.items.forEach(function(entry) {
                            switch (entry.keyId) {
                                case AVAILABLE_LAB_TEST:
                                    availableLabTestIen = entry.valueId;
                                    break;
                            }
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                        return;
                    }
                    $('#acceptDrpDwnContainer').attr('action', 'edit');
                    form.model.set('availableLabTests', availableLabTestIen);
                }
            };

            var pid = ADK.PatientRecordService.getCurrentPatient().get("pid");
            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/write-health-data/patient/' + pid + '/orders/' + form.model.get('orderId') + '?site=' + siteCode;
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveOrderableItemLoad: function(form, ien) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                    form.hideInProgress();
                },
                success: function(model, resp) {
                    var selectedLabInfo = resp.data;
                    var collectionSampleListFound = false;
                    var specimenListFound = false;
                    var collectionSampleDefault;
                    var urgencyListFound = false;
                    var itemID = null;
                    var collSamp = null;
                    var specimenDefault = null;
                    var urgencyDefault = null;
                    var reqCom = null;
                    if (!_.isEmpty(resp.data)) {
                        selectedLabInfo.forEach(function(entry) {
                            switch (entry.categoryName) {
                                case 'Test Name':
                                    form.model.set('labTestText', entry.default.name);
                                    break;
                                case 'Item ID':
                                    itemID = entry.default;
                                    break;
                                case 'Unique CollSamp':
                                    form.model.set('collectionSampleDisabled', true);
                                    break;
                                case 'Default CollSamp':
                                    form.model.set('defaultCollSamp', entry.default.value);
                                    break;
                                case 'Lab CollSamp':
                                    form.model.set('labCollSampDefault', entry.default.value);
                                    break;
                                case 'CollSamp':
                                    collSamp = entry;
                                    break;
                                case 'Specimens':
                                    form.model.set('specimenListCache', entry.values);
                                    form.model.unset('specimen');
                                    form.ui.specimen.trigger('control:picklist:set', [entry.values]);
                                    specimenListFound = true;
                                    break;
                                case 'Default Urgency':
                                    urgencyDefault = entry.default;
                                    break;
                                case 'Urgencies':
                                    form.model.set('urgencyList', entry.values);
                                    urgencyListFound = true;
                                    break;
                                case 'OIMessage':
                                    if (entry.values.length > 0) {
                                        form.model.set('alertMessage', entry.values[0].text0);
                                    }
                                    break;
                                case 'ReqCom':
                                    reqCom = entry.default.name;
                                    break;
                            }
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                        return;
                    }

                    //check reqCom
                    if (reqCom) {
                        FormUtils.handleReqCom(form, reqCom);
                    }

                    //collection sample
                    collectionSampleDefault = form.model.get('labCollSampDefault') ? form.model.get('labCollSampDefault') : form.model.get('defaultCollSamp');

                    var collectionSampleList = [];
                    if (collSamp) {
                        collectionSampleList = FormUtils.generateCollectionSamplePicklist(collSamp);
                        form.model.set('collectionSampleListCache', collectionSampleList);
                        collectionSampleListFound = true;
                    }
                    var userHasLrLabKey = false; //placeholder until LR Lab Key is implemented
                    if (!collectionSampleListFound || itemID.name !== 'CH' || userHasLrLabKey) {
                        collectionSampleList.push({ien: '0', displayName: 'Other'});
                    }
                    form.ui.collectionSample.trigger('control:picklist:set', [collectionSampleList]);

                    if (collectionSampleListFound) {
                        var collectionSampleListCache = form.model.get('collectionSampleListCache');
                        if (collectionSampleDefault) {
                            var selectedCollectionSample = _.filter(collectionSampleListCache, function(e) {
                                return e.n == collectionSampleDefault;
                            });
                            if (_.isEmpty(selectedCollectionSample)) {
                                form.model.set('collectionSample', collectionSampleListCache[0].ien);
                            }
                            else {
                                form.model.set('collectionSample', selectedCollectionSample[0].ien);
                            }
                        } else {
                            form.model.set('collectionSample', collectionSampleListCache[0].ien);
                        }
                    } else {
                        form.model.set('collectionSample', '0');
                    }

                    if (specimenListFound) {
                        if (specimenDefault) {
                            form.model.set('specimen', specimenDefault);
                        }
                        form.ui.otherSpecimenContainer.trigger('control:hidden', true);
                    }

                    //labCanCollect
                    var labCanCollect = FormUtils.labCanCollect(form.model.get('labCollSampDefault'), form.model.get('collectionSampleListCache'));
                    form.model.set('labCanCollect', labCanCollect);

                    //check collectionType
                    var collectionTypes = form.model.get('collectionTypeListCache');
                    form.model.unset('collectionType');
                    if (!labCanCollect && !_.isUndefined(form.model.get('collectionSampleListCache'))) {
                        var modifiedCollectionTypes = [];
                        if (!_.isEmpty(collectionTypes)) {
                            collectionTypes.forEach(function(entry) {
                                if (entry.code !== 'LC' && entry.code !== 'I') {
                                    modifiedCollectionTypes.push(entry);
                                }
                            });
                        }
                        else {
                            form.model.set('serverSideError', 'invalid-response');
                            return;
                        }
                        form.ui.collectionType.trigger('control:picklist:set', [modifiedCollectionTypes]);
                    } else {
                        form.ui.collectionType.trigger('control:picklist:set', [collectionTypes]);
                    }
                    if (form.model.get('collectionTypeDefault') === 'LC' || form.model.get('collectionTypeDefault') === 'I') {
                        if (form.model.get('labCanCollect')) {
                            form.model.set('collectionType', form.model.get('collectionTypeDefault'));
                        }
                        else {
                            form.model.set('collectionType', 'WC');
                        }
                    }
                    else {
                        form.model.set('collectionType', form.model.get('collectionTypeDefault'));
                    }

                    //check urgency
                    form.model.unset('urgency');
                    if (!urgencyListFound && urgencyDefault) {
                        var filteredUrgencyListCache = _.filter(form.model.get('urgencyListCache'), function(item) {
                           return item.ien === urgencyDefault.ien;
                        }, this);
                        if (filteredUrgencyListCache.length > 0) {
                            form.model.set('urgencyList', form.model.get('urgencyListCache'));
                        }
                        else {
                            form.model.set('urgencyList', [urgencyDefault]);
                        }
                    }
                    form.ui.urgency.trigger('control:picklist:set', [form.model.get('urgencyList')]);
                    if (urgencyDefault) {
                        form.model.set({
                            urgency: urgencyDefault.ien,
                            urgencyDisabled: true
                        });
                    } else {
                        form.model.set('urgency', form.model.get('urgencyDefaultCache'));
                    }

                    //check schedules
                    form.model.unset('howOften');
                    form.ui.howOften.trigger('control:picklist:set', [form.model.get('howOftenListCache')]);
                    if (form.model.get('howOftenDefaultCache')) {
                        form.model.set('howOften', form.model.get('howOftenDefaultCache'));
                    }

                    //specimen
                    if (form.model.get('existingOrder')) {
                        that.processExistingLabOrder(form);
                    }
                    form.hideInProgress();
                    form.enableInputFields(true);
                    form.ui.acceptDrpDwnContainer.trigger('control:disable', false);
                    form.enableFooterButtons(true);
                }
            };

            if (ien) {
                var siteCode = ADK.UserService.getUserSession().get('site');
                var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-sample-specimen-urgency&labTestIEN=' + ien;
                var RetrieveModel = Backbone.Model.extend({
                    url: modelUrl,
                    async: false,
                    parse: function(data) {
                        return data.data;
                    }
                });
                var model = new RetrieveModel();
                model.fetch(callback);

                // Get available activity data
                this.retrieveActivity(form, ien);
            }
        },
        retrieveActivity: function(form, ien){
            var that = this;
            var callback = {
                error: function(model, resp) {
                    // FIXME: Enable the server-side error handling when activity definition retrieval are implemented.
                    //form.model.set('serverSideError', 'generic');
                },
                success: function(model, resp) {
                    if (resp.data.length > 0) {
                        form.model.unset('activity');
                        var collect = new Backbone.Collection(resp.data);
                        form.model.set('activityList', collect);
                        form.ui.activity.trigger('control:picklist:set', collect);
                        form.ui.activity.trigger('control:disabled', false);
                    }
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/tasks/getactivitydefinitionsbyquery?testIen=' + ien + '&siteCode=' + siteCode;
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            form.ui.activity.trigger('control:disabled', true);
            model.fetch(callback);
        },
        retrieveAllCollectionSamples: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    if (!_.isEmpty(resp.data)) {
                        resp.data.forEach(function(entry) {
                            if (entry.categoryName === 'CollSamp') {
                                form.model.unset('otherCollectionSample');
                                var collSamp = FormUtils.generateCollectionSamplePicklist(entry);
                                form.model.set('otherCollectionSampleListCache', collSamp);
                                form.ui.otherCollectionSample.trigger('control:picklist:set', [collSamp]);
                            }
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                    }
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-all-samples';
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveAllSpecimens: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    form.model.unset('otherSpecimen');
                    form.model.set('otherSpecimenListCache', resp.data);
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-order-specimens';
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveImmediateCollection: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    var immediateCollection = [];
                    var count = 0;
                    if (!_.isEmpty(resp.data)) {
                        resp.data.forEach(function(entry) {
                            if (entry['text' + count]) {
                                immediateCollection.push(entry['text' + count]);
                            }
                            count++;
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                        return;
                    }
                    form.model.set('immediateCollection', immediateCollection);
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-collect-times';
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        retrieveMaxDays: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    var howOftenAlwaysDisabled = resp.data.value;
                    howOftenAlwaysDisabled = -1; //temp solution to always disable howOften field. delete line once multiple recurring orders is implemented
                    if (howOftenAlwaysDisabled === -1) {
                        form.model.set('howOftenAlwaysDisabled', true);
                        form.ui.howOften.trigger('control:disabled', true);
                    } else {
                        form.model.set('howOftenAlwaysDisabled', false);
                        form.ui.howOften.trigger('control:disabled', false);
                    }
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var location;
            if (ADK.PatientRecordService.getCurrentPatient().get('visit')) {
                location = ADK.PatientRecordService.getCurrentPatient().get('visit').localId;
            }

            if (_.isUndefined(location)) {
                console.log('visit has not been set');
            }
            else {
                var modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-order-max-days-continuous&location=' + location + '&schedule=0';
                var RetrieveModel = Backbone.Model.extend({
                    url: modelUrl,
                    parse: function(data) {
                        return data.data;
                    }
                });
                var model = new RetrieveModel();
                model.fetch(callback);
            }
        }
    };

    return addLabUtils;
});
