define([
    'jasminejquery',
    'moment',
    'app/applets/activeMeds/appletHelper'
], function(jasminejquery, moment, appletHelper) {
    'use strict';
    var medication;

    beforeEach(function() {
        medication = {
            "IMO": false,
            "codes": [
                {
                    "code": "197943",
                    "display": "Methocarbamol 500 MG Oral Tablet",
                    "system": "urn:oid:2.16.840.1.113883.6.88"
                }
            ],
            "dosages": [
                {
                    "amount": "1",
                    "dose": "500",
                    "instructions": "500MG",
                    "noun": "TABLET",
                    "relativeStart": 0,
                    "relativeStop": 527040,
                    "routeName": "PO",
                    "scheduleName": 1,
                    "start": "20140604",
                    "stop": "20150605",
                    "summary": "MedicationDose{uid=''}",
                    "units": "MG"
                }
            ],
            "facilityCode": "442",
            "facilityName": "CHEYENNE VAMC",
            "fills": [
                {
                    "daysSupplyDispensed": 30,
                    "dispenseDate": "20140604",
                    "quantityDispensed": "1",
                    "releaseDate": "",
                    "routing": "W",
                    "summary": "MedicationFill{uid=''}"
                }
            ],
            "kind": "Medication, Outpatient",
            "lastFilled": "20140604",
            "localId": "2210634;O",
            "medOrderSettingType": "outpatient",
            "medStatus": "urn:sct:55561003",
            "medStatusName": "active",
            "medType": "urn:sct:73639000",
            "name": "METHOCARBAMOL TAB",
            "orders": [
                {
                    "daysSupply": 30,
                    "fillCost": "0.026",
                    "fillsAllowed": 11,
                    "fillsRemaining": 11,
                    "locationName": "ZZCHY PC MAYS",
                    "locationUid": "urn:va:location:9016:1286",
                    "orderUid": "urn:va:order:9016:9106:5587940",
                    "ordered": "201406041142",
                    "pharmacistName": "BODDULURI,PADMA",
                    "pharmacistUid": "urn:va:user:9016:520736421",
                    "prescriptionId": 2298006,
                    "providerName": "BODDULURI,PADMA",
                    "providerUid": "urn:va:user:9016:520736421",
                    "quantityOrdered": "1",
                    "summary": "MedicationOrder{uid=''}",
                    "vaRouting": "W"
                }
            ],
            "overallStart": "20140604",
            "overallStop": "20150605",
            "patientInstruction": "",
            "pid": "HDR;10110V004877",
            "productFormName": "TAB",
            "products": [
                {
                    "drugClassCode": "urn:vadc:MS200",
                    "drugClassName": "SKELETAL MUSCLE RELAXANTS",
                    "ingredientCode": "urn:va:vuid:4017879",
                    "ingredientCodeName": "METHOCARBAMOL",
                    "ingredientName": "METHOCARBAMOL TAB",
                    "ingredientRXNCode": "urn:rxnorm:6845",
                    "ingredientRole": "urn:sct:410942007",
                    "strength": "500 MG",
                    "summary": "MedicationProduct{uid=''}",
                    "suppliedCode": "urn:va:vuid:4002631",
                    "suppliedName": "METHOCARBAMOL 500MG TAB"
                }
            ],
            "qualifiedName": "METHOCARBAMOL TAB",
            "rxncodes": [
                "urn:vandf:4017879",
                "urn:ndfrt:N0000010582",
                "urn:ndfrt:N0000000001",
                "urn:ndfrt:N0000010595",
                "urn:rxnorm:6845",
                "urn:ndfrt:N0000007365"
            ],
            "sig": "TAKE ONE TABLET BY MOUTH 1",
            "stampTime": "20160426111941",
            "stopped": "20150605",
            "summary": "METHOCARBAMOL 500MG TAB (ACTIVE)\n TAKE ONE TABLET BY MOUTH 1",
            "supply": false,
            "type": "Prescription",
            "uid": "urn:va:med:9016:9106:5587940",
            "units": "MG",
            "vaStatus": "ACTIVE",
            "vaType": "O",
            "calculatedStatus": "Expired",
            "lastAction": "20150605000000000",
            "expirationDate": "20150605000000000",
            "recent": false,
            "normalizedName": "Methocarbamol 500 MG Oral Tablet"
        };
    });

    describe("Fillable test suite - active medications", function() {
        it("Confirm 'Not Refillable' when expiration date is in the past and medication status is 'Active'", function() {
            medication.fillableStatus = 'Fillable for';
            medication.expirationDate = '20150605';

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Not Refillable");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication is active but expiration date has passed.');
        });
        it("Confirm 'Fillable for' when expiration date is in the future and medication status is 'Active'", function() {
            medication.fillableStatus = 'Fillable for';
            medication.fillsRemaining = medication.orders[0].fillsRemaining;
            medication.expirationDate = moment().add(3, 'days').add(12, 'hours');

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Fillable for");
            expect(result.date).toBe('3d');
            expect(result.description).toBe('This medication is Active and fillable for 3d. ');
        });
        it("Confirm fillable for when medication status is active and expires before supply on hand runs out", function () {
            medication.fillableStatus = 'Fillable for';
            medication.fillsRemaining = medication.orders[0].fillsRemaining;
            medication.lastFilled = moment();
            medication.expirationDate = moment().add(5, 'months');

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Fillable for");
            expect(result.date).toBe('5m');
            expect(result.description).toBe('This medication is Active and fillable for 5m. ');
        });
        it("Confirm 'Fillable for' when medication status is 'Active' and supply on hand runs out before expired", function() {
            medication.fillableStatus = 'Fillable for';
            medication.fillsRemaining = medication.orders[0].fillsRemaining;
            medication.lastFilled = moment();
            medication.expirationDate = moment().add(3, 'years');

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Fillable for");
            expect(result.date).toBe('10m');
            expect(result.description).toBe('This medication is Active and fillable for 10m. ');
        });
        it("Confirm '0 Refills' when fillsRemaining = 0 and medication status is 'Active'", function() {
            medication.orders[0].fillsRemaining = 0;
            medication.fillableStatus = '0 Refills';

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("0 Refills");
            expect(result.date).toBe(undefined);
            expect(result.label).toBe("label label-danger");
            expect(result.description).toBe("This medication is active with no refills remaining. ");
        });
        it("Confirm 'Expired' when fillsRemaining = 0 and medication status is 'Expired'", function() {
            medication.orders[0].fillsRemaining = 0;
            medication.vaStatus = 'Expired';
            medication.standardizedVaStatus = appletHelper.getStandardizedVaStatus(medication);
            medication.stopped = moment().subtract(3, 'years');
            medication.overallStop = moment().subtract(3, 'years');
            medication.fillableStatus = appletHelper.getFillableStatus(medication);

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Expired");
            expect(result.date).toBe('3y');
            expect(result.label).toBe('label label-danger');
            expect(result.description).toBe('This medication was expired 3 Years ago. ');
        });
        it("Confirm 'Expired ??' when expiration date is in the future and medication status is 'Expired'", function() {
            medication.vaStatus = 'Expired';
            medication.standardizedVaStatus = appletHelper.getStandardizedVaStatus(medication);
            medication.stopped = moment().add(3, 'years');
            medication.overallStop = moment().add(3, 'years');
            medication.fillableStatus = appletHelper.getFillableStatus(medication);

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Expired");
            expect(result.date).toBe('??');
            expect(result.label).toBe('label label-danger');
            expect(result.description).toBe('This medication is listed as expired but expiration date has not yet passed.');
        });
        it("Confirm 'Discontinued ??' when discontinue date is in the future and medication status is 'Discontinued'", function() {
            medication.vaStatus = 'Discontinued';
            medication.standardizedVaStatus = appletHelper.getStandardizedVaStatus(medication);
            medication.stopped = moment().add(3, 'years');
            medication.overallStop = moment().add(3, 'years');
            medication.fillableStatus = appletHelper.getFillableStatus(medication);

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Discontinued");
            expect(result.date).toBe('??');
            expect(result.label).toBe('label label-default');
            expect(result.description).toBe('This medication is listed as discontinued but discontinue date has not yet passed.');
        });
        it("Confirm 'Expired' when expiration date is in the past and medication status is 'Expired'", function() {
            medication.vaStatus = 'Expired';
            medication.standardizedVaStatus = appletHelper.getStandardizedVaStatus(medication);
            medication.stopped = moment().subtract(3, 'years');
            medication.overallStop = moment().subtract(3, 'years');
            medication.fillableStatus = appletHelper.getFillableStatus(medication);

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe("Expired");
            expect(result.date).toBe('3y');
            expect(result.label).toBe('label label-danger');
            expect(result.description).toBe('This medication was expired 3 Years ago. ');
        });
        it("Confirm 'No Data' when medication is missing data to determine fillable status (lastFilled, fillsRemaining, fills)", function() {
            medication.vaStatus = 'Active';
            medication.standardizedVaStatus = appletHelper.getStandardizedVaStatus(medication);
            medication.lastFilled = "";
            medication.orders[0].fillsRemaining = "";
            medication.fills = [];

            medication.fillableStatus = appletHelper.getFillableStatus(medication);

            var result = appletHelper.getFillableData(medication);
            expect(result.display).toBe('No Data');
            expect(result.label).toBe('label label-danger');
            expect(result.description).toBe('This medication was not filled or missing data to determine its status.');
        });
    });
});