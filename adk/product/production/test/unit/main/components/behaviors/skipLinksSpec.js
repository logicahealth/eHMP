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
    'main/accessibility/components'
], function(
    $,
    Handlebars,
    Backbone,
    Marionette,
    Behaviors,
    Accessibility
) {
    describe('The SkipLinks behavior', function() {
        var dropdownContainer; // persistent throughout tests
        var target; // re-created every test
        var testView;
        var DropdownContainer = Marionette.LayoutView.extend({
            template: Handlebars.compile('<div class="dropdown-region"></div>'),
            regions: {
                DropdownRegion: '.dropdown-region'
            },
            onRender: function() {
                this.showChildView('DropdownRegion', new Accessibility.SkipLinkDropdown({
                    collection: Accessibility.SkipLinks
                }));
            }
        });

        var TargetView = Marionette.LayoutView.extend({
            template: Handlebars.compile(
                '<div class="target-element-1"></div>' +
                '<div class="target-element-2"><button class="should-get-focus"></button></div>'
            ),
            behaviors: {
                SkipLinks: {
                    items: [{
                        label: 'Skip Link 1',
                        element: function() {
                            return this.$('.target-element-1');
                        },
                        rank: 1
                    }, {
                        label: 'Skip Link 2',
                        element: function() {
                            return this.$('.target-element-2');
                        },
                        rank: 0,
                        focusFirstTabbable: true
                    }]
                }
            }
        });
        var TestView = Marionette.LayoutView.extend({
            el: '.test-view-container',
            template: Handlebars.compile(
                '<div class="dropdown-parent-region"></div>' +
                '<div class="target-parent-region"></div>'
            ),
            regions: {
                DropdownRegion: '.dropdown-parent-region',
                TargetRegion: '.target-parent-region'
            }
        });
        beforeAll(function() {
            $('body').append('<div class="test-view-container"></div>');
            testView = new TestView();
            testView.render();
            dropdownContainer = new DropdownContainer();
            testView.showChildView('DropdownRegion', dropdownContainer);
        });
        beforeEach(function() {
            target = new TargetView();
            testView.showChildView('TargetRegion', target);
        });
        afterEach(function() {
            target.destroy();
        });
        afterAll(function() {
            testView.destroy();
            $('body > .test-view-container').remove();
        });
        it('displays items in dropdown ul and items behave correctly', function(done) {
            var link1Text = 'Skip Link 1';
            var link2Text = 'Skip Link 2';
            expect(target.$('.target-element-2')).toHaveAttr('aria-label', link2Text);
            expect(target.$('.target-element-1')).toHaveAttr('aria-label', link1Text);
            dropdownContainer.$('.dropdown button').focus().click();
            dropdownContainer.$('.dropdown').one('dropdown.shown', function() {
                expect($('.dropdown-menu ul')).toHaveLength(1);
                expect($('.dropdown-menu ul li')).toHaveLength(2);
                // 2 should be first due to higher rank
                expect($('.dropdown-menu ul li:first a')).toHaveText(link2Text);
                expect($('.dropdown-menu ul li:last a')).toHaveText(link1Text);
                expect(target.$('.target-element-2')).not.toHaveClass('skip-link-navigation-highlight');
                expect(target.$('.target-element-1')).not.toHaveClass('skip-link-navigation-highlight');
                $('.dropdown-menu ul li:first a').focus();
                expect(target.$('.target-element-2')).toHaveClass('skip-link-navigation-highlight');
                expect(target.$('.target-element-1')).not.toHaveClass('skip-link-navigation-highlight');
                $('.dropdown-menu ul li:last a').focus();
                expect(target.$('.target-element-1')).toHaveClass('skip-link-navigation-highlight');
                expect(target.$('.target-element-2')).not.toHaveClass('skip-link-navigation-highlight');
                $('.dropdown-menu ul li:last a').focus().click();
                expect(target.$('.target-element-1')).toBeFocused();
                expect(target.$('.target-element-2')).not.toBeFocused();
                dropdownContainer.$('.dropdown button').focus().click();
                dropdownContainer.$('.dropdown').one('dropdown.shown', function() {
                    $('.dropdown-menu ul li:first a').focus().click();
                    expect(target.$('.target-element-1')).not.toBeFocused();
                    expect(target.$('.target-element-2')).not.toBeFocused();
                    expect(target.$('.target-element-2 .should-get-focus')).toBeFocused();
                    done();
                });
            })
        });
    });
});
