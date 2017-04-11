/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'handlebars', 'api/UIComponents', 'jasminejquery'],
    function ($, Backbone, Marionette, Handlebars) {

        var template;

        describe('The UI Components template helper', function () {

            afterEach(function() {
                $('#fixture').remove();
            });

            beforeEach(function () {
                $('body').append('<div id="fixture"></div>');
            });

            describe('has a button helper', function () {

                describe('that creates a button based on given properties', function(){

                    beforeEach(function(){
                        template = Handlebars.compile('{{ui-button "Test button" type="submit" title="custom title"' +
                        'classes="class1 class2" id="id1" icon="icon" state="active" size="xs" status="active"}}');
                        $('#fixture').append(template);
                    });

                    it('sets button text to provided', function () {
                        expect($('#fixture button').text().trim()).toBe('Test button');
                    });

                    it('sets button with title to specified title', function () {
                        expect($('#fixture button').attr('title')).toBe('custom title');
                    });

                    it('sets button with type set to specified type', function () {
                        expect($('#fixture button').attr('type')).toBe('submit');
                    });

                    it('sets button with classes set to specified classes', function () {
                        expect($('#fixture button')).toHaveClass("class1");
                        expect($('#fixture button')).toHaveClass("class2");
                    });

                    it('sets button id to specified id', function () {
                        expect($('#fixture button')).toHaveId("id1");
                    });

                    it('sets icon to specified icon', function () {
                        expect($('#fixture button i').length).toBe(1);
                        expect($('#fixture button i')).toHaveClass('icon');
                    });

                    it('sets btn state class to specified state', function () {
                        expect($('#fixture button')).toHaveClass('btn-active');
                    });

                    it('sets btn size class to specified size', function () {
                        expect($('#fixture button')).toHaveClass('btn-xs');
                    });

                });
            });

            describe('has a dropdown helper', function () {

                describe('that creates a dropdown based on given properties', function() {

                    beforeEach(function() {

                        // split dropdown
                        template = Handlebars.compile(
                            '{{ui-dropdown "Food" split=true icon="fa-list" id="food-menu" type="submit" items=\'[{"label": "Sub Item 1", "id": "item-1"},{"label": "Sub Item 2", "id": "item-2"}]\'}}'
                        );
                        $('#fixture').append(template);

                        // single dropdown
                        template = Handlebars.compile(
                            '{{ui-dropdown "Food" split=false icon="fa-list" id="food-menu" type="submit" items=\'[{"label": "Sub Item 1", "id": "item-1"},{"label": "Sub Item 2", "id": "item-2"}]\'}}'
                        );
                        $('#fixture').append(template);
                    });

                    it('sets dropdown text to provided', function() {
                        expect($('#fixture button')).toContainText('Food');
                    });

                    it('sets dropdown with title to configurable title', function() {
                        expect($('#fixture button').attr('title')).toBe('Press enter to Food');
                    });

                    it('sets dropdown to configurable type', function() {
                        expect($('#fixture button').attr('type')).toBe('submit');
                    });

                    it('sets button id to configurable id', function() {
                        expect($('#fixture button')).toHaveId("food-menu");
                    });

                    it('sets icon to configurable icon', function() {
                        expect($('#fixture button i:eq(0)').length).toBe(1);
                        expect($('#fixture button i:eq(1)')).toHaveClass('fa-list');
                    });

                    it('sets dropdown menu to contain items of configurable label and id', function() {
                        expect($('.dropdown-menu:eq(0) li').length).toBe(2);
                        expect($('.dropdown-menu:eq(0) li:eq(0)')).toHaveId('food-menu-item-1');
                        expect($('.dropdown-menu:eq(0) li:eq(0) a')).toContainText('Sub Item 1');
                        expect($('.dropdown-menu:eq(0) li:eq(1)')).toHaveId('food-menu-item-2');
                        expect($('.dropdown-menu:eq(0) li:eq(01) a')).toContainText('Sub Item 2');
                    });

                    it('sets dropdown to be configured with split button or single button ', function() {
                        expect($('#fixture .btn-group:eq(0) button').length).toBe(2);
                        expect($('#fixture .btn-group:eq(0) button')).toHaveClass('dropdown-toggle');

                        expect($('#fixture .btn-group:eq(1) button').length).toBe(1);
                        expect($('#fixture .btn-group:eq(1) button')).toHaveClass('dropdown-toggle');
                    });

                });
            });
        });
    });