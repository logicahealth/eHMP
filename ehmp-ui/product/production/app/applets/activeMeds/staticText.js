define(function medsStaticText() {
    "use strict";
    var MEDS = {
        ACTIVE_MED: "This medication is active and expiration date has not passed, but supply should be exhausted and the last refill has not been picked up.",
        ACTIVE_EXPIRED: "This medication is active but expiration date has passed.",
        BEFORE_EXPIRED: "This medication is listed as expired but expiration date has not yet passed.",
        BEFORE_DISCONTINUED: "This medication is listed as discontinued but discontinue date has not yet passed.",
        MISSING_STATUS: "This medication was not filled or missing data to determine its status.",
        NO_REFILLS: "This medication is active with no refills remaining. ",
        NON_ACTIVE: "This medication is an Active Non VA medication. ",
        NO_DATA: 'No Data',
        PENDING_MEDICATION: "This medication is Pending. ",

        EXPIRED_ON: function expiredOn(date) {
            return "This medication was expired " + date + " ago. ";
        },
        DISCONTINUED_ON: function discontinuedOn(date) {
            return "This medication was discontinued " + date + " ago. ";
        },
        DISCONTINUED_ON_NON_VA: function discontinuredOn(date) {
            return "This medication is Non VA and was discontinued " + date + " ago. ";
        },
        ACTIVE_FILLABLE_FOR: function activeFillableFor(date) {
            return "This medication is Active and fillable for " + date + ". ";
        }
    };
    Object.freeze(MEDS);
    return MEDS;
});
