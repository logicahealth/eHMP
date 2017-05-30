/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define([
    'jquery',
    'handlebars',
    'backbone',
    'marionette',
    'main/components/behaviors/behaviors',
    'main/ui_components/components',
    'api/Messaging'
], function(
    $,
    Handlebars,
    Backbone,
    Marionette,
    Behaviors,
    UIComponents,
    Messaging
) {
    describe('The ErrorComponents behavior', function() {
        var parent;
        var errorContainer;
        var ErrorComponent = Backbone.Marionette.ItemView.extend({
            tagName: 'button',
            template: Handlebars.compile('{{getMessage}}'),
            templateHelpers: function() {
                var errorModel = this.getOption('errorModel');
                var message;
                if (errorModel instanceof Backbone.Model) message = errorModel.get('message')
                return {
                    getMessage: message || "Error Component"
                }
            }
        });
        var ErrorContainer = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile('<div class="error-components-target-container"></div>')
        });
        var ErrorContainerParent = Backbone.Marionette.LayoutView.extend({
            el: '.error-container-parent',
            template: Handlebars.compile('<div class="child-region"></div>'),
            regions: {
                childRegion: '.child-region'
            },
            onRender: function() {
                var ChildView = this.getOption('ChildView')
                this.showChildView('childRegion', new ChildView());
            }
        });

        var runCommonExpects = function(expectedContainerEl, shouldShow, errorText) {
            expect(expectedContainerEl.find('> .error-components-container')).toHaveLength(shouldShow ? 1 : 0);

            expect(expectedContainerEl.find('button')).toHaveLength(shouldShow ? 1 : 0);
            if (!shouldShow) return;
            if (!_.isString(errorText)) {
                errorText = 'Error Component';
            }
            expect(expectedContainerEl.find('button')).toHaveText(errorText);
        };

        beforeEach(function() {
            $('body').append('<div class="error-container-parent"></div>');
        });
        afterEach(function() {
            parent.destroy();
            $('body > .error-container-parent').remove();
        });
        beforeAll(function() {
            Messaging.trigger('register:component', {
                type: "errorItem",
                key: "errorReporter",
                view: ErrorComponent,
                shouldShow: function() {
                    return true;
                }
            });
        });
        afterAll(function() {
            var collection = Messaging.request('get:components');
            collection.reset();
        });

        describe('with no options', function() {
            beforeEach(function() {
                parent = new ErrorContainerParent({
                    ChildView: ErrorContainer.extend({
                        behaviors: {
                            ErrorComponents: {}
                        }
                    })
                });
                var obj = new Backbone.Marionette.Object();
                parent.render();
                errorContainer = parent.getRegion('childRegion').currentView;
            });
            it('correctly injects error component at end of error container view\'s $el', function() {
                runCommonExpects(errorContainer.$el, true);
            });
        });
        describe('with container option', function() {
            beforeEach(function() {
                parent = new ErrorContainerParent({
                    ChildView: ErrorContainer.extend({
                        behaviors: {
                            ErrorComponents: {
                                container: '.error-components-target-container'
                            }
                        }
                    })
                });
                var obj = new Backbone.Marionette.Object();
                parent.render();
                errorContainer = parent.getRegion('childRegion').currentView;
            });
            it('correctly injects error component in container view\'s div', function() {
                runCommonExpects(errorContainer.$el.find('.error-components-target-container'), true);
            });
        });
        describe('with shouldShow option as true', function() {
            beforeEach(function() {
                parent = new ErrorContainerParent({
                    ChildView: ErrorContainer.extend({
                        shouldShow: true,
                        behaviors: {
                            ErrorComponents: {
                                container: '.error-components-target-container',
                                shouldShow: function() {
                                    return this.getOption('shouldShow');
                                }
                            }
                        }
                    })
                });
                var obj = new Backbone.Marionette.Object();
                parent.render();
                errorContainer = parent.getRegion('childRegion').currentView;
            });
            it('correctly injects error component in container view\'s div', function() {
                // also checks that shouldShow gets correct view binding
                runCommonExpects(errorContainer.$el.find('.error-components-target-container'), true);
            });
        });
        describe('with shouldShow option as false', function() {
            beforeEach(function() {
                parent = new ErrorContainerParent({
                    ChildView: ErrorContainer.extend({
                        shouldShow: false,
                        behaviors: {
                            ErrorComponents: {
                                container: '.error-components-target-container',
                                shouldShow: function() {
                                    return this.getOption('shouldShow');
                                }
                            }
                        }
                    })
                });
                var obj = new Backbone.Marionette.Object();
                parent.render();
                errorContainer = parent.getRegion('childRegion').currentView;
            });
            it('correctly DOES NOT inject error component in container view\'s div', function() {
                // also checks that shouldShow gets correct view binding
                runCommonExpects(errorContainer.$el.find('.error-components-target-container'), false);
            });
        });
        describe('with getModel option', function() {
            var expectedModel = new Backbone.Model({
                message: 'Test string'
            });
            beforeEach(function() {
                parent = new ErrorContainerParent({
                    ChildView: ErrorContainer.extend({
                        behaviors: {
                            ErrorComponents: {
                                container: '.error-components-target-container',
                                getModel: function() {
                                    return expectedModel;
                                }
                            }
                        },
                    })
                });
                var obj = new Backbone.Marionette.Object();
                parent.render();
                errorContainer = parent.getRegion('childRegion').currentView;
            });
            it('correctly injects error component in container view\'s div with correct text', function() {
                // got correct model if different text is displayed in button view
                runCommonExpects(errorContainer.$el.find('.error-components-target-container'), true, 'Test string');
            });
        });
    });
});
