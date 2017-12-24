define([
    'backbone',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionList/medNameListCollection'
], function(Backbone, MedNameListCollection) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            medicationType: 'unrecognized',
            medicationDisplayType: 'UNRECOGNIZED MED TYPE',
            medications: new MedNameListCollection([])
        },
        parse: function(medsArrayGroupedByType) {
            if (medsArrayGroupedByType instanceof Array && medsArrayGroupedByType.length > 0) {
                return {
                    medicationType: medsArrayGroupedByType[0].getType().type,
                    medicationDisplayType: medsArrayGroupedByType[0].getType().displayType,
                    uidUnderscored: medsArrayGroupedByType[0].getUid(),
                    fillableHeader: medsArrayGroupedByType[0].getFillableHeader(),
                    tooltipSig: medsArrayGroupedByType[0].getTooltip().sig,
                    tooltipFacility: medsArrayGroupedByType[0].getTooltip().facility,
                    tooltipMedicationName: medsArrayGroupedByType[0].getTooltip().medicationName,
                    tooltipFillable: medsArrayGroupedByType[0].getTooltip().fillable,
                    medications: new MedNameListCollection(medsArrayGroupedByType, {
                        parse: true
                    })
                };
            } else {
                return {
                    medicationType: medsArrayGroupedByType.requiredType,
                    medicationDisplayType: medsArrayGroupedByType.displayType
                };
            }
        }
    });
});