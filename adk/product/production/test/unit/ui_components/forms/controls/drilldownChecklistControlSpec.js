/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "handlebars", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function($, Handlebars, Backbone, Marionette, UI) {

        var $form, form;

        var drilldownChecklistControlDefinition = {
            control: "drilldownChecklist",
            selectOptions: {
                control: "select",
                name: "drilldownCategory", // value is selected category
                label: "Drilldown Category Section",
                pickList: "drilldownCollection", // note the string pointing to the form model
                size: 10,
                srOnlyLabel: true,
                extraClasses: ["items-shown-md"]
            },
            checklistOptions: {
                control: "checklist",
                name: "listItems",
                extraClasses: ["items-shown-md"]
            },
            extraClasses: ["special-class-1", "special-class-2"]
        };
        var formModel_1 = new Backbone.Model({
            drilldownCategory: "categoryB", // first category is selected
            drilldownCollection: new Backbone.Collection([{
                value: "categoryA",
                label: "Category A",
                listItems: new Backbone.Collection([{
                    id: "group1-item1",
                    label: "Group 1 Item 1",
                    value: false
                }, {
                    id: "group1-item2",
                    label: "Group 1 Item 2",
                    value: false
                }, {
                    id: "group1-item3",
                    label: "Group 1 Item 3",
                    value: false
                }])
            }, {
                value: "categoryB",
                label: "Category B",
                listItems: new Backbone.Collection([{
                    id: "group2-item1",
                    label: "Group 2 Item 1",
                    value: false
                }, {
                    id: "group2-item2",
                    label: "Group 2 Item 2",
                    value: false
                }])
            }, {
                value: "categoryC",
                label: "Category C",
                listItems: new Backbone.Collection([{
                    id: "group3-item1",
                    label: "Group 3 Item 1",
                    value: false
                }, {
                    id: "group3-item2",
                    label: "Group 3 Item 2",
                    value: false
                }, {
                    id: "group3-item3",
                    label: "Group 3 Item 3",
                    value: false
                }])
            }])
        });

        describe("A drilldownChecklist control", function() {
            afterEach(function() {
                form.remove();
            });

            describe("basic", function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel_1,
                        fields: [drilldownChecklistControlDefinition]
                    });
                    $form = form.render().$el;
                    var drilldownCategoryView = form._getControl({controlType: 'select', controlName: 'drilldownCategory'});
                    $('body').append($form);
                    drilldownCategoryView.triggerMethod('attach');
                });

                it("contains correct wrapper", function() {
                    expect($form.find('.control.drilldownChecklist-control')).toHaveLength(1);
                });
                it("contains select and checklist controls", function() {
                    expect($form.find('.control.drilldownChecklist-control .control.select-control')).toHaveLength(1);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control')).toHaveLength(1);
                });
                it("the category specified in the form model is initially selected", function() {
                    var currentlySelectedFormModelValue = form.model.get(drilldownChecklistControlDefinition.selectOptions.name);
                    expect($form.find('.control.drilldownChecklist-control .control.select-control option:selected')).toHaveValue(currentlySelectedFormModelValue);
                    var drilldownCollection = form.model.get(drilldownChecklistControlDefinition.selectOptions.pickList);
                    var selectedCategoryLabel = drilldownCollection.findWhere({
                        value: currentlySelectedFormModelValue
                    });
                    selectedCategoryLabel = selectedCategoryLabel.get('label');
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control legend')).toHaveText(selectedCategoryLabel);
                });
                it("selecting a new category updates the model and checklist control", function() {
                    var currentlySelectedFormModelValue = form.model.get(drilldownChecklistControlDefinition.selectOptions.name);
                    var drilldownCollection = form.model.get(drilldownChecklistControlDefinition.selectOptions.pickList);
                    var selectedCategoryLabel = drilldownCollection.findWhere({
                        value: currentlySelectedFormModelValue
                    });
                    selectedCategoryLabel = selectedCategoryLabel.get('label');

                    expect($form.find('.control.drilldownChecklist-control .control.select-control option:selected')).toHaveValue(currentlySelectedFormModelValue);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control legend')).toHaveText(selectedCategoryLabel);
                    expect(form.model.get(drilldownChecklistControlDefinition.selectOptions.name)).toBe('categoryB');
                    // checklist items should only show selected category items
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .checkbox input')).toHaveLength(2);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .checkbox:first-of-type label')).toContainText('Group 2 Item 1');
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .control.form-group:nth-of-type(2) label')).toContainText('Group 2 Item 2');
                    // change to first category
                    $form.find('.control.drilldownChecklist-control .control.select-control select').val('categoryA').trigger('change');
                    expect(form.model.get(drilldownChecklistControlDefinition.selectOptions.name)).toBe('categoryA');
                    
                    currentlySelectedFormModelValue = form.model.get(drilldownChecklistControlDefinition.selectOptions.name);
                    drilldownCollection = form.model.get(drilldownChecklistControlDefinition.selectOptions.pickList);
                    selectedCategoryLabel = drilldownCollection.findWhere({
                        value: currentlySelectedFormModelValue
                    });
                    selectedCategoryLabel = selectedCategoryLabel.get('label');

                    expect($form.find('.control.drilldownChecklist-control .control.select-control option:selected')).toHaveValue(currentlySelectedFormModelValue);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control legend')).toHaveText(selectedCategoryLabel);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .checkbox input')).toHaveLength(3);
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .control.form-group:first-of-type label')).toContainText('Group 1 Item 1');
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .control.form-group:nth-of-type(2) label')).toContainText('Group 1 Item 2');
                    expect($form.find('.control.drilldownChecklist-control .control.checklist-control .control.form-group:nth-of-type(3) label')).toContainText('Group 1 Item 3');
                });
                it("contains correct extraClasses", function() {
                    expect($form.find('.control.drilldownChecklist-control')).toHaveClass(drilldownChecklistControlDefinition.extraClasses[0]);
                    expect($form.find('.control.drilldownChecklist-control')).toHaveClass(drilldownChecklistControlDefinition.extraClasses[1]);
                });
                it("triggering control:hidden hides the control", function() {
                    expect($form.find('.control.drilldownChecklist-control')).not.toHaveClass("hidden");
                    $form.find('.control.drilldownChecklist-control').trigger('control:hidden', true);
                    expect($form.find('.control.drilldownChecklist-control')).toHaveClass("hidden");
                });
            });

        });

    });
