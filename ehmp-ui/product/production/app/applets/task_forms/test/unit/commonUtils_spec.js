/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'app/applets/task_forms/common/utils/utils'],
    function ($, Backbone, Marionette, Jasmine, Util) {
        describe('Testing findLatest utility function', function(){
            it('Should set find the latest in a collection', function(){
                var array = [{
                    id: 'Order.Request',
                    deploymentId: 'blah:2.0.rc222.12345'
                },{
                    id: 'Order.Request',
                    deploymentId: 'blah:2.x'
                },{
                    id: 'Order.Something.Else',
                    deploymentId: 'blah:2.9.rc222.12345'
                },{
                    id: 'Order.Request',
                    deploymentId: 'blah:2.1.rc333.67890'
                }];

                var ItemModel = Backbone.Model.extend({
                    idAttribute: 'testId'
                });
                var collection = new Backbone.Collection(array, { model: ItemModel });
                var latest = Util.findLatest(collection, 'Order.Request');
                expect(latest).toBeDefined();
                expect(latest.get('deploymentId')).toEqual('blah:2.x');
            });
        });

    });