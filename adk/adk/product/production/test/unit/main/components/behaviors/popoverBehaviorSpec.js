/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/components/behaviors/behaviors'],
    function($, Handlebars, Backbone, Marionette, Behaviors) {
        describe('A popover behavior', function() {
            var testView;
            var $testEl;

            afterEach(function() {
                if (!testView.isDestroyed)
                    testView.destroy(); //this calls destroy
                $('body').find(testView.$el).remove();
            });

            var View = Backbone.Marionette.ItemView.extend({
                behaviors: {
                    Popover: {}
                },
                template: Handlebars.compile('<div data-toggle="popover" data-content="MY CONTENT">HELLO</div>')
            });

            describe('with basic configuration', function() {
                var $el;
                beforeEach(function() {
                    testView = new View();
                    testView.render();
                    $('body').append(testView.$el);

                    $testEl = testView.$el;
                    $el = $testEl.find('[data-toggle=popover]');
                });

                describe('is able to', function() {

                    describe('open a popover', function() {
                        beforeEach(function(done) {
                            $el.popover('destroy');
                            $el.on('shown.bs.popover', function() {
                                done();
                            });
                            $el.popover('show');
                        });

                        it('and locate the container', function() {
                            var unique_id = $el.attr('aria-describedby');
                            var $tip = $('body').find('#' + unique_id);
                            expect(!!$tip.length).toBe(true);
                            expect($tip.text()).toEqual('MY CONTENT');
                        });

                        describe('and close the popover', function() {
                            beforeEach(function(done) {
                                $el.on('hidden.bs.popover', function() {
                                    done();
                                });
                                $el.popover('hide');
                            });
                            it('and the popover container cannot be found', function() {
                                expect(!!$('body').find('.popover').length).toBe(false);
                            });
                        });

                        describe('and destroy the view', function() {
                            beforeEach(function(done) {
                                testView.on('destroy', function() {
                                    done();
                                });
                                $el.data('bs.popover').$tip.removeClass('fade'); //expedite the closing process so we can listen to it
                                testView.destroy();
                            });
                            it('and the popover container cannot be found', function() {
                                expect(!!$('body').find('.popover').length).toBe(false);
                            });
                        });
                    });
                });
            });
        });
    });