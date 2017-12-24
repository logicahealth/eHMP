define([
    'backbone',
    'moment',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowSubCollection'
], function(Backbone, moment, MedNameRowSubCollection) {
    'use strict';
    return Backbone.Model.extend({

        parse: function(medsGroupedByName) {
            var sortedMeds = new MedNameRowSubCollection(); // initialize first, so that this.onAdd gets bound correctly
            sortedMeds.add(medsGroupedByName); // then add all of the models
            var date = ADK.utils.getTimeSince(moment(medsGroupedByName[0].getEarlierStopAsMoment()).format("YYYYMMDDHHmmssSSS"), true);
            var crsUtil = ADK.utils.crsUtil;
            var CRSDOMAIN = crsUtil.crsAttributes.CRSDOMAIN;
            medsGroupedByName[0].set(CRSDOMAIN, crsUtil.domain.MEDICATION);
            crsUtil.applyConceptCodeId(medsGroupedByName[0]);

            var facilityCode = _.get(medsGroupedByName, '[0].attributes.facilityCode');
            var facilityModel = ADK.Enrichment.getFacility(facilityCode) || new Backbone.Model();

            return {
                medicationName: medsGroupedByName[0].getDisplayName().value,
                uidUnderscored: medsGroupedByName[0].getUid(),
                medications: sortedMeds,
                medicationType: medsGroupedByName[0].getType().type,
                overallStatusRank: sortedMeds.overallStatusRank,
                sig: medsGroupedByName[0].getSig(),
                modifiedVaStatus: medsGroupedByName[0].getModifiedVaStatus(),
                nextMedication: medsGroupedByName[0].getNextMedication(date),
                dataCode: medsGroupedByName[0].get('dataCode'),
                facilityMoniker: facilityModel.get('facilityMoniker')
            };
        }
    });
});