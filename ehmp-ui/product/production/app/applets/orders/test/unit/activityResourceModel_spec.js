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

    describe('Setting up activites instant model test', function () {
        var ActivityModel;

        beforeEach(function(done) {
            if (_.isUndefined(ActivityModel)) {
                require(['app/resources/fetch/activities/instanceModel'], function(model) {
                    ActivityModel = model;
                    return done();
                });
            } else {
                return done();
            }
        });

        describe('Tests for activities resource pool instanceModel', function() {
            it('Should parse activity instanceModel properly', function() {
                var cdsIntentResult = {
                    name: 'Some cds intent result',
                    data: {
                        results: [{
                            detail: {
                                comments: 'C Reactive Protein'
                            },
                            remediation: {
                                action: 'order',
                                domain: 'lab'
                            }
                        }]
                    }
                };
                var response = {
                    consultOrder: {
                        conditions: [{
                            code: 'abc123'
                        }],
                        destinationFacility: {
                            code: 'SITE'
                        },
                        acceptingProvider: {
                            uid: 'urn:user:12345'
                        },
                        preReqOrders: [{
                            orderName: 'C Reactive Protein'
                        }]
                    },
                    orderable: {
                        name: 'Some orderable'
                    },
                    consultClinicalObject: {
                        data: {
                            consultOrders: [{
                                cdsIntentResult: JSON.stringify(cdsIntentResult)
                            }]
                        }
                    },
                    formAction: 'submit',
                    state: 'Response:Please respond'
                };

                var modifiedResponse = ActivityModel.prototype.parse(response);
                expect(modifiedResponse.condition).toEqual('abc123');
                expect(modifiedResponse.destinationFacility).toEqual('SITE');
                expect(modifiedResponse.state).toEqual('Response');
                expect(modifiedResponse.subState).toEqual('Please respond');
                expect(modifiedResponse.orderable.name).toEqual('Some orderable');
                expect(modifiedResponse.cdsIntentResult.name).toEqual('Some cds intent result');
                expect(modifiedResponse.formAction).toEqual('submit');
                expect(modifiedResponse.acceptingProvider).toEqual('12345');
                expect(modifiedResponse.preReqOrders[0].domain).toEqual('lab');
                expect(modifiedResponse.preReqOrders[0].action).toEqual('order');
            });
        });
    });
});