define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'test/stubs', 'app/applets/allergy_grid/modal/modalView', 'require', 'underscore'],
    function($, Backbone, Marionette, jasminejquery, Stubs, ModalView, require, _) {
        'use strict';


        describe('Setting allergy grid up for testing ', function() {
            var AllergiesCollection;

            beforeEach(function(done) {
                if (_.isUndefined(AllergiesCollection)) {
                    require(['app/resources/fetch/allergies/collection'], function(collection) {
                        AllergiesCollection = collection;
                        return done();
                    });
                } else {
                    return done();
                }
            });
            describe('Base tests for modalView', function() {
                var view;

                beforeEach(function() {
                    window.ADK.UIResources = {
                        Fetch: {
                            Allergies: {
                                Collection: AllergiesCollection
                            }
                        }
                    };

                    view = new ModalView();
                });

                afterEach(function() {
                    window.ADK.UIResources = undefined;
                });

                describe('Test serializeModel functionality', function() {
                    it('Default format of facilityColor and severityCss', function() {
                        view.model = new Backbone.Model();
                        var result = view.serializeModel();
                        expect(result.facilityColor).toEqual('nonDOD');
                        expect(result.severityCss).toEqual('no-severity');
                    });

                    it('DoD and severity format of facilityColor and severityCss', function() {
                        view.model = new Backbone.Model({
                            acuityName: 'HIGH',
                            facilityCode: 'DOD'
                        });
                        var result = view.serializeModel();
                        expect(result.facilityColor).toEqual('DOD');
                        expect(result.severityCss).toEqual('high');
                    });

                    it('Contains product to format name', function() {
                        view.model = new Backbone.Model({
                            products: [{
                                name: 'Chocolate'
                            }]
                        });
                        var result = view.serializeModel();
                        expect(result.name).toEqual('Chocolate');
                    });

                    it('Contains entered date to format originatedFormatted', function() {
                        view.model = new Backbone.Model({
                            entered: '20161130103330'
                        });
                        var result = view.serializeModel();
                        expect(result.originatedFormatted).toEqual('11/30/2016 - 10:33');
                    });
                });

                describe('Test onBeforeShow', function() {
                    it('fetchOptions exist and collection is fetched', function() {
                        spyOn(view.collection, 'fetchCollection');
                        view.fetchOptions = {};
                        view.onBeforeShow();
                        expect(view.collection.fetchCollection).toHaveBeenCalled();
                    });

                    it('fetchOptions does not exist and collection is not fetched', function() {
                        spyOn(view.collection, 'fetchCollection');
                        view.onBeforeShow();
                        expect(view.collection.fetchCollection).not.toHaveBeenCalled();
                    });
                });
            });
        });

    });