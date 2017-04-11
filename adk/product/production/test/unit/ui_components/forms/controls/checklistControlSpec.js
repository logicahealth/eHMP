/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "handlebars", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function($, Handlebars, Backbone, Marionette, UI) {

        var $form, form,
            checklistControlDefinition_1 = {
                name: "checklistValue",
                label: "checklist label",
                control: "checklist"
            },
            checklistControlDefinition_2 = { //used to test collection option
                name: "checklistValue",
                label: "checklist label",
                control: "checklist",
                collection: new Backbone.Collection([{
                    name: 'first-thing',
                    label: 'First Thing',
                    value: false
                }, {
                    name: 'second-thing',
                    label: 'Second Thing',
                    value: false,
                    disabled: true
                }, {
                    name: 'third-thing',
                    label: 'Third Thing',
                    value: undefined
                }])
            },
            formModel_1 = new Backbone.Model({
                checklistValue: new Backbone.Collection([{
                    name: 'first-thing',
                    label: 'First Thing',
                    value: false
                }, {
                    name: 'second-thing',
                    label: 'Second Thing',
                    value: false,
                    disabled: true
                }, {
                    name: 'third-thing',
                    label: 'Third Thing',
                    value: undefined
                }])
            }),
            formModel_2 = new Backbone.Model({ //used to test attributeMapping option
                checklistValue: new Backbone.Collection([{
                    itemName: 'first-thing',
                    itemLabel: 'First Thing',
                    itemValue: true
                }, {
                    itemName: 'second-thing',
                    itemLabel: 'Second Thing',
                    itemValue: false,
                    disabled: true
                }, {
                    itemName: 'third-thing',
                    itemLabel: 'Third Thing',
                    itemValue: undefined
                }])
            }),
            formModel_3 = new Backbone.Model({ //used to test itemTemplate option
                checklistValue: new Backbone.Collection([{
                    name: 'first-thing',
                    label: 'First Thing',
                    value: false,
                    time: '00:01'
                }, {
                    name: 'second-thing',
                    label: 'Second Thing',
                    value: false,
                    disabled: true
                }, {
                    name: 'third-thing',
                    label: 'Third Thing',
                    value: undefined,
                    time: '00:03'
                }])
            }),
            formModel_4 = new Backbone.Model({ //used to test selectedCountName option
                checklistValue: new Backbone.Collection([{
                    name: 'first-thing',
                    label: 'First Thing',
                    value: true
                }, {
                    name: 'second-thing',
                    label: 'Second Thing',
                    value: true,
                    disabled: true
                }, {
                    name: 'third-thing',
                    label: 'Third Thing',
                    value: undefined
                }])
            });

        describe("A checklist control", function() {
            afterEach(function() {
                form.remove();
            });

            describe("with basic functionality", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_1,
                        fields: [checklistControlDefinition_1]
                    });
                    $form = form.render().$el;
                    $("body").append($form);
                });

                it("contains correct wrapper", function() {
                    expect($form.find('.checklistValue').length).toBe(1);
                });
                it("contains correct label", function() {
                    expect($form.find('legend').length).toBe(1);
                    expect($form.find('legend')).toHaveText('checklist label');
                });
                it("contains correct initial value", function() {
                    expect($form.find('input:checkbox')).not.toBeChecked();
                });
                it("contains correct amount of checkboxes", function() {
                    expect($form.find('.childView-container .control').length).toBe(3);
                });
                it("updates model after value change", function() {
                    $form.find('#checklistValue-first-thing').click().trigger('change');
                    expect($form.find('#checklistValue-first-thing')).toBeChecked();
                    expect($form.find('#checklistValue-second-thing')).not.toBeChecked();
                    expect($form.find('#checklistValue-third-thing')).not.toBeChecked();

                    $form.find('#checklistValue-second-thing').click().trigger('change');
                    expect($form.find('#checklistValue-second-thing')).not.toBeChecked();

                    $form.find('#checklistValue-third-thing').click().trigger('change');
                    expect($form.find('#checklistValue-third-thing')).toBeChecked();

                    expect(form.model.get('checklistValue').models[0].get('value')).toBe(true);
                    expect(form.model.get('checklistValue').models[1].get('value')).toBe(false);
                    expect(form.model.get('checklistValue').models[2].get('value')).toBe(true);
                });
                it("contains correct class", function() {
                    expect($form.find('fieldset')).toHaveClass('checklistValue');
                });
                it("has correct attribute on disabled items", function() {
                    expect($form.find('#checklistValue-second-thing')).toBeDisabled();
                });
                it("displays error message", function() {
                    form.model.errorModel.set('checklistValue', 'Example error');
                    expect($form.find('span.error')).toExist();
                    expect($form.find('span.error')).toHaveText('Example error');
                });
                it("error message is removed properly", function() {
                    expect($form.find('span.error')).toHaveText('Example error');
                    $form.find('#checklistValue-first-thing').click().trigger('change');
                    expect($form.find('span.error')).not.toExist();
                });
            });
            describe("with collection option", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: new Backbone.Model(),
                        fields: [checklistControlDefinition_2]
                    });
                    $form = form.render().$el;
                    $("body").append($form);
                });
                it("initial model value set correctly", function() {
                    expect($form.find('#checklistValue-first-thing')).toExist();
                    expect($form.find('#checklistValue-second-thing')).toExist();
                    expect($form.find('#checklistValue-third-thing')).toExist();
                });
                it("has correct attribute on disabled items", function() {
                    expect($form.find('#checklistValue-second-thing')).toBeDisabled();
                });
            });
            describe("with attributeMapping option", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_2,
                        fields: [_.defaults({
                            attributeMapping: {
                                unique: 'itemName',
                                value: 'itemValue',
                                label: 'itemLabel'
                            }
                        }, checklistControlDefinition_1)]
                    });
                    $form = form.render().$el;
                    $("body").append($form);
                });
                it("initial model value set correctly", function() {
                    expect($form.find('#checklistValue-first-thing')).toExist();
                    expect($form.find('#checklistValue-second-thing')).toExist();
                    expect($form.find('#checklistValue-third-thing')).toExist();
                });
                it("has correct attribute on disabled items", function() {
                    expect($form.find('#checklistValue-second-thing')).toBeDisabled();
                });
            });
            describe("with srOnlyLabel option", function() {
                describe("value = true", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                srOnlyLabel: true
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });

                    it("legend has correct class", function() {
                        expect($form.find('legend')).toHaveClass("sr-only");
                    });
                });
                describe("value = false", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                srOnlyLabel: false
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });

                    it("legend has correct class", function() {
                        expect($form.find('legend')).not.toHaveClass("sr-only");
                    });
                });
                describe("value = undefined", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                srOnlyLabel: undefined
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });

                    it("legend has correct class", function() {
                        expect($form.find('legend')).not.toHaveClass("sr-only");
                    });
                });
            });
            describe("with extraClasses option", function() {
                describe("value = ['class1', 'class2']", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                extraClasses: ["class1", "class2"]
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("fieldset tag has correct classes", function() {
                        expect($form.find('fieldset')).toHaveClass("class1");
                        expect($form.find('fieldset')).toHaveClass("class2");
                    });
                    it("input does not contain the extra classes", function() {
                        expect($form.find('input:checkbox')).not.toHaveClass("class1");
                        expect($form.find('input:checkbox')).not.toHaveClass("class2");
                    });
                });
                describe("value = undefined", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                extraClasses: undefined
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("fieldset tag has correct classes", function() {
                        expect($form.find('fieldset')).toHaveProp("class", "control form-group checklist-control checklistValue");
                    });
                    it("input does not contain the extra classes", function() {
                        expect($form.find('input:checkbox')).toHaveProp("class", "");
                    });
                });
                describe("value = 'special-class'", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                                extraClasses: 'special-class'
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("fieldset tag has correct classes", function() {
                        expect($form.find('fieldset')).toHaveClass("special-class");
                    });
                    it("input does not contain the extra classes", function() {
                        expect($form.find('input:checkbox')).not.toHaveClass("special-class");
                    });
                });
            });
            describe("with itemTemplate option", function() {
                describe("value = '<strong>{{label}}</strong>{{#if time}} - <span class='time-taken'>{{time}}</span>{{/if}}'", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_3,
                            fields: [_.defaults({
                                itemTemplate: "<strong>{{label}}</strong>{{#if time}} - <span class='time-taken'>{{time}}</span>{{/if}}"
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("items use correct template", function() {
                        expect($form.find('.checkbox label strong')).toExist();
                        expect($form.find('.checkbox label strong').length).toBe(3);
                    });
                    it("items display extra field values", function() {
                        expect($form.find('.checkbox label .time-taken')).toContainText('00:');
                        expect($form.find('.checkbox label .time-taken').length).toBe(2);
                    });
                });
                describe("value = Handlebars.compile('<strong>{{label}}</strong>{{#if time}} - <span class='time-taken'>{{time}}</span>{{/if}}')", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_3,
                            fields: [_.defaults({
                                itemTemplate: Handlebars.compile("<strong>{{label}}</strong>{{#if time}} - <span class='time-taken'>{{time}}</span>{{/if}}")
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("items use correct template", function() {
                        expect($form.find('.checkbox label strong')).toExist();
                        expect($form.find('.checkbox label strong').length).toBe(3);
                    });
                    it("items display extra field values", function() {
                        expect($form.find('.checkbox label .time-taken')).toContainText('00:');
                        expect($form.find('.checkbox label .time-taken').length).toBe(2);
                    });
                });
                describe("value = undefined", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: formModel_3,
                            fields: [_.defaults({
                                itemTemplate: undefined
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("items still exist", function() {
                        expect($form.find('input:checkbox')).toExist();
                        expect($form.find('input:checkbox').length).toBe(3);
                    });
                });
            });
            describe("with hideCheckboxForSingleItem option", function() {
                describe("value = true", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: new Backbone.Model({
                                checklistValue: new Backbone.Collection([{
                                    name: 'first-thing',
                                    label: 'First Thing',
                                    value: false
                                }])
                            }),
                            fields: [_.defaults({
                                hideCheckboxForSingleItem: true
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("contains correct wrapper", function() {
                        expect($form.find('.checklistValue').length).toBe(1);
                    });
                    it("contains correct label", function() {
                        expect($form.find('legend').length).toBe(1);
                        expect($form.find('legend')).toHaveText('checklist label');
                    });
                    it("contains correct amount of items", function() {
                        expect($form.find('.childView-container .control').length).toBe(1);
                    });
                    it("contains correct tag", function() {
                        expect($form.find('.childView-container .control span.single-item').length).toBe(1);
                    });
                });
                describe("value = undefined", function() {
                    beforeEach(function() {
                        form = new UI.Form({
                            model: new Backbone.Model({
                                checklistValue: new Backbone.Collection([{
                                    name: 'first-thing',
                                    label: 'First Thing',
                                    value: false
                                }])
                            }),
                            fields: [_.defaults({
                                hideCheckboxForSingleItem: undefined
                            }, checklistControlDefinition_1)]
                        });
                        $form = form.render().$el;
                        $("body").append($form);
                    });
                    it("contains correct wrapper", function() {
                        expect($form.find('.checklistValue').length).toBe(1);
                    });
                    it("contains correct label", function() {
                        expect($form.find('legend').length).toBe(1);
                        expect($form.find('legend')).toHaveText('checklist label');
                    });
                    it("contains correct initial value", function() {
                        expect($form.find('input:checkbox')).not.toBeChecked();
                    });
                    it("contains correct amount of items", function() {
                        expect($form.find('.childView-container .control').length).toBe(1);
                    });
                    it("contains correct tag", function() {
                        expect($form.find('.childView-container .control input:checkbox')).toExist();
                        expect($form.find('.childView-container .control span.single-item')).not.toExist();
                    });
                });
            });
            describe("with selectedCountName option", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_4,
                        fields: [_.defaults({
                            selectedCountName: 'checklist-count'
                        }, checklistControlDefinition_1)]
                    });
                    $form = form.render().$el;
                    $("body").append($form);
                });

                it("expect the the count to be set initially", function() {
                    expect(form.model.get('checklist-count')).toBe(2);
                });
                it("expect the the count to be updated", function() {
                    $form.find('#checklistValue-third-thing').click().trigger('change');
                    expect(form.model.get('checklist-count')).toBe(3);
                });
            });
            describe("using trigger to dynamically change", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_1,
                        fields: [checklistControlDefinition_1]
                    });
                    $form = form.render().$el;
                    $("body").append($form);
                });

                it("hidden for the control", function() {
                    $form.find('.checklistValue').trigger("control:hidden", true);
                    expect($form.find('.checklistValue')).toHaveClass('hidden');
                    $form.find('.checklistValue').trigger("control:hidden", false);
                    expect($form.find('.checklistValue')).not.toHaveClass('hidden');
                });
                it("disabled for one item", function() {
                    $form.find('.checklistValue').trigger("control:item:disabled", {item:'first-thing',value:true});
                    expect($form.find('label[for=checklistValue-first-thing]')).toHaveClass('disabled');
                    expect($form.find('#checklistValue-first-thing')).toHaveAttr('disabled','disabled');
                    $form.find('.checklistValue').trigger("control:item:disabled", {item:'first-thing',value:false});
                    expect($form.find('label[for=checklistValue-first-thing]')).not.toHaveClass('disabled');
                    expect($form.find('#checklistValue-first-thing')).not.toHaveAttr('disabled');
                });
                it("disabled for all items", function() {
                    $form.find('.checklistValue').trigger("control:item:disabled", {value:true});
                    expect($form.find('label')).toHaveClass('disabled');
                    expect($form.find('input:checkbox')).toHaveAttr('disabled','disabled');
                    $form.find('.checklistValue').trigger("control:item:disabled", {value:false});
                    expect($form.find('label')).not.toHaveClass('disabled');
                    expect($form.find('input:checkbox')).not.toHaveAttr('disabled');
                });
                it("value for one item", function() {
                    $form.find('.checklistValue').trigger("control:item:value", {item:'first-thing',value:true});
                    expect($form.find('#checklistValue-first-thing')).toBeChecked();
                    $form.find('.checklistValue').trigger("control:item:value", {item:'first-thing',value:false});
                    expect($form.find('#checklistValue-first-thing')).not.toBeChecked();
                });
                it("value for all items", function() {
                    $form.find('.checklistValue').trigger("control:item:value", {value:true});
                    expect($form.find('input:checkbox')).toBeChecked();
                    $form.find('.checklistValue').trigger("control:item:value", {value:false});
                    expect($form.find('input:checkbox')).not.toBeChecked();
                });
            });
        });

    });