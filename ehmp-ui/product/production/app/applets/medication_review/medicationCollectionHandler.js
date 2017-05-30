/* global ADK */
define([
    'moment',
    'backbone',
    'underscore',
    'app/applets/medication_review/medicationCollectionFormatHelper'
], function(moment, Backbone, _, medicationCollectionFormatHelper) {
    "use strict";

    var collectionHandler = {
        resetCollections: function(collection, useGlobalDateFilter) {
            var dateModel = ADK.SessionStorage.getModel('globalDate');
            var fromDate = dateModel.get('fromDate');
            var startTime;
            var endTime;
            var stoppedDate;

            if (dateModel.get('selectedId') === 'allRangeGlobal') {
                var sortDate = function(a, b) {
                    var c = new Date(a);
                    var d = new Date(b);
                    return (c - d) * -1;
                };

                var allStartDates = [];
                var GDFStart = moment(fromDate, 'MM/DD/YYYY').valueOf();
                var selectedId = dateModel.get('selectedId');
                var customFromDate = dateModel.get('customFromDate');
                var customToDate = dateModel.get('customToDate');

                var filteredModels = _.filter(collection.models, function(model) {
                    var overallStart = moment(model.get('overallStart'), 'YYYYMMDDHHmm').valueOf();
                    var overallStop = moment(model.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var lastFilled = moment(model.get('lastFilled'), 'YYYYMMDDHHmm').valueOf();
                    var lastAdmin = moment(model.get('lastAdmin'), 'YYYYMMDDHHmm').valueOf();
                    if (selectedId === 'allRangeGlobal' || !useGlobalDateFilter) {
                        return true;
                    } else if (fromDate && (fromDate !== 'null')) {
                        return (overallStart >= GDFStart || lastFilled >= GDFStart || lastAdmin >= GDFStart || overallStop >= GDFStart);
                    } else if (selectedId === 'customRangeApplyGlobal') {
                        var startCustom = moment(customFromDate, 'MM/DD/YYYY').valueOf();
                        var stopCustom = moment(customToDate, 'MM/DD/YYYY').valueOf();
                        return ((overallStart >= startCustom || lastFilled >= startCustom || lastAdmin >= startCustom) && overallStop <= stopCustom);
                    }
                    return true;
                });

                _.each(filteredModels, function(med) {
                    if (_.isUndefined(med.get('stopped')) || med.get('stopped') === '') {
                        stoppedDate = moment().add(6, 'months');
                    } else {
                        stoppedDate = med.get('stopped');
                    }
                    if (!_.isUndefined(med.get('overallStart'))) {
                        allStartDates.push(moment(med.get('overallStart'), 'YYYYMMDDHHmm').valueOf());
                        allStartDates.push(moment(med.get('stopped'), 'YYYYMMDDHHmm').valueOf());
                    }
                });

                allStartDates.sort(function(a, b) {
                    return sortDate(a, b);
                });

                var uniqueYears = _.unique(allStartDates);
                startTime = _.last(uniqueYears);
                endTime = _.first(uniqueYears);

            } else {
                startTime = moment(fromDate, 'MM/DD/YYYY').valueOf();
                endTime = moment(dateModel.get('toDate'), 'MM/DD/YYYY').valueOf();
            }

            _.each(collection.models, function(model) {
                model.set('graphRelativeityNewestTime', endTime);
                model.set('graphRelativeityOldestTime', startTime);
            });

            return this.groupCollectionModels(collection, useGlobalDateFilter);
        },
        groupCollectionModels: function(collection, useGlobalDateFilter) {
            var sortOrderValue = function(firstGroupByValue) {
                var patientClass = ADK.PatientRecordService.getCurrentPatient().patientStatusClass();
                if (patientClass.toLowerCase() === 'inpatient') {
                    if (firstGroupByValue.toLowerCase() === 'inpatient') {
                        return 1;
                    } else {
                        return 0;
                    }
                } else if (patientClass.toLowerCase() === 'outpatient') {
                    if (firstGroupByValue.toLowerCase() === 'outpatient') {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    return 2;
                }
            };

            var emptyInpatientModel = new Backbone.Model({
                type: 'inpatient',
                isNonVa: false,
                meds: new Backbone.Collection(),
                sortOrderValue: sortOrderValue('inpatient'),
                firstModel: ADK.PatientRecordService.getCurrentPatient().patientStatusClass(),
                groupNames: []
            });

            var emptyOutpatientModel = new Backbone.Model({
                type: 'outpatient',
                isNonVa: false,
                meds: new Backbone.Collection(),
                sortOrderValue: sortOrderValue('outpatient'),
                firstModel: ADK.PatientRecordService.getCurrentPatient().patientStatusClass(),
                groupNames: []
            });

            var emptyClinicOrderModel = new Backbone.Model({
                type: 'clinic_order',
                isNonVa: false,
                meds: new Backbone.Collection(),
                sortOrderValue: sortOrderValue('clinic_order'),
                firstModel: ADK.PatientRecordService.getCurrentPatient().patientStatusClass(),
                groupNames: []
            });

            var groups = collection.groupBy(function(med) {
                return med.get('firstGroupByValue');
            });

            var medicationGroups = _.map(groups, function(medications, firstGroupByValue) {
                return new Backbone.Model({
                    type: firstGroupByValue,
                    isNonVa: false,
                    meds: new medicationCollectionFormatHelper.medsCollection(medications),
                    sortOrderValue: sortOrderValue(firstGroupByValue),
                    firstModel: ADK.PatientRecordService.getCurrentPatient().patientStatusClass()
                });
            });

            _.each(medicationGroups, function(model) {
                var groupedMeds = medicationCollectionFormatHelper.groupByMedicationNameThenByFacility(model.get('meds'), useGlobalDateFilter);
                model.set('groupNames', groupedMeds.groupNames);
                model.get('meds').reset(groupedMeds.medicationSubGroups);
            });

            var patientClass = ADK.PatientRecordService.getCurrentPatient().patientStatusClass();
            var medicationGroupsFinal = [emptyOutpatientModel, emptyClinicOrderModel, emptyInpatientModel];
            var medicationGroupsFinalMap = {
                'inpatient': 2,
                'outpatient': 0,
                'clinic_order': 1
            };

            if (patientClass.toLowerCase() === 'inpatient') {
                medicationGroupsFinal = [emptyInpatientModel, emptyClinicOrderModel, emptyOutpatientModel];
                medicationGroupsFinalMap = {
                    'inpatient': 0,
                    'outpatient': 2,
                    'clinic_order': 1
                };
            }
            _.each(medicationGroups, function(group) {
                var index = medicationGroupsFinalMap[group.get('type').toLowerCase()];
                medicationGroupsFinal[index] = group;
            });

            medicationGroupsFinal[0].set('expandOnInitialRender', true);

            collection.comparator = function(first, second) {
                if (first.get('sortOrderValue') > second.get('sortOrderValue')) {
                    return 0;
                } else {
                    return 1;
                }
            };

            return new Backbone.Collection(medicationGroupsFinal);
        }
    };
    return collectionHandler;
});
