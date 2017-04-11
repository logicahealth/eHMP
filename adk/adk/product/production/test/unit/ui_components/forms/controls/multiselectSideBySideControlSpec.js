/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["api/Messaging", "jquery", "handlebars", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function(Messaging, $, Handlebars, Backbone, Marionette, UI) {

        var $testPage,
            testPage,
            availableRegionTable = ".control > .available-region > .faux-table ",
            selectedRegionTable = ".control > .selected-region > .faux-table ";

        var msbs_definition_basic = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items"
            },
            msbs_definition_extraClasses = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items",
                extraClasses: ["class1", "class2"]
            },
            msbs_definition_attributeMapping = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items",
                extraClasses: ["class1", "class2"],
                attributeMapping: {
                    id: 'id',
                    label: 'description',
                    value: 'booleanValue'
                }
            },
            msbs_definition_additionalColumns = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items",
                additionalColumns: [{
                    //Extra Additional Column Options
                    columnTitle: "Index",
                    columnClasses: ["text-center"],
                    //Normal Control Options
                    name: "index",
                    extraClasses: ["top-margin-xs", "bottom-margin-xs"],
                    control: 'input',
                    srOnlyLabel: true,
                    label: "Item Index"
                }]
            },
            msbs_definition_itemColumn = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items",
                itemColumn: {
                    columnTitle: "Special Items",
                    columnClasses: ["flex-width-3"]
                }
            },
            msbs_definition_selectedSize = {
                control: "multiselectSideBySide",
                name: "items",
                label: "Items",
                selectedSize: 7
            },
            formModel_1 = new Backbone.Model({
                items: new Backbone.Collection([{
                    id: '001',
                    label: 'Item 01',
                    value: true,
                    index: '1.0'
                }, {
                    id: '002',
                    label: 'Item 02',
                    value: false,
                    index: '2.0'
                }, {
                    id: '003',
                    label: 'Item 03',
                    value: undefined,
                    index: '3.0'
                }])
            }),
            formModel_2 = new Backbone.Model({
                items: new Backbone.Collection([{
                    id: '001',
                    description: 'Item 01',
                    booleanValue: true,
                    index: '1.0'
                }, {
                    id: '002',
                    description: 'Item 02',
                    booleanValue: false,
                    index: '2.0'
                }, {
                    id: '003',
                    description: 'Item 03',
                    booleanValue: undefined,
                    index: '3.0'
                }])
            });
        var NotificationView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile("{{message}}"),
            modelEvents: {
                'change': 'render'
            },
            tagName: 'p'
        });
        var TestView = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile([
                '<div class="test-region"></div>',
                '<div class="live-region"></div>'
            ].join('\n')),
            ui: {
                'TestRegion': '.test-region',
                'AriaLiveRegion': '.live-region'
            },
            regions: {
                'TestRegion': '@ui.TestRegion',
                'ariaLiveRegion': '@ui.AriaLiveRegion'
            },
            initialize: function(options) {
                this.ViewToTest = options.view;
                if (!_.isFunction(this.ViewToTest.initialize)) {
                    this.ViewToTest = new this.ViewToTest();
                }
                this.NotificationView = new NotificationView({
                    model: new Backbone.Model({
                        'message': ''
                    })
                });
                var self = this;
                Messaging.reply('get:adkApp:region', function() { // component show() expects a region handed back
                    return self.getRegion('ariaLiveRegion');
                });
            },
            onRender: function() {
                this.showChildView('TestRegion', this.ViewToTest);
                this.ariaLiveRegion.show(this.NotificationView);
            }
        });

        describe("A multiselectSideBySide control", function() {
            afterEach(function() {
                testPage.remove();
            });

            describe("basic", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_basic]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct wrapper", function() {
                    //Ensure the correct classes on the top level control element
                    expect($testPage.find('.row.control.multiselectSideBySide-control.items')).toBeInDOM();
                });
                it("contains two container regions", function() {
                    expect($testPage.find('.control > .col-md-6')).toHaveLength(2);
                    expect($testPage.find('.control > .col-md-6:nth-child(1)')).toHaveClass('available-region');
                    expect($testPage.find('.control > .col-md-6:nth-child(2)')).toHaveClass('selected-region');
                });
                it("contains correct table headings", function() {
                    //Check the Available Side
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell')).toHaveLength(2);
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Available Items");
                    //Check the Selected Side
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell')).toHaveLength(2);
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Selected Items");
                });
                it("contains input filter", function() {
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group label.sr-only')).toBeInDOM();
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group input')).toBeInDOM();
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading.hidden i.fa.fa-spinner.fa-spin')).toBeInDOM();
                    //Double check to make sure there is no filter on the selected side
                    expect($testPage.find(selectedRegionTable + '> .container-fluid input')).not.toBeInDOM();
                });
                it("initial render of items are placed in correct regions", function() {
                    //Check the number of rows on each side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);

                    //Item 01 should be on both sides
                    //First check if it is on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toContainText('Remove');
                    //Check to see if this item is muted color sinice it is already added
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toHaveClass('color-grey-darkest');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toHaveClass('color-grey-darkest');
                    //second check if it is on the selected side
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2)')).toContainText('Remove');

                    //Item 02 should only be on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(1)')).toContainText('Item 02');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(2) button')).toContainText('Add');

                    //Item 03 should only be on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(1)')).toContainText('Item 03');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toContainText('Add');
                });
                it("clicking 'Add' button adds item to selected the selected side", function() {
                    //Make sure there are the correct number of items unslected
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(2);

                    $testPage.find("button[title='Press enter to add Item 03.']").focus().click();
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(1);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toContainText('Remove');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                });
                it("clicking 'Remove' button removes item from selected side", function() {
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(2);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(1);

                    $testPage.find("button[title='Press enter to remove Item 01.']").focus().click();

                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(2);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) > .table-cell:nth-child(1)')).toContainText('Item 03');
                });
                it("removing all items from selected side leaves 'No Items selected.' text", function() {
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    $testPage.find("button[title='Press enter to remove Item 03.']").focus().click();
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(1)')).toContainText('No Items selected.');
                });
                it("selecting all items from available side leaves all items in a text muted state", function() {
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);

                    //Add all Items to the slelected side
                    $testPage.find("button[title='Press enter to add Item 01.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 02.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 03.']").focus().click();
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(2) button:contains("Remove")')).toHaveLength(3);

                    //Remove all Items from the selected side
                    $testPage.find("button[title='Press enter to remove Item 01.']").focus().click();
                    $testPage.find("button[title='Press enter to remove Item 02.']").focus().click();
                    $testPage.find("button[title='Press enter to remove Item 03.']").focus().click();
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(1)')).toContainText('No Items selected.');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(2) button:contains("Add")')).toHaveLength(3);
                });
                it("correct filtering of available items", function(done) {
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).toHaveClass('hidden');
                    $testPage.find(availableRegionTable + 'input.filter:text').val('03').trigger('input');
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).not.toHaveClass('hidden');
                    expect($testPage.find(availableRegionTable + 'input.filter:text')).toHaveValue('03');
                    setTimeout(function() {
                        expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).toHaveClass('hidden');
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 03');
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toContainText('Add');
                        done();
                    }, 300);
                });
            });
            describe("with extra classes", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_extraClasses]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct wrapper", function() {
                    //Ensure the correct classes on the top level control element
                    expect($testPage.find('.row.control.multiselectSideBySide-control.items')).toHaveClass("class1 class2");
                });
            });
            describe("with attributeMapping", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_2,
                            fields: [msbs_definition_attributeMapping]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct wrapper", function() {
                    //Ensure the correct classes on the top level control element
                    expect($testPage.find('.row.control.multiselectSideBySide-control.items')).toHaveClass("class1 class2");
                });
                it("initial render of items are placed in correct regions", function() {
                    //Check the number of rows on each side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);

                    //Item 01 should be on both sides
                    //First check if it is on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toContainText('Remove');
                    //Check to see if this item is muted color sinice it is already added
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toHaveClass('color-grey-darkest');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toHaveClass('color-grey-darkest');
                    //second check if it is on the selected side
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2)')).toContainText('Remove');

                    //Item 02 should only be on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(1)')).toContainText('Item 02');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(2) button')).toContainText('Add');

                    //Item 03 should only be on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(1)')).toContainText('Item 03');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toContainText('Add');
                });
                it("clicking 'Add' button adds item to selected the selected side", function() {
                    //Make sure there are the correct number of items unslected
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(2);

                    $testPage.find("button[title='Press enter to add Item 03.']").focus().click();
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(1);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toContainText('Remove');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                });
                it("clicking 'Remove' button removes item from selected side", function() {
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(2);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(1);

                    $testPage.find("button[title='Press enter to remove Item 01.']").focus().click();

                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell button:contains("Add")')).toHaveLength(2);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) > .table-cell:nth-child(1)')).toContainText('Item 03');
                });
                it("removing all items from selected side leaves 'No Items selected.' text", function() {
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    $testPage.find("button[title='Press enter to remove Item 03.']").focus().click();
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(1)')).toContainText('No Items selected.');
                });
                it("selecting all items from available side leaves all items in a text muted state", function() {
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);

                    //Add all Items to the slelected side
                    $testPage.find("button[title='Press enter to add Item 01.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 02.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 03.']").focus().click();
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(2) button:contains("Remove")')).toHaveLength(3);

                    //Remove all Items from the selected side
                    $testPage.find("button[title='Press enter to remove Item 01.']").focus().click();
                    $testPage.find("button[title='Press enter to remove Item 02.']").focus().click();
                    $testPage.find("button[title='Press enter to remove Item 03.']").focus().click();
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(1)')).toContainText('No Items selected.');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(2) button:contains("Add")')).toHaveLength(3);
                });
                it("correct filtering of available items", function(done) {
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).toHaveClass('hidden');
                    $testPage.find(availableRegionTable + 'input.filter:text').val('Item 03').trigger('input');
                    expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).not.toHaveClass('hidden');
                    expect($testPage.find(availableRegionTable + 'input.filter:text')).toHaveValue('Item 03');
                    setTimeout(function() {
                        expect($testPage.find(availableRegionTable + '> .container-fluid .msbs-input.row > .control.input-control.form-group span.loading')).toHaveClass('hidden');
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(1);
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)').text()).toBe('Item 03');
                        expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button').text()).toBe('Add');
                        done();
                    }, 500);
                });
            });
            describe("with additionalColumns", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_additionalColumns]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct table headings", function() {
                    //Check the Available Side
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell')).toHaveLength(2);
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Available Items");
                    //Check the Selected Side
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Selected Items");
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell:nth-child(2)')).toContainText("Index");
                });
                it("selecting all items from available side leaves all items in a text muted state", function() {
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);

                    //Add all Items to the slelected side
                    $testPage.find("button[title='Press enter to add Item 01.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 02.']").focus().click();
                    $testPage.find("button[title='Press enter to add Item 03.']").focus().click();
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row .table-cell:nth-child(2) button:contains("Remove")')).toHaveLength(3);
                });
                it("initial render of items are placed in correct regions", function() {
                    //Check the number of rows on each side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row')).toHaveLength(3);

                    //Item 01 should be on both sides
                    //First check if it is on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toContainText('Remove');
                    //Check to see if this item is muted color sinice it is already added
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toHaveClass('color-grey-darkest');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) button')).toHaveClass('color-grey-darkest');
                    //second check if it is on the selected side
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(1)')).toContainText('Item 01');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(2) input').val()).toBe('1.0');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(1) .table-cell:nth-child(3)')).toContainText('Remove');

                    //Item 02 should be on both sides
                    //First check if it is on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(1)')).toContainText('Item 02');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(2) button')).toContainText('Remove');
                    //Check to see if this item is muted color sinice it is already added
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(1)')).toHaveClass('color-grey-darkest');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(2) button')).toHaveClass('color-grey-darkest');
                    //second check if it is on the selected side
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(1)')).toContainText('Item 02');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(2) input').val()).toBe('2.0');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(2) .table-cell:nth-child(3)')).toContainText('Remove');

                    //Item 03 should be on both sides
                    //First check if it is on the available side
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(1)')).toContainText('Item 03');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toContainText('Remove');
                    //Check to see if this item is muted color sinice it is already added
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(1)')).toHaveClass('color-grey-darkest');
                    expect($testPage.find(availableRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) button')).toHaveClass('color-grey-darkest');
                    //second check if it is on the selected side
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(1)')).toContainText('Item 03');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(2) input').val()).toBe('3.0');
                    expect($testPage.find(selectedRegionTable + '> .body.auto-overflow-y > .table-row:nth-child(3) .table-cell:nth-child(3)')).toContainText('Remove');
                });
            });
            describe("with itemCoulmn", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_itemColumn]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains correct table headings", function() {
                    //Check the Available Side
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell')).toHaveLength(2);
                    expect($testPage.find(availableRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Special Items");
                    //Check the Selected Side
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell')).toHaveLength(2);
                    expect($testPage.find(selectedRegionTable + '> .header.table-row > .table-cell:nth-child(1)')).toContainText("Special Items");
                });
            });
            describe("with selectedSize", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_selectedSize]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("contains two container regions", function() {
                    expect($testPage.find('.control > [class*="col-md-"]')).toHaveLength(2);
                    expect($testPage.find('.control > .available-region')).toHaveClass('col-md-5');
                    expect($testPage.find('.control > .selected-region')).toHaveClass('col-md-7');
                });
            });
            describe("with selectedCountName", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [_.defaults({
                            selectedCountName: 'msbs-count'
                        }, msbs_definition_basic)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("expect the the count to be set initially", function() {
                    expect(formModel_1.get('msbs-count')).toBe(3);
                });
                it("expect the the count to be updated", function() {
                    $testPage.find("button[title='Press enter to remove Item 01.']").focus().click();
                    expect(formModel_1.get('msbs-count')).toBe(2);
                });
            });
            describe("using trigger to dynamically change attributes", function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: formModel_1,
                            fields: [msbs_definition_basic]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it("disabled", function() {
                    $testPage.find('.multiselectSideBySide-control').trigger("control:disabled", true);
                    expect($testPage.find('.control input')).toHaveProp('disabled', true);
                    expect($testPage.find('.control button')).toHaveProp('disabled', true);
                    $testPage.find('.multiselectSideBySide-control').trigger("control:disabled", false);
                    expect($testPage.find('.control input')).toHaveProp('disabled', false);
                    expect($testPage.find('.control button')).toHaveProp('disabled', false);
                });
            });
        });

    });