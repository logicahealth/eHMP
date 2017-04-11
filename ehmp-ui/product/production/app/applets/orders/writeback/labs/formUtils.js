define([
    "backbone",
    "marionette",
    "underscore",
    "moment"
], function(Backbone, Marionette, _, moment) {
    "use strict";

    var FormUtils = {
        resetForm: function(form) {
            form.model.errorModel.clear();
            //reset availableLabTests
            form.model.unset('labTestText');
            //reset collection sample
            form.model.unset('collectionSample');
            form.model.unset('collectionSampleListCache');
            form.ui.collectionSample.trigger('control:picklist:set', []);
            form.model.unset('otherCollectionSample');
            form.model.unset('collectionSampleDisabled');
            //reset specimen
            form.model.unset('specimen');
            form.model.unset('labSpecimenListCache');
            form.ui.specimen.trigger('control:picklist:set', []);
            form.model.unset('otherSpecimen');
            form.model.unset('specimenText');
            //reset urgency
            form.model.unset('urgency');
            form.model.unset('urgencyText');
            form.model.unset('addToNoteUrgencyText');
            form.model.unset('urgencyDisabled');
            form.ui.urgency.trigger('control:picklist:set', []);
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
            form.model.unset('alertMessage');
            form.model.unset('errorMessage');
            form.model.unset('savedTime');

            form.model.unset('activity');
            form.model.unset('activityList');
            form.model.unset('problemRelationship');
            form.model.unset('annotation');
            form.ui.activity.trigger('control:picklist:set', []);
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
            form.model.unset('otherSpecimen');
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
        handleOtherSpecimen: function(form) {
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
        handleAlertMessage: function(form, messages) {
            if (!_.isEmpty(messages)) {
                var alertMessage = _.pluck(messages, 'text').join(' ');
                form.model.set('alertMessage', alertMessage);
            }
        },
        handleActivity: function(form) {
            // handle the activity chosen here.
        },
        updateSpecimenText: function(form) {
            if (form.model.get('specimen') && form.model.get('specimen') !== '0') {
                var filteredSpecimenListCache = _.filter(form.model.get('labSpecimenListCache'), {'ien': form.model.get('specimen')});
                if (filteredSpecimenListCache.length > 0) {
                    form.model.set('specimenText', filteredSpecimenListCache[0].name);
                }
            } else {
                var filteredOtherSpecimenListCache = _.filter(form.model.get('allSpecimensListCache'), {'value': form.model.get('otherSpecimen')});
                if (filteredOtherSpecimenListCache.length > 0) {
                    form.model.set('specimenText', filteredOtherSpecimenListCache[0].label);
                }
                else {
                    form.model.unset('specimenText');
                }
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
            form.ui.futureLabCollectDate.trigger('control:required', false);
            form.ui.futureLabCollectTime.trigger('control:required', false);
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
                        if (_.isEmpty(form.model.get('collectionDateTimePicklist'))) {
                            form.model.set('collectionDateTimePicklist', form.model.get('collectionDateTimeLC')[0].code);
                        }
                        else {
                            this.handleCollectionDateTimePicklist(form);
                        }
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
                    this.setDefaultImmediateCollectionDateTime(form);
                    break;
            }
        },
        setDefaultImmediateCollectionDateTime: function(form) {
            var serverTimeDifference = form.model.get('serverTimeDifference');
            var serverTime = moment().add(serverTimeDifference, 'milliseconds');
            form.model.set({
                immediateCollectionDate: moment().format('MM/DD/YYYY'),
                immediateCollectionTime: serverTime.add(5, 'minutes').format('HH:mm')
            });
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
                location = ADK.PatientRecordService.getCurrentPatient().get('visit').locationUid.split(':').pop();
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
                if (_.isEmpty(form.model.get('futureLabCollectDate'))) {
                    form.model.set('futureLabCollectDate', moment().format('MM/DD/YYYY'));
                }
                else {
                    form.ui.futureLabCollectTime.trigger('control:hidden', false);
                }
            }
        },
        handleUrgency: function(form) {
            if (form.model.get('urgencyList')) {
                var selectedUrgency = _.filter(form.model.get('urgencyList'), function(e) {
                    return e.ien === form.model.get('urgency') || e.code === form.model.get('urgency');
                });
                var selectedUrgencyName = (!_.isEmpty(selectedUrgency) ? selectedUrgency[0].name : undefined);
                if (selectedUrgencyName) {
                    form.model.set('urgencyText', selectedUrgencyName, {silent: true});
                    form.model.unset('addToNoteUrgencyText');
                    var selectedUrgencyNameLowerCase = selectedUrgencyName.toLowerCase();
                    if (selectedUrgencyNameLowerCase !== "routine") {
                        form.model.set('addToNoteUrgencyText', selectedUrgencyName);
                    }
                }
            }
        },
        handleCollectionSample: function(form) {
            form.model.unset('otherCollectionSample');
            form.model.unset('specimen');
            form.model.unset('otherSpecimen');
            form.ui.specimen.trigger('control:disabled', true);
            if (form.model.get('collectionSample') === '0') {
                form.ui.otherCollectionSample.trigger('control:hidden', false);
                form.ui.otherCollectionSample.trigger('control:required', true);
                this.setSpecimenToOther(form);
            }
            else {
                form.ui.otherCollectionSample.trigger('control:hidden', true);
                form.ui.otherCollectionSample.trigger('control:required', false);
                var collectionSampleListCache = form.model.get('collectionSampleListCache');
                var labSpecimenListCache = form.model.get('labSpecimenListCache');
                if (collectionSampleListCache) {
                    var selectedCollectionSample = _.filter(collectionSampleListCache, function(e) {
                        return e.ien == form.model.get('collectionSample');
                    });
                    if (selectedCollectionSample.length > 0) {
                        if (selectedCollectionSample[0].text) {
                            this.handleAlertMessage(form, selectedCollectionSample);
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
                            form.ui.specimen.trigger('control:picklist:set', [labSpecimenListCache]);
                            form.model.set('specimen', '0');
                            form.ui.specimen.trigger('control:disabled', false);
                            form.ui.otherSpecimen.trigger('control:disabled', false);
                            form.model.unset('otherSpecimen');
                        }
                        else {
                            var specimen = { ien: selectedCollectionSample[0].specPtr, name: selectedCollectionSample[0].specName };
                            this.selectSpecimen(form, specimen);
                            form.ui.specimen.trigger('control:disabled', true);
                        }
                    }
                } else if (labSpecimenListCache) {
                    form.ui.specimen.trigger('control:picklist:set', [labSpecimenListCache]);
                }
                else {
                    this.setSpecimenToOther(form);
                }
            }
            this.builCollectionTypeList(form);
        },
        handleOtherCollectionSample: function(form) {
            var otherCollectionSampleListCache = form.model.get('otherCollectionSampleListCache');
            var selectedOtherCollectionSample = _.filter(otherCollectionSampleListCache, function(e) {
                return e.ien == form.model.get('otherCollectionSample');
            });
            if (!_.isEmpty(selectedOtherCollectionSample)) {
                form.model.unset('specimen');
                if (selectedOtherCollectionSample[0].specPtr){
                    form.ui.specimen.trigger('control:picklist:set', [{ien: selectedOtherCollectionSample[0].specPtr, name: selectedOtherCollectionSample[0].specName}]);
                    form.ui.specimen.trigger('control:disabled', true);
                    form.model.set('specimen', selectedOtherCollectionSample[0].specPtr);
                    form.ui.otherSpecimen.trigger('control:hidden', true);
                }
                else {
                    form.ui.specimen.trigger('control:picklist:set', [form.model.get('otherSpecimenCache')]);
                    form.model.set('specimen', '0');
                    form.ui.specimen.trigger('control:disabled', false);
                    form.ui.otherSpecimen.trigger('control:hidden', false);
                    form.ui.otherSpecimen.trigger('control:disabled', false);
                    form.model.unset('otherSpecimen');
                }
            }
            var modifiedCollectionTypes = this.getLimitedCollectionTypes(form.model.get('collectionTypeListCache'));
            form.ui.collectionType.trigger('control:picklist:set', [modifiedCollectionTypes]);
        },
        setSpecimenToOther: function(form) {
            form.ui.specimen.trigger('control:picklist:set', [{ien: '0', name: 'Other'}]);
            form.ui.otherSpecimen.trigger('control:disabled', true);
            form.model.set('specimen', '0');
            form.model.unset('otherSpecimen');
        },
        selectSpecimen: function(form, specimen) {
            var labSpecimenListCache = form.model.get('labSpecimenListCache');
            var specimenToSelect = [];
            if (labSpecimenListCache) {
                specimenToSelect = _.filter(labSpecimenListCache, function(e) {
                    return e.ien == specimen.ien;
                });
            }
            if (labSpecimenListCache && specimenToSelect.length > 0) {
                form.ui.specimen.trigger('control:picklist:set', [labSpecimenListCache]);
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
            _.each(collSamp, function(entry) {
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
            _.each(collectionSampleList, function(collectionSample){
                if (!_.isUndefined(collectionSample.tubeTop) && collectionSample.tubeTop !== '') {
                    collectionSample.displayName = collectionSample.name + ' (' + collectionSample.tubeTop + ')';
                }
                else {
                    collectionSample.displayName = collectionSample.name;
                }
            });
            return collectionSampleList;
        },
        builCollectionTypeList: function(form) {
            var collectionTypes = form.model.get('collectionTypeListCache');
            var collectionSample = form.model.get('collectionSample');
            var labCanCollect = form.model.labCanCollect();
            form.model.unset('collectionType');

            if (collectionSample !== '0' && !labCanCollect) {
                collectionTypes = this.getLimitedCollectionTypes(collectionTypes);
            }
            form.ui.collectionType.trigger('control:picklist:set', [collectionTypes]);
            if (form.model.get('collectionTypeDefault') === 'LC' || form.model.get('collectionTypeDefault') === 'I') {
                if (labCanCollect) {
                    form.model.set('collectionType', form.model.get('collectionTypeDefault'));
                }
                else {
                    form.model.set('collectionType', 'WC');
                }
            }
            else {
                form.model.set('collectionType', form.model.get('collectionTypeDefault'));
            }
        },
        getLimitedCollectionTypes: function(collectionTypes) {
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
            return modifiedCollectionTypes;
        },
        handleEnableActivity: function() {
            var notificationDate = '';

            // If we're enabling the activity reporting, we set the default date to a week after the current
            // collection date if it's defined, otherwise, set it to a week from today.
            var isEnabled = this.model.get('isActivityEnabled');
            if (isEnabled) {
                var collectionMoment = FormUtils.getCollectionMoment.apply(this);
                var startMoment = collectionMoment.isValid() ? collectionMoment : moment();
                notificationDate = startMoment.add(7, 'days').format('MM/DD/YYYY');
            }
            if (!this.isDraftLoading) {
                this.model.set('notificationDate', notificationDate);
            }
            this.ui.notificationDate.trigger('control:disabled', !isEnabled);
        },
        handleNotificationDate: function() {
            if (this.isDraftLoading) {
                return;
            }
            var pastDueDate = '';

            var notificationMoment = moment(this.model.get('notificationDate'), 'MM/DD/YYYY');
            if (notificationMoment.isValid()) {

                // Validate the current notification date. If the values are different, we defer a re-set of the
                // 'notificationDate' to update the control with the valid date.
                var validNotificationMoment = FormUtils.validateNotificationMoment.call(this, notificationMoment);
                if (!notificationMoment.isSame(validNotificationMoment, 'day')) {
                    _.defer(function(model, notificationDate) {
                        model.set('notificationDate', notificationDate);
                    }, this.model, validNotificationMoment.format('MM/DD/YYYY'));
                }
                pastDueDate = notificationMoment.format('YYYYMMDD');
            }

            // Pass the notification date, in the correct format ('YYYYMMDD') to the 'pastDueDate' attribute.
            this.model.set('pastDueDate', pastDueDate, {silent: true});
        },
        validateNotificationMoment: function(notificationMoment) {

            // The notification date cannot be before either the collection date or today, whichever is later.
            var collectionMoment = FormUtils.getCollectionMoment.apply(this);
            var todayMoment = moment();

            var earliestMoment = collectionMoment.isAfter(todayMoment) ? collectionMoment : todayMoment;
            return notificationMoment.isBefore(earliestMoment) ? earliestMoment : notificationMoment;
        },
        getCollectionMoment: function() {
            return moment(this.model.get('collectionDate'), 'MM/DD/YYYY');
        },

        //====================== DRAFT UTILITY FUNCTIONS ======================
        onBeforeDraftEvent: function(action, option) {
            this.showInProgress(action);
            this.enableInputFields(false);
            this.enableFooterButtons(false);
        },
        onDraftSuccessEvent: function(options) {
            this.hideInProgress();
            this.$el.trigger('tray.reset');
        },
        onDraftErrorEvent: function(options) {
            this.hideInProgress();
            this.enableInputFields(true);
            this.enableFooterButtons(true);
        },
        onDraftReadSuccess: function(options) {
            this.isDraftLoaded = true;
            this.model.trigger('draft:getData');
        }
    };

    return FormUtils;
});
