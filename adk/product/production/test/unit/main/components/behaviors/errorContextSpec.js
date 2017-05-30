/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define([
    'jquery',
    'handlebars',
    'backbone',
    'marionette',
    'main/components/behaviors/behaviors'
], function(
    $,
    Handlebars,
    Backbone,
    Marionette,
    Behaviors
) {

    describe('The ErrorContext behavior', function() {
        var callee;
        var listener;
        var contextObject = {
            title: 'ErrorContext view',
            someProperty: 'Righteous indignation'
        };
        var contextTitle = 'ErrorContext listening view';
        var Listener = Backbone.Marionette.LayoutView.extend({
            el: '.error-context-listener',
            template: Handlebars.compile('<div class="child-region"></div>'),
            regions: {
                'childRegion': '.child-region'
            },
            contextObject: contextObject,
            contextTitle: contextTitle,
        });
        var Callee = Backbone.Marionette.ItemView.extend({
            template: false,
            onAttach: function() {
                this.$el.trigger('request:error:context', 'respond:error:context');
            }
        });
        var CalleeParent = Backbone.Marionette.LayoutView.extend({
            el: '.error-context-callee',
            template: Handlebars.compile('<div class="child-region"></div>'),
            regions: {
                childRegion: '.child-region'
            }
        });
        var runCommonIts = function() {
            it('returns a context title and details for a descendent callee', function() {
                callee = new Callee();
                var responseContext;
                var spyObj = {
                    onResponse: function(e, context) {
                        e.stopImmediatePropagation();
                        responseContext = context;
                    }
                };
                spyOn(spyObj, 'onResponse').and.callThrough();
                callee.$el.one('respond:error:context', spyObj.onResponse);
                listener.showChildView('childRegion', callee);
                expect(spyObj.onResponse).toHaveBeenCalled();
                expect(responseContext.title).toBe(contextTitle);
                expect(responseContext.details).toBe(contextObject);
                callee.$el.off('respond:error:context');
            });
            it('does not return a context title and details for a NON descendent callee', function() {
                callee = new Callee();
                var calleeParent = new CalleeParent();
                var responseContext;
                var spyObj = {
                    onResponse: function(e, context) {
                        e.stopImmediatePropagation();
                        responseContext = context;
                    }
                };
                spyOn(spyObj, 'onResponse').and.callThrough();
                callee.$el.one('respond:error:context', spyObj.onResponse);
                calleeParent.render();
                calleeParent.showChildView('childRegion', callee);
                expect(spyObj.onResponse).not.toHaveBeenCalled();
                expect(responseContext).toBe(undefined);
                callee.$el.off('respond:error:context');
                calleeParent.destroy();
            });
        };
        beforeEach(function() {
            $('body').append('<div class="error-context-listener"></div>');
            $('body').append('<div class="error-context-callee"></div>');
        });
        afterEach(function() {
            callee.destroy();
            listener.destroy();
            $('body > .error-context-listener, body > .error-context-callee').remove();
        });
        describe('with static string \'title\' and static object \'details\'', function() {
            beforeEach(function() {
                Listener = Listener.extend({
                    behaviors: {
                        ErrorContext: {
                            title: contextTitle,
                            details: contextObject
                        }
                    }
                });
                listener = new Listener();
                listener.render();
            });
            runCommonIts();
        });
        describe('with function \'title\' and static object \'details\'', function() {
            beforeEach(function() {
                Listener = Listener.extend({
                    behaviors: {
                        ErrorContext: {
                            title: function() {
                                return this.getOption('contextTitle');
                            },
                            details: contextObject
                        }
                    }
                });
                listener = new Listener();
                listener.render();
            });
            runCommonIts();
        });
        describe('with static string \'title\' and function \'details\'', function() {
            beforeEach(function() {
                Listener = Listener.extend({
                    behaviors: {
                        ErrorContext: {
                            title: contextTitle,
                            details: function() {
                                return this.getOption('contextObject');
                            }
                        }
                    }
                });
                listener = new Listener();
                listener.render();
            });
            runCommonIts();
        });
        describe('with function \'title\' and function \'details\'', function() {
            beforeEach(function() {
                Listener = Listener.extend({
                    behaviors: {
                        ErrorContext: {
                            title: function() {
                                return this.getOption('contextTitle');
                            },
                            details: function() {
                                return this.getOption('contextObject');
                            }
                        }
                    }
                });
                listener = new Listener();
                listener.render();
            });
            runCommonIts();
        });
        describe('with a descendent in same ancestor stack', function() {
            var intermediateTitle = 'ErrorContext intermediate listening view';
            var intermediateContextObject = {
                title: 'ErrorContext intermediate view',
                someProperty: 'Undead redemption'
            };
            var IntermediateListener = Backbone.Marionette.LayoutView.extend({
                template: Handlebars.compile('<div class="intermediate-child-region"></div>'),
                regions: {
                    childRegion: '.intermediate-child-region'
                },
                contextObject: intermediateContextObject,
                behaviors: {
                    ErrorContext: {
                        title: intermediateTitle,
                        details: function() {
                            return this.getOption('contextObject');
                        }
                    }
                },
            });
            var intermediateListener;
            beforeEach(function() {
                intermediateListener = new IntermediateListener();
                Listener = Listener.extend({
                    behaviors: {
                        ErrorContext: {
                            title: function() {
                                return this.getOption('contextTitle');
                            },
                            details: function() {
                                return this.getOption('contextObject');
                            }
                        }
                    },
                    onRender: function() {
                        this.showChildView('childRegion', intermediateListener)
                    }
                });
                listener = new Listener();
                listener.render();
            });
            it('top most listener is not called', function() {
                callee = new Callee();
                var responseContext;
                var spyObj = {
                    onResponse: function(e, context) {
                        e.stopImmediatePropagation();
                        responseContext = context;
                    }
                };
                spyOn(spyObj, 'onResponse').and.callThrough();
                callee.$el.on('respond:error:context', spyObj.onResponse);
                intermediateListener.showChildView('childRegion', callee);
                expect(spyObj.onResponse).toHaveBeenCalled();
                expect(responseContext.title).not.toBe(contextTitle);
                expect(responseContext.details).not.toBe(contextObject);
                expect(responseContext.title).toBe(intermediateTitle);
                expect(responseContext.details).toBe(intermediateContextObject);
                expect(spyObj.onResponse.calls.count()).toBe(1);
                callee.$el.off('respond:error:context');
            });
        });
    });

});
