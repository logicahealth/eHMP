define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/search/views/rightSideButtonView'
], function($, Backbone, Marionette, jasmine, Stubs, RightSideButtonView) {
    'use strict';

    describe('The Right Side Button View', function() {
        var view;
        var mockModel;
        var resources = window.ADK.UIResources;
        Stubs.bootstrapViewTest();

        beforeEach(function() {
            $.fn.extend({
                popover: function(options) {}
            });
            window.ADK.UIResources = {
                Fetch: {
                    TextSearch: {
                        Collection: ADK.Resources.Collection.extend({
                            fetchCollection: function() {
                                return new Backbone.Collection();
                            }
                        })
                    }
                }
            };

            mockModel = new Backbone.Model({
                searchTerm: 'mockSearchTerm'
            });
            view = new RightSideButtonView({
                model: mockModel
            });
        });

        afterEach(function() {
            window.ADK.UIResources = resources;
        });

        describe('when constructing the view', function() {
            it('should exist', function() {
                expect(view).toBeDefined();
            });
        });

        describe('when rendered', function() {
            it('should create the help Button', function() {
                view.render();
                expect(view.$el.find('.help-icon-button-container button')).toBeDefined();
            });
            it('should create the closeTextSearchButton', function() {
                view.render();
                expect(view.ui.closeTextSearchButton).toBeDefined();
            });
        });
    });
});