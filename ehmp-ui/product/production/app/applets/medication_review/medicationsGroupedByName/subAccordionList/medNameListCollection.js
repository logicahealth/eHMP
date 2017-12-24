define([
    'underscore',
    'backbone',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowModel'
], function(_, Backbone, MedNameRowModel) {
    'use strict';

    return Backbone.Collection.extend({
        ascending: 0,
        descending: 1,
        sortTypes: {
            status: 0,
            medicationName: 1,
            sig: 2,
            facilityMoniker: 3
        },
        initialize: function() {
            this.setDefaults();
        },
        setDefaults: function() {
            this.currentSortOrder = this.ascending;
            this.currentSortType = this.sortTypes.status;
            this.comparator = this.statusRankComparator;
        },
        model: MedNameRowModel,
        parse: function(incomingCollection) {
            var groupArrays = _.groupBy(incomingCollection, function(medModel) {
                return medModel.getDisplayName().value;
            });
            return _.values(groupArrays);
        },
        setComparator: function(attributeToSortBy) {
            if (attributeToSortBy === "medicationName") {
                this.comparator = this.medicationNameComparator;
            } else if (attributeToSortBy === "sig") {
                this.comparator = this.sigComparator;
            } else {
                this.comparator = this.statusRankComparator;
            }
        },
        setUpSortForColumn: function(sortType) {
            if (this.currentSortType != this.sortTypes[sortType]) {
                this.currentSortType = this.sortTypes[sortType] || this.sortTypes.status;
                if (this.currentSortType === this.sortTypes.medicationName) {
                    this.comparator = this.medicationNameComparator;
                } else if (this.currentSortType === this.sortTypes.sig) {
                    this.comparator = this.sigComparator;
                } else if(this.currentSortType === this.sortTypes.facilityMoniker) {
                    this.comparator = this.facilityComparator;
                } else {
                    this.comparator = this.statusRankComparator;
                }
                
                this.currentSortOrder = this.ascending;
            } else {
                this.currentSortOrder++;
                if (this.currentSortOrder > this.descending) {
                    this.setDefaults();
                }
            }
        },
        statusRankComparator: function(firstModel, secondModel) {
            var firstModelStatusRank = firstModel.get('overallStatusRank');
            var secondModelStatusRank = secondModel.get('overallStatusRank');
            if (firstModelStatusRank !== secondModelStatusRank) {
                if (this.currentSortOrder === this.descending) {
                    return (firstModelStatusRank < secondModelStatusRank) ? 1 : -1;
                } else {
                    return (firstModelStatusRank < secondModelStatusRank) ? -1 : 1;
                }
            } else {
                var firstModelName = firstModel.get("medicationName");
                var secondModelName = secondModel.get("medicationName");
                // Whether current sort is ascending or descending, this secondary sort is always ascending
                return (firstModelName < secondModelName) ? -1 : (firstModelName > secondModelName) ? 1 : 0;
            }
        },
        medicationNameComparator: function(firstModel, secondModel) {
            var firstMedicationName = firstModel.get('medicationName');
            var secondMedicationName = secondModel.get('medicationName');
            if (firstMedicationName === secondMedicationName) {
                return 0;
            }
            var result = (firstMedicationName < secondMedicationName) ? -1 : 1;
            if (this.currentSortOrder == this.descending) {
                result = result * -1;
            }
            return result;
        },
        sigComparator: function(firstModel, secondModel) {
            var firstSig = firstModel.get('sig');
            var secondSig = secondModel.get('sig');
            if (firstSig == secondSig) {
                return 0;
            }
            var result = (firstSig < secondSig) ? -1 : 1;
            if (this.currentSortOrder == this.descending) {
                result = result * -1;
            }
            return result;
        },
        facilityComparator: function(firstModel, secondModel) {
            var firstMoniker = firstModel.get('facilityMoniker');
            var secondMoniker = secondModel.get('facilityMoniker');
            if (firstMoniker === secondMoniker) return 0;
            var result = (firstMoniker < secondMoniker) ? -1 : 1;
            if (this.currentSortOrder == this.descending) {
                return result * -1;
            }
            return result;
        }
    });
});