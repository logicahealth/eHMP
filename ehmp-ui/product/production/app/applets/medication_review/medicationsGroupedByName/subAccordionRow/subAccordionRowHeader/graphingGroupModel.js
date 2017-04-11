define([
    'backbone',
    'marionette',
    'moment'
], function(Backbone, Marionette, moment) {
    'use strict';

    var graphingGroupModel = Backbone.Model.extend({
        parse: function(medications) {
            var latestMed = medications.at(0);

            var result = {
                badGraphingData: medications.badGraphingData,
                medications: medications
            };

            try {
                var date = ADK.utils.getTimeSince(moment(latestMed.getEarlierStopAsMoment()).format("YYYYMMDDHHmmssSSS"), true);
                var userSiteCode = ADK.UserService.getUserSession().get('site');
                result.uidUnderscored = latestMed.getUid();
                result.name = latestMed.get('name');
                result.facilityMoniker = latestMed.get('facilityMoniker');
                result.stopped = latestMed.get('stopped');
                result.computedSig = latestMed.getSig();
                result.fillableLabel = latestMed.getNextMedication(date).label;
                result.fillableDate = latestMed.getNextMedication(date).date;
                result.fillableDescription = latestMed.getNextMedication(date).description;
                result.fillableDisplay = latestMed.getNextMedication(date).display;
                result.userSiteIcon = latestMed.userSiteIcon(userSiteCode);
                result.ivProducts = latestMed.getSig().products;
                result.ivDosages = latestMed.getSig().dosages;
                result.vaType = latestMed.get('vaType');
            } catch (error) {
                // We fully expect to enter this catch block during unit tests(for lack of ADK), but do not want the needlessly noisy output
            }
            return result;
        }
    });

    return graphingGroupModel;
});