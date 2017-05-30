define([
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'require',
    'underscore'
], function(Backbone, Marionette, jasminejquery, Stubs, require, _) {
    'use strict';

    describe('Setting up appointments test', function() {

        var AppointmentsCollection;

        beforeEach(function(done) {
            if (_.isUndefined(AppointmentsCollection)) {
                require(['app/resources/fetch/appointments/patientRecordAppointments/collection'], function(collection) {
                    AppointmentsCollection = collection;
                    return done();
                });
            } else {
                return done();
            }
        });

        describe('Test for Appointments Collection - parse function', function() {

            it('The response has data.items. Should return an array of models:', function() {
                var model1 = {
                    test1: 'test1'
                };

                var model2 = {
                    test2: 'test2'
                };

                var mockResponse = {
                    data: {
                        items: [model1, model2]
                    }
                };

                var expectedResult = [model1, model2];
                var parsedResult = AppointmentsCollection.prototype.parse(mockResponse);
                expect(expectedResult).toEqual(parsedResult);
            });

            it('The response has just an array of objects, no data.items. Should return an array of models:', function() {
                var model1 = {
                    test1: 'test1'
                };

                var model2 = {
                    test2: 'test2'
                };

                var mockResponse = [model1, model2];
                var expectedResult = [model1, model2];
                var parsedResult = AppointmentsCollection.prototype.parse(mockResponse);
                expect(expectedResult).toEqual(parsedResult);
            });
        });
    });
});