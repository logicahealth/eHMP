define([
    'jasminejquery',
    'backbone',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollection'
], function(jasminejquery, Backbone, GraphingGroupCollection) {
    'use strict';
    var graphingGroupCollection, med1, med2, med3, med4, med5, med6, med7, med8, med9, med10, med11, med12;
    var MedicationOrderModel;

    var setupTest = function() {

        med1 = new MedicationOrderModel({
            uid: 'uid:med1',
            name: "aspirin",
            vaType: "o"
        });
        med2 = new MedicationOrderModel({
            uid: 'uid:med2',
            name: "aspirin",
            vaType: "o"
        });
        med3 = new MedicationOrderModel({
            uid: 'uid:med3',
            name: "aspirin",
            vaType: "o"
        });
        med4 = new MedicationOrderModel({
            uid: 'uid:med4',
            name: "aspirin",
            vaType: "o"
        });
        med5 = new MedicationOrderModel({
            uid: 'uid:med5',
            name: "aspirin",
            vaType: "O"
        });
        med6 = new MedicationOrderModel({
            uid: 'uid:med6',
            name: "aspirin",
            vaType: "o"
        });
        med7 = new MedicationOrderModel({
            uid: 'uid:med7',
            name: "aspirin",
            vaType: "O"
        });
        med8 = new MedicationOrderModel({
            uid: 'uid:med8',
            name: "aspirin",
            vaType: "O"
        });
        med9 = new MedicationOrderModel({
            uid: 'uid:med9',
            name: "aspirin",
            vaType: "O"
        });
        med10 = new MedicationOrderModel({
            uid: 'uid:med10',
            name: "aspirin",
            vaType: "O"
        });
        med11 = new MedicationOrderModel({
            uid: 'uid:med11',
            name: "aspirin",
            vaType: "O"
        });
        med12 = new MedicationOrderModel({
            uid: 'uid:med12',
            name: "aspirin",
            vaType: "O"
        });
    };

    beforeEach(function(done) {
        if (_.isUndefined(MedicationOrderModel)) {
            require([
                'app/resources/fetch/medication_review/medicationOrderModel'
            ], function(model) {
                MedicationOrderModel = model;
                setupTest();
                done();
            });
        } else {
            setupTest();
            done();
        }
    });

    describe("Initial sorting of meds for graphing groups", function() {
        it("Will return 3 active VA meds sorted by earlier stop in descending order", function() {
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

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med2);
            expect(sorted.at(1)).toBe(med3);
            expect(sorted.at(2)).toBe(med1);
        });

        it("Will return 3 pending orders sorted by start date in descending order", function() {
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

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0).get('uid')).toBe('uid:med2');
            expect(sorted.at(1).get('uid')).toBe('uid:med3');
            expect(sorted.at(2).get('uid')).toBe('uid:med1');
        });

        it("Will return 3 non-VA active meds sorted by start date in ascending order", function() {
            med1.set("overallStart", "20150401");
            med1.set("overallStop", "20150501");
            med1.set("stopped", "20150430");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150102");
            med2.set("overallStop", "20150303");
            med2.set("stopped", "20150301");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150601");
            med3.set("overallStop", "20150701");
            med3.set("stopped", "20150725");
            med3.set("vaStatus", "active");
            med3.set("vaType", "n");

            var orderCollection = new Backbone.Collection([med1, med2, med3]); // 3, 1, 2
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med2);
            expect(sorted.at(1)).toBe(med1);
            expect(sorted.at(2)).toBe(med3);
        });

        it("Will return 2 non-VA active orders before a discontinued non-VA order ", function() {
            med1.set("overallStart", "20150601");
            med1.set("overallStop", "20150701");
            med1.set("stopped", "20150725");
            med1.set("vaStatus", "active");
            med1.set("vaType", "n");

            med2.set("overallStart", "20150401");
            med2.set("overallStop", "20150501");
            med2.set("stopped", "20150430");
            med2.set("vaStatus", "discontinued");
            med2.set("vaType", "n");

            med3.set("overallStart", "20150102");
            med3.set("overallStop", "20150303");
            med3.set("stopped", "20150301");
            med3.set("vaStatus", "active");
            med3.set("vaType", "n");

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med3);
            expect(sorted.at(1)).toBe(med1);
            expect(sorted.at(2)).toBe(med2);
        });

        it("Will return one non-VA active med before 2 non-VA discontinued sorted by earlier stop date descending", function() {
            med1.set("overallStart", "20140424");
            med1.set("overallStop", "20151104");
            med1.set("stopped", "20141212");
            med1.set("vaStatus", "discontinued");
            med1.set("vaType", "n");

            med2.set("overallStart", "20090813");
            med2.set("overallStop", "20110227");
            med2.set("stopped", "20110227");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

            med3.set("overallStart", "20101010");
            med3.set("overallStop", "20110402");
            med3.set("stopped", "20110215");
            med3.set("vaStatus", "discontinued");
            med3.set("vaType", "n");

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med2);
            expect(sorted.at(1)).toBe(med1);
            expect(sorted.at(2)).toBe(med3);
        });

        it("Will return 2 non-VA discontinued orders before one that cannot be graphed", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110218");
            med1.set("vaStatus", "discontinued");
            med1.set("vaType", "n");

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

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med3);
            expect(sorted.at(1)).toBe(med1);
            expect(sorted.at(2)).toBe(med2);
        });

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

            med4.set("overallStart", "20000816");
            med4.set("overallStop", "20010302");
            med4.set("stopped", "20010302");
            med4.set("vaStatus", "expired");
            med4.set("vaType", "o");

            med5.set("overallStart", "20090813");
            med5.set("overallStop", "20110227");
            med5.set("stopped", "20110218");
            med5.set("vaStatus", "discontinued");
            med5.set("vaType", "n");

            // Not graphable because discontinued must have both stop dates after the start date
            med6.set("overallStart", "20070713");
            med6.set("overallStop", "20070915");
            med6.set("stopped", "20070523");
            med6.set("vaStatus", "discontinued");
            med6.set("vaType", "o");

            med7.set("overallStart", "20150524");
            med7.set("overallStop", "20150904");
            med7.set("stopped", "20150901");
            med7.set("vaStatus", "active");
            med7.set("vaType", "o");

            var orderCollection = new Backbone.Collection([med1, med2, med3, med4, med5, med6, med7]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med1);
            expect(sorted.at(1)).toBe(med3);
            expect(sorted.at(2)).toBe(med7);
            expect(sorted.at(3)).toBe(med5);
            expect(sorted.at(4)).toBe(med4);
            expect(sorted.at(5)).toBe(med2);
            expect(sorted.at(6)).toBe(med6);
        });

        it("Will return 1 non-VA active - then 5 active, expired, discontinued sorted by earlier stop date - then one pending", function() {

            med1.set("overallStart", "20070713");
            med1.set("overallStop", "20070915");
            med1.set("stopped", "20070523");
            med1.set("vaStatus", "expired");
            med1.set("vaType", "o");

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

            med6.set("overallStart", "20120410");
            med6.set("overallStop", "20121002");
            med6.set("stopped", "20130215");
            med6.set("vaStatus", "active");
            med6.set("vaType", "n");

            med7.set("overallStart", "20000816");
            med7.set("overallStop", "20010302");
            med7.set("stopped", "20010302");
            med7.set("vaStatus", "expired");
            med7.set("vaType", "o");

            var orderCollection = new Backbone.Collection([med1, med2, med3, med4, med5, med6, med7]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med6);
            expect(sorted.at(1)).toBe(med3);
            expect(sorted.at(2)).toBe(med4);
            expect(sorted.at(3)).toBe(med5);
            expect(sorted.at(4)).toBe(med1);
            expect(sorted.at(5)).toBe(med7);
            expect(sorted.at(6)).toBe(med2);
        });

        it("Will return non-VA active at the top, pending at the bottom, and the rest in the middle sorted by earlier stop date descending", function() {
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

            //overlaps with med3 and med4
            med5.set("overallStart", "20150115");
            med5.set("overallStop", "20150329");
            med5.set("stopped", "20150430");
            med5.set("vaStatus", "expired");
            med5.set("vaType", "o");

            //ends same date med6 start
            med6.set("overallStart", "20141202");
            med6.set("overallStop", "20141231");
            med6.set("stopped", "20150101");
            med6.set("vaStatus", "expired");
            med6.set("vaType", "o");

            //start and stop dates are the same
            med7.set("overallStart", "20150101");
            med7.set("overallStop", "20150101");
            med7.set("stopped", "20150101");
            med7.set("vaStatus", "discontinued");
            med7.set("vaType", "o");

            var orderCollection = new Backbone.Collection([med2, med1, med3, med4, med5, med7, med6]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med2);
            expect(sorted.at(1)).toBe(med3);
            expect(sorted.at(2)).toBe(med4);
            expect(sorted.at(3)).toBe(med5);
            expect(sorted.at(4)).toBe(med7);
            expect(sorted.at(5)).toBe(med6);
            expect(sorted.at(6)).toBe(med1);
        });

        it("Will return one non-VA active first, then assorted meds sorted by earlier stop, and 1 pending at the bottom", function() {
            med1.set("overallStart", "20150225");
            med1.set("overallStop", "20151231");
            med1.set("stopped", "20151230");
            med1.set("vaStatus", "pending");
            med1.set("vaType", "o");

            med2.set("overallStart", "20150430");
            med2.set("overallStop", "20150830");
            med2.set("stopped", "20150829");
            med2.set("vaStatus", "discontinued");
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
            med6.set("vaStatus", "active");
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
            med9.set("vaStatus", "active");
            med9.set("vaType", "n");

            var orderCollection = new Backbone.Collection([med1, med2, med3, med4, med5, med6, med7, med8, med9]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med9);
            expect(sorted.at(1)).toBe(med2);
            expect(sorted.at(2)).toBe(med4);
            expect(sorted.at(3)).toBe(med3);
            expect(sorted.at(4)).toBe(med6);
            expect(sorted.at(5)).toBe(med5);
            expect(sorted.at(6)).toBe(med7);
            expect(sorted.at(7)).toBe(med8);
            expect(sorted.at(8)).toBe(med1);
        });

        it("Will return 1 not graphable at the bottom, below 3 pending", function() {

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

            // Not graphable
            med10.set("overallStart", "20151027");
            med10.set("overallStop", "20160112");
            med10.set("stopped", "20150525");
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

            var orderCollection = new Backbone.Collection([med3, med2, med1, med10, med11, med5, med12, med7, med8, med9, med4, med6]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0).get('uid')).toBe('uid:med11');
            expect(sorted.at(1).get('uid')).toBe('uid:med12');
            expect(sorted.at(2).get('uid')).toBe('uid:med7');
            expect(sorted.at(3).get('uid')).toBe('uid:med8');
            expect(sorted.at(4).get('uid')).toBe('uid:med9');
            expect(sorted.at(5).get('uid')).toBe('uid:med4');
            expect(sorted.at(6).get('uid')).toBe('uid:med5');
            expect(sorted.at(7).get('uid')).toBe('uid:med6');
            expect(sorted.at(8).get('uid')).toBe('uid:med3');
            expect(sorted.at(9).get('uid')).toBe('uid:med2');
            expect(sorted.at(10).get('uid')).toBe('uid:med1');
            expect(sorted.at(11).get('uid')).toBe('uid:med10');
        });
    });

    describe("Initial sort for graphing groups of meds with bad dates", function() {
        it("Will return 1 non-VA active at the top, then 1 active, 1 pending, and 3 not graphable at the bottom", function() {
            // Graphable because it's pending
            med1.set("overallStart", "20130503");
            med1.set("overallStop", "20130204");
            med1.set("stopped", "20130204");
            med1.set("vaStatus", "pending");

            // Graphable because it's non-VA active
            med2.set("overallStart", "20130726");
            med2.set("overallStop", "20130202");
            med2.set("stopped", "20130626");
            med2.set("vaStatus", "active");
            med2.set("vaType", "n");

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

            var orderCollection = new Backbone.Collection([med5, med1, med4, med2, med3, med6]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0).get('uid')).toBe('uid:med2');
            expect(sorted.at(1).get('uid')).toBe('uid:med3');
            expect(sorted.at(2).get('uid')).toBe('uid:med1');
            expect(sorted.at(3).getCanBeGraphed()).toBe(false);
            expect(sorted.at(4).getCanBeGraphed()).toBe(false);
            expect(sorted.at(5).getCanBeGraphed()).toBe(false);
            expect(sorted.contains(med3)).toBe(true);
            expect(sorted.contains(med4)).toBe(true);
            expect(sorted.contains(med5)).toBe(true);
        });

        it("Will return 2 discontinued with 1 not graphable at the bottom", function() {
            med1.set("overallStart", "20090813");
            med1.set("overallStop", "20110227");
            med1.set("stopped", "20110218");
            med1.set("vaStatus", "discontinued");
            med1.set("vaType", "n");

            // Not graphable
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

            var orderCollection = new Backbone.Collection([med1, med2, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0).get('uid')).toBe('uid:med3');
            expect(sorted.at(1).get('uid')).toBe('uid:med1');
            expect(sorted.at(2).get('uid')).toBe('uid:med2');
        });

        it("Will return all meds in order when all not graphable", function() {
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

            var orderCollection = new Backbone.Collection([med2, med4, med1, med5, med3]);
            graphingGroupCollection = new GraphingGroupCollection();
            var sorted = graphingGroupCollection.prepareMedsForGrouping(orderCollection, true);

            expect(sorted.at(0)).toBe(med2);
            expect(sorted.at(1)).toBe(med4);
            expect(sorted.at(2)).toBe(med1);
            expect(sorted.at(3)).toBe(med5);
            expect(sorted.at(4)).toBe(med3);
        });
    });

});