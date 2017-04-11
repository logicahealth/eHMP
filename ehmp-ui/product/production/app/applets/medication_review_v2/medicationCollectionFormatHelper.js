define([
    "app/applets/medication_review_v2/appletHelper"
], function(appletHelper) {
    "use strict";

    /* Overlap Logic
    [S2--P2]             [S2--P2]   //No Overlap here
            [S1------P1]            //Overlap below
            [S2------P2]        (1)
               [S2-P2]          (1)
                [S2------P2]    (1)
        [S2----P2]              (2)
        [S2--------------P2]    (2)

    (S1 <= S2 && P1 > S2) || (S1>= S2 && S1 < P2)
    */
    function compare(a, b) {
        var c = new Date(a.date);
        var d = new Date(b.date);
        return (c - d);
    }

    var splitOverLappingMedsConcat = function(medArray) {
        var concatArray = []; //this will be an array of arrays of models
        for (var medArrayIndex = 0; medArrayIndex < medArray.length; medArrayIndex++) {
            //this model needs to be compared with all saved models to see if it can be rolled up with any
            var indexStartDate = moment(medArray[medArrayIndex].get('overallStart'), "YYYYMMDD").valueOf();
            var indexStopDate = moment(medArray[medArrayIndex].get('stopped'), "YYYYMMDD").valueOf();
            var startDateArray = [];
            if (indexStartDate <= indexStopDate) { //ignore bad data where start is after stop date
                if (concatArray.length === 0) {
                    concatArray.push([medArray[0]]); //store first element of medArray as an array into concatArray
                } else {
                    //compare this model with the ones already saved to see if it can be rolled up
                    var overlapFound = false;
                    for (var concatArrayIndex = concatArray.length - 1; concatArrayIndex >= 0; concatArrayIndex--) {
                        overlapFound = false;
                        for (var concatArrayModelIndex = concatArray[concatArrayIndex].length - 1; concatArrayModelIndex >= 0; concatArrayModelIndex--) {
                            var concatStartDate = moment(concatArray[concatArrayIndex][concatArrayModelIndex].get('overallStart'), "YYYYMMDD").valueOf();
                            var concatStopDate = moment(concatArray[concatArrayIndex][concatArrayModelIndex].get('stopped'), "YYYYMMDD").valueOf();
                            //No overlap if the stop date of one is the same as the start date of the other
                            if ((concatStartDate <= indexStartDate && concatStopDate > indexStartDate) ||
                                (concatStartDate >= indexStartDate && concatStartDate < indexStopDate) ||
                                //this last check is for a rare situation where start and stop of both dates are exactly the same day
                                (concatStartDate === indexStartDate && concatStopDate === indexStartDate)) { //overlap exists
                                overlapFound = true;
                                break;
                            }
                        }
                        if (!overlapFound) { //if no overlap, rollup
                            var startDate = {
                                index: concatArrayIndex,
                                date: moment(concatArray[concatArrayIndex][concatArray[concatArrayIndex].length - 1].get('overallStart'), "YYYYMMDD").valueOf()
                            };
                            startDateArray.push(startDate);
                        }
                    }

                    if (startDateArray.length === 0) { //there is overlap with all elements, don't rollup
                        concatArray.push([medArray[medArrayIndex]]); //push as a new array into concatArray
                    } else {
                        startDateArray.sort(compare);
                        var dateIndex = startDateArray[0];
                        concatArray[dateIndex.index].push(medArray[medArrayIndex]); //push to current concatArray array - Rollup
                    }
                }

            }

        }

        return concatArray;
    };

    var removeDuplicateMedsIfPresent = function(models) {
        var newModels = _.filter(models, function(model, index) {
            /* tests if the model has a duplicate in the rest of the modles by uid */
            for (index += 1; index < models.length; index += 1) {
                if (_.isEqual(model.get('uid'), models[index].get('uid'))) {
                    return false;
                }
            }
            return true;
        });
        return newModels;
    };

    var groupByMedication = function(collection, useGlobalDateFilter) {
        var subGroups = collection.groupBy(function(med) {
            return med.get('groupbyValue');
        });

        var medicationSubGroups = _.map(subGroups, function(subMedications, subMedication) {
            /* get all attributes of the first med in the group and then append the sub group collection */
            var medSubGroupModel = new Backbone.Model();
            var noDuplicateSubMedications = removeDuplicateMedsIfPresent(subMedications);
            medSubGroupModel.set('submeds', new SubMedsCollection(noDuplicateSubMedications));

            //set the greenline of the group to be the oldes overallStart date
            var oldestOverallStartDate = moment();
            _.each(medSubGroupModel.get('submeds').models, function(model) {
                var modelStartDate = moment(model.get('overallStart'), 'YYYYMMDD').valueOf();
                if (moment(modelStartDate).isBefore(oldestOverallStartDate)) {
                    oldestOverallStartDate = modelStartDate;
                }
            });
            _.each(medSubGroupModel.get('submeds').models, function(model) {
                model.set('greenLineDate', moment(oldestOverallStartDate).format('YYYYMMDD'));
            });

            var unfilteredModelsForGraph = medSubGroupModel.get('submeds').models;
            var AllDateModel = ADK.SessionStorage.getModel('globalDate');
            var filteredModels = medSubGroupModel.get('submeds').models;

            if (AllDateModel.get('selectedId') !== 'all-range-global' && useGlobalDateFilter) {

                filteredModels = _.filter(medSubGroupModel.get('submeds').models, function(model) {
                    var dateModel = ADK.SessionStorage.getModel('globalDate');
                    var GDFStart = moment(dateModel.get('fromDate'), "MM/DD/YYYY").valueOf();
                    var overallStart = moment(model.get('overallStart'), "YYYYMMDD").valueOf();
                    var overallStop = moment(model.get('stopped'), "YYYYMMDD").valueOf();
                    var lastFilled = moment(model.get('lastFilled'), "YYYYMMDD").valueOf();
                    var lastAdmin = moment(model.get('lastAdmin'), "YYYYMMDD").valueOf();

                    if (dateModel.get('fromDate') && (dateModel.get('fromDate') !== 'null')) {
                        var filter1 = (overallStart >= GDFStart || lastFilled >= GDFStart || lastAdmin >= GDFStart || overallStop >= GDFStart);
                        return filter1;
                    } else if (dateModel.get('selectedId') === 'custom-range-apply-global' ||
                        dateModel.get('selectedId') === 'custom-range-apply-global') {
                        var startCustom = moment(dateModel.get('customFromDate'), 'MM/DD/YYYY');
                        var stopCustom = moment(dateModel.get('customToDate'), 'MM/DD/YYYY');

                        var filter2 = ((overallStart >= startCustom || lastFilled >= startCustom || lastAdmin >= startCustom) && overallStop <= stopCustom);
                        return filter2;

                    } else {
                        return true;
                    }
                });
            }
            var modelToReturn = medSubGroupModel.get('submeds').models[0];

            medSubGroupModel.get('submeds').reset(filteredModels);
            modelToReturn.set("submeds", new Backbone.Collection(filteredModels));

            return modelToReturn;
        });
        var filteredOutEmptySubGroups = _.filter(medicationSubGroups, function(subGroup) {
            return (subGroup.get('submeds').models.length > 0);
        });
        return filteredOutEmptySubGroups;
    };
    var groupByFacility = function(collection) {
        var facilityGroups = collection.groupBy(function(subGroupInternalMed) {
            return 'key';
        });
        var completeFacilityGroups = {};
        var completeFacilityGroupsSets = _.map(facilityGroups, function(value, key) {
            return {
                key: key,
                sets: splitOverLappingMedsConcat(value)
            };
        });

        _.each(completeFacilityGroupsSets, function(groupsSet) {

            var newKey = groupsSet.key;

            for (var index = 0; index < groupsSet.sets.length; index++) {
                var nextKey = newKey + index.toString();
                if (index === 0) {
                    nextKey = newKey + '_topFacilityRow';
                }

                completeFacilityGroups[nextKey] = groupsSet.sets[index];
            }
        });

        var facilityGroupModels = _.map(completeFacilityGroups, function(subFacilityMedications, key) {

            var topBorderClass = '';
            if (key.indexOf('_topFacilityRow') >= 0) {
                topBorderClass = 'grayTopBorder';
            }
            subFacilityMedications[0].set('topBorderClass', topBorderClass);
            var facilityModel = new Backbone.Model({
                topBorderClass: topBorderClass,
                firstFacilityMed: subFacilityMedications[0],
                facilityName: subFacilityMedications[0].get('facilityName'),
                facilityMoniker: subFacilityMedications[0].get('facilityMoniker'),
                facilityMeds: new Backbone.Collection(subFacilityMedications)
            });

            /* check for change in dose */
            if (facilityModel.get('facilityMeds').models.length > 1) {
                facilityModel.set('secondFacilityMed', facilityModel.get('facilityMeds').models[1]);
                var bothHaveDose = (facilityModel.get('secondFacilityMed').get('dosages') &&
                    facilityModel.get('secondFacilityMed').get('dosages')[0] !== undefined &&
                    facilityModel.get('secondFacilityMed').get('dosages')[0].dose !== undefined &&
                    facilityModel.get('firstFacilityMed').get('dosages') &&
                    facilityModel.get('firstFacilityMed').get('dosages')[0] !== undefined &&
                    facilityModel.get('firstFacilityMed').get('dosages')[0].dose !== undefined);
                if (bothHaveDose) {

                    if (parseFloat(facilityModel.get('firstFacilityMed').get('dosages')[0].dose) > parseFloat(facilityModel.get('secondFacilityMed').get('dosages')[0].dose)) {
                        facilityModel.get('firstFacilityMed').set('changeInMedicationDoseClass', 'fa fa-arrow-up');
                        facilityModel.set('ariaLabelAdditionalText', ' There was an increase in dosage from ' +
                            facilityModel.get('secondFacilityMed').get('dosages')[0].instructions + " to " + facilityModel.get('firstFacilityMed').get('dosages')[0].instructions);
                    } else if (parseFloat(facilityModel.get('firstFacilityMed').get('dosages')[0].dose) < parseFloat(facilityModel.get('secondFacilityMed').get('dosages')[0].dose) + ".") {
                        facilityModel.get('firstFacilityMed').set('changeInMedicationDoseClass', 'fa fa-arrow-down');
                        facilityModel.set('ariaLabelAdditionalText', ' There was a decrease in dosage from ' +
                            facilityModel.get('secondFacilityMed').get('dosages')[0].instructions + " to " + facilityModel.get('firstFacilityMed').get('dosages')[0].instructions + ".");
                    }
                }
            }
            return facilityModel;
        });

        if (facilityGroupModels[0] !== undefined) {
            facilityGroupModels[0].set('topBorderClass', '');
        }
        return facilityGroupModels;
    };
    var groupByMedicationNameThenByFacility = function(collection, useGlobalDateFilter) {
        var medicationSubGroups = groupByMedication(collection, useGlobalDateFilter);
        var groupNames = [];
        _.each(medicationSubGroups, function(subGroupModel) {
            groupNames.push(subGroupModel.get("displayName"));
            var facilityGroupModels = groupByFacility(subGroupModel.get('submeds'));
            var graphText = appletHelper.getGraphTextInfo(facilityGroupModels);
            _.each(facilityGroupModels, function(model) {
                model.set('graphInfoText', graphText);
            });
            subGroupModel.set('subMedsInternalGroupModels', new Backbone.Collection(facilityGroupModels));
            if (subGroupModel.get('subMedsInternalGroupModels').models[0] !== undefined)
                subGroupModel.get('subMedsInternalGroupModels').models[0].set("isFirstOverlappingMed", true);
            var AllDateModel = ADK.SessionStorage.getModel('globalDate');
            var unfilteredCollectionToGraphFacilityGroupModels = facilityGroupModels;
            subGroupModel.set('unfilteredCollectionToGraph', new Backbone.Collection(unfilteredCollectionToGraphFacilityGroupModels));
            subGroupModel.set('hasOverLappingMeds', true);
        });
        return {
            medicationSubGroups: medicationSubGroups,
            groupNames: groupNames
        };
    };
    var self = this;
    var statusRanks = {
        'ACTIVE': 1,
        'UNRELEASED': 1,
        'PENDING': 2,
        'EXPIRED': 3,
        'DISCONTINUED': 4
    };
    var medsCollection = Backbone.Collection.extend({
        comparator: function(modelA, modelB) {
            var modelAStatus = statusRanks[modelA.get('standardizedVaStatus')] || 100;
            var modelBStatus = statusRanks[modelB.get('standardizedVaStatus')] || 100;

            //if statuses are different, put higher rank up
            if (modelAStatus !== modelBStatus) {
                return (modelAStatus < modelBStatus) ? -1 : 1;
                //else the ranks are the same - order by alphabetical
            } else {
                var modelAName = modelA.get("displayName");
                var modelBName = modelB.get("displayName");

                return (modelAName < modelBName) ? -1 : (modelAName > modelBName) ? 1 : 0;
            }
        }
    });

    //SubMedsCollection is used for sorting data with in a medication group
    var SubMedsCollection = Backbone.Collection.extend({
        comparator: function(modelA, modelB) {
            var modelAStatus = statusRanks[modelA.get('standardizedVaStatus')] || 100;
            var modelBStatus = statusRanks[modelB.get('standardizedVaStatus')] || 100;

            var modelAIsNotUserSiteMed = modelA.get("isNotUserSiteMed") || false;
            var modelBIsNotUserSiteMed = modelB.get("isNotUserSiteMed") || false;

            var modelANonVAActive = modelA.get('vaType') === 'N' && modelAStatus === 1;
            var modelBNonVAActive = modelB.get('vaType') === 'N' && modelBStatus === 1;

            //Non-VA active should be always on top with user home site first.
            if (modelANonVAActive && modelBNonVAActive) {
                if (!modelAIsNotUserSiteMed) {
                    return -1;
                } else if (!modelBIsNotUserSiteMed) {
                    return 1;
                }
            } else if (modelANonVAActive) {
                return -1;
            } else if (modelBNonVAActive) {
                return 1;
            }

            var modelAStoppedDateValue = moment(modelA.get("stopped"), 'YYYYMMDD').valueOf();
            var modelBStoppedDateValue = moment(modelB.get("stopped"), 'YYYYMMDD').valueOf();

            //stopped date as first tie-breaker
            if (modelAStoppedDateValue !== modelBStoppedDateValue) {
                return (modelAStoppedDateValue > modelBStoppedDateValue) ? -1 : 1;
            } else {
                //user site as second tie-breaker. User home site should be on top.
                var modelAFacility = modelA.get('facilityName');
                var modelBFacility = modelB.get('facilityName');
                if (modelAIsNotUserSiteMed !== modelBIsNotUserSiteMed) {
                    //if modelA is from user site, put it on top, else put modelB on top.
                    return !modelAIsNotUserSiteMed ? -1 : 1;
                }

                if (modelAFacility !== modelBFacility) {
                    return (modelAFacility > modelBFacility) ? 1 : -1;
                }

                //user status as third tie-breaker.
                if (modelAStatus !== modelBStatus) {
                    return (modelAStatus < modelBStatus) ? -1 : 1;
                }

                //else same rank.
                return 0;
            }
        }
    });
    var getMedicationGroup = function(collection, groupName) {
        var mainGroup = {};
        _.each(collection.models, function(model) {
            var group = null;
            for (var medsIndex = 0; medsIndex < model.get('meds').models.length; medsIndex++) {

                if (model.get('meds').models[medsIndex].get('displayName') === groupName) {
                    group = model.get('meds').models[medsIndex];
                    break;
                }
            }
            if (model.get("type").toLowerCase() === 'inpatient') {
                mainGroup.inpatientMeds = group;
            } else if (model.get("type").toLowerCase() === 'outpatient') {
                mainGroup.outpatientMeds = group;
            } else {
                mainGroup.clinicalOrders = group;
            }
        });
        return mainGroup;
    };
    var getMedicationGroupNames = function(collection) {
        var groupNames = [];
        _.each(collection.models, function(model) {
            groupNames = groupNames.concat(model.get("groupNames"));
        });
        var uniqueNames = _.unique(groupNames);
        return (uniqueNames);
    };

    return {
        splitOverLappingMedsConcat: splitOverLappingMedsConcat,
        removeDuplicateMedsIfPresent: removeDuplicateMedsIfPresent,
        groupByMedication: groupByMedication,
        groupByFacility: groupByFacility,
        groupByMedicationNameThenByFacility: groupByMedicationNameThenByFacility,
        medsCollection: medsCollection,
        subMedsCollection: SubMedsCollection,
        getMedicationGroup: getMedicationGroup,
        getMedicationGroupNames: getMedicationGroupNames
    };

});