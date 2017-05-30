/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "handlebars", "backbone", "marionette", "main/UILibrary", "api/UIComponents", "jasminejquery"],
    function($, Handlebars, Backbone, Marionette, UI) {

        describe("A searchbar control", function() {
            var $form, form, $control, $testPage, testPage;

            var searchbarControlDefinition_1 = {
                    control: 'searchbar',
                    name: 'test1',
                    placeholder: 'Enter Test 1 Text Here',
                    label: 'Test 1',
                    buttonOptions: {
                        type: 'submit',
                        title: 'Press enter to view results.'
                    },
                    type: 'search',
                    extraClasses: ['extra-class-name'],
                    title: 'Enter test 1 text'
                },
                formModel_1 = new Backbone.Model(),
                formModel_2 = new Backbone.Model({
                    test1: 'Initial Search Value'
                });

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

            afterEach(function() {
                testPage.remove();
            });

            describe("when rendered,", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_1,
                        fields: [searchbarControlDefinition_1]
                    });

                    testPage = new TestView({
                        view: form
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);

                    $form = form.$el;
                    $control = $form.find('.control.searchbar-control');
                });

                it("follows control standard for wrapping HTML element", function() {
                    expect($control).toExist();
                    expect($control).toHaveClass('test1');
                });
                it("contains correct HTML formating structure", function() {
                    expect($control.find('> .row')).toExist();
                    expect($control.find('> .row > .col-xs-12')).toExist();
                    expect($control.find('> .row > .col-xs-12 > .input-group')).toExist();
                });
                describe("has a label", function() {
                    var $label;
                    beforeEach(function() {
                        $label = $control.find('.input-group > label');
                    });

                    it("element present", function() {
                        expect($label).toExist();
                    });
                    it("with correct value", function() {
                        expect($label).toContainText('Test 1');
                    });
                    it("with correct for attribute", function() {
                        expect($label.attr('for')).toContain('test1');
                    });
                });
                describe("has an input", function() {
                    var $input;
                    afterEach(function() {
                        form.model.clear();
                    });
                    beforeEach(function() {
                        $input = $control.find('.input-group > input:text');
                    });

                    it("element present", function() {
                        expect($input).toExist();
                    });
                    it("with correct placeholder", function() {
                        expect($input).toHaveAttr('placeholder', 'Enter Test 1 Text Here');
                    });
                    it("with correct title", function() {
                        expect($input).toHaveAttr('title', 'Enter test 1 text');
                    });
                    it("with correct initial value", function() {
                        expect($input).toHaveValue('');
                    });
                    it("with correct id", function() {
                        expect($input.attr('id')).toContain('test1');
                    });
                    it("that updates the model after value change", function() {
                        $input.val('Test Input String!').trigger('change');
                        expect($input).toHaveValue('Test Input String!');
                        expect(form.model.get('test1')).toBe("Test Input String!");
                    });
                    it("update:config", function() {
                        $form.find('.test1').trigger("control:update:config", {
                            hidden: true
                        });
                        expect($form.find('.test1')).toHaveClass('hidden');
                        $form.find('.test1').trigger("control:update:config", {
                            hidden: false
                        });
                        expect($form.find('.test1')).not.toHaveClass('hidden');
                    });
                });
                describe("has an clear input button", function() {
                    var $clearButton;
                    afterEach(function() {
                        form.model.clear();
                    });
                    beforeEach(function() {
                        $clearButton = $control.find('.input-group > .input-group-addon > button.clear-input-btn');
                    });

                    it("element present", function() {
                        expect($clearButton).toExist();
                    });
                    it("with correct type", function() {
                        expect($clearButton).toHaveAttr('type', 'button');
                    });
                    it("with correct title", function() {
                        expect($clearButton).toHaveAttr('title', 'Press enter to clear search text');
                    });
                    it("with correct classes", function() {
                        expect($clearButton).toHaveClass('btn');
                        expect($clearButton).toHaveClass('btn-icon');
                        expect($clearButton).toHaveClass('btn-sm');
                        expect($clearButton).toHaveClass('color-grey-darkest');
                    });
                    it("that has the proper icon", function() {
                        expect($clearButton).toContainElement('i.fa.fa-times[aria-hidden="true"]');
                        expect($clearButton).toContainElement('span.sr-only');
                    });
                    it("that is hidden initially", function() {
                        expect($clearButton).toHaveClass('hidden');
                    });
                    it("that is un-hidden when user enters a value", function() {
                        expect($clearButton).toHaveClass('hidden');
                        $control.find('.input-group > input:text').val('a').trigger('keyup');
                        expect($clearButton).not.toHaveClass('hidden');
                    });
                    it("that clears the model value when clicked", function() {
                        expect($clearButton).toHaveClass('hidden');
                        $control.find('.input-group > input:text').val('a').trigger('keyup');
                        expect($clearButton).not.toHaveClass('hidden');
                        $clearButton.click();
                        expect($clearButton).toHaveClass('hidden');
                        expect(form.model.get('test1')).toBe("");
                        expect($control.find('.input-group > input:text').val()).toBe("");
                    });
                });
                describe("has an submit button", function() {
                    var $submitButton;
                    afterEach(function() {
                        form.model.clear();
                    });
                    beforeEach(function() {
                        $submitButton = $control.find('.input-group > .input-group-addon > button.text-search');
                    });

                    it("element present", function() {
                        expect($submitButton).toExist();
                    });
                    it("with correct type", function() {
                        expect($submitButton).toHaveAttr('type', 'submit');
                    });
                    it("with correct title", function() {
                        expect($submitButton).toHaveAttr('title', 'Press enter to view results.');
                    });
                    it("with correct classes", function() {
                        expect($submitButton).toHaveClass('btn');
                        expect($submitButton).toHaveClass('btn-sm');
                        expect($submitButton).toHaveClass('btn-primary');
                    });
                    it("that has the proper icon", function() {
                        expect($submitButton).toContainElement('i.fa.fa-search[aria-hidden="true"]');
                        expect($submitButton).toContainElement('span.sr-only');
                    });
                    it("that is disabled initially", function() {
                        expect($submitButton).toBeDisabled();
                    });
                    it("that is un-disabled when user enters a single character", function() {
                        expect($submitButton).toBeDisabled();
                        $control.find('.input-group > input:text').val('a').trigger('keyup');
                        expect($submitButton).not.toBeDisabled();
                    });
                });
            });
        });
    });