define([
    'jquery',
    'jasminejquery',
    'moment',
    'underscore',
    'app/resources/fetch/activeMeds/model',
    'app/applets/activeMeds/staticText'
], function ($, jasminejquery, moment, _, Model, Meds) {
    'use strict';

    describe("Fillable test suite - active medications", function () {
        var medication;
        var model;
        var adkUtilTime;
        var isMockingTime = false;
        var timeStub;


        beforeEach(function () {
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

            timeStub = _.get(self, 'ADK.utils.getTimeSince');
            _.set(self, 'ADK.utils.getTimeSince', function () {
                return adkUtilTime;
            });

            model = null;
        });

        afterEach(function () {
            _.set(self, 'ADK.utils.getTimeSince', timeStub);
        });


        describe("Legacy test for active med", function () {
            it("Confirm 'Refillable' when expiration date is in the future, medication status is 'Active', supply should be exhausted (lastFilled + daysSupply is in the past), but last refill has not been picked up", function () {
                medication.orders[0].fillsRemaining = 1;
                medication.expirationDate = moment().add(1, 'years');

                model = new Model(medication);

                var fillableStatus = 'Fillable for';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Refillable");
                expect(result.label).toBe("label label-warning all-padding-xs align-self-flex-start");
                expect(result.date).toBe(undefined);
                expect(result.description).toBe('This medication is active and expiration date has not passed, but supply should be exhausted and the last refill has not been picked up.');
            });
            it("Confirm 'Not Refillable' when expiration date is in the past and medication status is 'Active'", function () {
                medication.expirationDate = '20150605';

                model = new Model(medication);

                var fillableStatus = 'Fillable for';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Not Refillable");
                expect(result.label).toBe("label label-warning all-padding-xs align-self-flex-start");
                expect(result.date).toBe(undefined);
                expect(result.description).toBe('This medication is active but expiration date has passed.');
            });

            it("Confirm rounded 'Fillable for' when expiration date is in the future and medication status is 'Active'", function() {
                medication.fillableStatus = 'Fillable for';
                medication.fillsRemaining = medication.orders[0].fillsRemaining;
                medication.expirationDate = moment().add(3, 'days').add(13, 'hours');
                model = new Model(medication);

                var result = model.getFillableData(medication.fillableStatus);
                expect(result.display).toBe("Fillable for");
                expect(result.date).toBe('4d');
                expect(result.description).toBe('This medication is Active and fillable for 4d. ');
            });

            it("Confirm 'Fillable for' when expiration date is in the future and medication status is 'Active'", function () {
                medication.fillsRemaining = medication.orders[0].fillsRemaining;
                medication.expirationDate = moment().add(3, 'days').add(11, 'hours');

                model = new Model(medication);

                var fillableStatus = 'Fillable for';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Fillable for");
                expect(result.date).toBe('3d');
                expect(result.description).toBe('This medication is Active and fillable for 3d. ');
            });
            it("Confirm fillable for when medication status is active and expires before supply on hand runs out", function () {
                medication.fillsRemaining = medication.orders[0].fillsRemaining;
                medication.lastFilled = moment();
                medication.expirationDate = moment().add(5, 'months').add(4, 'days');

                model = new Model(medication);

                var fillableStatus = 'Fillable for';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Fillable for");
                expect(result.date).toBe('5m');
                expect(result.description).toBe('This medication is Active and fillable for 5m. ');
            });
            it("Confirm 'Fillable for' when medication status is 'Active' and supply on hand runs out before expired", function () {
                medication.fillsRemaining = medication.orders[0].fillsRemaining;
                medication.lastFilled = moment();
                medication.expirationDate = moment().add(3, 'years');

                model = new Model(medication);

                var fillableStatus = 'Fillable for';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Fillable for");
                expect(result.date).toBe('11m');
                expect(result.description).toBe('This medication is Active and fillable for 11m. ');
            });

            it("Confirm '0 Refills' when fillsRemaining = 0 and medication status is 'Active'", function () {
                medication.orders[0].fillsRemaining = 0;

                model = new Model(medication);

                var fillableStatus = '0 Refills';
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("0 Refills");
                expect(result.date).toBe(undefined);
                expect(result.label).toBe("label label-danger all-padding-xs align-self-flex-start");
                expect(result.description).toBe("This medication is active with no refills remaining. ");
            });
            it("Confirm 'Expired' when fillsRemaining = 0 and medication status is 'Expired'", function () {
                adkUtilTime = {
                    timeSince: '3years',
                    count: 3,
                    timeUnits: 'y',
                    timeSinceDescription: '3 Years'
                };

                medication.orders[0].fillsRemaining = 0;
                medication.vaStatus = 'Expired';
                medication.stopped = moment().subtract(3, 'years');
                medication.overallStop = moment().subtract(3, 'years');

                model = new Model(medication);

                var standardizedVaStatus = model.getStandardizedVaStatus(medication.calculatedStatus, medication.vaStatus);
                var fillableStatus = model.getFillableStatus(standardizedVaStatus, medication.vaType, medication.orders);
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Expired");
                expect(result.date).toBe('3y');
                expect(result.label).toBe('label label-danger all-padding-xs align-self-flex-start');
                expect(result.description).toBe('This medication was expired 3 Years ago. ');
            });
            it("Confirm 'Expired ??' when expiration date is in the future and medication status is 'Expired'", function () {
                adkUtilTime = {
                    count: -3
                };

                medication.vaStatus = 'Expired';
                medication.stopped = moment().add(3, 'years');
                medication.overallStop = moment().add(3, 'years');

                model = new Model(medication);

                var standardizedVaStatus = model.getStandardizedVaStatus(medication.calculatedStatus, medication.vaStatus);
                var fillableStatus = model.getFillableStatus(standardizedVaStatus, medication.vaType, medication.orders);
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Expired");
                expect(result.date).toBe('??');
                expect(result.label).toBe('label label-danger all-padding-xs align-self-flex-start');
                expect(result.description).toBe('This medication is listed as expired but expiration date has not yet passed.');
            });
            it("Confirm 'Discontinued ??' when discontinue date is in the future and medication status is 'Discontinued'", function () {
                adkUtilTime = {
                    count: -3
                };

                medication.calculatedStatus = 'Discontinued';
                medication.stopped = moment().add(3, 'years');
                medication.overallStop = moment().add(3, 'years');

                model = new Model(medication);

                var standardizedVaStatus = model.getStandardizedVaStatus(medication.calculatedStatus, medication.vaStatus);
                var fillableStatus = model.getFillableStatus(standardizedVaStatus, medication.vaType, medication.orders);
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Discontinued");
                expect(result.date).toBe('??');
                expect(result.label).toBe('label label-default all-padding-xs align-self-flex-start');
                expect(result.description).toBe('This medication is listed as discontinued but discontinue date has not yet passed.');
            });
            it("Confirm 'Expired' when expiration date is in the past and medication status is 'Expired'", function () {
                adkUtilTime = {
                    timeSince: '3years',
                    count: 3,
                    timeUnits: 'y',
                    timeSinceDescription: '3 Years'
                };

                medication.vaStatus = 'Expired';
                medication.stopped = moment().subtract(3, 'years');
                medication.overallStop = moment().subtract(3, 'years');

                model = new Model(medication);

                var standardizedVaStatus = model.getStandardizedVaStatus(medication.calculatedStatus, medication.vaStatus);
                var fillableStatus = model.getFillableStatus(standardizedVaStatus, medication.vaType, medication.orders);
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe("Expired");
                expect(result.date).toBe('3y');
                expect(result.label).toBe('label label-danger all-padding-xs align-self-flex-start');
                expect(result.description).toBe('This medication was expired 3 Years ago. ');
            });
            it("Confirm 'No Data' when medication is missing data to determine fillable status (lastFilled, fillsRemaining, fills)", function () {
                medication.calculatedStatus = 'Active';
                medication.lastFilled = "";
                medication.orders[0].fillsRemaining = "";
                medication.fills = [];

                model = new Model(medication);

                var standardizedVaStatus = model.getStandardizedVaStatus(medication.calculatedStatus, medication.vaStatus);
                var fillableStatus = model.getFillableStatus(standardizedVaStatus, medication.vaType, medication.orders);
                var result = model.getFillableData(fillableStatus);

                expect(result.display).toBe('No Data');
                expect(result.label).toBe('label label-danger all-padding-xs align-self-flex-start');
                expect(result.description).toBe('This medication was not filled or missing data to determine its status.');
            });
        });

        describe("activeMeds/model.getFillsRemaining", function () {
            it("returns 'no data' when the vaType is I and V", function () {
                var typeI = _.extend({}, medication);
                var typeV = _.extend({}, medication);

                _.set(typeI, 'vaType', 'I');
                _.set(typeV, 'vaType', 'V');

                var modelI = new Model(typeI);
                var modelV = new Model(typeV);


                expect(modelI.getFillsRemaining()).toBe(Meds.NO_DATA);
                expect(modelV.getFillsRemaining()).toBe(Meds.NO_DATA);
            });
            it("returns the number of fills when calculatedStatus is Pending and has orders", function () {
                var fillsAllowed = 10;

                _.set(medication, 'calculatedStatus', 'Pending');
                _.set(_.get(medication, 'orders')[0], 'fillsAllowed', fillsAllowed);

                model = new Model(medication);

                expect(model.getFillsRemaining()).toBe(fillsAllowed.toString());
            });
            it("returns 'no data' when the status is pending but there are not orders", function () {
                _.set(medication, 'calculatedStatus', 'Pending');
                _.set(medication, 'orders', []);

                model = new Model(medication);

                expect(model.getFillsRemaining()).toBe(Meds.NO_DATA);
            });
            it("returns no data when vaType is N and there are no orders", function () {
                _.set(medication, 'vaType', 'N');
                _.set(medication, 'orders', []);

                model = new Model(medication);

                expect(model.getFillsRemaining()).toBe(Meds.NO_DATA);
            });
            it("returns zero when fills are discontinued/cancelled/expired", function () {
                var discontinued = _.extend({}, medication, {calculatedStatus: 'discontinued'});
                var cancelled = _.extend({}, medication, {calculatedStatus: 'cancelled'});
                var expired = _.extend({}, medication, {calculatedStatus: 'expired'});

                var discontinuedModel = new Model(discontinued);
                var cancelledModel = new Model(cancelled);
                var expiredModel = new Model(expired);

                expect(discontinuedModel.getFillsRemaining()).toBe('0');
                expect(cancelledModel.getFillsRemaining()).toBe('0');
                expect(expiredModel.getFillsRemaining()).toBe('0');
            });
            it("returns fills for all other calculated status", function () {
                var fillsRemaining = 10;

                _.set(medication, 'calculatedStatus', 'other');
                _.set(medication, 'vaType', 'A');
                _.set(_.get(medication, 'orders')[0], 'fillsRemaining', fillsRemaining);

                model = new Model(medication);
                expect(model.getFillsRemaining()).toBe(fillsRemaining.toString());
            });
        });

        describe("activeMeds/model.getStandardizedVaStatus", function () {
            it("returns and empty string when there is no vaStatus or calculatedStatus", function () {
                model = new Model(medication);

                expect(model.getStandardizedVaStatus()).toBe("");
            });
            it("returns uppercase calculatedStatus when not discontinued", function () {
                var status = 'status';

                model = new Model(medication);

                expect(model.getStandardizedVaStatus(status)).toBe(status.toUpperCase());
            });
            it("falls back to vaStatus when calculatedStatus is missing", function () {
                var status = 'status';

                model = new Model(medication);

                expect(model.getStandardizedVaStatus(null, status)).toBe(status.toUpperCase());
            });
            it("shortens a 'DISCONTINUED/EDIT' status", function () {
                model = new Model(medication);

                expect(model.getStandardizedVaStatus('DISCONTINUED/EDIT')).toBe('DISCONTINUED');
            });
        });

        describe("activeMeds/model.getFillableStatus", function () {
            it('capitalizes pending and expired', function () {
                model = new Model(medication);

                expect(model.getFillableStatus("pending")).toBe('Pending');
                expect(model.getFillableStatus("expired")).toBe('Expired');
            });
            it("returns 'Non Va' for vaType 'N'", function () {
                model = new Model(medication);

                expect(model.getFillableStatus("other", 'N')).toBe('Non VA');
            });
            it("returns '0 Refills' when there are not Refills", function () {
                var orders = [{
                    fillsRemaining: 0
                }];

                model = new Model(medication);

                expect(model.getFillableStatus("other", 'I', orders)).toBe('0 Refills');
            });
            it("returns 'No Data' when lastFilled and fillsRemaining are missing", function() {
                _.set(medication, 'lastFilled', null);
                _.set(medication, 'fills', null);

                model = new Model(medication);

                expect(model.getFillableStatus("other", 'I', [])).toBe('No Data');
            });
            it("returns 'Fillable For' for any other scenario", function () {
                model = new Model(medication);

                expect(model.getFillableStatus("other", 'I', [])).toBe('Fillable for');
            });
        });
    });
});