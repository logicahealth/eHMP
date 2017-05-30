/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/UILibrary', 'main/collections/collections'],
    function(_, $, Handlebars, Backbone, Marionette, UILibrary, ADKCollections) {
        'use strict';
        var TableView = UILibrary.Table;
        describe('A table view', function() {
            var tableView;
            afterEach(function() {
                tableView.destroy();
            });
            describe('with a flat body', function() {
                beforeEach(function() {
                    var TestTableView = TableView.extend({
                        helpers: function() {
                            return {
                                test1: function(model) {
                                    // essentially overwrites 'test1'/{{test1}} to be uppercase
                                    return model.get('test1').toUpperCase();
                                },
                                test1_cell: function(model) {
                                    // Template helper only used to format body cell.
                                    // Takes in result of 'test1' helper, if defined
                                    // else, will take model.get('test1').
                                    // If it is desired not to use the transformed value,
                                    // can still transform model.get('test1')
                                    return this.test1.substr(6);
                                },
                                // test2: function(model) {
                                //     // demonstration of using template helper for templating
                                //     return new Handlebars.SafeString('<span>' + Handlebars.escapeExpression(model.get('test2')) + '! <i class="fa fa-flag"></i></span>');
                                // }
                            };
                        }
                    });
                    tableView = new TestTableView({
                        collection: new Backbone.Collection([{
                            id: 'row1',
                            test1: 'test1-row1',
                            test2: 'test2-row1',
                            test3: 'test3-row1'
                        }, {
                            id: 'row2',
                            test1: 'test1-row2',
                            test2: 'test2-row2',
                            test3: 'test3-row2'
                        }, {
                            id: 'row3',
                            test1: 'test1-row3',
                            test2: 'test2-row3',
                            test3: 'test3-row3'
                        }]),
                        columns: [{
                            name: 'test1',
                            label: 'Test 1'
                        }, {
                            name: 'test2',
                            label: 'Test 2',
                            bodyTemplate: '{{test2}} custom text!'
                        }, {
                            name: 'test3',
                            label: 'Test 3'
                        }]
                    });
                    tableView.render();
                    $('body').append(tableView.$el);
                });
                afterEach(function() {
                    tableView.destroy();
                });
                describe('consists of', function() {
                    describe('a Marionette.CompositeView', function() {
                        it('that is of correct type', function() {
                            expect(tableView instanceof Backbone.Marionette.CompositeView).toBe(true);
                        });
                        it('that renders an html table correctly', function() {
                            var numRows = 3;
                            var numCols = 3;
                            expect(tableView.$('table')).toHaveLength(0);
                            expect(tableView.$el.prop('tagName')).toBe('TABLE');
                            expect(tableView.$el).toHaveClass('table');

                            expect(tableView.$('thead')).toHaveLength(1);
                            expect(tableView.$('thead tr')).toHaveLength(1);
                            expect(tableView.$('thead tr th')).toHaveLength(numCols);

                            expect(tableView.$('tbody')).toHaveLength(1);
                            expect(tableView.$('tbody tr')).toHaveLength(numRows);
                            expect(tableView.$('tbody tr td')).toHaveLength(numRows * numCols);
                        });
                        it('that renders vanilla cells with model value only', function() {
                            expect(tableView.$('tbody tr:first td:last')).toHaveText('test3-row1');
                        });
                        it('that renders a custom cell template correctly', function() {
                            expect(tableView.$('tbody tr:first td:first')).not.toContainText('custom text!');
                            expect(tableView.$('tbody tr:first td:nth-child(2)')).toHaveText('test2-row1 custom text!');
                            expect(tableView.$('tbody tr:first td:last')).not.toContainText('custom text!');
                        });
                        it('that renders cells with custom template helpers', function() {
                            expect(tableView.$('tbody tr:first td:first')).not.toHaveText('test1-row1');
                            // after two template helper transformation
                            expect(tableView.$('tbody tr:first td:first')).toHaveText('ROW1');
                            expect(tableView.$('tbody tr:nth-child(2) td:first')).toHaveText('ROW2');
                            expect(tableView.$('tbody tr:last td:first')).toHaveText('ROW3');
                            // others should not be transformed
                            expect(tableView.$('tbody tr:first td:nth-child(2)')).toContainText('test2-row1');
                            expect(tableView.$('tbody tr:first td:last')).toHaveText('test3-row1');
                        });
                        it('that scopes tbody cells to column header', function() {
                            var header1Id = tableView.$('thead tr th:first').attr('id');
                            var header2Id = tableView.$('thead tr th:nth-child(2)').attr('id');
                            var header3Id = tableView.$('thead tr th:last').attr('id');
                            expect(tableView.$('tbody tr td:first')).toHaveAttr('headers', header1Id);
                            expect(tableView.$('tbody tr td:nth-child(2)')).toHaveAttr('headers', header2Id);
                            expect(tableView.$('tbody tr td:last')).toHaveAttr('headers', header3Id);
                        });
                    });
                });
            });
            describe('with a grouped body', function() {
                beforeEach(function() {
                    var GroupedCollection = ADKCollections.GroupingCollection.extend({});
                    var TestTableView = TableView.extend({
                        helpers: function() {
                            return {
                                'group_groupHeader': function(groupModel) {
                                    return this.group.toUpperCase();
                                }
                            };
                        }
                    });
                    tableView = new TestTableView({
                        collection: new GroupedCollection({
                            data: {
                                totalItems: 3,
                                items: [{
                                    id: 'row1',
                                    test1: 'test1-row1',
                                    test2: 'test2-row1',
                                    test3: 'test3-row1',
                                    group: 'Group 1'
                                }, {
                                    id: 'row2',
                                    test1: 'test1-row2',
                                    test2: 'test2-row2',
                                    test3: 'test3-row2',
                                    group: 'Group 1'
                                }, {
                                    id: 'row3',
                                    test1: 'test1-row3',
                                    test2: 'test2-row3',
                                    test3: 'test3-row3',
                                    group: 'Group 2'
                                }]
                            }
                        }, {
                            sortKey: {
                                asc: 'group asc',
                                desc: 'group desc'
                            },
                            groupName: 'group',
                            parse: true
                        }),
                        columns: [{
                            name: 'test1',
                            label: 'Test 1'
                        }, {
                            name: 'test2',
                            label: 'Test 2',
                            bodyTemplate: '{{test2}} custom text!'
                        }, {
                            name: 'test3',
                            label: 'Test 3'
                        }, {
                            name: 'group',
                            label: 'Group',
                            sortKeys: {
                                asc: 'group asc',
                                desc: 'group desc'
                            }
                        }]
                    });
                    tableView.render();
                    $('body').append(tableView.$el);
                });
                describe('consists of', function() {
                    describe('a Marionette CompositeView', function() {
                        var numRows = 3;
                        var numCols = 4;
                        var numGroups = 2;
                        it('that is of correct type', function() {
                            expect(tableView instanceof Backbone.Marionette.CompositeView).toBe(true);
                        });
                        describe('that renders a grouped table\'s', function() {
                            it('table tag correctly', function() {
                                expect(tableView.$('table')).toHaveLength(0);
                                expect(tableView.$el.prop('tagName')).toBe('TABLE');
                                expect(tableView.$el).toHaveClass('table');
                            });
                            describe('header correctly, including', function() {
                                it('header arrangement', function() {
                                    expect(tableView.$('thead')).toHaveLength(1);
                                    expect(tableView.$('thead tr')).toHaveLength(1);
                                    expect(tableView.$('thead tr th')).toHaveLength(numCols);
                                });
                                it('sortable columns only th\'s with clickable button', function() {
                                    expect(tableView.$('thead tr th button')).toHaveLength(1);
                                    expect(tableView.$('thead tr th:last button')).toHaveLength(1);
                                    expect(tableView.$('thead tr th:last button')).toHaveText('Group');
                                });
                            });
                            it('body correctly', function() {
                                expect(tableView.$('tbody')).toHaveLength(1);
                                expect(tableView.$('tbody tr')).toHaveLength(numRows + numGroups);
                                expect(tableView.$('tbody tr td')).toHaveLength(numRows * numCols);
                            });
                            it('footer correctly', function() {
                                expect(tableView.$('tfoot')).toHaveLength(1);
                                expect(tableView.$('tfoot tr')).toHaveLength(1);
                                expect(tableView.$('tfoot tr td')).toHaveLength(1);
                                expect(tableView.$('tfoot tr td')).toHaveAttr('colspan', numCols.toString());
                            });
                            describe('groups correctly, including', function() {
                                it('group headers', function() {
                                    expect(tableView.$('tbody tr.row-header')).toHaveLength(numGroups);
                                    expect(tableView.$('tbody tr.row-header')).toHaveAttr('data-group-key');
                                    expect(tableView.$('tbody tr.row-header th')).toHaveLength(numGroups);
                                    expect(tableView.$('tbody tr.row-header th')).toHaveAttr('colspan', numCols.toString());
                                    expect(tableView.$('tbody tr.row-header:first th button span.badge')).toHaveText("2");
                                    expect(tableView.$('tbody tr.row-header:last th button span.badge')).toHaveText("1");
                                });
                                it('grouped rows', function() {
                                    expect(tableView.$('tbody tr.row-header:first').nextUntil('tbody tr.row-header')).toHaveLength(2);
                                    expect(tableView.$('tbody tr.row-header:last').nextUntil('tbody tr.row-header')).toHaveLength(1);
                                });
                                it('group headers in regards to transformative template helpers', function() {
                                    expect(tableView.$('tbody tr.row-header th:first')).not.toContainText('Group 1');
                                    expect(tableView.$('tbody tr.row-header th:last')).not.toContainText('Group 2');
                                    expect(tableView.$('tbody tr.row-header th:first')).toContainText('GROUP 1');
                                    expect(tableView.$('tbody tr.row-header th:last')).toContainText('GROUP 2');
                                });
                            });
                            describe('accessibility aspects correctly, including', function() {
                                it('setting correct scope tags to group headers', function() {
                                    expect(tableView.$('tbody tr.row-header th')).toHaveAttr('scope', 'rowGroup');
                                });
                                it('contains sr-only help text in group header button', function() {
                                    expect(tableView.$('tbody tr.row-header:first th button span.sr-only')).toContainText("2 items in group");
                                    expect(tableView.$('tbody tr.row-header:last th button span.sr-only')).toContainText("1 items in group");
                                });
                                it('scoping tbody td cells to column and group header', function() {
                                    var groupHeaderId1 = tableView.$('tbody tr.row-header:first th').attr('id');
                                    var groupHeaderId2 = tableView.$('tbody tr.row-header:last th').attr('id');
                                    var header1Id = tableView.$('thead tr th:first').attr('id');
                                    var header2Id = tableView.$('thead tr th:nth-child(2)').attr('id');
                                    var header3Id = tableView.$('thead tr th:nth-child(3)').attr('id');
                                    var header4Id = tableView.$('thead tr th:last').attr('id');
                                    var $group1Rows = tableView.$('tbody tr.row-header:first').nextUntil('tbody tr.row-header');
                                    var $group2Rows = tableView.$('tbody tr.row-header:last').nextUntil('tbody tr.row-header');

                                    expect($group1Rows.find('td:first').attr('headers')).toBe(header1Id + ' ' + groupHeaderId1);
                                    expect($group1Rows.find('td:nth-child(2)').attr('headers')).toBe(header2Id + ' ' + groupHeaderId1);
                                    expect($group1Rows.find('td:nth-child(3)').attr('headers')).toBe(header3Id + ' ' + groupHeaderId1);
                                    expect($group1Rows.find('td:last').attr('headers')).toBe(header4Id + ' ' + groupHeaderId1);

                                    expect($group2Rows.find('td:first').attr('headers')).toBe(header1Id + ' ' + groupHeaderId2);
                                    expect($group2Rows.find('td:nth-child(2)').attr('headers')).toBe(header2Id + ' ' + groupHeaderId2);
                                    expect($group2Rows.find('td:nth-child(3)').attr('headers')).toBe(header3Id + ' ' + groupHeaderId2);
                                    expect($group2Rows.find('td:last').attr('headers')).toBe(header4Id + ' ' + groupHeaderId2);
                                });
                                it('footer aria-live region', function() {
                                    expect(tableView.$('tfoot tr')).toHaveAttr('aria-live', 'assertive');
                                    expect(tableView.$('tfoot tr')).toHaveClass('sr-only');
                                });
                            });
                        });
                        describe('that triggers and responds correctly to collection/data events such as', function() {
                            // don't do in real code...
                            var originalCollectionModels;
                            describe('table sort', function() {
                                var onUserSort;
                                var spyObj;
                                beforeEach(function() {
                                    originalCollectionModels = _.clone(tableView.collection.models);
                                    onUserSort = function(direction, column) {
                                        tableView.collection.reset();
                                    };
                                    spyObj = { onUserSort: onUserSort };
                                    tableView.collection.listenTo(tableView.collection, 'sort:user', function() { spyObj.onUserSort.apply(this, arguments); });
                                    spyOn(spyObj, 'onUserSort').and.callThrough();
                                    expect(tableView.$('tbody tr td')).toHaveLength(numRows * numCols);
                                    tableView.$('thead th:last button').click();
                                });
                                it('by triggering sort:user on sort/click', function() {
                                    expect(spyObj.onUserSort).toHaveBeenCalled();
                                });
                                it('by emptying table and displaying "Sorting... on sort/click"', function() {
                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td')).toHaveText('Sorting...');
                                });
                                it('by updating footer\'s aria-live region when models are added back', function() {
                                    expect(tableView.$('tbody tr td span')).toHaveText('Sorting...');
                                    expect(tableView.$('tfoot tr td')).toHaveText("");
                                    tableView.collection.set(originalCollectionModels);
                                    tableView.collection.trigger('sync');
                                    expect(tableView.$('tfoot tr td')).toHaveText("Finished sorting.");
                                });
                            });
                            describe('collection \'reset\'', function() {
                                beforeEach(function() {
                                    originalCollectionModels = _.clone(tableView.collection.models);
                                    expect(tableView.$('tbody tr td')).toHaveLength(numRows * numCols);
                                    expect(tableView.$('tbody tr th')).toHaveLength(numGroups);
                                    tableView.collection.reset();
                                });
                                it('by emptying collection with no models provided on reset', function() {
                                    expect(tableView.$('tbody tr td')).toHaveLength(1); // empty view
                                    expect(tableView.$('tbody tr th')).toHaveLength(0);
                                });
                                it('by showing loading (empty) view', function() {
                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td span')).toHaveAttr('data-table-state', 'loading');
                                    expect(tableView.$('tbody tr td span')).toHaveText('Loading...');
                                });
                                it('by showing sorting (empty) view when sorting', function() {
                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td span')).toHaveAttr('data-table-state', 'loading');
                                    expect(tableView.$('tbody tr td span')).toHaveText('Loading...');
                                    tableView.collection.reset([], { state: 'sorting' });
                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td span')).toHaveAttr('data-table-state', 'sorting');
                                    expect(tableView.$('tbody tr td span')).toHaveText('Sorting...');
                                });
                                it('by showing filtering (empty) view when filtering', function() {
                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td span')).toHaveAttr('data-table-state', 'loading');
                                    expect(tableView.$('tbody tr td span')).toHaveText('Loading...');
                                    tableView.collection.reset([], { state: 'filtering' });

                                    expect(tableView.$('tbody tr td')).toHaveLength(1);
                                    expect(tableView.$('tbody tr td span')).toHaveAttr('data-table-state', 'filtering');
                                    expect(tableView.$('tbody tr td span')).toHaveText('Filtering...');
                                });
                                it('by updating footer\'s aria-live region when models are added back', function() {
                                    expect(tableView.$('tbody tr td span')).toHaveText('Loading...');
                                    expect(tableView.$('tfoot tr td')).toHaveText("");
                                    tableView.collection.reset(originalCollectionModels);
                                    tableView.collection.trigger('sync');
                                    expect(tableView.$('tfoot tr td')).toHaveText("Finished loading.");
                                });
                            })
                        });
                    })
                });
            });
        });
    });
