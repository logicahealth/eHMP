/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/components/behaviors/behaviors'],
    function($, Handlebars, Backbone, Marionette, Behaviors) {
        describe('A tooltip behavior', function() {
            var testView;
            var $testEl;

            var id = 0;

            afterEach(function() {
                if (!testView.isDestroyed)
                    testView.destroy(); //this calls destroy
                $('body').find(testView.$el).remove();
                $('body').find('.tooltip').remove();
            });

            var View = Backbone.Marionette.ItemView.extend({
                behaviors: {
                    Tooltip: {}
                },
            });

            describe('with basic default options', function() {
                var $el;
                beforeEach(function() {
                    var Temp = View.extend({
                        template: Handlebars.compile('<div id="' + ++id + '" tooltip-data-key="Refresh">I have a tooltip!</div>')
                    });
                    testView = new Temp();
                    testView.render();
                    $('body').append(testView.$el);

                    $testEl = testView.$el;
                    $el = $testEl.find('[tooltip-data-key]');
                });

                describe('has the option', function() {
                    var data;
                    beforeEach(function() {
                        data = $el.data('bs.tooltip');
                    });
                    it('container as "body"', function() {
                        expect(data.options.container).toEqual('body');
                    });
                    it('placement as "auto top"', function() {
                        expect(data.options.placement).toEqual('auto top');
                    });
                    it('trigger as "hover"', function() {
                        expect(data.options.trigger).toEqual('hover');
                    });

                });

                describe('is able to', function() {
                    it('correctly map a tooltip', function() {
                        var dotitle = $el.attr('data-original-title'),
                            title = $el.attr('title');
                        expect(dotitle === 'Refresh' || title === 'Refresh').toBe(true);
                    });

                    describe('open a tooltip', function() {
                        beforeEach(function(done) {
                            $el.on('shown.bs.tooltip', function() {
                                done();
                            });
                            $el.trigger('mouseenter');
                        });

                        it('and locate the container', function() {
                            var unique_id = $el.attr('aria-describedby');
                            var $tip = $('body').find('#' + unique_id);
                            expect(!!$tip.length).toBe(true);
                            expect($tip).toHaveClass('top');
                            expect($tip.text()).toEqual('Refresh');
                        });

                        describe('and close the tooltip', function() {
                            beforeEach(function(done) {
                                $el.on('hidden.bs.tooltip', function() {
                                    done();
                                });
                                $el.trigger('mouseleave');
                            });
                            it('and the tooltip container cannot be found', function() {
                                expect(!!$('body').find('.tooltip').length).toBe(false);
                            });
                        });

                        describe('and destroy the view', function() {
                            beforeEach(function(done) {
                                testView.on('destroy', function() {
                                    done();
                                });
                                $el.data('bs.tooltip').$tip.removeClass('fade'); //expedite the closing process so we can listen to it
                                testView.destroy();
                            });
                            it('and the tooltip container cannot be found', function() {
                                expect(!!$('body').find('.tooltip').length).toBe(false);
                            });
                        });
                    });
                });
            });

            describe('with options passed in through behavior', function() {
                var $el;
                var Test = View.extend({
                    template: Handlebars.compile('<div tooltip-data-key="Help">I have a tooltip!</div>')
                });

                var initializeView = function(Test) {
                    testView = new Test();
                    testView.render();
                    $('body').append(testView.$el);

                    $testEl = testView.$el;
                    $el = $testEl.find('[tooltip-data-key]');
                };

                describe('has the option', function() {
                    var config = {
                        'placement': 'left',
                        'container': 'html',
                        'trigger': 'focus'
                    };

                    initializeView(Test.extend({
                        behaviors: {
                            Tooltip: config
                        }
                    }));

                    var data;
                    beforeEach(function() {
                        data = $el.data('bs.tooltip');
                    });
                    it('container as "html"', function() {
                        expect(data.options.container).toEqual('html');
                    });
                    it('placement as "left"', function() {
                        expect(data.options.placement).toEqual('left');
                    });
                    it('trigger as "focus"', function() {
                        expect(data.options.trigger).toEqual('focus');
                    });

                    describe('open a tooltip', function() {
                        beforeEach(function(done) {
                            $el.on('shown.bs.tooltip', function() {
                                done();
                            });
                            $el.trigger('focusin');
                        });

                        it('and locate the container', function() {
                            var unique_id = $el.attr('aria-describedby');
                            var $tip = $('html').find('#' + unique_id);
                            expect(!!$tip.length).toBe(true);
                            expect($tip).toHaveClass('left');
                            expect($tip.text()).toEqual('Help');
                        });
                    });

                    describe('and close the tooltip', function() {
                        beforeEach(function(done) {
                            $el.on('hidden.bs.tooltip', function() {
                                done();
                            });
                            $el.trigger('focusout');
                        });
                        it('and the tooltip container cannot be found', function() {
                            expect(!!$('html').find('.tooltip').length).toBe(false);
                        });
                    });
                });
            });
        });
    });