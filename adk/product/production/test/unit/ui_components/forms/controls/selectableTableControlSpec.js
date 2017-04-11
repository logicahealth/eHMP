'use strict';
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function($, _, Backbone, Marionette, UI) {
    var $form, form;

    var selectableTableControlDefinition = {
        control: "selectableTable",
        name: "selectTableModel",
        collection: [{
            date: "05/09/2015 - 12:00",
            details: "Was prescribed some pain meds",
            location: "Primary Care"
        }, {
            date: "05/09/2014 - 2:00",
            details: "Was given a cast for broken foot",
            location: "General Medicine"
        }, {
            date: "05/09/2013 - 1:00",
            details: "Hurt neck in plane crash",
            location: "Therapy"
        }, {
            date: "05/09/2012 - 2:30",
            details: "Swallowed a fork, need internal stitches",
            location: "ENT Surgery"
        }],
        columns: [{
            title: "Date",
            id: "date"
        }, {
            title: "Details",
            id: "details"
        }, {
            title: "Location",
            id: "location"
        }]
    };

    var formModel = new Backbone.Model();

    describe('A selectableTable', function() {
        afterEach(function() {
            form.remove();
        });

        describe('basic', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [selectableTableControlDefinition]
                });

                $form = form.render().$el;
                $('body').append($form);
            });

            it('contains a faux table class', function() {
                expect($form.find('.faux-table')).toHaveLength(1);
            });

            it('has id default to name', function() {
                expect($form.find('.faux-table-container')).toHaveId(selectableTableControlDefinition.name);
            });

            it('has screen reader text with a default label', function() {
                expect($form.find('.control span.sr-only:first')).toHaveText('Press enter to select this row.');
            });

            it('sets value in model when input is changed, and sets correct row to active', function() {
                // simply selecting first row for simplicity
                expect($form.find('a.active')).toHaveLength(0);
                var firstEl = $form.find('a')[0];
                $(firstEl).trigger('click');
                $form.find('input').trigger('change');
                expect($(firstEl)).toHaveClass('active');
                expect($form.find('a.active')).toHaveLength(1);
                // make sure to check the name in field
                var modelDetailString = form.model.get('selectTableModel').get('details');
                var stringFromCollection = selectableTableControlDefinition.collection[0].details;
                expect(modelDetailString).toBe(stringFromCollection);

                form.model.unset('selectTableModel');
            });

        });
        describe('with initial value', function() {
            afterEach(function() {
                formModel.unset('selectTableModel');
            });
            beforeEach(function() {
                //second model in collection
                formModel.set('selectTableModel', new Backbone.Model({
                    date: "05/09/2014 - 2:00",
                    details: "Was given a cast for broken foot",
                    location: "General Medicine"
                }));
                form = new UI.Form({
                    model: formModel,
                    fields: [selectableTableControlDefinition]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('starts with a correct initial model value', function() {
                expect($form.find('a.active')).toHaveLength(1);
                expect($form.find('a.active')).toContainText(form.model.get('selectTableModel').get('details'));
            });

            it('selects a new row and set the model accordingly', function() {
                expect($form.find('a.active')).toHaveLength(1);

                var firstEl = $form.find('a')[0];
                $(firstEl).trigger('click');
                $form.find('input').trigger('change');
                expect($(firstEl)).toHaveClass('active');
                expect($form.find('a.active')).toHaveLength(1);
                // make sure to check the name in field
                var modelDetailString = form.model.get('selectTableModel').get('details');
                var stringFromCollection = selectableTableControlDefinition.collection[0].details;
                expect(modelDetailString).toBe(stringFromCollection);
            });
        });

        describe('with extra classes', function() {
            var extraClassesSelectableTableControlDefinition = {
                control: "selectableTable",
                name: "selectTableModel",
                collection: new Backbone.Collection([{
                    date: "05/09/2015 - 12:00",
                    details: "Was prescribed some pain meds",
                    location: "Primary Care"
                }, {
                    date: "05/09/2014 - 2:00",
                    details: "Was given a cast for broken foot",
                    location: "General Medicine"
                }, {
                    date: "05/09/2013 - 1:00",
                    details: "Hurt neck in plane crash",
                    location: "Therapy"
                }, {
                    date: "05/09/2012 - 2:30",
                    details: "Swallowed a fork, need internal stitches",
                    location: "ENT Surgery"
                }]),
                columns: [{
                    title: "Date",
                    id: "date"
                }, {
                    title: "Details",
                    id: "details"
                }, {
                    title: "Location",
                    id: "location"
                }],
                extraClasses: ["special-class-1", "special-class-2"]
            };
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [extraClassesSelectableTableControlDefinition]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('container has correct classes', function() {
                expect($form.find('.control')).toHaveClass('special-class-1');
                expect($form.find('.control')).toHaveClass('special-class-2');
            });

            it('table does not have the same classes', function() {
                expect($form.find('.faux-table')).not.toHaveClass('special-class-1');
                expect($form.find('.faux-table')).not.toHaveClass('special-class-2');
            });
        });

        describe('with a label for the screen reader', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [_.defaults({label: 'encounter location'}, selectableTableControlDefinition)]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('has screen reader text with the label', function() {
                expect($form.find('.control span.sr-only:first')).toHaveText('Press enter to set this as the encounter location.');
            });
        });

        describe('with id specified in config', function() {
            var iDSelectableTableControlDefinition = {
                control: "selectableTable",
                name: "selectTableModel",
                id: "encounterLocationTable",
                collection: new Backbone.Collection([{
                    date: "05/09/2015 - 12:00",
                    details: "Was prescribed some pain meds",
                    location: "Primary Care"
                }, {
                    date: "05/09/2014 - 2:00",
                    details: "Was given a cast for broken foot",
                    location: "General Medicine"
                }, {
                    date: "05/09/2013 - 1:00",
                    details: "Hurt neck in plane crash",
                    location: "Therapy"
                }, {
                    date: "05/09/2012 - 2:30",
                    details: "Swallowed a fork, need internal stitches",
                    location: "ENT Surgery"
                }]),
                columns: [{
                    title: "Date",
                    id: "date"
                }, {
                    title: "Details",
                    id: "details"
                }, {
                    title: "Location",
                    id: "location"
                }]
            };
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [iDSelectableTableControlDefinition]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('has correct id', function() {
                expect($form.find('.faux-table-container')).toHaveId(iDSelectableTableControlDefinition.id);
            });
        });

        describe('that\'s empty', function() {
            var selectableTable;

            beforeEach(function() {
                selectableTable = _.defaults({collection: []}, selectableTableControlDefinition);
            });

            it('displays a default empty message', function() {
                form = new UI.Form({model: formModel, fields: [selectableTable]});
                $form = form.render().$el;
                $('body').append($form);

                expect($form.find('.no-results')).toContainText('No items found');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('displays a default empty message with a custom label', function() {
                selectableTable.label = 'zipper';
                form = new UI.Form({model: formModel, fields: [selectableTable]});
                $form = form.render().$el;
                $('body').append($form);

                expect($form.find('.no-results')).toContainText('No zippers found');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('displays a custom empty message', function() {
                selectableTable.emptyTemplate = '<div class="emptier">Really empty</div>';
                form = new UI.Form({model: formModel, fields: [selectableTable]});
                $form = form.render().$el;
                $('body').append($form);

                expect($form.find('.no-results')).toContainHtml('<div class="emptier">Really empty</div>');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('displays no empty message if configured not to', function() {
                selectableTable.showEmptyMessage = false;
                form = new UI.Form({model: formModel, fields: [selectableTable]});
                $form = form.render().$el;
                $('body').append($form);

                expect($form.find('.no-results')).toBeHidden();
            });
        });

        describe('with items', function() {
            var collection = new Backbone.Collection([{
                date: "05/09/2015 - 12:00",
                details: "Was prescribed some pain meds",
                location: "Primary Care"
            }, {
                date: "05/09/2014 - 2:00",
                details: "Was given a cast for broken foot",
                location: "General Medicine"
            }, {
                date: "05/09/2013 - 1:00",
                details: "Hurt neck in plane crash",
                location: "Therapy"
            }, {
                date: "05/09/2012 - 2:30",
                details: "Swallowed a fork, need internal stitches",
                location: "ENT Surgery"
            }]);
            var itemsEmptySelectableTableControlDefinition = _.defaults({collection: collection}, selectableTableControlDefinition);

            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [itemsEmptySelectableTableControlDefinition]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('displays an empty message when all items are removed by reset', function() {
                collection.reset();

                expect($form.find('.no-results')).toContainText('No items found');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('displays an empty message when all items are removed by set', function() {
                collection.set([]);

                expect($form.find('.no-results')).toContainText('No items found');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('displays an empty message when all items are removed by hand', function() {
                while(collection.length) {
                    collection.remove(collection.at(0));
                }

                expect($form.find('.no-results')).toContainText('No items found');
                expect($form.find('.no-results')).toBeVisible();
            });

            it('hides the empty message when items are added by reset', function() {
                collection.reset([{
                    date: "04/01/2012 - 12:30",
                    details: "Swallowed a fly (I don't know why)",
                    location: "ENT Surgery"
                }]);

                expect($form.find('.no-results')).toBeHidden();
            });

            it('hides the empty message when items are added by set', function() {
                collection.reset();
                collection.set([{
                    date: "04/01/2012 - 12:30",
                    details: "Swallowed a fly (I don't know why)",
                    location: "ENT Surgery"
                }]);

                expect($form.find('.no-results')).toBeHidden();
            });

            it('hides the empty message when items are added by hand', function() {
                collection.reset();
                collection.add({
                    date: "04/01/2012 - 12:30",
                    details: "Swallowed a fly (I don't know why)",
                    location: "ENT Surgery"
                });

                expect($form.find('.no-results')).toBeHidden();
            });
        });

        describe('with loading events', function() {
            var collection = new Backbone.Collection([]);

            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [_.defaults({
                        id: 'loadingSelectableTable',
                        collection: collection
                    }, selectableTableControlDefinition)]
                });
                $form = form.render().$el;
                $('body').append($form);
                $form.find('#loadingSelectableTable').trigger('control:loading', true);
            });

            it('displays a default loading message', function() {
                expect($form.find('.loading')).toContainHtml('<i class="fa fa-spinner fa-spin"></i> Loading...');
                expect($form.find('.loading')).toBeVisible();
            });

            it('hides the loading message when loading is triggered done', function() {
                $form.find('#loadingSelectableTable').trigger('control:loading', false);

                expect($form.find('.loading')).toBeHidden();
            });

            it('hides the loading message when items are added', function() {
                collection.add({
                    date: "04/01/2012 - 12:30",
                    details: "Swallowed a fly (I don't know why)",
                    location: "ENT Surgery"
                });

                expect($form.find('.loading')).toBeHidden();
            });

            it('hides the loading message when the collection is reset to empty', function() {
                collection.reset();

                expect($form.find('.loading')).toBeHidden();
            });
        });

        describe('with a custom loading template', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [_.defaults({
                        id: 'loadingSelectableTable',
                        collection: [],
                        loadingTemplate: '<div class="loadinger">Really loading</div>'
                    }, selectableTableControlDefinition)]
                });
                $form = form.render().$el;
                $('body').append($form);
                $form.find('#loadingSelectableTable').trigger('control:loading', true);
            });

            it('displays the custom loading template', function() {
                expect($form.find('.loading')).toContainHtml('<div class="loadinger">Really loading</div>');
                expect($form.find('.loading')).toBeVisible();
            });
        });

        describe("using trigger to dynamically change attributes", function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModel,
                    fields: [selectableTableControlDefinition]
                });
                $form = form.render().$el;
                $("body").append($form);
            });

            it("hidden", function() {
                $form.find('.selectTableModel').trigger("control:hidden", true);
                expect($form.find('.selectTableModel')).toHaveClass('hidden');
                $form.find('.selectTableModel').trigger("control:hidden", false);
                expect($form.find('.selectTableModel')).not.toHaveClass('hidden');
            });
        });
    });
});
