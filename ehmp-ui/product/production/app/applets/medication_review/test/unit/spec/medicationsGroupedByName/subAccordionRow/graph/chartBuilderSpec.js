define([
    'jasminejquery',
    'backbone',
    'app/applets/medication_review/medicationsUngrouped/medicationOrderModel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/graph/chartBuilder'
], function(jasminejquery, Backbone, MedicationOrderModel, ChartBuilder) {
    'use strict';

    beforeEach(function() {
        var model1 = new MedicationOrderModel({
            "facilityCode": "998",
            "facilityName": "ABILENE (CAA)",
            "name": "CAPTOPRIL TAB",
            "overallStart": "20000216",
            "overallStop": "20010216",
            "vaStatus": "EXPIRED",
            "vaType": "O",
            meds: new Backbone.Collection({})
        });
        var model2 = new MedicationOrderModel({
            "facilityCode": "998",
            "facilityName": "ABILENE (CAA)",
            "name": "POTASSIUM CHLORIDE INJ,SOLN",
            "overallStart": "199911051500",
            "overallStop": "199911051010",
            "stopped": "199911051010",
            "vaStatus": "DISCONTINUED/EDIT",
            "vaType": "V"
        });

        var model3 = new MedicationOrderModel({
            "facilityCode": "998",
            "facilityName": "ABILENE (CAA)",
            "name": "BACITRACIN OINT,TOP",
            "overallStart": "201403280915",
            "overallStop": "201403280915",
            "vaStatus": "ACTIVE",
            "vaType": "N"
        });

    });
    describe("", function() {
        it("", function() {
            expect().toBe();
        });
    });
});