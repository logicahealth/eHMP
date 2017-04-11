define([
    'underscore',
    'backbone',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowModel'
], function(_, Backbone, MedNameRowModel) {
    'use strict';

    return Backbone.Collection.extend({
        model: MedNameRowModel,
        parse: function(incomingCollection) {
            var groupArrays = _.groupBy(incomingCollection, function(medModel) {
                return medModel.getDisplayName().value;
            });
            return _.values(groupArrays);
        },
        comparator: function(firstModel, secondModel) {
            var firstModelStatusRank = firstModel.get('overallStatusRank');
            var secondModelStatusRank = secondModel.get('overallStatusRank');
            if (firstModelStatusRank !== secondModelStatusRank) {
                return (firstModelStatusRank < secondModelStatusRank) ? -1 : 1;
            } else {
                var firstModelName = firstModel.get("medicationName");
                var secondModelName = secondModel.get("medicationName");

                return (firstModelName < secondModelName) ? -1 : (firstModelName > secondModelName) ? 1 : 0;
            }
        }
    });
});