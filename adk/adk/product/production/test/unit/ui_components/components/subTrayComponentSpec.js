/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/ui_components/components'],
    function($, Handlebars, Backbone, Marionette, UI) {

        var testText = "Test Text",
            trayTestPage;

        var TestView = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile([
                '<div class="test-region"></div>'
            ].join('\n')),
            ui: {
                'TestRegion': '.test-region'
            },
            regions: {
                'TestRegion': '@ui.TestRegion'
            },
            initialize: function(options) {
                this.ViewToTest = options.view;
                if (!_.isFunction(this.ViewToTest.initialize)) {
                    this.ViewToTest = new this.ViewToTest();
                }
            },
            onRender: function() {
                this.showChildView('TestRegion', this.ViewToTest);
            }
        });

        describe('A sub tray component', function() {
            afterEach(function() {
                trayTestPage.remove();
            });

            describe('has basic functionality', function() {
                var trayConfig = {
                    buttonLabel: 'Example Sub Tray',
                    position: 'right',
                    viewport: '.test-region',
                    tray: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('<div class="content">' + testText + '</div>')
                    })
                };

                beforeEach(function() {
                    var trayTestView = new UI.SubTray(trayConfig);
                    trayTestPage = new TestView({
                        view: trayTestView
                    });
                    trayTestPage = trayTestPage.render();
                    $('body').append(trayTestPage.$el);
                });

                describe('is presented', function() {
                    it('with correct structure and attributes and is closed', function() {
                        expect(trayTestPage.TestRegion.currentView.$el).toHaveClass('sidebar');
                        expect(trayTestPage.$('.btn[type=button][data-toggle=sidebar-subTray][aria-expanded=false]')).toHaveLength(1);
                        expect(trayTestPage.$('.sidebar-sub-tray.right[aria-hidden=true][tabindex=-1]')).toHaveLength(1);
                    });

                    it('with correct labels and content', function() {
                        expect(trayTestPage.$('.sidebar-sub-tray').children()[0]).toContainText(testText);
                        expect(trayTestPage.$('.btn')).toContainText(trayConfig.buttonLabel);
                    });
                });

                describe('is able to', function() {
                    it('open and close', function() {
                        var el = trayTestPage.TestRegion.currentView.$el,
                            trayShow = spyOnEvent(el, 'subTray.show'),
                            trayHide = spyOnEvent(el, 'subTray.hide');

                        trayTestPage.$('.btn').click(); //open with button
                        expect(trayShow).toHaveBeenTriggered();
                        expect(el).toHaveClass('open');

                        trayTestPage.$('.btn').click(); //close with button
                        expect(trayHide).toHaveBeenTriggered();
                        expect(el).not.toHaveClass('open');
                    });

                    describe('broadcast animation completed events', function() {
                        describe('on open', function() {
                            beforeEach(function(done) {
                                trayTestPage.$('.btn').click();
                                trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                    done();
                                });
                            });
                            it('where roles are updated', function() {
                                expect(trayTestPage.$('.btn')).toHaveAttr('aria-expanded', 'true');
                                expect(trayTestPage.$('.sidebar-sub-tray')).toHaveAttr('aria-hidden', 'false');
                            });
                        });

                        describe('on close', function() {
                            beforeEach(function(done) {
                                trayTestPage.$('.btn').click();
                                trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                    trayTestPage.$('.btn').click();
                                    trayTestPage.TestRegion.currentView.$el.on('subTray.hidden', function() {
                                        done();
                                    });
                                });
                            });
                            it('where roles are updated', function() {
                                expect(trayTestPage.$('.btn')).toHaveAttr('aria-expanded', 'false');
                                expect(trayTestPage.$('.sidebar-sub-tray')).toHaveAttr('aria-hidden', 'true');
                            });
                        });
                    });

                    describe('ensure focus', function() {
                        beforeEach(function(done) {
                            trayTestPage.$('.btn').click();
                            trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                done();
                            });
                        });
                        it('goes to correct element', function() {
                            expect($(document.activeElement).hasClass('sidebar-sub-tray')).toBe(true);
                        });
                    });

                    describe('handle keyboard functionality', function() {
                        var e = $.Event('keydown');

                        describe('where spacebar is pressed', function() {
                            beforeEach(function(done) {
                                e.which = 32;
                                trayTestPage.$('.btn').trigger(e);
                                trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                    done();
                                });
                            });
                            it('to open sub tray', function() {
                                expect(trayTestPage.$('.sidebar-sub-tray')).toHaveAttr('aria-hidden', 'false');
                            });
                        });

                        describe('where shift+tab is pressed inside sub tray', function() {
                            beforeEach(function(done) {
                                e.which = 9;
                                e.shiftKey = true;
                                trayTestPage.$('.btn').click();
                                trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                    $(document.activeElement).trigger(e);
                                    $('body').focusin(); //issuing the event doesn't actually shift focus so we have to do so manually
                                    done();
                                });
                            });
                            it('to close sub tray', function() {
                                expect(trayTestPage.TestRegion.currentView.$el).not.toHaveClass('open');
                            });
                        });

                        describe('where tab is pressed inside sub tray and focus leaves', function() {
                            beforeEach(function(done) {
                                e.which = 9;
                                trayTestPage.$('.btn').click();
                                trayTestPage.TestRegion.currentView.$el.on('subTray.shown', function() {
                                    $(document.activeElement).trigger(e);
                                    $('body').focusin(); //issuing the event doesn't actually shift focus so we have to do so manually
                                    done();
                                });
                            });
                            it('to close sub tray', function() {
                                expect(trayTestPage.TestRegion.currentView.$el).not.toHaveClass('open');
                            });
                        });

                    });
                });
            });

        });

    });