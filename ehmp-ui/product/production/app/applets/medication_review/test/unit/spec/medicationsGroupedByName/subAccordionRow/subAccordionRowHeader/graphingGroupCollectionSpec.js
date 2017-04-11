define([
    'jasminejquery',
    'backbone',
    'app/applets/medication_review/medicationsUngrouped/medicationOrderModel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollection',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowSubCollection'
], function(jasminejquery, Backbone, MedicationOrderModel, GraphingGroupCollection, MedNameRowSubCollection) {
    'use strict';
    var graphingGroupCollection, med1, med2, med3, med4, med5, med6, med7, med8, med9, med10, med11, med12;

    beforeEach(function() {

        med1 = new MedicationOrderModel({
            uid: 'uid:med1',
            name: "aspirin",
            vaType: "o",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med2 = new MedicationOrderModel({
            uid: 'uid:med2',
            name: "aspirin",
            vaType: "o",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med3 = new MedicationOrderModel({
            uid: 'uid:med3',
            name: "aspirin",
            vaType: "o",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med4 = new MedicationOrderModel({
            uid: 'uid:med4',
            name: "aspirin",
            vaType: "o",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med5 = new MedicationOrderModel({
            uid: 'uid:med5',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med6 = new MedicationOrderModel({
            uid: 'uid:med6',
            name: "aspirin",
            vaType: "o",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med7 = new MedicationOrderModel({
            uid: 'uid:med7',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med8 = new MedicationOrderModel({
            uid: 'uid:med8',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med9 = new MedicationOrderModel({
            uid: 'uid:med9',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med10 = new MedicationOrderModel({
            uid: 'uid:med10',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med11 = new MedicationOrderModel({
            uid: 'uid:med11',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
        med12 = new MedicationOrderModel({
            uid: 'uid:med12',
            name: "aspirin",
            vaType: "O",
            orders: [{
                fillsRemaining: 1
            }]
        });
    });

    describe("Graphing group collection parse with all meds not graphable", function() {
        it("Will return meds in the given order when all are not graphable", function() {
            // Not graphable
            med1.set("overallStart", "20050306");
            med1.set("overallStop", "20050123");
            med1.set("stopped", "20050305");
            med1.set("vaStatus", "active");

            // Not graphable
            med2.set("overallStart", "20050312");
            med2.set("overallStop", "20050310");
            med2.set("stopped", "20050310");
            med2.set("vaStatus", "expired");

            // Not graphable
            med3.set("overallStart", "20050308");
            med3.set("overallStop", "20050307");
            med3.set("stopped", "20050307");
            med3.set("vaStatus", "discontinued");

            // Not graphable
            med4.set("overallStart", "20050316");
            med4.set("overallStop", "20050306");
            med4.set("stopped", "20050306");
            med4.set("vaStatus", "discontinued");

            var orderCollection = new MedNameRowSubCollection([med3, med1, med4, med2]);
            graphingGroupCollection = new GraphingGroupCollection();
            var parseOutput = graphingGroupCollection.parse(orderCollection);
            var firstCollection = parseOutput[0];

            expect(firstCollection.at(0).get('uid')).toBe('uid:med2');
            expect(firstCollection.at(1).get('uid')).toBe('uid:med3');
            expect(firstCollection.at(2).get('uid')).toBe('uid:med4');
            expect(firstCollection.at(3).get('uid')).toBe('uid:med1');
            expect(firstCollection.badGraphingData).toBe(true);
        });
    });

    describe("Graphing group collection parse with Active outpatient meds", function() {
        it("Will return a graphing group with one model when none of them overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "active");

            med2.set("overallStart", "20150601");
            med2.set("overallStop", "20150701");
            med2.set("stopped", "20150725");
            med2.set("vaStatus", "active");

            med3.set("overallStart", "20150401");
            med3.set("overallStop", "20150501");
            med3.set("stopped", "20150430");
            med3.set("vaStatus", "active");

            var orderCollection = new MedNameRowSubCollection([med2, med3, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(1);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med3);
            expect(graphingGroupCollection.at(0).get("medications").at(2)).toBe(med1);
        });

        it("Will return a graphing group with two models when two out of three overlap", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110227");
            med1.set("vaStatus", "active");

            med2.set("overallStart", "20101010");
            med2.set("overallStop", "20110402");
            med2.set("stopped", "20110215");
            med2.set("vaStatus", "active");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "active");

            var orderCollection = new MedNameRowSubCollection([med3, med1, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med2);
        });

        it("Will return a graphing group with three models when three out of three overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "active");

            med2.set("overallStart", "20150228");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "active");

            med3.set("overallStart", "20150201");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "active");

            var orderCollection = new MedNameRowSubCollection([med3, med2, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med1);
        });
    });

    describe("Graphing group collection parse with Pending outpatient meds", function() {
        it("Will return a graphing group with three models when zero out of three overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "pending");

            med2.set("overallStart", "20150401");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "pending");

            med3.set("overallStart", "20150601");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med2, med1, med3]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get("uid")).toBe("uid:med3");
            expect(graphingGroupCollection.at(1).get("medications").at(0).get("uid")).toBe("uid:med2");
            expect(graphingGroupCollection.at(2).get("medications").at(0).get("uid")).toBe("uid:med1");
        });

        it("Will return a graphing group with three models when two out of three overlap", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110227");
            med1.set("vaStatus", "pending");

            med2.set("overallStart", "20101010");
            med2.set("overallStop", "20110402");
            med2.set("stopped", "20110215");
            med2.set("vaStatus", "pending");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med3, med1, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get("uid")).toBe("uid:med3");
            expect(graphingGroupCollection.at(1).get("medications").at(0).get("uid")).toBe("uid:med2");
            expect(graphingGroupCollection.at(2).get("medications").at(0).get("uid")).toBe("uid:med1");
        });

        it("Will return a graphing group with three models when three out of three overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "pending");

            med2.set("overallStart", "20150301");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "pending");

            med3.set("overallStart", "20150201");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med1, med3, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get("uid")).toBe("uid:med2");
            expect(graphingGroupCollection.at(1).get("medications").at(0).get("uid")).toBe("uid:med3");
            expect(graphingGroupCollection.at(2).get("medications").at(0).get("uid")).toBe("uid:med1");
        });
    });

    describe("Graphing group collection parse with active Non-Va meds", function() {
        it("Will return a graphing group with three models when zero out of three overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150401");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150601");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "active");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med2, med3, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med3);
        });

        it("Will return a graphing group with three models when all are non-VA active and two overlap", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110227");
            med1.set("vaStatus", "Active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20101010");
            med2.set("overallStop", "20110402");
            med2.set("stopped", "20110215");
            med2.set("vaStatus", "active");
            med2.set("vaType", "N");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "Active");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med3, med1, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med3);
        });

        it("Will return a graphing group with three models when three out of three overlap", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "Active");
            med1.set("vaType", "N");

            med2.set("overallStart", "20150301");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "Active");
            med2.set("vaType", "N");

            med3.set("overallStart", "20150201");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "Active");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med3, med2, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med2);
        });
    });

    describe("Graphing group collection parse with active AND discontinued Non-Va meds", function() {
        it("Will return a graphing group with two models when zero out of three overlap AND first and last are active with middle med discontinued", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150401");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "discontinued");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150601");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "active");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med3, med1, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(1).get("medications").at(1).get('uid')).toBe('uid:med2');
        });

        it("Will return a graphing group with two models when two out of three overlap AND first med is active, second and last discontinued", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110227");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20101010");
            med2.set("overallStop", "20110402");
            med2.set("stopped", "20110215");
            med2.set("vaStatus", "discontinued");
            med2.set("vaType", "n");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "discontinued");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med1, med3, med2]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(1)).toBe(med2);
        });

        it("Will return a graphing group with one model when zero out of three overlap AND all discontinued - with one not graphable", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110218");
            med1.set("vaStatus", "discontinued");
            med1.set("vaType", "n");

            // Not graphable because earlier of two stop dates is before start date
            med2.set("overallStart", "20121010");
            med2.set("overallStop", "20120402");
            med2.set("stopped", "20120215");
            med2.set("vaStatus", "discontinued");
            med2.set("vaType", "n");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "discontinued");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med3, med2, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(med2.getCanBeGraphed()).toBe(false);

            expect(graphingGroupCollection.length).toBe(1);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(0).get("medications").at(2)).toBe(undefined);
        });

        it("Will return a graphing group with one model when zero out of three overlap AND all discontinued", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110218");
            med1.set("vaStatus", "discontinued");
            med1.set("vaType", "n");

            med2.set("overallStart", "20120410");
            med2.set("overallStop", "20121002");
            med2.set("stopped", "20121015");
            med2.set("vaStatus", "discontinued");
            med2.set("vaType", "n");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20141212");
            med3.set("vaStatus", "discontinued");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med3, med2, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(1);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(2)).toBe(med1);
        });

        it("Will return a graphing group with three models when three non-va meds overlap AND last med is discontinued", function() {
            med1.set("overallStart", "20150102");
            med1.set("overallStop", "20150303");
            med1.set("stopped", "20150301");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150301");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150201");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "discontinued");
            med3.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med2, med1, med3]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med3);
        });
    });

    describe("Graphing group collection parse with active, discontinued, expired", function() {

        it("Will return a graphing group with four models and a non-graphable med removed", function() {

            med1.set("overallStart", "20120410");
            med1.set("overallStop", "20121002");
            med1.set("stopped", "20130215");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20151212");
            med2.set("overallStop", "20151224");
            med2.set("stopped", "20151215");
            med2.set("vaStatus", "pending");
            med2.set("vaType", "o");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20151212");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            med4.set("overallStart", "20150524");
            med4.set("overallStop", "20150904");
            med4.set("stopped", "20150901");
            med4.set("vaStatus", "active");
            med4.set("vaType", "o");

            med5.set("overallStart", "20090813");
            med5.set("overallStop", "20110227");
            med5.set("stopped", "20110218");
            med5.set("vaStatus", "discontinued");
            med5.set("vaType", "n");

            med7.set("overallStart", "20000816");
            med7.set("overallStop", "20010302");
            med7.set("stopped", "20010302");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            // Not graphable because discontinued with earlier stop before start
            med6.set("overallStart", "20070713");
            med6.set("overallStop", "20070915");
            med6.set("stopped", "20070523");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med7, med6]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(4);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(3);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med5');
            expect(graphingGroupCollection.at(0).get("medications").at(2).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(3).get("medications").at(0).get('uid')).toBe('uid:med2');
        });

        it("Will return a graphing group with four models when an expired med has stopped before overallStart", function() {

            med1.set("overallStart", "20120410");
            med1.set("overallStop", "20121002");
            med1.set("stopped", "20130215");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20151212");
            med2.set("overallStop", "20151224");
            med2.set("stopped", "20151215");
            med2.set("vaStatus", "pending");
            med2.set("vaType", "o");

            med3.set("overallStart", "20140424");
            med3.set("overallStop", "20151104");
            med3.set("stopped", "20151212");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            med4.set("overallStart", "20150524");
            med4.set("overallStop", "20150904");
            med4.set("stopped", "20150901");
            med4.set("vaStatus", "active");
            med4.set("vaType", "o");

            med5.set("overallStart", "20090813");
            med5.set("overallStop", "20110227");
            med5.set("stopped", "20110218");
            med5.set("vaStatus", "discontinued");
            med5.set("vaType", "n");

            // Graphable because expired does not need stopped to be valid
            med6.set("overallStart", "20070713");
            med6.set("overallStop", "20070915");
            med6.set("stopped", "20070523");
            med6.set("vaStatus", "expired");
            med6.set("vaType", "o");

            med7.set("overallStart", "20000816");
            med7.set("overallStop", "20010302");
            med7.set("stopped", "20010302");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6, med7]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(4);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med5');
            expect(graphingGroupCollection.at(0).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(0).get("medications").at(3).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(3).get("medications").at(0).get('uid')).toBe('uid:med2');
        });

        it("Will return a graphing group with three models when an earlier expired med gets grouped with a non-VA active med", function() {

            med1.set("overallStart", "20151029");
            med1.set("overallStop", "20160115");
            med1.set("stopped", "20160115");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            med2.set("overallStart", "20150503");
            med2.set("overallStop", "20151029");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150427");
            med3.set("overallStop", "20150504");
            med3.set("stopped", "20150506");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            //overlaps with med3
            med4.set("overallStart", "20150217");
            med4.set("overallStop", "20150429");
            med4.set("stopped", "20150428");
            med4.set("vaStatus", "expired");
            med4.set("vaType", "o");

            //overlaps with med4 (3/29 is after 2/17)
            med5.set("overallStart", "20150115");
            med5.set("overallStop", "20150329");
            med5.set("stopped", "20150430");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            //start and stop dates are the same
            med6.set("overallStart", "20150101");
            med6.set("overallStop", "20150101");
            med6.set("stopped", "20150101");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            //ends same date med6 start
            med7.set("overallStart", "20141202");
            med7.set("overallStop", "20141231");
            med7.set("stopped", "20150101");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med2, med3, med4, med5, med7, med6, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(2);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med2');
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(1).get("medications").at(1).get('uid')).toBe('uid:med5');
            expect(graphingGroupCollection.at(1).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(1).get("medications").at(3).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med1');
        });

        it("Will return a graphing group with four models when an earlier expired med gets grouped with a non-VA active med, pending placed before an expired med", function() {

            med1.set("overallStart", "20151029");
            med1.set("overallStop", "20160115");
            med1.set("stopped", "20160115");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            //overlaps with med1, med3, med4, med5
            med8.set("overallStart", "20150217");
            med8.set("overallStop", "20160102");
            med8.set("stopped", "20160102");
            med8.set("vaStatus", "expired");
            med8.set("vaType", "o");

            med2.set("overallStart", "20150503");
            med2.set("overallStop", "20151029");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150427");
            med3.set("overallStop", "20150504");
            med3.set("stopped", "20150506");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            //overlaps with med3
            med4.set("overallStart", "20150217");
            med4.set("overallStop", "20150429");
            med4.set("stopped", "20150428");
            med4.set("vaStatus", "expired");
            med4.set("vaType", "o");

            //overlaps with med3 and med4
            med5.set("overallStart", "20150115");
            med5.set("overallStop", "20150329");
            med5.set("stopped", "20150430");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            //start and stop dates are the same
            med6.set("overallStart", "20150101");
            med6.set("overallStop", "20150101");
            med6.set("stopped", "20150101");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            //ends same date med6 start
            med7.set("overallStart", "20141202");
            med7.set("overallStop", "20141231");
            med7.set("stopped", "20150101");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med8, med2, med3, med4, med5, med7, med6, med1], {
                comparator: function(med) {
                    return -1 * med.getEarlierStopAsMoment().valueOf();
                }
            });
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(4);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(2);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med4);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(1)).toBe(med5);
            expect(graphingGroupCollection.at(1).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(1).get("medications").at(3).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(3).get("medications").at(0)).toBe(med8);
        });

        it("Will return a graphing group with four models when an earlier expired med gets grouped with a non-VA active med, pending placed before a discontinued med", function() {

            med1.set("overallStart", "20151029");
            med1.set("overallStop", "20160115");
            med1.set("stopped", "20160115");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            //overlaps with med1, med3, med4, med5
            med8.set("overallStart", "20150217");
            med8.set("overallStop", "20160102");
            med8.set("stopped", "20160102");
            med8.set("vaStatus", "discontinued");
            med8.set("vaType", "o");

            med2.set("overallStart", "20150503");
            med2.set("overallStop", "20151029");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150427");
            med3.set("overallStop", "20150504");
            med3.set("stopped", "20150506");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            //overlaps with med3
            med4.set("overallStart", "20150217");
            med4.set("overallStop", "20150429");
            med4.set("stopped", "20150428");
            med4.set("vaStatus", "expired");
            med4.set("vaType", "o");

            //overlaps with med3 and med4
            med5.set("overallStart", "20150115");
            med5.set("overallStop", "20150329");
            med5.set("stopped", "20150430");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            //start and stop dates are the same
            med6.set("overallStart", "20150101");
            med6.set("overallStop", "20150101");
            med6.set("stopped", "20150101");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            //ends same date med6 start
            med7.set("overallStart", "20141202");
            med7.set("overallStop", "20141231");
            med7.set("stopped", "20150101");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med8, med2, med3, med4, med5, med7, med6, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(4);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(2);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med4);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(1)).toBe(med5);
            expect(graphingGroupCollection.at(1).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(1).get("medications").at(3).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(3).get("medications").at(0)).toBe(med8);
        });


        it("Will return a graphing group with four models when an earlier expired med gets grouped with a non-VA active med, pending placed before an expired and discontinued med", function() {

            med1.set("overallStart", "20151029");
            med1.set("overallStop", "20160115");
            med1.set("stopped", "20160115");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            //overlaps with med1, med3, med4, med5, med8
            med9.set("overallStart", "20150217");
            med9.set("overallStop", "20160110");
            med9.set("stopped", "20160108");
            med9.set("vaStatus", "discontinued");
            med9.set("vaType", "o");

            //overlaps with med1, med3, med4, med5
            med8.set("overallStart", "20150217");
            med8.set("overallStop", "20160102");
            med8.set("stopped", "20160102");
            med8.set("vaStatus", "expired");
            med8.set("vaType", "o");

            med2.set("overallStart", "20150503");
            med2.set("overallStop", "20151029");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150427");
            med3.set("overallStop", "20150504");
            med3.set("stopped", "20150506");
            med3.set("vaStatus", "active");
            med3.set("vaType", "o");

            //overlaps with med3
            med4.set("overallStart", "20150217");
            med4.set("overallStop", "20150429");
            med4.set("stopped", "20150428");
            med4.set("vaStatus", "expired");
            med4.set("vaType", "o");

            //overlaps with med3 and med4
            med5.set("overallStart", "20150115");
            med5.set("overallStop", "20150329");
            med5.set("stopped", "20150430");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            //start and stop dates are the same
            med6.set("overallStart", "20150101");
            med6.set("overallStop", "20150101");
            med6.set("stopped", "20150101");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            //ends same date med6 start
            med7.set("overallStart", "20141202");
            med7.set("overallStop", "20141231");
            med7.set("stopped", "20150101");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med9, med8, med2, med3, med4, med5, med7, med6, med1], {
                comparator: function(med) {
                    return -1 * med.getEarlierStopAsMoment().valueOf();
                }
            });
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(5);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(2);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(4).get("medications").length).toBe(1);

            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med4);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(1)).toBe(med5);
            expect(graphingGroupCollection.at(1).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(1).get("medications").at(3).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(2).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(3).get("medications").at(0)).toBe(med8);
            expect(graphingGroupCollection.at(4).get("medications").at(0)).toBe(med9);
        });

        it("Will return a graphing group with three models when active med is newest, pending in middle and discontinued last", function() {
            med1.set("overallStart", "20150225");
            med1.set("overallStop", "20151231");
            med1.set("stopped", "20151230");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            med2.set("overallStart", "20150430");
            med2.set("overallStop", "20150830");
            med2.set("stopped", "20150829");
            med2.set("vaStatus", "active");
            med2.set("vaType", "o");

            med3.set("overallStart", "20141102");
            med3.set("overallStop", "20150228");
            med3.set("stopped", "20150228");
            med3.set("vaStatus", "expired");
            med3.set("vaType", "o");

            med4.set("overallStart", "20140705");
            med4.set("overallStop", "20150630");
            med4.set("stopped", "20150615");
            med4.set("vaStatus", "discontinued");
            med4.set("vaType", "o");

            med5.set("overallStart", "20130625");
            med5.set("overallStop", "20140530");
            med5.set("stopped", "20140531");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            med6.set("overallStart", "20140510");
            med6.set("overallStop", "20141102");
            med6.set("stopped", "20141101");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            med7.set("overallStart", "20131028");
            med7.set("overallStop", "20140407");
            med7.set("stopped", "20140402");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            med8.set("overallStart", "20130510");
            med8.set("overallStop", "20130901");
            med8.set("stopped", "20130531");
            med8.set("vaStatus", "discontinued");
            med8.set("vaType", "o");

            med9.set("overallStart", "20130107");
            med9.set("overallStop", "20130512");
            med9.set("stopped", "20130509");
            med9.set("vaStatus", "discontinued");
            med9.set("vaType", "n");

            var orderCollection = new MedNameRowSubCollection([med2, med3, med6, med7, med8, med4, med5, med9, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(3);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(4);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(4);

            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med2');
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(0).get("medications").at(2).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(0).get("medications").at(3).get('uid')).toBe('uid:med7');

            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med1');

            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(2).get("medications").at(1).get('uid')).toBe('uid:med5');
            expect(graphingGroupCollection.at(2).get("medications").at(2).get('uid')).toBe('uid:med8');
            expect(graphingGroupCollection.at(2).get("medications").at(3).get('uid')).toBe('uid:med9');
        });

        it("Will return a graphing group with seven models when three overlap, and three pending", function() {

            med1.set("overallStart", "20151212");
            med1.set("overallStop", "20151224");
            med1.set("stopped", "20151220");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            med2.set("overallStart", "20151215");
            med2.set("overallStop", "20151226");
            med2.set("stopped", "20151228");
            med2.set("vaStatus", "pending");
            med2.set("vaType", "o");

            med3.set("overallStart", "20151230");
            med3.set("overallStop", "20151231");
            med3.set("stopped", "20151231");
            med3.set("vaStatus", "pending");
            med3.set("vaType", "o");

            med4.set("overallStart", "20110226");
            med4.set("overallStop", "20110302");
            med4.set("stopped", "20110304");
            med4.set("vaStatus", "active");
            med4.set("vaType", "o");

            med5.set("overallStart", "20090813");
            med5.set("overallStop", "20110227");
            med5.set("stopped", "20110218");
            med5.set("vaStatus", "active");
            med5.set("vaType", "o");

            med6.set("overallStart", "20090816");
            med6.set("overallStop", "20101010");
            med6.set("stopped", "20101010");
            med6.set("vaStatus", "active");
            med6.set("vaType", "o");

            med7.set("overallStart", "20140316");
            med7.set("overallStop", "20140802");
            med7.set("stopped", "20140802");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            med8.set("overallStart", "20140310");
            med8.set("overallStop", "20140315");
            med8.set("stopped", "20140317");
            med8.set("vaStatus", "expired");
            med8.set("vaType", "o");

            med9.set("overallStart", "20140205");
            med9.set("overallStop", "20140228");
            med9.set("stopped", "20140227");
            med9.set("vaStatus", "expired");
            med9.set("vaType", "o");

            med10.set("overallStart", "20151027");
            med10.set("overallStop", "20160112");
            med10.set("stopped", "20151225");
            med10.set("vaStatus", "discontinued");
            med10.set("vaType", "o");

            med11.set("overallStart", "20150830");
            med11.set("overallStop", "20151030");
            med11.set("stopped", "20151030");
            med11.set("vaStatus", "discontinued");
            med11.set("vaType", "o");

            med12.set("overallStart", "20140828");
            med12.set("overallStop", "20140926");
            med12.set("stopped", "20140916");
            med12.set("vaStatus", "discontinued");
            med12.set("vaType", "o");

            var orderCollection = new MedNameRowSubCollection([med10, med11, med12, med7, med8, med9, med4, med5, med6, med3, med2, med1]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(5);
            expect(graphingGroupCollection.at(0).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(1).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(2).get("medications").length).toBe(1);
            expect(graphingGroupCollection.at(3).get("medications").length).toBe(2);
            expect(graphingGroupCollection.at(4).get("medications").length).toBe(7);

            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med2');
            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(3).get("medications").at(0).get('uid')).toBe('uid:med10');
            expect(graphingGroupCollection.at(3).get("medications").at(1).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(4).get("medications").at(0).get('uid')).toBe('uid:med11');
            expect(graphingGroupCollection.at(4).get("medications").at(1).get('uid')).toBe('uid:med12');
            expect(graphingGroupCollection.at(4).get("medications").at(2).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(4).get("medications").at(3).get('uid')).toBe('uid:med8');
            expect(graphingGroupCollection.at(4).get("medications").at(4).get('uid')).toBe('uid:med9');
            expect(graphingGroupCollection.at(4).get("medications").at(5).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(4).get("medications").at(6).get('uid')).toBe('uid:med5');
        });
    });

    describe("Graphing group collection parse meds with bad dates", function() {
        it("Will return a graphing group with two models where pending and active are on their own rows and 3 are not graphable", function() {
            med1.set("overallStart", "20130503");
            med1.set("overallStop", "20130204");
            med1.set("stopped", "20130204");
            med1.set("vaStatus", "pending");

            med2.set("overallStart", "20130726");
            med2.set("overallStop", "20130202");
            med2.set("stopped", "20130626");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20050306");
            med3.set("overallStop", "20050123");
            med3.set("stopped", "20050306");
            med3.set("vaStatus", "active");

            // Not graphable
            med4.set("overallStart", "20050312");
            med4.set("overallStop", "20050310");
            med4.set("stopped", "20050310");
            med4.set("vaStatus", "expired");

            // Not graphable
            med5.set("overallStart", "20050308");
            med5.set("overallStop", "20050307");
            med5.set("stopped", "20050307");
            med5.set("vaStatus", "discontinued");

            // Not graphable
            med6.set("overallStart", "20050316");
            med6.set("overallStop", "20050306");
            med6.set("stopped", "20050306");
            med6.set("vaStatus", "discontinued");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(0).get("medications").at(2)).toBe(undefined);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med1);
            expect(graphingGroupCollection.at(1).get("medications").at(1)).toBe(undefined);
        });

        it("Will return a graphing group with three model with an active med with good dates, pending, and the rest bad dates with different vaStatus", function() {
            //pending
            med1.set("overallStart", "20130503");
            med1.set("overallStop", "20130204");
            med1.set("stopped", "20130204");
            med1.set("vaStatus", "pending");

            med2.set("overallStart", "20130726");
            med2.set("overallStop", "20130202");
            med2.set("stopped", "20130626");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            //good date
            med3.set("overallStart", "20050123");
            med3.set("overallStop", "20050306");
            med3.set("stopped", "20050306");
            med3.set("vaStatus", "active");

            // Not graphable
            med4.set("overallStart", "20050312");
            med4.set("overallStop", "20050310");
            med4.set("stopped", "20050310");
            med4.set("vaStatus", "expired");

            // Not graphable
            med5.set("overallStart", "20050308");
            med5.set("overallStop", "20050307");
            med5.set("stopped", "20050307");
            med5.set("vaStatus", "discontinued");

            // Not graphable
            med6.set("overallStart", "20050316");
            med6.set("overallStop", "20050306");
            med6.set("stopped", "20050306");
            med6.set("vaStatus", "discontinued");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0)).toBe(med2);
            expect(graphingGroupCollection.at(0).get("medications").at(1)).toBe(med3);
            expect(graphingGroupCollection.at(1).get("medications").at(0)).toBe(med1);
        });

        it("Will return a graphing group with two models with one pending, one expired good date, and two bad dates", function() {
            //pending
            med1.set("overallStart", "20150503");
            med1.set("overallStop", "20150204");
            med1.set("stopped", "20150204");
            med1.set("vaStatus", "pending");

            //Not graphable
            med2.set("overallStart", "20130726");
            med2.set("overallStop", "20130202");
            med2.set("stopped", "20130202");
            med2.set("vaStatus", "active");

            //good date
            med3.set("overallStart", "20110226");
            med3.set("overallStop", "20110302");
            med3.set("stopped", "20110304");
            med3.set("vaStatus", "expired");

            //Not graphable
            med4.set("overallStart", "20050123");
            med4.set("overallStop", "20040306");
            med4.set("stopped", "20040306");
            med4.set("vaStatus", "discontinued");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(2);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med3');
        });
    });

    describe("Graphing group collection parse meds with missing dates", function() {
        it("Will return a graphing group with one model when all meds are missing dates", function() {
            // Not graphable
            med1.set("overallStart", "");
            med1.set("overallStop", "20150418");
            med1.set("stopped", "");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            // Not graphable
            med2.set("overallStart", "20150418");
            med2.set("overallStop", "");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");

            // Not graphable
            med3.set("overallStart", "20150418");
            med3.set("overallStop", "");
            med3.set("stopped", "20150514");
            med3.set("vaStatus", "expired");

            // Not graphable
            med4.set("overallStart", "");
            med4.set("overallStop", "20150425");
            med4.set("stopped", "20150420");
            med4.set("vaStatus", "discontinued");

            // Not graphable
            med5.set("overallStart", "");
            med5.set("overallStop", "20150510");
            med5.set("stopped", "");
            med5.set("vaStatus", "discontinued");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            // One model with all meds when they are all not graphable
            expect(graphingGroupCollection.length).toBe(1);
            // No need to sort them if we aren't going to graph them, so they come out in the same order they came in
            expect(graphingGroupCollection.at(0).get('medications').at(0).get('uid')).toBe('uid:med3');
            expect(graphingGroupCollection.at(0).get('medications').at(1).get('uid')).toBe('uid:med5');
            expect(graphingGroupCollection.at(0).get('medications').at(2).get('uid')).toBe('uid:med4');
            expect(graphingGroupCollection.at(0).get('medications').at(3).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(0).get('medications').at(4).get('uid')).toBe('uid:med2');
            expect(graphingGroupCollection.at(0).get('medications').badGraphingData).toBe(true);
        });

        it("Will return a graphing group with two models when one med is pending with missing end dates and remaining meds have missing dates", function() {
            // Not graphable
            med1.set("overallStart", "");
            med1.set("overallStop", "20150418");
            med1.set("stopped", "");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            // Not graphable
            med2.set("overallStart", "20150418");
            med2.set("overallStop", "");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");

            // Not graphable
            med3.set("overallStart", "20150418");
            med3.set("overallStop", "");
            med3.set("stopped", "20150514");
            med3.set("vaStatus", "expired");

            // Not graphable
            med4.set("overallStart", "");
            med4.set("overallStop", "20150418");
            med4.set("stopped", "20150420");
            med4.set("vaStatus", "discontinued");

            // Not graphable
            med5.set("overallStart", "");
            med5.set("overallStop", "20150418");
            med5.set("stopped", "");
            med5.set("vaStatus", "discontinued");

            med6.set("overallStart", "20150418");
            med6.set("overallStop", "");
            med6.set("stopped", "");
            med6.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(1);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med6');
        });

        it("Will return a graphing group with two models when one med is pending with missing start and end dates and remaining meds have missing dates", function() {
            med1.set("overallStart", "");
            med1.set("overallStop", "20150418");
            med1.set("stopped", "");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150418");
            med2.set("overallStop", "");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");

            med3.set("overallStart", "20150418");
            med3.set("overallStop", "");
            med3.set("stopped", "20150514");
            med3.set("vaStatus", "expired");

            med4.set("overallStart", "");
            med4.set("overallStop", "20150418");
            med4.set("stopped", "20150420");
            med4.set("vaStatus", "discontinued");

            med5.set("overallStart", "");
            med5.set("overallStop", "20150418");
            med5.set("stopped", "");
            med5.set("vaStatus", "discontinued");

            med6.set("overallStart", "");
            med6.set("overallStop", "");
            med6.set("stopped", "");
            med6.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(1);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med6');
        });

        it("Will return a graphing group with three models when one med an active, Non-Va and pending with missing date, one Non-Va active, and remaining meds have missing dates", function() {

            //non-va active with good dates
            med7.set("overallStart", "20150418");
            med7.set("overallStop", "20150621");
            med7.set("stopped", "20150621");
            med7.set("vaStatus", "active");
            med7.set("vaType", "n");

            //non-va with missing stopped date
            med1.set("overallStart", "20150317");
            med1.set("overallStop", "20150418");
            med1.set("stopped", "");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            //pending with good dates
            med8.set("overallStart", "20150418");
            med8.set("overallStop", "20150704");
            med8.set("stopped", "20150703");
            med8.set("vaStatus", "pending");

            //active with no end dates - not graphable
            med2.set("overallStart", "20150418");
            med2.set("overallStop", "");
            med2.set("stopped", "");
            med2.set("vaStatus", "active");

            //missing overallStop date - not graphable
            med3.set("overallStart", "20150501");
            med3.set("overallStop", "");
            med3.set("stopped", "20150514");
            med3.set("vaStatus", "expired");

            //missing start date - not graphable
            med4.set("overallStart", "");
            med4.set("overallStop", "20150630");
            med4.set("stopped", "20150420");
            med4.set("vaStatus", "discontinued");

            //missing start and end date - not graphable
            med5.set("overallStart", "");
            med5.set("overallStop", "20150713");
            med5.set("stopped", "");
            med5.set("vaStatus", "discontinued");

            //missing end dates
            med6.set("overallStart", "20150918");
            med6.set("overallStop", "");
            med6.set("stopped", "");
            med6.set("vaStatus", "pending");

            var orderCollection = new MedNameRowSubCollection([med1, med2, med3, med4, med5, med6, med7, med8]);
            graphingGroupCollection = new GraphingGroupCollection(orderCollection, {
                parse: true
            });

            expect(graphingGroupCollection.length).toBe(4);
            expect(graphingGroupCollection.at(0).get("medications").at(0).get('uid')).toBe('uid:med1');
            expect(graphingGroupCollection.at(1).get("medications").at(0).get('uid')).toBe('uid:med7');
            expect(graphingGroupCollection.at(2).get("medications").at(0).get('uid')).toBe('uid:med6');
            expect(graphingGroupCollection.at(3).get("medications").at(0).get('uid')).toBe('uid:med8');
        });
    });
});