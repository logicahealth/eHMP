define([
    'jasminejquery',
    'backbone',
    'app/applets/medication_review/medicationFilter/medicationDateFilter'
], function(JasmineJquery, Backbone, MedicationDateFilter) {
    'use strict';

    describe('Medications date filter', function() {
        var ungroupedMeds;
        var dateFilter;
        var MedicationsUngroupedCollection;
        var MedicationsUngroupedModel;

        var setupTest = function() {
            var med1 = new MedicationsUngroupedModel({
                uid: 'med1:uid'
            });
            var med2 = new MedicationsUngroupedModel({
                uid: 'med2:uid'
            });
            ungroupedMeds = new MedicationsUngroupedCollection([med1, med2]);
            var datePickerModel = new Backbone.Model({
                'selected-id': 'someHtmlId',
                'fromDate': '01/01/2000',
                'toDate': '01/01/2010'
            });
            dateFilter = new MedicationDateFilter({
                view: new Backbone.View(),
                collection: ungroupedMeds,
                dateModel: datePickerModel
            });
            spyOn(dateFilter, 'filterByDate');
        };

        beforeEach(function(done) {
            if (_.isUndefined(MedicationsUngroupedCollection) || _.isUndefined(MedicationsUngroupedModel)) {
                require([
                    'app/resources/fetch/medication_review/medicationOrderCollection',
                    'app/resources/fetch/medication_review/medicationOrderModel'
                ], function(collection, model) {
                    MedicationsUngroupedCollection = collection;
                    MedicationsUngroupedModel = model;
                    setupTest();
                    done();
                });
            } else {
                setupTest();
                done();
            }
        });


        it('will call filterBy when new meds are set on the collection', function() {
            var med3 = new MedicationsUngroupedModel({
                uid: 'med3:uid'
            });
            var med4 = new MedicationsUngroupedModel({
                uid: 'med4:uid'
            });
            ungroupedMeds.set([med3, med4]);
            expect(dateFilter.filterByDate).toHaveBeenCalled();
        });

        it('will call filterBy when an existing med is set with changed attributes', function() {
            var med2 = new MedicationsUngroupedModel({
                uid: 'med2:uid',
                name: 'aspirin'
            });
            ungroupedMeds.set(med2);
            expect(dateFilter.filterByDate).toHaveBeenCalled();
        });

        it('will not call filterBy when set is called with no actual changes', function() {
            ungroupedMeds.set(ungroupedMeds.models);
            expect(dateFilter.filterByDate).not.toHaveBeenCalled();
        });

        it('will not call filterBy when set is called with logically equal models', function() {
            var medA = new MedicationsUngroupedModel({
                uid: 'med1:uid'
            });
            var medB = new MedicationsUngroupedModel({
                uid: 'med2:uid'
            });
            ungroupedMeds.set([medA, medB]);
            expect(dateFilter.filterByDate).not.toHaveBeenCalled();
        });

        it('will call filterBy when a new med is added', function() {
            ungroupedMeds.add(new MedicationsUngroupedModel({
                uid: 'med3:uid'
            }));
            expect(dateFilter.filterByDate).toHaveBeenCalled();
        });

        it('will call filterBy when a med is removed', function() {
            ungroupedMeds.remove('med2:uid');
            expect(dateFilter.filterByDate).toHaveBeenCalled();
        });
    });
});