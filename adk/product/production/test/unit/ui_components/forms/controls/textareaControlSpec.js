/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "handlebars", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function($, Handlebars, Backbone, Marionette, UI) {

        var $testPage, testPage;

        var textareaControlDefinition_1 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                title: "Enter message here",
                charCount: false
            },
            textareaControlDefinition_2 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                extraClasses: ["special-class-1", "special-class-2"],
                charCount: false
            },
            textareaControlDefinition_3 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                disabled: true,
                charCount: false
            },
            textareaControlDefinition_4 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                required: true,
                charCount: false
            },
            textareaControlDefinition_5 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                rows: 5,
                cols: 3,
                charCount: false
            },
            textareaControlDefinition_6 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                maxlength: 20,
                charCount: false
            },
            textareaControlDefinition_7 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                helpMessage: "This is a help message.",
                charCount: false
            },
            textareaControlDefinition_8 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                title: "Enter message here",
                srOnlyLabel: true,
                charCount: false
            },
            textareaControlDefinition_9 = {
                control: "textarea",
                name: "textareaValue",
                label: "textarea label",
                placeholder: "Enter text...",
                title: "Enter message here"
            },
            formModel_1 = new Backbone.Model(),
            formModel_2 = new Backbone.Model({
                textareaValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit ex purus, quis cursus augue tempor vitae. Integer commodo tincidunt.'
            }),
            formModel_3 = new Backbone.Model({
                textareaValue: 'Some starting text'
            }),
            FormModelClean = Backbone.Model;

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

        describe("A textarea control", function() {
            afterEach(function() {
                testPage.remove();
            });

            describe("basic", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_1]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct wrapper", function() {
                    expect($testPage.find('.control').length).toBe(1);
                });
                it("contains correct label", function() {
                    expect($testPage.find('label').length).toBe(1);
                    expect($testPage.find('label')).toHaveText('textarea label');
                    expect($testPage.find('label')).toHaveAttr('for', 'textareaValue');
                });
                it("contains correct title", function() {
                    expect($testPage.find('textarea').length).toBe(1);
                    expect($testPage.find('textarea')).toHaveAttr('title', 'Enter message here');
                });
                it("contains correct initial text", function() {
                    expect($testPage.find('textarea')).toBeEmpty();
                });
                it("updates model after value change", function() {
                    $testPage.find('textarea').text('New Text String').trigger('input');
                    expect(testPage.ViewToTest.model.get('textareaValue')).toBe('New Text String');
                });
                it("contains default maxlength", function() {
                    expect($testPage.find('textarea')).toHaveAttr('maxlength', '200');
                });
                it("contains correct id", function() {
                    expect($testPage.find('textarea')).toHaveId('textareaValue');
                });
                it("contains correct class", function() {
                    expect($testPage.find('textarea')).toHaveClass('form-control');
                });
            });
            describe("with extra classes", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_2]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("has correct classes", function() {
                    expect($testPage.find('div')).toHaveClass("special-class-1");
                    expect($testPage.find('div')).toHaveClass("special-class-2");
                });
                it("textarea does not have the same classes", function() {
                    expect($testPage.find('textarea')).not.toHaveClass("special-class-1");
                    expect($testPage.find('textarea')).not.toHaveClass("special-class-2");
                });
            });
            describe("disabled", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_3]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("has correct attribute", function() {
                    expect($testPage.find('textarea')).toBeDisabled();
                });
            });
            describe("required", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_4]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("has correct attribute", function() {
                    expect($testPage.find('textarea')).toHaveAttr('required', 'required');
                });
            });
            describe("set cols and rows", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_5]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("has correct attribute", function() {
                    expect($testPage.find('textarea')).toHaveAttr('cols', '3');
                    expect($testPage.find('textarea')).toHaveAttr('rows', '5');
                });
            });
            describe("set maxlength", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_6]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("has correct attribute", function() {
                    expect($testPage.find('textarea')).toHaveAttr('maxlength', '20');
                });
            });
            describe("with help message", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_7]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it("help message is in a span with proper class", function() {
                    expect($testPage.find('span').length).toBe(1);
                    expect($testPage.find('span')).toHaveClass('help-block');
                });
                it("has help message", function() {
                    expect($testPage.find('span.help-block')).toHaveText('This is a help message.');
                });
            });
            describe("with initial value", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_2,
                            fields: [textareaControlDefinition_1]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it("initial model value set correctly", function() {

                    expect($testPage.find('textarea')).toHaveText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit ex purus, quis cursus augue tempor vitae. Integer commodo tincidunt.');
                });
            });
            describe("basic with sr-only label", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_8]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct label", function() {
                    expect($testPage.find('label').length).toBe(1);
                    expect($testPage.find('label')).toHaveText('textarea label');
                    expect($testPage.find('label')).toHaveAttr('for', 'textareaValue');
                    expect($testPage.find('label')).toHaveClass('sr-only');
                });
            });
            describe("with error", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [textareaControlDefinition_1]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it("contains error", function() {
                    testPage.ViewToTest.model.errorModel.set('textareaValue', 'Example error');
                    expect($testPage.find('span.error')).toExist();
                    expect($testPage.find('span.error')).toHaveLength(1);
                    expect($testPage.find('span.error')).toHaveText('Example error');
                });
                it("error is removed", function() {
                    testPage.ViewToTest.model.errorModel.set('textareaValue', 'Example error');
                    expect($testPage.find('textarea')).toHaveLength(1);
                    expect($testPage.find('span.error')).toHaveLength(1);
                    expect($testPage.find('.control.textarea-control')).toHaveClass('has-error');
                    expect($testPage.find('span.error')).toHaveText('Example error');
                    $testPage.find('textarea').val('Post error text').trigger('input');
                    expect($testPage.find('span.error')).not.toExist();
                    expect($testPage.find('.control.textarea-control')).not.toHaveClass('has-error');
                });
            });
            describe("using trigger to dynamically change attributes", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: new FormModelClean(),
                            fields: [textareaControlDefinition_1]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("hidden", function() {
                    $testPage.find('.textareaValue').trigger("control:hidden", true);
                    expect($testPage.find('.textareaValue')).toHaveClass('hidden');
                    $testPage.find('.textareaValue').trigger("control:hidden", false);
                    expect($testPage.find('.textareaValue')).not.toHaveClass('hidden');

                });
                it("placeholder", function() {
                    $testPage.find('.textareaValue').trigger("control:placeholder", 'new place');
                    expect($testPage.find('textarea')).toHaveAttr("placeholder", 'new place');
                    $testPage.find('.textareaValue').trigger("control:placeholder", '');
                    expect($testPage.find('textarea')).not.toHaveAttr('placeholder', 'new place');
                });
                it("rows", function() {
                    $testPage.find('.textareaValue').trigger("control:rows", 4);
                    expect($testPage.find('textarea')).toHaveAttr('rows', '4');
                    $testPage.find('.textareaValue').trigger("control:rows", 7);
                    expect($testPage.find('textarea')).toHaveAttr('rows', '7');
                });
                it("updates text and model value with control:insert:string", function() {
                    expect($testPage.find('.textareaValue textarea')).toHaveValue('');
                    $testPage.find('.textareaValue textarea').val("starting text").trigger('input');
                    expect($testPage.find('.textareaValue textarea')).toHaveValue('starting text');
                    expect(testPage.ViewToTest.model.get('textareaValue')).toBe('starting text');
                    $testPage.find('.textareaValue textarea').trigger('control:insert:string', ' added text!');
                    expect($testPage.find('.textareaValue textarea')).toHaveValue(' added text!starting text');
                    expect(testPage.ViewToTest.model.get('textareaValue')).toBe(' added text!starting text');
                });
                it("updates text and model value with control:insert:string with prependWith and appendWith", function() {
                    expect($testPage.find('.textareaValue textarea')).toHaveValue('');
                    $testPage.find('.textareaValue textarea').val("starting text").trigger('input');
                    expect($testPage.find('.textareaValue textarea')).toHaveValue('starting text');
                    expect(testPage.ViewToTest.model.get('textareaValue')).toBe('starting text');
                    $testPage.find('.textareaValue textarea').trigger('control:insert:string', [' added text!', {
                        prependWith: "---",
                        appendWith: " :-) "
                    }]);
                    expect($testPage.find('.textareaValue textarea')).toHaveValue('--- added text! :-) starting text');
                    expect(testPage.ViewToTest.model.get('textareaValue')).toBe('--- added text! :-) starting text');
                });
            });
            describe("with char count enabled", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: new FormModelClean(),
                            fields: [_.defaults({
                                charCount: true,
                                maxlength: 60
                            }, textareaControlDefinition_9)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it("contains correct span class", function() {
                    expect($testPage.find('.char-count-region')).toHaveLength(1);
                    expect($testPage.find('.char-count-region span')).toHaveLength(1);
                });
                it("shows correct count when initialized without a value", function() {
                    expect($testPage.find('.char-count-region span')).toContainText("60");
                });
                it("shows correct count when initialized with a value", function() {
                    testPage.remove();
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_3,
                            fields: [_.defaults({
                                charCount: true,
                                maxlength: 60
                            }, textareaControlDefinition_9)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                    expect($testPage.find('.char-count-region span')).toContainText("42");
                });
                it("shows correct count when input is entered", function() {
                    var string = 'Test string';
                    $testPage.find('textarea').val(string);
                    $testPage.find('textarea').trigger('input');
                    expect($testPage.find('.char-count-region span')).toContainText($testPage.find('textarea').attr('maxlength') - string.length);
                });
                it("shows correct count when model value is updated", function() {
                    var string = 'New text from model!';
                    testPage.ViewToTest.model.set('textareaValue', string);
                    expect($testPage.find('.char-count-region span')).toContainText($testPage.find('textarea').attr('maxlength') - string.length);
                });
                it("displays character count text by default", function() {
                    testPage.remove();
                    testPage = new TestView({
                        view: new UI.Form({
                            model: new FormModelClean(),
                            fields: [_.defaults({
                                maxlength: 60
                            }, textareaControlDefinition_9)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                    expect($testPage.find('.char-count-region')).toHaveLength(1);
                    expect($testPage.find('.char-count-region span')).toHaveLength(1);
                });
                it("does not display character count text if maxlength is -1 (for unlimited)", function() {
                    testPage.remove();
                    testPage = new TestView({
                        view: new UI.Form({
                            model: new FormModelClean(),
                            fields: [_.defaults({
                                charCount: true,
                                maxlength: -1
                            }, textareaControlDefinition_9)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                    expect($testPage.find('.char-count-region')).toHaveLength(0);
                    expect($testPage.find('.char-count-region span')).toHaveLength(0);
                });
            });
        });
    });
