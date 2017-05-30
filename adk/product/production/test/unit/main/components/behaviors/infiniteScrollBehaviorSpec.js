/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/components/behaviors/behaviors'],
    function($, Handlebars, Backbone, Marionette, Behaviors) {
        describe('A infiniteScroll behavior', function() {

            var customMatchers = {
                setOptions: function(options) {
                    if (!_.isObject(options)) {
                        options = {};
                    }
                    return _.defaultsDeep(options, {
                        tagName: {
                            wrapper: 'div',
                            content: 'div'
                        },
                        className: ''
                    });
                },
                toHaveLoadingView: function(util, customEqualityTesters) {
                    return {
                        compare: function(selector, options) {
                            options = customMatchers.setOptions(options);
                            var $wrapperElement = selector.find('>' + options.tagName.wrapper + ':last-of-type');
                            var hasCorrectWrapper = _.isEqual($wrapperElement.length, 1) && $wrapperElement.hasClass(options.className);
                            var hasCorrectContent = _.isEqual($wrapperElement.find('> ' + options.tagName.content).length, 1);
                            var result = {};
                            result.pass = hasCorrectWrapper && hasCorrectContent;
                            if (result.pass) {
                                result.message = "Expected view to not have a loading view";
                            } else {
                                result.message = "Expected view have a loading view";
                            }
                            return result;
                        }
                    };
                },
                toHaveErrorView: function(util, customEqualityTesters) {
                    return {
                        compare: function(selector, options) {
                            options = customMatchers.setOptions(options);
                            var result = customMatchers.toHaveLoadingView(util, customEqualityTesters).compare(selector, options);
                            if (result.pass) {
                                var $wrapperElement = selector.find('>' + options.tagName.wrapper + ':last-of-type');
                                var $errorContainer = $wrapperElement.find('.infinite-scroll-error-message-container');
                                var hasErrorContainer = _.isEqual($errorContainer.length, 1);
                                var hasErrorMessage = _.contains($errorContainer.text(), 'Error loading records');
                                var hasRetryButton = _.isEqual($wrapperElement.find('button').length, 1);
                                result.pass = hasErrorContainer && hasErrorMessage && hasRetryButton;
                                if (result.pass) {
                                    result.message = "Expected view to not have an error view";
                                } else {
                                    result.message = "Expected view have an error view";
                                }
                                return result;
                            }
                            return result;
                        }
                    };
                },
                toHaveAllResultsView: function(util, customEqualityTesters) {
                    return {
                        compare: function(selector, options) {
                            options = customMatchers.setOptions(options);
                            var result = customMatchers.toHaveLoadingView(util, customEqualityTesters).compare(selector, options);
                            if (result.pass) {
                                var $wrapperElement = selector.find('>' + options.tagName.wrapper + ':last-of-type');
                                var hasAllResultsMessage = _.contains($wrapperElement.text(), 'records are displayed.');
                                result.pass = hasAllResultsMessage;
                                if (result.pass) {
                                    result.message = "Expected view to not have an all results message view";
                                } else {
                                    result.message = "Expected view have an all results message view";
                                }
                                return result;
                            }
                            return result;
                        }
                    };
                }
            };

            var testView;
            var $testEl;
            var collection;
            var $scrollingElement;
            var scrollTopPosition = 0;
            var FiveItemArray = [{ text: 'Item 5.1' }, { text: 'Item 5.2' }, { text: 'Item 5.3' }, { text: 'Item 5.4' }, { text: 'Item 5.5' }];
            var ThreeItemArray = [{ text: 'Item 3.1' }, { text: 'Item 3.2' }, { text: 'Item 3.3' }];
            var OneItemArray = [{ text: 'Item 1.1' }];

            var ChildView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{text}}'),
                attributes: {
                    'style': 'height: 10px;font-size: 8px;'
                }
            });

            var Collection = Backbone.Collection.extend({
                getNextPage: function() {},
                hasNextPage: function() {
                    return true;
                },
                getTotalItems: function() {
                    return this.length;
                },
                inProgress: false

            });

            var View = Backbone.Marionette.CompositeView.extend({
                template: Handlebars.compile('<div class="first-wrapping-element"><div class="second-wrapping-element" style="height: 30px; overflow-y: scroll;"></div></div>'),
                childViewContainer: '.second-wrapping-element',
                behaviors: {
                    InfiniteScroll: {
                        getCollection: function() {
                            return this.collection;
                        },
                        container: '.first-wrapping-element .second-wrapping-element',
                        events: 'fetch-rows-event',
                        scrollTriggerPoint: 9
                    }
                },
                childView: ChildView
            });

            var setUpCollectionSpies = function() {
                spyOn(collection, 'getNextPage');
                collection.trigger('sync');
            };

            var setUp = function(CompositeView, ViewCollection, itemsArray, behaviorOptions) {
                var ViewDef = CompositeView.extend({
                    behaviors: {
                        InfiniteScroll: _.defaultsDeep(behaviorOptions, CompositeView.prototype.behaviors.InfiniteScroll)
                    }
                });
                testView = new ViewDef({ collection: new ViewCollection(itemsArray) });
                testView.render();
                $('body').append(testView.$el);

                $testEl = testView.$el;
                $scrollingElement = $testEl.find(ViewDef.prototype.behaviors.InfiniteScroll.container);
                collection = testView.collection;
                setUpCollectionSpies();
            };

            afterEach(function() {
                if (!testView.isDestroyed)
                    testView.destroy(); //this calls destroy
                $('body').find(testView.$el).remove();
                $('body').find('.tooltip').remove();
            });
            beforeAll(function() {
                jasmine.addMatchers(customMatchers);
            });
            var moreThanOneItem = false;
            describe('with custom options for', function() {
                beforeEach(function() {
                    setUp(View, Collection, moreThanOneItem ? FiveItemArray : OneItemArray, {
                        tagName: {
                            wrapper: 'p',
                            content: 'span'
                        },
                        className: 'class-to-add-to-the-wrapping-message-element',
                        events: 'fetch-rows-event'
                    });
                    moreThanOneItem = true;
                });
                it('tagNames and classNames', function() {
                    expect($scrollingElement).toHaveLoadingView({
                        tagName: {
                            wrapper: 'p',
                            content: 'span'
                        },
                        className: 'class-to-add-to-the-wrapping-message-element'
                    });
                });
                it('events', function() {
                    expect($scrollingElement).not.toHaveLoadingView({
                        tagName: {
                            wrapper: 'p',
                            content: 'span'
                        },
                        className: 'class-to-add-to-the-wrapping-message-element'
                    });
                    $scrollingElement.scrollTop(40);
                    $scrollingElement.trigger('fetch-rows-event');
                    expect($scrollingElement).toHaveLoadingView({
                        tagName: {
                            wrapper: 'p',
                            content: 'span'
                        },
                        className: 'class-to-add-to-the-wrapping-message-element'
                    });
                });
            });

            describe('with view that has scrolling', function() {
                beforeEach(function() {
                    setUp(View, Collection, FiveItemArray, {});
                });

                it('container is scrollable', function() {
                    expect($scrollingElement[0].scrollHeight > $scrollingElement[0].clientHeight).toBe(true);
                });
                describe('when container is scrolled', function() {
                    beforeEach(function() {
                        scrollTopPosition = $scrollingElement.scrollTop() + scrollTopPosition + 10;
                        $scrollingElement.scrollTop(scrollTopPosition);
                        $scrollingElement.trigger('scroll.infinite');
                    });
                    it('trigger point is not hit on first scroll', function() {
                        expect($scrollingElement.scrollTop()).toEqual(10);
                        expect(collection.getNextPage).not.toHaveBeenCalled();
                    });
                    it('trigger point is hit on second scroll', function() {
                        expect($scrollingElement.scrollTop() >= 20).toBeTruthy();
                        expect(collection.getNextPage).toHaveBeenCalled();

                        expect($scrollingElement).toHaveLoadingView();
                    });
                    it('collection reset clears loading view', function() {
                        expect($scrollingElement).toHaveLoadingView();
                        collection.trigger('reset');
                        expect($scrollingElement).not.toHaveLoadingView();
                    });
                    it('collection fetch error clears loading view and add error view', function() {
                        expect($scrollingElement).toHaveLoadingView();
                        collection.trigger('page:fetch:error');
                        expect($scrollingElement).toHaveErrorView();
                    });
                    it('error view retry button adds loading view', function() {
                        collection.trigger('page:fetch:error');
                        expect($scrollingElement).toHaveErrorView();
                        $scrollingElement.find('button').click();
                        expect($scrollingElement).not.toHaveErrorView();
                        expect($scrollingElement).toHaveLoadingView();
                    });
                });
            });

            describe('with view that does not have enough items for scrolling', function() {
                beforeEach(function() {
                    setUp(View, Collection, OneItemArray, {});
                });
                it('container is not scrollable', function() {
                    expect($scrollingElement[0].scrollHeight > $scrollingElement[0].clientHeight).toBe(false);
                });
                it('behavior tries to fetch next page on start', function() {
                    expect(collection.getNextPage).toHaveBeenCalled();
                    expect($scrollingElement).toHaveLoadingView();
                });
            });

            describe('with view that does not have more items', function() {
                beforeEach(function() {
                    setUp(View, Collection.extend({
                        hasNextPage: function() {
                            return false;
                        }
                    }), OneItemArray, {});
                });
                it('behavior shows has all items message', function() {
                    expect(collection.getNextPage).not.toHaveBeenCalled();
                    expect($scrollingElement).toHaveAllResultsView();

                });
                it('behavior does not show loading on scroll', function() {
                    $scrollingElement.trigger('scroll.infinite');
                    expect(collection.getNextPage).not.toHaveBeenCalled();
                    expect($scrollingElement).toHaveAllResultsView();

                });
            });
        });
    });
