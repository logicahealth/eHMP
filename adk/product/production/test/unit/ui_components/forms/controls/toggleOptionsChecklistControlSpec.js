/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, afterEach, xdescribe, fdescribe, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "handlebars", "backbone", "marionette", "main/ui_components/components", "api/UIComponents", "jasminejquery"],
    function($, Handlebars, Backbone, Marionette, UI) {

        var $form, form;

        var toggleOptionsChecklistDefinition = {
            name: 'toggleOptionsChecklist',
            label: 'toggle options checklist',
            control: 'toggleOptionsChecklist',
            columnHeaders: [{
                id: 'AO',
                label: 'AO',
                title: 'Agent Orange exposure'
            }, {
                id: 'IR',
                label: 'IR',
                title: 'Ionizing Radiation Exposure'
            }, {
                id: 'SWAC',
                label: 'SWAC',
                title: 'Southwest Asia Conditions'
            }, {
                id: 'SHD',
                label: 'SHD',
                title: 'Shipboard Hazard and Defense'
            }, {
                id: 'MST',
                label: 'MST',
                title: 'Military Sexual Truama'
            }, {
                id: 'HNC',
                label: 'HNC',
                title: 'Hippopotomal Nordic Conditions'
            }]
        };
        var $testPage, testPage;
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

        describe("A toggleOptionsChecklist control", function() {
            afterEach(function() {
                testPage.remove();
            });

            beforeEach(function() {
                form = new UI.Form({
                    model: new Backbone.Model({
                        toggleOptionsChecklist: new Backbone.Collection([{
                            id: 'row01',
                            label: 'This is the first row in the checklist',
                            value: true,
                            columnCollection: [{
                                name: 'AO',
                                value: true
                            }, {
                                name: 'IR',
                                value: true
                            }, {
                                name: 'SWAC',
                                value: true
                            }, {
                                name: 'SHD',
                                value: null
                            }, {
                                name: 'MST',
                                value: null
                            }, {
                                name: 'HNC',
                                value: null
                            }],
                        }, {
                            id: 'row02',
                            label: 'This is the second row in the checklist',
                            value: false,
                            columnCollection: [{
                                name: 'AO',
                                value: false
                            }, {
                                name: 'SWAC',
                                value: null
                            }, {
                                name: 'SHD',
                                value: null
                            }],
                        }, {
                            id: 'row03',
                            label: 'This is the third row in the checklist',
                            value: undefined,
                            columnCollection: [{
                                name: 'MST'
                            }, {
                                name: 'HNC'
                            }],
                        }])
                    }),
                    fields: [toggleOptionsChecklistDefinition]
                });

                testPage = new TestView({
                    view: form
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            describe("renders correctly", function() {


                it("with the correct wrappers", function() {
                    expect($testPage.find('.toc-table-header-region').length).toBe(1);
                    expect($testPage.find('.toc-table-header-region > .toc-table-header').length).toBe(1);
                    expect($testPage.find('.toc-table-body-region').length).toBe(1);
                    expect($testPage.find('.toc-table-body-region > .toc-table-body').length).toBe(1);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row').length).toBe(3);
                });
                it("with the correct number of header buttons and rows", function() {
                    expect($testPage.find('.toc-table-header > .toc-table-header-btn').length).toBe(6);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row').length).toBe(3);
                });
                it("button headers contain correct class/text", function() {
                    expect($testPage.find('a.btn.AO')).toHaveText("AO");
                    expect($testPage.find('a.btn.IR')).toHaveText("IR");
                    expect($testPage.find('a.btn.SWAC')).toHaveText("SWAC");
                    expect($testPage.find('a.btn.SHD')).toHaveText("SHD");
                    expect($testPage.find('a.btn.MST')).toHaveText("MST");
                    expect($testPage.find('a.btn.HNC')).toHaveText("HNC");
                });
                it("third (last) row's radios has class of disabled", function() {
                    expect($testPage.find('.toc-table-body > fieldset.toc-row:last .radio.disabled').length).toBe(2);
                });
                it("with the correct row title and radio wrappers", function() {
                    expect($testPage.find('.toc-table-body > fieldset.toc-row  .toc-row-title').length).toBe(3);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row  .toc-row-options').length).toBe(3);
                });
                it("with the correct number of radio buttons", function() {
                    expect($testPage.find('.toc-table-body > fieldset.toc-row .toc-option').length).toBe(18);
                    expect($testPage.find('input.AO').length).toBe(4);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row input[type="radio"]').length).toBe(22);
                });
                it("radio buttons render correctly", function() {
                    expect($testPage.find('label[for="row-0-AO-yes"]')).toHaveText("Yes");
                    expect($testPage.find('label[for="row-0-AO-no"]')).toHaveText("No");
                });
                it("row titles render correctly", function() {
                    expect($testPage.find('.toc-row-title > p.faux-legend').length).toBe(3);
                    expect($testPage.find('.toc-row-title > p.faux-legend')[0]).toHaveText("This is the first row in the checklist");
                    expect($testPage.find('.toc-row-title > p.faux-legend')[1]).toHaveText("This is the second row in the checklist");
                    expect($testPage.find('.toc-row-title > p.faux-legend')[2]).toHaveText("This is the third row in the checklist");
                });
                it("checkboxes in row titles render correctly", function() {
                    expect($testPage.find('.toc-row-title > .control.form-group > .checkbox > input:checkbox').length).toBe(3);
                    expect($testPage.find('.toc-row-title > .control.form-group > .checkbox > label.sr-only').length).toBe(3);
                    expect($testPage.find('input:checkbox')[0]).toBeChecked();
                    expect($testPage.find('input:checkbox')[1]).not.toBeChecked();
                    expect($testPage.find('input:checkbox')[2]).not.toBeChecked();
                });
            });
            describe("radio buttons and checkbox function", function() {
                it("radio buttons correct initial value", function() {
                    //First Row
                    expect($testPage.find('input:radio')[0]).toBeChecked();
                    expect($testPage.find('input:radio')[1]).not.toBeChecked();

                    expect($testPage.find('input:radio')[2]).toBeChecked();
                    expect($testPage.find('input:radio')[3]).not.toBeChecked();

                    expect($testPage.find('input:radio')[4]).toBeChecked();
                    expect($testPage.find('input:radio')[5]).not.toBeChecked();

                    expect($testPage.find('input:radio')[6]).not.toBeChecked();
                    expect($testPage.find('input:radio')[7]).not.toBeChecked();

                    expect($testPage.find('input:radio')[8]).not.toBeChecked();
                    expect($testPage.find('input:radio')[9]).not.toBeChecked();

                    expect($testPage.find('input:radio')[10]).not.toBeChecked();
                    expect($testPage.find('input:radio')[11]).not.toBeChecked();

                    //Second Row
                    expect($testPage.find('input:radio')[12]).not.toBeChecked();
                    expect($testPage.find('input:radio')[13]).toBeChecked();

                    expect($testPage.find('input:radio')[14]).not.toBeChecked();
                    expect($testPage.find('input:radio')[15]).not.toBeChecked();

                    expect($testPage.find('input:radio')[16]).not.toBeChecked();
                    expect($testPage.find('input:radio')[17]).not.toBeChecked();

                    //Third Row
                    expect($testPage.find('input:radio')[18]).not.toBeChecked();
                    expect($testPage.find('input:radio')[19]).not.toBeChecked();

                    expect($testPage.find('input:radio')[20]).not.toBeChecked();
                    expect($testPage.find('input:radio')[21]).not.toBeChecked();
                });
                it("radio buttons change when header button clicked", function() {
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");
                    $testPage.find('a.btn.AO').click();
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");
                    $testPage.find('a.btn.AO').click();
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("no");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");
                    $testPage.find('a.btn.AO').click();
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");

                    //testing fifth column header a.btn in same it to make sure it is unaffected by first column header button
                    expect($testPage.find('.MST-radio-group:eq(0) input:radio:checked').val()).toBe(undefined);
                    expect($testPage.find('.MST-radio-group:eq(1) input:radio:checked').val()).toBe(undefined);
                    $testPage.find('a.btn.MST').click();
                    expect($testPage.find('.MST-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.MST-radio-group:eq(1) input:radio:checked').val()).toBe(undefined);
                    $testPage.find('a.btn.MST').click();
                    expect($testPage.find('.MST-radio-group:eq(0) input:radio:checked').val()).toBe("no");
                    expect($testPage.find('.MST-radio-group:eq(1) input:radio:checked').val()).toBe(undefined);
                    $testPage.find('a.btn.MST').click();
                    expect($testPage.find('.MST-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.MST-radio-group:eq(1) input:radio:checked').val()).toBe(undefined);
                });
                it("radio buttons work when clicked individually", function() {
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    $testPage.find('#row-0-AO-yes').click();
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    $testPage.find('#row-0-AO-no').click();
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("no");
                    //DISABLED  radio buttons
                    expect($testPage.find('.AO-radio-group:eq(2) input:radio:checked').val()).toBe(undefined);
                    $testPage.find('#row-2-AO-yes').click();
                    expect($testPage.find('.AO-radio-group:eq(2) input:radio:checked').val()).toBe(undefined);

                });
                it("checkboxes work", function() {
                    //frirst checkbox
                    expect($testPage.find('input:checkbox#row01')).toBeChecked();
                    $testPage.find('input:checkbox#row01').click();
                    expect($testPage.find('input:checkbox#row01')).not.toBeChecked();
                    $testPage.find('input:checkbox#row01').click();
                    expect($testPage.find('input:checkbox#row01')).toBeChecked();
                    //second textbox
                    expect($testPage.find('input:checkbox#row02')).not.toBeChecked();
                    $testPage.find('input:checkbox#row02').click();
                    expect($testPage.find('input:checkbox#row02')).toBeChecked();
                    $testPage.find('input:checkbox#row02').click();
                    expect($testPage.find('input:checkbox#row02')).not.toBeChecked();
                    //third checkbox DISABLED
                    expect($testPage.find('input:checkbox#row03')).not.toBeChecked();
                    $testPage.find('input:checkbox#row03').click();
                    expect($testPage.find('input:checkbox#row03')).toBeChecked();
                    $testPage.find('input:checkbox#row03').click();
                    expect($testPage.find('input:checkbox#row03')).not.toBeChecked();
                });
            });
            describe('TOC events work correctly', function() {
                it('and the control handles header:click event properly', function() {
                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");

                    $('.toc').trigger('control:header:click', 'AO');

                    expect($testPage.find('.AO-radio-group:eq(0) input:radio:checked').val()).toBe("yes");
                    expect($testPage.find('.AO-radio-group:eq(1) input:radio:checked').val()).toBe("no");
                });
                it('and the control handles header:add event properly', function() {
                    expect($testPage.find('.toc-table-header-btn').length).toBe(6);
                    $('.toc').trigger('control:header:add', {
                        id: 'NT',
                        label: 'NT',
                        title: 'New Thing'
                    });
                    expect($testPage.find('.toc-table-header-btn').length).toBe(7);

                    expect($testPage.find('a.btn.NT')).toHaveText("NT");
                    expect($testPage.find('.toc-table-body > fieldset.toc-row .toc-option').length).toBe(21);
                    expect($testPage.find('input.NT').length).toBe(0);
                    expect($testPage.find('.toc-option input:radio').length).toBe(22);
                });
                it('and the control handles header:remove event properly', function() {
                    expect($testPage.find('.toc-table-header-btn').length).toBe(6);
                    $('.toc').trigger('control:header:remove', {
                        id: 'AO'
                    });
                    expect($testPage.find('.toc-table-header-btn').length).toBe(5);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row .toc-option').length).toBe(18);
                    expect($testPage.find('.toc-option input:radio').length).toBe(22);
                });
                it('and the control handles header:update event properly', function() {
                    expect($testPage.find('.toc-table-header-btn').length).toBe(6);
                    $('.toc').trigger('control:header:update', {
                        id: 'AO',
                        label: 'AO2',
                        title: 'Agent Orange'
                    });
                    expect($testPage.find('a.btn.AO')).toHaveText("AO2");
                    expect($testPage.find('.toc-table-header-btn').length).toBe(1);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row .toc-option').length).toBe(3);

                    expect($testPage.find('input.AO').length).toBe(4);
                    expect($testPage.find('.toc-option input:radio').length).toBe(4);
                });
                xit('and the control handles row:add event properly', function() {
                    expect($testPage.find('fieldset.toc-row').length).toBe(3);
                    $('.toc').trigger('control:row:add', {
                        id: 'row04',
                        label: 'This is the forth row in the checklist',
                        value: true,
                        columnCollection: [{
                            name: 'AO',
                            value: true
                        }, {
                            name: 'IR',
                            value: false
                        }, {
                            name: 'SWAC',
                            value: null
                        }]
                    });
                    expect($testPage.find('fieldset.toc-row').length).toBe(4);
                    expect($testPage.find('.toc-row-title > p.faux-legend:last')).toHaveText("This is the fourth row in the checklist");

                    expect($testPage.find('input.AO').length).toBe(6);
                    expect($testPage.find('.toc-table-body > fieldset.toc-row .toc-option').length).toBe(24);
                    expect($testPage.find('.toc-option input:radio').length).toBe(28);
                });
                xit('and the control handles row:remove event properly', function() {
                    expect($testPage.find('fieldset.toc-row').length).toBe(3);
                    $('.toc').trigger('control:row:remove', {
                        label: 'first thing'
                    });
                    expect($testPage.find('fieldset.toc-row').length).toBe(2);
                    expect($testPage.find('.toc-row-title > p.faux-legend:first')).toHaveText("This is the second row in the checklist");

                    expect($testPage.find('input.AO').length).toBe(4); // 6 radio buttons in new column
                    expect($testPage.find('.toc-table-body > fieldset.toc-row > .toc-flex > .toc-row-options-region > .toc-row-options > .toc-option').length).toBe(12); //21 groups of radio buttons
                    expect($testPage.find('.toc-option input:radio').length).toBe(24); //2x2x6
                });
                xit('and the control handles row:update event properly', function() {
                    expect($testPage.find('fieldset.toc-row').length).toBe(3);
                    $('.toc').trigger('control:row:update', {
                        name: 'toc1',
                        labe: 'first thing',
                        value: false,
                        disabled: false,
                        description: 'This is the first row in the checklist'
                    });
                    expect($testPage.find('fieldset.toc-row').length).toBe(1);

                    expect($testPage.find('div.toc-row-title > p.faux-legend:first')).toHaveText("This is the first row in the checklist");

                    expect($testPage.find('input.AO').length).toBe(2); // 6 radio buttons in new column
                    expect($testPage.find('div.toc-table-body > fieldset.toc-row > div.toc-flex > div.toc-row-options-region > div.toc-row-options > div.toc-option').length).toBe(6); //21 groups of radio buttons
                    expect($testPage.find('div.toc-option input:radio').length).toBe(12); //2x1x6
                });
                xit('and the control handles row:disableevent properly', function() {
                    $('fieldset.toc-row:first').trigger('control:row:disable', true);
                    expect($testPage.find('div.toc-table-body > fieldset.toc-row:first')).toHaveClass("row-disabled");
                    expect($testPage.find('input:checkbox:disabled#toc1').length).toBe(1);
                    var headers = ['AO', 'IR', 'SWAC', 'SHD', 'MST', 'HNC'];
                    _.each(headers, function(h) {
                        expect($testPage.find('input:radio:disabled#m1-0-' + h + '-Yes').length).toBe(1);
                        expect($testPage.find('input:radio:disabled#m1-0-' + h + '-No').length).toBe(1);
                    });
                });
                xit('and the control handles radioGroup:disable event properly', function() {
                    $('.AO-radio-group').trigger('control:radioGroup:disable', true);
                    expect($testPage.find('input:radio:disabled#m1-0-AO-Yes').length).toBe(1);
                    expect($testPage.find('input:radio:disabled#m1-0-AO-No').length).toBe(1);
                });
                xit('and the control handles checkbox:disable event properly', function() {
                    $('input:checkbox#toc1').trigger('control:checkbox:disable', true);
                    expect($testPage.find('input:checkbox:disabled#toc1').length).toBe(1);
                });
            });
        });
    });