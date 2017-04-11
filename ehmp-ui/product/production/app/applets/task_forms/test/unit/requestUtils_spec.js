/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'app/applets/task_forms/activities/order.request/utils'],
    function ($, Backbone, Marionette, Jasmine, Util) {
        describe('Testing setRequest utility function', function(){
            it('Should set request properly', function(){
                var clinicalObject = {
                    data: {
                        requests: [{
                            name: 'Request 1'
                        },
                        {
                            name: 'Request 2'
                        }]
                    }
                };

                var model = new Backbone.Model({clinicalObject: clinicalObject});
                Util.setRequest(model);
                expect(model.get('request').name).toEqual('Request 2');
            });
        });

        describe('Testing setActions utility function', function(){
            it('Should build model properly for given signals', function(){
                var model = new Backbone.Model({
                    actions: ['END', 'EDIT'],
                    userID: '9E7A;1234'
                });

                var user = new Backbone.Model({
                    site: '9E7A',
                    duz: {
                        '9E7A': '1234'
                    }
                });

                Util.setActions(model, user);
                expect(model.get('showDiscontinue')).toEqual(true);
                expect(model.get('actionButtons').length).toEqual(1);
                expect(model.get('actionButtons')[0].signal).toEqual('EDIT');
                expect(model.get('actionButtons')[0].label).toEqual('Edit Request');
            });
        });

        describe('Testing buildAcceptActionModel utility function', function(){
            it('Should build action model properly from form input', function(){
                var model = new Backbone.Model({
                    deploymentId: 'Vista.Order.2.0',
                    processInstanceId: 42,
                    signalName: 'END',
                    comment: 'Some reason text'
                });

                var actionModel = new Backbone.Model();
                Util.buildAcceptActionModel(model, actionModel);
                expect(actionModel.get('deploymentId')).toEqual('Vista.Order.2.0');
                expect(actionModel.get('processInstanceId')).toEqual(42);
                expect(actionModel.get('signalName')).toEqual('END');
                expect(actionModel.get('parameter').signalBody.get('objectType')).toEqual('requestSignal');
                expect(actionModel.get('parameter').signalBody.get('name')).toEqual('END');
                expect(actionModel.get('parameter').signalBody.get('actionText')).toEqual('Discontinue');
                expect(actionModel.get('parameter').signalBody.get('data').comment).toEqual('Some reason text');
            });
        });

        describe('Testing getCreatedAtFacilityName utility function', function(){
            it('Should return correctly facility name', function(){
                var facilityCollection = new Backbone.Collection([{
                    facilityID: '500',
                    vistaName: 'PANORAMA'
                },
                {
                    facilityID: '507',
                    vistaName: 'KODAK'
                }]);
                expect(Util.getCreatedAtFacilityName('500', facilityCollection)).toEqual('PANORAMA');
            });
        });
    });