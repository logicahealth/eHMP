define([
    "backbone",
    "marionette",
    "underscore"
], function(Backbone, Marionette, _) {
    "use strict";

    var FormUtils = {
        resetForm: function(form) {
            form.model.errorModel.clear();
            //reset availableLabTests
            form.model.unset('labTestText');
            //reset collection sample
            form.model.unset('collectionSample');
            form.model.unset('collectionSampleText');
            form.model.unset('collectionSampleListCache');
            form.ui.collectionSample.trigger('control:picklist:set', []);
            form.model.unset('otherCollectionSample');
            form.model.unset('collectionSampleDisabled');
            //reset specimen
            form.model.unset('specimen');
            form.model.unset('specimenListCache');
            form.ui.specimen.trigger('control:picklist:set', []);
            form.model.unset('otherSpecimen');
            form.model.unset('specimenText');
            //reset urgency
            form.model.unset('urgency');
            form.model.unset('urgencyText');
            form.model.unset('addToNoteUrgencyText');
            form.model.unset('urgencyDisabled');
            form.ui.urgency.trigger('control:picklist:set', []);
            //reset howOften, howLong
            form.model.unset('howOften');
            form.model.unset('howLong');
            form.model.unset('howOftenText');
            form.ui.howOften.trigger('control:picklist:set', []);
            //reset collectionType
            form.model.unset('collectionType');
            form.model.unset('collectionTypeText');
            form.ui.collectionType.trigger('control:picklist:set', []);
            //reset collectionDateTimePicklist
            form.model.unset('collectionDateTimePicklist');
            form.ui.collectionDateTimePicklist.trigger('control:picklist:set', []);
            //reset dynamic fields
            form.model.unset('sampleDrawnAt');
            form.model.unset('additionalComments');
            form.model.unset('anticoagulant');
            form.model.unset('anticoagulantText');
            form.model.unset('orderComment');
            form.model.unset('urineVolume');
            form.model.unset('orderCommentText');
            form.model.unset('doseDate');
            form.model.unset('doseTime');
            form.model.unset('drawDate');
            form.model.unset('drawTime');
            form.model.unset('doseDrawText');
            form.model.unset('immediateCollectionDate');
            form.model.unset('immediateCollectionTime');
            form.model.unset('forTest');

            form.model.unset('labCollSampDefault');
            form.model.unset('labCanCollect');
            form.model.unset('alertMessage');
            form.model.unset('errorMessage');
            form.model.unset('savedTime');

            form.model.unset('activity');
            form.model.unset('activityList');
            form.model.unset('problemRelationship');
            form.model.unset('annotation');
            form.ui.activity.trigger('control:picklist:set', []);
            form.ui.acceptDrpDwnContainer.trigger('control:disable', true);
            form.enableFooterButtons(false);
            this.setInitialCollectionDateTimeValues(form);
            form.hideDynamicFields();
            form.resetDynamicRequiredFields(form);
        },
        setInitialCollectionDateTimeValues: function(form) {
            form.model.set({
                collectionDate: moment().format('MM/DD/YYYY')
            });
            form.model.unset('collectionTime');
        },
        handleSpecimen: function(form) {
            if (form.model.get('specimen') === '0') {
                form.ui.otherSpecimenContainer.trigger('control:hidden', false);
                form.ui.otherSpecimen.trigger('control:required', true);
            }
            else {
                form.ui.otherSpecimenContainer.trigger('control:hidden', true);
                form.ui.otherSpecimen.trigger('control:required', false);
            }
            this.updateSpecimenText(form);
        },
        handleReqCom: function(form, reqCom) {
            form.model.set('reqCom', reqCom);
            switch (reqCom) {
                case 'ANTICOAGULATION':
                    form.ui.anticoagulant.trigger('control:hidden', false);
                    form.ui.anticoagulant.trigger('control:disabled', false);
                    break;
                case 'TDM (PEAK-TROUGH)':
                    form.ui.sampleDrawnAtContainer.trigger('control:hidden', false);
                    form.ui.sampleDrawnAt.trigger('control:disabled', false);
                    form.ui.sampleDrawnAt.trigger('control:required', true);
                    form.ui.additionalComments.trigger('control:hidden', false);
                    form.ui.additionalComments.trigger('control:disabled', false);
                    break;
                case 'DOSE/DRAW TIMES':
                    form.ui.doseContainer.trigger('control:hidden', false);
                    form.ui.drawContainer.trigger('control:hidden', false);
                    form.ui.doseDrawDateTime.trigger('control:disabled', false);
                    form.ui.doseDrawDateTime.trigger('control:required', true);
                    break;
                case 'ORDER COMMENT':
                case 'MICRO ORDER COMMENT':
                case 'TRANSFUSION':
                case 'DIAGNOSIS COMMENT':
                case 'ORDER COMMENT MODIFIED':
                case 'ZZ VIROLOGY ORDER COMMENT':
                    form.ui.orderComment.trigger('control:hidden', false);
                    form.ui.orderComment.trigger('control:disabled', false);
                    break;
                case 'URINE VOLUME':
                    form.ui.urineVolume.trigger('control:hidden', false);
                    form.ui.urineVolume.trigger('control:disabled', false);
                    break;
            }
        },
        handleDoseDrawTimes: function(form) {
            var doseText = "";
            var drawText = "";
            if (form.model.get('doseDate')) {
                form.model.set('forTest', '~For Test: ' + form.model.get('labTestText'));
                doseText = "~Last dose: " + form.model.get('doseDate') + " " + form.model.get('doseTime');
            }
            if (form.model.get('drawDate')) {
                form.model.set('forTest', '~For Test: ' + form.model.get('labTestText'));
                drawText = "  draw time: " + form.model.get('drawDate') + " " + form.model.get('drawTime');
            } else if (form.model.get('doseDate')) {
                drawText = "  draw time: UNKNOWN";
            }
            form.model.set('doseDrawText', doseText + drawText);
        },
        handleDoseDate: function(form) {
            var doseDate = form.model.get('doseDate');
            if (doseDate !== moment().format('MM/DD/YYYY')) {
                form.model.set('doseTime', '00:00');
            }
        },
        handleDoseTime: function(form) {
            if (form.model.get('doseTime') && form.model.get('doseTime') !== '00:00' && form.model.get('doseTime') !== '0:00') {
                form.model.set('doseDate', moment().format('MM/DD/YYYY'));
            }
        },
        handleDrawDate: function(form) {
            var drawDate = form.model.get('drawDate');
            if (drawDate !== moment().format('MM/DD/YYYY')) {
                form.model.set('drawTime', '00:00');
            }
        },
        handleDrawTime: function(form) {
            if (form.model.get('drawTime') && form.model.get('drawTime') !== '00:00' && form.model.get('drawTime') !== '0:00') {
                form.model.set('drawDate', moment().format('MM/DD/YYYY'));
            }
        },
        handleOrderComment: function(form) {
            form.model.set({
                forTest: '~For Test: ' + form.model.get('labTestText'),
                orderCommentText: '~' + form.model.get('orderComment')
            });
        },
        handleSampleDrawnAt: function(form) {
            form.model.set('forTest', '~For Test: ' + form.model.get('labTestText'));
        },
        handleAnticoagulant: function(form) {
            form.model.set({
                forTest: '~For Test: ' + form.model.get('labTestText'),
                anticoagulantText: '~ANTICOAGULANT: ' + form.model.get('anticoagulant')
            });
        },
        handleAlertMessage: function(form, message) {
            if (message) {
                form.model.set('alertMessage', message);
            }
        },
        handleActivity: function(form) {
            // handle the activity chosen here.
        },
        updateSpecimenText: function(form) {
            if (form.model.get('specimen') && form.model.get('specimen') !== '0') {
                var filteredSpecimenListCache = _.filter(form.model.get('specimenListCache'), function(item) {
                   return item.ien === form.model.get('specimen');
                }, this);
                if (filteredSpecimenListCache.length > 0) {
                    form.model.set('specimenText', filteredSpecimenListCache[0].name);
                }
            } else {
                var filteredOtherSpecimenListCache = _.filter(form.model.get('otherSpecimenListCache'), function(item) {
                   return item.ien === form.model.get('otherSpecimen');
                }, this);
                if (filteredOtherSpecimenListCache.length > 0) {
                    form.model.set('specimenText', filteredOtherSpecimenListCache[0].name);
                }
                else {
                    form.model.unset('specimenText');
                }
            }
        },
        updateCollectionSampleText: function(form) {
            if (form.model.get('collectionSample') && form.model.get('collectionSample') !== '0') {
                var collectionSampleListCache = form.model.get('collectionSampleListCache');
                var selectedCollectionSample = _.filter(collectionSampleListCache, function(e) {
                    return e.ien == form.model.get('collectionSample');
                });
                if (selectedCollectionSample.length > 0) {
                    form.model.set('collectionSampleText', selectedCollectionSample[0].name);
                }
            } else {
                var otherCollectionSampleListCache = form.model.get('otherCollectionSampleListCache');
                var selectedOtherCollectionSample = _.filter(otherCollectionSampleListCache, function(e) {
                    return e.ien == form.model.get('otherCollectionSample');
                });
                if (selectedOtherCollectionSample.length > 0) {
                    form.model.set('collectionSampleText', selectedOtherCollectionSample[0].name);
                    var otherSpecimenListCache = form.model.get('otherSpecimenListCache');
                    if (selectedOtherCollectionSample[0].specPtr){
                        var otherSpecimenToSelect = [];
                        if (otherSpecimenListCache) {
                            otherSpecimenToSelect = _.filter(otherSpecimenListCache, function(e) {
                                return e.ien == selectedOtherCollectionSample[0].specPtr;
                            });
                        }
                        if (otherSpecimenListCache && otherSpecimenToSelect.length > 0) {
                            form.ui.otherSpecimen.trigger('control:picklist:set', [otherSpecimenListCache]);
                        } else {
                            form.ui.otherSpecimen.trigger('control:picklist:set', [{ien: selectedOtherCollectionSample[0].specPtr, name: selectedOtherCollectionSample[0].specName}]);
                        }
                        form.model.set('otherSpecimen', selectedOtherCollectionSample[0].specPtr);
                        form.ui.otherSpecimen.trigger('control:disabled', true);
                    }
                    else {
                        form.model.unset('otherSpecimen');
                        form.ui.otherSpecimen.trigger('control:picklist:set', [otherSpecimenListCache]);
                        form.ui.otherSpecimen.trigger('control:disabled', false);
                    }
                }
                else {
                    form.model.unset('collectionSampleText');
                }
                this.updateSpecimenText(form);
            }
        },
        handleCollectionType: function(form) {
            form.model.set('collectionTypeText', form.model.get('collectionType'));
            form.ui.immediateCollectionContainer.trigger('control:hidden', true);
            form.ui.collectionDateTimePicklist.trigger('control:hidden', true);
            form.ui.collectionDate.trigger('control:hidden', true);
            form.ui.collectionTime.trigger('control:hidden', true);
            form.ui.collectionDate.trigger('control:required', false);
            form.ui.collectionDateTimePicklist.trigger('control:required', false);
            form.ui.futureLabCollectTimesContainer.trigger('control:hidden', true);
            switch (form.model.get('collectionType')) {
                case 'WC':
                    form.ui.collectionDate.trigger('control:hidden', false);
                    form.ui.collectionTime.trigger('control:hidden', false);
                    form.ui.collectionDate.trigger('control:disabled', false);
                    form.ui.collectionTime.trigger('control:disabled', false);
                    form.ui.collectionDate.trigger('control:required', true);
                    break;
                case 'LC':
                    if (form.model.get('collectionDateTimeLC') && form.model.get('collectionDateTimeLC').length > 0) {
                        form.ui.collectionDateTimePicklist.trigger('control:picklist:set', [form.model.get('collectionDateTimeLC')]);
                        form.model.set('collectionDateTimePicklist', form.model.get('collectionDateTimeLC')[0].code);
                    }
                    form.ui.collectionDateTimePicklist.trigger('control:hidden', false);
                    form.ui.collectionDateTimePicklist.trigger('control:disabled', false);
                    form.ui.collectionDateTimePicklist.trigger('control:required', true);
                    break;
                case 'SP':
                    form.ui.collectionDate.trigger('control:hidden', false);
                    form.ui.collectionTime.trigger('control:hidden', false);
                    form.ui.collectionDate.trigger('control:disabled', false);
                    form.ui.collectionTime.trigger('control:disabled', false);
                    form.ui.collectionDate.trigger('control:required', true);
                    break;
                case 'I':
                    form.ui.immediateCollectionContainer.trigger('control:hidden', false);
                    form.ui.immediateCollection.trigger('control:disabled', false);
                    form.ui.immediateCollectionDate.trigger('control:disabled', false);
                    form.ui.immediateCollectionTime.trigger('control:disabled', false);
                    break;
            }
        },
        handleCollectionDateTime: function(form) {
            var collectionDate = form.model.get('collectionDate');
            var collectionTime = form.model.get('collectionTime');
            if (collectionTime !== '0:00' && collectionTime !== '00:00' && !_.isUndefined(collectionTime)) {
                form.model.set('collectionDateTime', collectionDate + ' ' + collectionTime);
            }
            else if (collectionDate === moment().format('MM/DD/YYYY')) {
                form.model.set('collectionDateTime', 'TODAY');
            }
            else {
                form.model.set('collectionDateTime', collectionDate);
            }
        },
        handleFutureLabCollectDate: function(form) {
            var that = this;
            var callback = {
                error: function(model, resp) {
                    form.model.set('serverSideError', 'generic');
                },
                success: function(model, resp) {
                    form.ui.futureLabCollectInProgress.trigger('control:hidden', true);
                    var picklist = [];
                    var firstEntry;
                    if (!_.isEmpty(resp.data)) {
                        resp.data.forEach(function(entry) {
                            if (entry.indexOf('-1') !== -1) {
                                form.model.set('futureLabCollectErrorMessage', entry.replace('-1^', ''));
                            } else {
                                form.ui.futureLabCollectTime.trigger('control:hidden', false);
                                var hour = entry.substr(0, 2);
                                var minute = entry.substr(2, 2);
                                var time = hour + ':' + minute;
                                var label = ' Collection: ' + time;
                                if (parseInt(hour) < 12) {
                                    label = 'AM' + label;
                                } else {
                                    label = 'PM' + label;
                                }
                                picklist.push({
                                    label: label,
                                    value: time
                                });
                                if (!firstEntry) {
                                    firstEntry = time;
                                }
                            }
                        });
                    }
                    else {
                        form.model.set('serverSideError', 'invalid-response');
                        return;
                    }
                    form.ui.futureLabCollectTime.trigger('control:picklist:set', [picklist]);
                    form.model.set('futureLabCollectTime', firstEntry);
                    form.ui.futureLabCollectTime.trigger('control:size', picklist.length);
                }
            };
            form.model.unset('futureLabCollectErrorMessage');
            form.model.unset('futureLabCollectTime');
            form.ui.futureLabCollectTime.trigger('control:picklist:set', []);
            form.ui.futureLabCollectTime.trigger('control:size', 1);
            form.ui.futureLabCollectInProgress.trigger('control:hidden', false);
            var dateSelected = new Date(form.model.get('futureLabCollectDate'));

            var siteCode = ADK.UserService.getUserSession().get('site');
            var location;
            if (ADK.PatientRecordService.getCurrentPatient().get('visit')) {
                location = ADK.PatientRecordService.getCurrentPatient().get('visit').localId;
            }
            var pid = ADK.PatientRecordService.getCurrentPatient().get("pid");
            var modelUrl = '/resource/write-health-data/labSupportData?site=' + siteCode + '&type=lab-collect-times&dateSelected=' + dateSelected.toString('yyyyMMddHHmmss') + '&location=' + location + '&pid=' + pid;
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            model.fetch(callback);
        },
        handleCollectionDateTimePicklist: function(form) {
            form.ui.futureLabCollectTimesContainer.trigger('control:hidden', true);
            form.ui.futureLabCollectTime.trigger('control:hidden', true);
            form.ui.futureLabCollectDate.trigger('control:required', false);
            form.ui.futureLabCollectTime.trigger('control:required', false);
            if (form.model.get('collectionDateTimePicklist') === 'LO') {
                form.ui.futureLabCollectTimesContainer.trigger('control:hidden', false);
                form.ui.futureLabCollectDate.trigger('control:required', true);
                form.ui.futureLabCollectTime.trigger('control:required', true);
                form.model.set('futureLabCollectDate', moment().format('MM/DD/YYYY'));
            }
        },
        handleUrgency: function(form) {
            if (form.model.get('urgencyList')) {
                var selectedUrgency = _.filter(form.model.get('urgencyList'), function(e) {
                    return e.ien === form.model.get('urgency') || e.code === form.model.get('urgency');
                });
                var selectedUrgencyName = (!_.isEmpty(selectedUrgency) ? selectedUrgency[0].name : undefined);
                if (selectedUrgencyName) {
                    form.model.unset('urgencyText');
                    form.model.unset('addToNoteUrgencyText');
                    var selectedUrgencyNameLowerCase = selectedUrgencyName.toLowerCase();
                    if (selectedUrgencyNameLowerCase === 'stat') {
                        form.model.set('urgencyText', selectedUrgencyName);
                    }
                    if (selectedUrgencyNameLowerCase !== "routine") {
                        form.model.set('addToNoteUrgencyText', selectedUrgencyName);
                    }
                }
            }
        },
        handleCollectionSample: function(form) {
            form.model.unset('specimen');
            if (form.model.get('collectionSample') === '0') {
                form.ui.otherCollectionSampleContainer.trigger('control:hidden', false);
                form.ui.otherCollectionSample.trigger('control:required', true);
                this.setSpecimenToOther(form);
            }
            else {
                form.ui.otherCollectionSampleContainer.trigger('control:hidden', true);
                form.ui.otherCollectionSample.trigger('control:required', false);
                var collectionSampleListCache = form.model.get('collectionSampleListCache');
                var specimenListCache = form.model.get('specimenListCache');
                if (collectionSampleListCache) {
                    var selectedCollectionSample = _.filter(collectionSampleListCache, function(e) {
                        return e.ien == form.model.get('collectionSample');
                    });
                    if (selectedCollectionSample.length > 0) {
                        if (selectedCollectionSample[0].text) {
                            form.model.set('alertMessage', selectedCollectionSample[0].text);
                        }
                        if (selectedCollectionSample[0].unused1 && selectedCollectionSample[0].unused1 !== '') {
                            this.handleReqCom(form, selectedCollectionSample[0].unused1);
                        }
                        if (selectedCollectionSample[0].unused2 && selectedCollectionSample[0].unused2 !== '') {
                            this.handleReqCom(form, selectedCollectionSample[0].unused2);
                        }
                        if (selectedCollectionSample[0].unused3 && selectedCollectionSample[0].unused3 !== '') {
                            this.handleReqCom(form, selectedCollectionSample[0].unused3);
                        }
                        form.ui.otherSpecimen.trigger('control:required', false);

                        if (selectedCollectionSample[0].specPtr === '') {
                            this.setSpecimenToOther(form);
                        }
                        else {
                            var specimen = { ien: selectedCollectionSample[0].specPtr, name: selectedCollectionSample[0].specName };
                            this.selectSpecimen(form, specimen);
                        }
                    }
                } else if (specimenListCache) {
                    form.ui.specimen.trigger('control:picklist:set', [specimenListCache]);
                }
                else {
                    this.setSpecimenToOther(form);
                }
            }
            this.updateCollectionSampleText(form);
        },
        setSpecimenToOther: function(form) {
            form.ui.specimen.trigger('control:picklist:set', [{ien: '0', name: 'Other'}]);
            form.model.set('specimen', '0');
            form.model.unset('otherSpecimen');
            form.ui.otherSpecimen.trigger('control:picklist:set', [form.model.get('otherSpecimenListCache')]);
        },
        selectSpecimen: function(form, specimen) {
            var specimenListCache = form.model.get('specimenListCache');
            var specimenToSelect = [];
            if (specimenListCache) {
                specimenToSelect = _.filter(specimenListCache, function(e) {
                    return e.ien == specimen.ien;
                });
            }
            if (specimenListCache && specimenToSelect.length > 0) {
                form.ui.specimen.trigger('control:picklist:set', [specimenListCache]);
            } else {
                form.ui.specimen.trigger('control:picklist:set', [{ien: specimen.ien, name: specimen.name}]);
            }
            form.ui.otherSpecimenContainer.trigger('control:hidden', true);
            form.model.set({
                specimen: specimen.ien,
                specimenText:specimen.name
            });
        },


        getSelectControlSorter: function(data, params) {
            var filterText = params.term;
            if (filterText) {
                var first = [];
                var others = [];
                var filterTextLower = filterText.toLowerCase();
                data.forEach(function(item){
                    var text = item.text.toLowerCase();

                    if (text.indexOf(filterTextLower) === 0) {
                        first.push(item);
                    } else {
                        others.push(item);
                    }
                });
                return first.concat(others);
            }
            else {
                return data;
            }
        },
        generateCollectionSamplePicklist: function(collSamp) {
            var collectionSampleList = [];
            var previousEntry = null;
            var text = '';
            collSamp.values.forEach(function(entry) {
                if (!_.isUndefined(entry.text)) {
                    text += entry.text;
                } else if (!_.isUndefined(entry.ien)) {
                    if (!_.isEmpty(previousEntry)) {
                        if (text !== '') {
                            previousEntry.text = text;
                            text = '';
                        }
                        collectionSampleList.push(previousEntry);
                    }
                    previousEntry = entry;
                }
            });
            if (text !== '') {
                previousEntry.text = text;
            }
            collectionSampleList.push(previousEntry);
            collectionSampleList.forEach(function(collectionSample){
                if (!_.isUndefined(collectionSample.tubeTop) && collectionSample.tubeTop !== '') {
                    collectionSample.displayName = collectionSample.name + ' (' + collectionSample.tubeTop + ')';
                }
                else {
                    collectionSample.displayName = collectionSample.name;
                }
            });
            return collectionSampleList;
        },
        labCanCollect: function(labCollSampDefault, collSampList) {
            var labCanCollect = false;

            if (!_.isUndefined(collSampList)){
                var selectedCollectionSample = _.filter(collSampList, function(e) {
                    return e.n == labCollSampDefault;
                });
                if (!_.isEmpty(selectedCollectionSample)) {
                    labCanCollect = true;
                }
            }
            return labCanCollect;
        }

    };

    return FormUtils;
});
