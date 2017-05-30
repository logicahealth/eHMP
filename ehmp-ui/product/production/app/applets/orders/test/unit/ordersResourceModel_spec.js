define([
    'require',
    'test/stubs',
    'backbone',
    'marionette',
    'jasminejquery',
    'moment',
    'underscore'
], function(require, Stubs, Backbone, Marionette, jasminejquery, moment, _) {
    'use strict';

    describe('Setting up Orders Model', function() {

        var OrderModel;

        beforeEach(function(done) {
            if (_.isUndefined(OrderModel)) {
                require(['app/resources/fetch/orders/model'], function(model) {
                    OrderModel = model;
                    return done();
                });
            } else {
                return done();
            }
        });

        describe('Tests for orders resource pool model', function() {
            it('Should parse orders model properly', function() {
                var response = {
                    entered: '20161220',
                    service: 'PSJ'
                };
                spyOn(ADK.Enrichment, 'addFacilityMoniker').and.callFake(function(response) {
                    response.facilityMoniker = 'TST1';
                });

                spyOn(ADK.utils, 'formatDate').and.returnValue('12/20/2016');
                var modifiedResponse = OrderModel.prototype.parse(response);
                expect(modifiedResponse.displayGroup).toEqual('I RX');
                expect(modifiedResponse.facilityMoniker).toEqual('TST1');
                expect(modifiedResponse.enteredFormatted).toEqual('12/20/2016');
            });
        });
    });
});