/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function($, Backbone, Marionette, UI) {

        var $form, form;

        var puppetFormDefinition = {
            control: "input",
            name: "inputValue",
            label: "input label",
            title: "Please enter a value",
            placeholder: "Enter text..."
        };

        var formModel = new Backbone.Model();

        describe("Puppetform", function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [puppetFormDefinition]
                });

                $form = form.render().$el;

                $("body").append($form);
            });

            afterEach(function() {
                form.remove();
            });
            it("has form tag", function() {
                expect(form.tagName).toBe('form');
            });
            it("has required sr-only tag", function() {
                expect($form.find('p')).toHaveClass('sr-only');
                expect($form.find('p')).toHaveText('* indicates a required field. Tab to enter form.');
            });
        });

    });