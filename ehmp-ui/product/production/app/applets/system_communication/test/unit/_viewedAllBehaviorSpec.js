/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn, afterEach */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'underscore', 'backbone', 'marionette', 'app/applets/system_communication/viewedAllBehavior'],
    function($, _, Backbone, Marionette, ViewedAllBehavior) {
        describe('A "viewed all" behavior', function() {

            var testView;
            var $scrollingElement;
            var FiveItemArray = [{ text: 'Item 5.1' }, { text: 'Item 5.2' }, { text: 'Item 5.3' }, { text: 'Item 5.4' }, { text: 'Item 5.5' }];
            var OneItemArray = [{ text: 'Item 1.1' }];

            var ChildView = Backbone.Marionette.ItemView.extend({
                template: _.template('{{text}}'),
                attributes: {
                    'style': 'height: 10px;font-size: 8px;'
                }
            });

            var View = Backbone.Marionette.CompositeView.extend({
                template: _.template('<div class="first-wrapping-element"><div class="second-wrapping-element" style="height: 30px; overflow-y: scroll;"></div></div>'),
                childViewContainer: '.second-wrapping-element',
                behaviors: {
                    ViewedAllBehavior: {
                        behaviorClass: ViewedAllBehavior,
                        container: '.first-wrapping-element .second-wrapping-element'
                    }
                },
                childView: ChildView,
                events: {
                    'viewed-all': function() {
                        this.onViewedAll();
                    }
                },
                onViewedAll: _.noop
            });

            var setUp = function(CompositeView, itemsArray, behaviorOptions) {
                var ViewDef = CompositeView.extend({
                    behaviors: {
                        ViewedAllBehavior: _.defaultsDeep(behaviorOptions, CompositeView.prototype.behaviors.ViewedAllBehavior)
                    }
                });
                testView = new ViewDef({ collection: new Backbone.Collection(itemsArray) });
                testView.render();
                $('body').append(testView.$el);
                var $testEl = testView.$el;
                $scrollingElement = $testEl.find(ViewDef.prototype.behaviors.ViewedAllBehavior.container);
                spyOn(testView, 'onViewedAll');
                Marionette.triggerMethodOn(testView, 'attach', testView, testView);
            };

            afterEach(function() {
                if (!testView.isDestroyed)
                    testView.destroy(); //this calls destroy
                $('body').find(testView.$el).remove();
            });

            var moreThanOneItem = false;
            describe('with no custom event', function() {
                beforeEach(function() {
                    setUp(View, moreThanOneItem ? FiveItemArray : OneItemArray, {});
                    moreThanOneItem = true;
                });
                it('is triggered onAttach becuase all item(s) are visible at start', function() {
                    expect(testView.onViewedAll).toHaveBeenCalled();
                });
                it('is not triggered onAttach becuase not all item(s) are visible at start', function() {
                    expect(testView.onViewedAll).not.toHaveBeenCalled();
                    $scrollingElement.scrollTop(50);
                    $scrollingElement.trigger('scroll');
                    expect(testView.onViewedAll).toHaveBeenCalled();
                });
            });

            var moreThanOneItem2 = false;
            describe('with custom event', function() {
                beforeEach(function() {
                    setUp(View, moreThanOneItem2 ? FiveItemArray : OneItemArray, { event: 'view-shown' });
                    moreThanOneItem2 = true;
                });
                it('is triggered after event is fired becuase all item(s) are visible at start', function() {
                    expect(testView.onViewedAll).not.toHaveBeenCalled();
                    testView.trigger('view-shown');
                    expect(testView.onViewedAll).toHaveBeenCalled();
                });
                it('is not triggered after event is fired becuase not all item(s) are visible at start', function() {
                    expect(testView.onViewedAll).not.toHaveBeenCalled();
                    testView.trigger('view-shown');
                    expect(testView.onViewedAll).not.toHaveBeenCalled();
                    $scrollingElement.scrollTop(50);
                    $scrollingElement.trigger('scroll');
                    expect(testView.onViewedAll).toHaveBeenCalled();
                });
            });
        });
    });
