/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'main/ui_components/components', 'api/UIComponents', 'jasminejquery'],
    function($, Backbone, Marionette, UI) {

        var $form, form;

        var searchBarDefinition = {
            name: 'searchBar',
            placeholder: 'Search Record',
            title: 'This is a searchbar',
            size: '12',
            extraClasses: ['bloody', 'dog'],
            control: 'searchbar'
        };

        var formModel = new Backbone.Model();

        describe('A searchbar', function() {
            afterEach(function() {
                form.destroy();
            });
            describe('basic', function() {
                var mockSubmit = null;
                beforeEach(function() {

                    mockSubmit = jasmine.createSpy('Mock Submit');

                    form = new UI.Form({
                        model: formModel,
                        fields: [searchBarDefinition],
                        events: {
                            'submit': mockSubmit
                        }
                    });

                    $form = form.render().$el;
                    $('body').append($form);

                });

                it('contains an input field', function() {
                    expect($form.find('input').length).toBe(1);
                });

                it('contains a title on the input field', function() {
                    expect($form.find('input')).toHaveAttr('title', 'This is a searchbar');
                });

                it('contains a placeholder on the input field', function() {
                    expect($form.find('input')).toHaveAttr('placeholder', 'Search Record');
                });

                it('contains a button', function() {
                    expect($form.find('button').length).toBe(2);
                });

                it('contains a button with a title', function() {
                    expect($form.find('button')[0]).toHaveAttr('title', 'Press enter to clear search text');
                });

                it('contains a button with a title', function() {
                    expect($form.find('button')[1]).toHaveAttr('title', 'Press enter to search, then view results below');
                });

                it('contains a button with an icon', function() {
                    expect($form.find('button i').length).toBe(2);
                });

                it('contains a button that fires a submit handler if it is pressed', function() {
                    expect(mockSubmit).not.toHaveBeenCalled();
                    $form.find('button').trigger('submit');
                    expect(mockSubmit).toHaveBeenCalled();
                    expect(mockSubmit.calls.count()).toEqual(2);
                });


                it('sets value in model when input is changed', function() {
                    $form.find('input').val('test');
                    $form.find('input').trigger('change');
                    expect(form.model).toBe(formModel);
                    expect(form.model.get('searchBar')).toBe('test');
                });
            });
        });
    });
