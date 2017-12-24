define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, $, _, Handlebars) {
    'use strict';

    describe('Quick Tile Behavior:', function() {

        /**
         * Extend this with the tileOptions you are looking to test
         *
         * Example:
         *      RowView = BaseRowView.extend({
         *           tileOptions: {
         *              quickMenu: {
         *                  enabled: true,
         *                  buttons: [{
         *                      type: 'detailsviewbutton',
         *                      shouldShow: true
         *                  }]
         *              }
         *          }
         *      });
         */
        var RowView;
        var view;
        var options;

        var tableTemplate = '<thead><tr><th>One</th><th>Two</th></tr></thead><tbody></tbody>';
        var rowTemplate = '<td>{{one}}</td><td>{{two}}</td>';

        function findMenu() {
            return $('div[id^=menuview]');
        }

        var BaseRowView = Backbone.Marionette.ItemView.extend({
            tagName: 'tr',
            template: Handlebars.compile(rowTemplate)
        });


        var CompositeView = Marionette.CompositeView.extend({
            tagName: 'table',
            getChildView: function() {
                return RowView;
            },
            childViewContainer: 'tbody',
            template: Handlebars.compile(tableTemplate),
            behaviors: {
                QuickTile: {
                    enabled: true,
                    headerContainerSelector: 'thead > tr',
                    childContainerSelector: function() {
                        return this.$el;
                    },
                    rowTagName: 'td',
                    headerTagName: 'th',
                    containerSelector: function() {
                        return this.$el;
                    },
                    shouldShow: true
                }
            },
            toggleFirstMenu: function() {
                var first = this.children.first();
                var $button = first.$('button[id^=menuButtonview]');
                $button.click();
            }
        });

        var collection = new Backbone.Collection([
            {one: 'a', two: 'b'},
            {one: 'c', two: 'd'}
        ]);

        beforeEach(function() {
            options = {
                collection: collection
            };
        });

        afterEach(function() {
            view.destroy();
        });


        describe('Setup:', function() {
            beforeEach(function() {
                RowView = BaseRowView.extend({
                    tileOptions: {
                        quickMenu: {
                            enabled: true,
                            buttons: [{
                                type: 'detailsviewbutton',
                                shouldShow: true
                            }]
                        }
                    }
                });

                view = new CompositeView(options);
                view.render();
            });

            it('adds the quick menu class to the table', function() {
                expect(view.$el).toHaveClass('quick-menu-table');
            });

            it('creates a header cell in the table', function() {
                var headerCells = view.$('thead > tr > th');
                var firstCell = headerCells.first();

                expect(headerCells.length).toBe(3);
                expect(firstCell).toHaveClass('quickmenu-header');
            });

            it('adds a quick menu to each row of the table', function() {
                var count = 0;
                view.$('tbody > tr').each(function() {
                    count++;
                    var $row = $(this);
                    var $cells = $row.find('td');
                    var $first = $cells.first();
                    expect($cells.length).toBe(3);
                    expect($first).toHaveClass('quickmenu-container');
                });
                expect(count).toBe(2);
            });
        });


        describe('Menu Container Creation:', function() {
            var $menu;

            beforeEach(function() {
                RowView = BaseRowView.extend({
                    tileOptions: {
                        quickMenu: {
                            enabled: true,
                            buttons: [{
                                type: 'detailsviewbutton',
                                shouldShow: true
                            }]
                        }
                    }
                });

                view = new CompositeView(options);
                view.render();
                view.toggleFirstMenu();
                $menu = findMenu();
            });

            afterEach(function() {
                view.toggleFirstMenu();
            });

            it('appends a menu container to the dom', function() {
                expect($menu.length).toBe(1);
            });

            it('built the details view option', function() {
                var $li = $menu.find('ul > li');
                var $first = $li.first();
                var text = $first.text().trim();

                expect($li.length).toBe(1);
                expect(text).toBe('details');
            });
        });

        describe('Buttons:', function() {

            // This can not exist in beforeEach or else the loops will not find them.
            // Careful not to override data.
            var buttons = [
                {name: 'detailsviewbutton', displayName: 'details', index: 0},
                {name: 'gotoactionbutton', displayName: 'go to action', index: 1},
                {name: 'infobutton', displayName: 'more information', index: 2},
                {name: 'tilesortbutton', displayName: 'manual sort', index: 3},
                {name: 'additembutton', displayName: 'add new item', index: 4},
                {name: 'notesobjectbutton', displayName: 'create note object', index: 5},
                {name: 'crsbutton', displayName: 'concept relationships', index: 6},
                {name: 'associatedworkspace', displayName: 'associated workspace', index: 7},
                {name: 'editviewbutton', displayName: 'edit form', index: 8},
                {name: 'deletestackedgraphbutton', displayName: 'delete stacked graph', index: 9}
            ];

            describe('Solo:', function() {
                function checkButton(button) {
                    it('testing ' + button.name, function() {
                        RowView = BaseRowView.extend({
                            tileOptions: {
                                quickMenu: {
                                    enabled: true,
                                    buttons: [{
                                        type: button.name,
                                        shouldShow: true
                                    }]
                                }
                            }
                        });

                        view = new CompositeView(options);
                        view.render();
                        view.toggleFirstMenu();
                        var $menu = findMenu();

                        var $li = $menu.find('ul > li');
                        var $first = $li.first();
                        var text = $first.text().trim();

                        expect($li.length).toBe(1);
                        expect(text).toBe(button.displayName);
                        view.toggleFirstMenu();
                    });
                }

                _.each(buttons, function(button) {
                    checkButton(button);
                });
            });


            describe('Solo: shouldShow is false:', function() {
                function checkButton(button) {
                    RowView = BaseRowView.extend({
                        tileOptions: {
                            quickMenu: {
                                enabled: true,
                                buttons: [{
                                    type: button.name,
                                    shouldShow: false
                                }]
                            }
                        }
                    });

                    view = new CompositeView(options);
                    view.render();
                    view.toggleFirstMenu();
                    var $menu = findMenu();

                    var $li = $menu.find('ul > li');

                    expect($li.length).toBe(0);
                    view.toggleFirstMenu();
                }

                _.each(buttons, function(button) {
                    it(button.name, function() {
                        checkButton(button);
                    });
                });
            });

            describe('Solo: onClick', function() {
                var clickCheck;

                beforeEach(function() {
                    clickCheck = '';
                });

                function checkButton(button) {
                    RowView = BaseRowView.extend({
                        tileOptions: {
                            quickMenu: {
                                enabled: true,
                                buttons: [{
                                    type: button.name,
                                    shouldShow: true,
                                    onClick: function() {
                                        clickCheck = button.name;
                                    }
                                }]
                            }
                        }
                    });

                    view = new CompositeView(options);
                    view.render();
                    view.toggleFirstMenu();
                    var $menu = findMenu();

                    var $li = $menu.find('ul > li');
                    var $first = $li.first();
                    var $anchor = $first.find('a');
                    $anchor.removeAttr('aria-disabled');
                    $anchor.click();

                    expect(clickCheck).toBe(button.name);
                    view.toggleFirstMenu();
                }

                _.each(buttons, function(button) {
                    it(button.name, function() {
                        checkButton(button);
                    });
                });
            });

            describe('All', function() {
                it('handles every button being added at once', function() {
                    var buttonOptions = _.map(buttons, function(button) {
                        return {
                            type: button.name,
                            shouldShow: true
                        };
                    });

                    RowView = BaseRowView.extend({
                        tileOptions: {
                            quickMenu: {
                                enabled: true,
                                buttons: buttonOptions
                            }
                        }
                    });

                    view = new CompositeView(options);
                    view.render();
                    view.toggleFirstMenu();
                    var $menu = findMenu();

                    var $li = $menu.find('ul > li');

                    expect($li.length).toBe(buttons.length);
                    view.toggleFirstMenu();
                });

                it('reorders the buttons to the correct index', function() {
                    var buttonOptions = _.map(buttons, function(button) {
                        return {
                            type: button.name,
                            shouldShow: true
                        };
                    }).reverse();

                    RowView = BaseRowView.extend({
                        tileOptions: {
                            quickMenu: {
                                enabled: true,
                                buttons: buttonOptions
                            }
                        }
                    });

                    view = new CompositeView(options);
                    view.render();
                    view.toggleFirstMenu();
                    var $menu = findMenu();

                    var $li = $menu.find('ul > li');

                    $li.each(function(index, val) {
                        var text = $(val).text().trim();
                        expect(text).toBe(buttons[index].displayName);
                    });
                });
            });
        });
    });
});