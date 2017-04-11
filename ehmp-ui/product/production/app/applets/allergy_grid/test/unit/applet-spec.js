define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'test/stubs', 'app/applets/allergy_grid/applet'],
    function($, Backbone, Marionette, jasminejquery, Stubs, AllergyGrid) {
        'use strict';

        var serializeModel;

        describe('Base tests for allergy applet', function() {
            beforeEach(function() {
                serializeModel = _.get(AllergyGrid, 'viewTypes[1].view.prototype.DataGrid.prototype.DataGridRow.prototype.serializeModel');
            });

            describe('Test serializeModel functionality', function() {
                it('Default format of facilityColor and severityCss', function() {
                    var mockView = {
                        model: new Backbone.Model({})
                    };
                    var result = serializeModel.call(mockView);
                    expect(result.facilityColor).toEqual('nonDOD');
                    expect(result.severityCss).toEqual('no-severity');
                });

                it('DoD and severity format of facilityColor and severityCss', function() {
                    var mockView = {
                        model: new Backbone.Model({
                            acuityName: 'HIGH',
                            facilityCode: 'DOD'
                        })
                    };
                    var result = serializeModel.call(mockView);
                    expect(result.facilityColor).toEqual('DOD');
                    expect(result.severityCss).toEqual('high');
                });

                it('Contains product to format name', function() {
                    var mockView = {
                        model: new Backbone.Model({
                            products: [{
                                name: 'Chocolate'
                            }]
                        })
                    };
                    var result = serializeModel.call(mockView);
                    expect(result.name).toEqual('Chocolate');
                });

                it('Contains entered date to format originatedFormatted', function() {
                    var mockView = {
                        model: new Backbone.Model({
                            entered: '20161130103330'
                        })
                    };
                    var result = serializeModel.call(mockView);
                    expect(result.originatedFormatted).toEqual('11/30/2016 - 10:33');
                });
            });
        });
    });