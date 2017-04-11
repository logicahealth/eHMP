define([
    'backbone',
    'marionette',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupModel'
], function(Backbone, Marionette, GraphingGroupModel) {
    'use strict';

    var GraphingGroupCollection = Backbone.Collection.extend({
        model: GraphingGroupModel,
        comparator: function(graphingGroupModelA, graphingGroupModelB) {
            var firstMed = graphingGroupModelA.get('medications').at(0);
            var secondMed = graphingGroupModelB.get('medications').at(0);
            var ACTIVE_NON_VA = 10;
            var ACTIVE = 20;
            var PENDING = 30;
            var EXPIRED = 34;
            var DISCONTINUED = 36;
            var NOT_GRAPHABLE = 40;

            var firstGraphingPriority = graphingPriorityOf(firstMed);
            var secondGraphingPriority = graphingPriorityOf(secondMed);
            if (firstGraphingPriority !== secondGraphingPriority || firstGraphingPriority === NOT_GRAPHABLE) {
                return firstGraphingPriority - secondGraphingPriority;
            }

            var differenceBetweenStarts = secondMed.getOverallStartAsMoment().valueOf() - firstMed.getOverallStartAsMoment().valueOf();
            if (firstGraphingPriority === ACTIVE_NON_VA || firstGraphingPriority === PENDING) {
                if (firstGraphingPriority === ACTIVE_NON_VA) {
                    differenceBetweenStarts = differenceBetweenStarts * -1;
                }
                return differenceBetweenStarts;
            } else {
                // IMPORTANT - We want to sort in DESCENDING order. Thus we do second minus first.
                var differenceBetweenStops = secondMed.getEarlierStopAsMoment().valueOf() - firstMed.getEarlierStopAsMoment().valueOf();
                if (differenceBetweenStops !== 0) {
                    return differenceBetweenStops;
                }
                // BUT - If the stop is the exact same day, then we want to sort by start date in ASCENDING order.
                if (differenceBetweenStarts !== 0) {
                    return differenceBetweenStarts;
                }
                // FINALLY - If the start is the exact same day, we sort by the statusRank (different than graphingPriority above)
                var differenceBetweenStatusRanks = firstMed.getStatusRank() - secondMed.getStatusRank();
                if (differenceBetweenStatusRanks !== 0) {
                    return differenceBetweenStatusRanks;
                }
            }
            // if (firstMed.get('facilityName') !== secondMed.get('facilityName')) {
            //  firstMed.isUserSite(this.adk);
            //  return -1
            // }

            return firstMed.getStatusRank() - secondMed.getStatusRank();

            function graphingPriorityOf(medicationOrder) {
                var status = medicationOrder.getModifiedVaStatus();
                if (status === 'active') {
                    if (medicationOrder.getIsNonVA()) {
                        return ACTIVE_NON_VA;
                    }
                    return ACTIVE;
                }
                if (status === 'pending') {
                    return PENDING;
                }
                if (status === 'expired') {
                    return EXPIRED;
                }
                if (status === 'discontinued') {
                    return DISCONTINUED;
                }
                return NOT_GRAPHABLE;
            }
        },
        parse: function(meds) {
            var result = [];

            var atLeastOneGraphable = meds.some(function(med) {
                return med.getCanBeGraphed();
            });

            // We used to have a strategy of sorting the meds before separating into groups,
            // but unit testing appears to prove that separating them first and then sorting 
            // the groups themselves works equally as well
            // Therefore, it appears we do not need to spend cpu cycles sorting the meds
            var sortedMeds = this.prepareMedsForGrouping(meds, false);

            if (!atLeastOneGraphable) {
                sortedMeds.badGraphingData = true;
                result.push(sortedMeds);
                return result;
            }

            var pendingAndNotGraphable = sortedMeds.filter(function(med) {
                return med.getModifiedVaStatus() === 'pending' || !med.getCanBeGraphed();
            });
            sortedMeds.remove(pendingAndNotGraphable);

            var atLeastTwoMedsOverlap = false;
            var current;
            for (var i = 1; i < sortedMeds.length; i++) {
                current = sortedMeds.at(i);

                var previous = meds.at(i - 1);
                if (previous.activeRegionsOverlap(current)) {
                    atLeastTwoMedsOverlap = true;
                    break;
                }
            }

            if (!atLeastTwoMedsOverlap && sortedMeds.length > 0) {
                result.push(sortedMeds);
            } else {
                // separate overlapping meds
                var med;
                for (var j = 0; j < sortedMeds.length; j++) {
                    med = sortedMeds.at(j);
                    if (result.length === 0 || med.getModifiedVaStatus() === 'pending') {
                        result.push(new Backbone.Collection(med));
                        continue;
                    }
                    var previousCollection;
                    for (var k = result.length - 1; k >= 0; k--) {
                        previousCollection = result[k];
                        var medToCompare = previousCollection.last();
                        if (!med.activeRegionsOverlap(medToCompare)) {
                            previousCollection.add(med);
                            break;
                        }
                        if (k === 0) {
                            result.push(new Backbone.Collection(med));
                        }
                    }
                }
            }

            // Now add pending
            if (pendingAndNotGraphable.length > 0) {
                var pending = pendingAndNotGraphable.filter(function(med) {
                    return med.getModifiedVaStatus() === 'pending';
                });
                _.each(pending, function(med) {
                    result.push(new Backbone.Collection(med));
                });
            }

            return result;
        },
        prepareMedsForGrouping: function(medsGroupedByName, shouldSort) {
            var SortedCollection = Backbone.Collection.extend({
                comparator: function(firstMed, secondMed) {
                    var ACTIVE_NON_VA = 10;
                    var ACTIVE_EXPIRED_DISCONTINUED_OTHER = 20;
                    var PENDING = 30;
                    var NOT_GRAPHABLE = 40;

                    var firstGraphingPriority = graphingPriorityOf(firstMed);
                    var secondGraphingPriority = graphingPriorityOf(secondMed);
                    if (firstGraphingPriority !== secondGraphingPriority || firstGraphingPriority === NOT_GRAPHABLE) {
                        return firstGraphingPriority - secondGraphingPriority;
                    }

                    var differenceBetweenStarts = secondMed.getOverallStartAsMoment().valueOf() - firstMed.getOverallStartAsMoment().valueOf();
                    if (firstGraphingPriority === ACTIVE_EXPIRED_DISCONTINUED_OTHER) {
                        // IMPORTANT - We want to sort in DESCENDING order. Thus we do second minus first.
                        var differenceBetweenStops = secondMed.getEarlierStopAsMoment().valueOf() - firstMed.getEarlierStopAsMoment().valueOf();
                        if (differenceBetweenStops !== 0) {
                            return differenceBetweenStops;
                        }
                        // BUT - If the stop is the exact same day, then we want to sort by start date in ASCENDING order.
                        if (differenceBetweenStarts !== 0) {
                            return differenceBetweenStarts;
                        }
                        // FINALLY - If the start is the exact same day, we sort by the statusRank (different than graphingPriority above)
                        var differenceBetweenStatusRanks = firstMed.getStatusRank() - secondMed.getStatusRank();
                        if (differenceBetweenStatusRanks !== 0) {
                            return differenceBetweenStatusRanks;
                        }
                    } else if ((firstGraphingPriority === ACTIVE_NON_VA || firstGraphingPriority === PENDING) && (differenceBetweenStarts !== 0)) {
                        // When both are active non-VA meds OR both are pending, then they essentially have the same stop, so we'll sort by start
                        if (firstGraphingPriority === ACTIVE_NON_VA) {
                            differenceBetweenStarts = differenceBetweenStarts * -1;
                        }
                        return differenceBetweenStarts;
                    }

                    // if (firstMed.get('facilityName') !== secondMed.get('facilityName')) {
                    //  firstMed.isUserSite(this.adk);
                    //  return -1
                    // }

                    return firstMed.getStatusRank() - secondMed.getStatusRank();

                    function graphingPriorityOf(medicationOrder) {
                        var status = medicationOrder.getModifiedVaStatus();
                        if (!medicationOrder.getCanBeGraphed()) {
                            return NOT_GRAPHABLE;
                        }
                        if (medicationOrder.getIsNonVA() && status === 'active') {
                            return ACTIVE_NON_VA;
                        }
                        if (status === 'pending') {
                            return PENDING;
                        }
                        return ACTIVE_EXPIRED_DISCONTINUED_OTHER;
                    }
                }
            });
            var result = new SortedCollection(medsGroupedByName.models, {
                sort: shouldSort
            });
            return result;
        }
    });

    return GraphingGroupCollection;
});