define([
    'backbone',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowSubCollection'
], function(Backbone, MedNameRowSubCollection) {
    'use strict';
    return Backbone.Model.extend({

        parse: function(medsGroupedByName) {
            var sortedMeds = new MedNameRowSubCollection(); // initialize first, so that this.onAdd gets bound correctly
            sortedMeds.add(medsGroupedByName); // then add all of the models
            var date = ADK.utils.getTimeSince(medsGroupedByName[0].getEarlierStop().stoppedDate);
            return {
                medicationName: medsGroupedByName[0].getDisplayName().value,
                uidUnderscored: medsGroupedByName[0].getUid(),
                medications: sortedMeds,
                medicationType: medsGroupedByName[0].getType().type,
                overallStatusRank: sortedMeds.overallStatusRank,
                sig: medsGroupedByName[0].getSig(),
                modifiedVaStatus: medsGroupedByName[0].getModifiedVaStatus(),
                nextMedication: medsGroupedByName[0].getNextMedication(date)
            };
        }
    });
});