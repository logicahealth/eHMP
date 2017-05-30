/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/UILibrary'],
    function(_, $, Handlebars, Backbone, Marionette, UILibrary) {
        'use strict';
        var TextFilterView = UILibrary.TextFilter;
        var FilterCollection = TextFilterView.prototype.Collection.extend({
            initialize: function() {
                this.listenTo(this, 'filter-entered', 'onFilterEntered');
            },
            onFilterEntered: function(){}

        });
        var testCollection;
        var filterTitle = '';
        var instanceId = 'applet1';

        var setUpCollectionSpies = function() {
            spyOn(testCollection, 'onFilterEntered');
        };

        var $testPage, testPage;
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
        describe('A text filter view', function() {
            var textFilterView;
            afterEach(function() {
                textFilterView.destroy();
            });
            var extensibleTextFilterTests = function(multipleFilters, showFilterTitle, filterArray) {
                filterArray = filterArray || [];
                describe('with ' + (multipleFilters ? 'multiple filters' : 'single filter') + ' and filter title ' + (showFilterTitle ? 'visible' : 'hidden') + (filterArray.length > 0 ? ' with persisting filters' : ''), function() {
                    beforeEach(function() {
                        var TestTextFilterView = TextFilterView.extend({});
                        testCollection = new FilterCollection(filterArray);
                        textFilterView = new TestTextFilterView({
                            collection: testCollection,
                            showFilterTitle: showFilterTitle,
                            multipleFilters: multipleFilters,
                            instanceId: instanceId,
                            filterTitle: filterTitle
                        });
                        testPage = new TestView({
                            view: textFilterView
                        });
                        testPage = testPage.render();
                        $testPage = testPage.$el;
                        $('body').append($testPage);
                        setUpCollectionSpies();
                    });
                    afterEach(function() {
                        textFilterView.destroy();
                    });
                    describe('consists of', function() {
                        describe('a Marionette.LayoutView', function() {
                            it('that is of correct type', function() {
                                expect(textFilterView instanceof Backbone.Marionette.LayoutView).toBe(true);
                            });
                            describe('that has a form view', function() {
                                it('inside the correct region', function() {
                                    expect(textFilterView.$('.filter-container-text-form > form')).toHaveLength(1);
                                });
                                describe('that displays a searchbar control', function() {
                                    it('with the correct classes', function() {
                                        expect(textFilterView.$('form .searchbar-control.' + instanceId + 'FilterSearchText')).toHaveLength(1);
                                    });
                                });
                                if (multipleFilters) {
                                    it('that displays the submit button', function() {
                                        expect(textFilterView.$('form .searchbar-control button:submit')).not.toHaveClass('sr-only');
                                    });
                                } else {
                                    it('that hides the submit button', function() {
                                        expect(textFilterView.$('form .searchbar-control button:submit')).toHaveClass('sr-only');
                                    });
                                }
                                if (!showFilterTitle) {
                                    it('that does not include an input control for the filter title', function() {
                                        expect(textFilterView.$('form input')).toHaveLength(1);
                                    });
                                } else {
                                    it('that displays an input control with the correct classes when not on a predefinedScreen', function() {
                                        expect(textFilterView.$('form .input-control.applet-filter-title.' + instanceId + 'FilterTitle')).toHaveLength(1);
                                    });
                                }
                            });
                            describe('that has a filter list view', function() {
                                if (multipleFilters) {
                                    it('that is visible', function() {
                                        expect(textFilterView.$('.filter-container-text-list ul')).toHaveLength(1);
                                    });
                                    var filterListLength = filterArray.length;
                                    describe('that has a remove-all button', function() {
                                        it('that is not visible when applicable', function() {
                                            expect(textFilterView.$('.filter-container-text-list button.btn-clear-all.remove-all')).toHaveLength((testCollection.length > 0) ? 1 : 0);
                                        });
                                        if (filterListLength > 0) {
                                            it('that when clicked removes all filters', function() {
                                                expect(testCollection.length).toBe(filterListLength);
                                                expect(textFilterView.$('.filter-container-text-list ul li')).toHaveLength(filterListLength);
                                                textFilterView.$('.filter-container-text-list button.btn-clear-all.remove-all').click();
                                                expect(testCollection.length).toBe(0);
                                                expect(textFilterView.$('.filter-container-text-list ul li')).toHaveLength(0);
                                                expect(textFilterView.$('.filter-container-text-list button.btn-clear-all.remove-all')).toHaveLength(0);
                                            });
                                        }
                                    });
                                    if (filterListLength > 0) {
                                        describe('that has filter items', function() {
                                            it('that are visible', function() {
                                                expect(textFilterView.$('.filter-container-text-list ul li')).toHaveLength(filterListLength);
                                            });
                                            it('that when clicked remove the filter from the list', function() {
                                                expect(testCollection.length).toBe(filterListLength);
                                                expect(textFilterView.$('.filter-container-text-list ul li')).toHaveLength(filterListLength);
                                                textFilterView.$('.filter-container-text-list ul li:last-of-type button').click();
                                                expect(testCollection.length).toBe(filterListLength - 1);
                                                expect(textFilterView.$('.filter-container-text-list ul li')).toHaveLength(filterListLength - 1);
                                            });
                                        });
                                    }
                                } else {
                                    it('that is hidden', function() {
                                        expect(textFilterView.$('.filter-container-text-list').html()).toBe("");
                                    });
                                }
                            });
                        });
                    });
                });
            };
            // Pre-Defined workspace
            extensibleTextFilterTests(false, false);
            // Expanded View
            extensibleTextFilterTests(true, false);
            extensibleTextFilterTests(true, false, [{ text: '1' }, { text: '2' }]);
            // User-Defined workspace
            extensibleTextFilterTests(true, true);
            extensibleTextFilterTests(true, true, [{ text: '1' }, { text: '2' }, { text: '3' }]);
        });
    });
