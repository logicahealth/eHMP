/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/collections/collections', 'api/UrlBuilder', 'main/ResourceDirectory'],
    function(_, $, Handlebars, Backbone, Marionette, ADKCollections, UrlBuilder, ResourceDirectory) {
        'use strict';
        describe('A grouping paging collection', function() {
            beforeAll(function() {
                var resourceDirectory = ResourceDirectory.instance();
                resourceDirectory.add(_.extend({}, _.get(resourceDirectory, 'model.prototype.defaults', {}), {
                    "title": "test",
                    "href": "./test/unit/main/collections/testResource.json"
                }));
            });
            var GroupCollection = ADKCollections.GroupingCollection;
            var groupCollection;
            var items;
            var testObject = new Backbone.Marionette.Object();
            var expectedItems;
            var expectedGroups;
            describe('consists of', function() {
                beforeEach(function() {
                    items = [{
                        id: 'item1',
                        attr1: 'value1'
                    }, {
                        id: 'item2',
                        attr1: 'value1'
                    }, {
                        id: 'item3',
                        attr1: 'value2'
                    }];
                    expectedItems = 3;
                    expectedGroups = 2;
                    groupCollection = new GroupCollection(items, { groupName: 'attr1', parse: true });
                    spyOn(groupCollection, 'fetch');
                });
                describe('a Backbone.Collection', function() {
                    it('that is of correct type', function() {
                        expect((groupCollection instanceof ADKCollections.GroupingCollection) &&
                            (groupCollection instanceof ADKCollections.ServerCollection) &&
                            (groupCollection instanceof ADKCollections.BaseCollection) &&
                            (groupCollection instanceof Backbone.Collection)).toBe(true);
                        expect(groupCollection.collectionType).toBe('server');
                    });
                    it('has expected functions and attributes', function() {
                        expect(typeof groupCollection.setGrouping).toBe('function');
                        expect(typeof groupCollection.getTotalItems).toBe('function');
                        expect(typeof groupCollection.isEmpty).toBe('function');
                        expect(_.has(groupCollection, 'groupName')).toBe(true);
                        expect(_.has(groupCollection, '_initialGroupKey')).toBe(true);
                        expect(_.has(groupCollection, '_initialGroupName')).toBe(true);
                        expect(_.has(groupCollection, '_groupKey')).toBe(true);
                        expect(groupCollection.groupName).toBe('attr1');
                    });
                    it('correctly takes in items and parses to correct group and getTotalItems returns correct amount', function() {
                        expect(groupCollection.length).toBe(expectedGroups);
                        expect(groupCollection.getTotalItems()).toBe(expectedItems);
                        expect(groupCollection.first().get('_groupKey')).toBe('value1');
                        expect(groupCollection.first().get('rows').length).toBe(2);
                        expect(groupCollection.last().get('_groupKey')).toBe('value2');
                        expect(groupCollection.last().get('rows').length).toBe(1);
                    });
                    it('isEmpty returns expected value', function() {
                        expect(groupCollection.isEmpty()).toBe(false);
                        expect(groupCollection.getTotalItems()).toBe(expectedItems);
                        groupCollection.reset();
                        expect(groupCollection.isEmpty()).toBe(true);
                        expect(groupCollection.getTotalItems()).toBe(0);
                    });
                    it('setGrouping updates group values and collection correctly', function() {
                        expect(groupCollection.groupName).toBe('attr1');
                        expect(groupCollection.length).toBe(expectedGroups);
                        expect(groupCollection.first().get('_groupKey')).toBe('value1');
                        expect(groupCollection.last().get('_groupKey')).toBe('value2');
                        groupCollection.setGrouping('id');
                        expect(groupCollection.length).toBe(expectedGroups);
                        expect(groupCollection.first().get('_groupKey')).toBe('value1');
                        expect(groupCollection.last().get('_groupKey')).toBe('value2');
                        groupCollection.reset(items, { parse: true });
                        expect(groupCollection.length).toBe(3);
                        expect(groupCollection.first().get('_groupKey')).toBe('item1');
                        expect(groupCollection.first().get('rows').length).toBe(1);
                        expect(groupCollection.last().get('_groupKey')).toBe('item3');
                        expect(groupCollection.last().get('rows').length).toBe(1);
                        expect(groupCollection._initialGroupName).toBe('attr1');
                    });
                });
            });
            afterAll(function() {
                testObject.destroy();
            });
        });
    });
