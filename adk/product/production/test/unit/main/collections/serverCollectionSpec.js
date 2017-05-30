/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/collections/collections', 'api/UrlBuilder', 'main/ResourceDirectory'],
    function(_, $, Handlebars, Backbone, Marionette, ADKCollections, UrlBuilder, ResourceDirectory) {
        'use strict';
        describe('A server paging collection', function() {
            beforeAll(function() {
                var resourceDirectory = ResourceDirectory.instance();
                resourceDirectory.add(_.extend({}, _.get(resourceDirectory, 'model.prototype.defaults', {}), {
                    "title": "test",
                    "href": "./test/unit/main/collections/testResource.json"
                }));
            });
            var ServerCollection = ADKCollections.ServerCollection;
            var serverCollection;
            var testObject = new Backbone.Marionette.Object();
            describe('consists of', function() {
                beforeEach(function() {
                    serverCollection = new ServerCollection();
                    spyOn(serverCollection, 'fetch');
                    serverCollection.Criteria.Page.setMax(0);
                });
                describe('a Backbone.Collection', function() {
                    it('that is of correct type', function() {
                        expect((serverCollection instanceof ADKCollections.ServerCollection) &&
                            (serverCollection instanceof ADKCollections.BaseCollection) &&
                            (serverCollection instanceof Backbone.Collection)).toBe(true);
                        expect(serverCollection.collectionType).toBe('server');
                    });
                    it('has expected functions and attributes', function() {
                        expect(typeof serverCollection.hasNextPage).toBe('function');
                        expect(typeof serverCollection.getNextPage).toBe('function');
                        expect(typeof serverCollection.serverSort).toBe('function');
                        expect(typeof serverCollection.serverFilter).toBe('function');
                        expect(_.has(serverCollection, 'Criteria')).toBe(true);
                    });
                    it('hasNextPage returns expected result', function() {
                        expect(serverCollection.hasNextPage()).toBe(false);
                        serverCollection.Criteria.Page.setMax(10);
                        expect(serverCollection.hasNextPage()).toBe(true);
                        serverCollection.inProgress = true;
                        expect(serverCollection.hasNextPage()).toBe(false);
                    });
                    it('getNextPage fetches next page as expected', function() {
                        serverCollection.getNextPage();
                        expect(serverCollection.fetch).not.toHaveBeenCalled();
                        serverCollection.Criteria.Page.setMax(10);
                        serverCollection.getNextPage();
                        expect(serverCollection.fetch).toHaveBeenCalled();
                    });
                    it('parse updates paging values', function() {
                        var response = { data: { totalItems: 2, nextStartIndex: 1 } };
                        expect(serverCollection.Criteria.Page.max).toBe(0);
                        expect(serverCollection.Criteria.Page.start).toBe(0);
                        serverCollection.parse(response);
                        expect(serverCollection.Criteria.Page.max).toBe(2);
                        expect(serverCollection.Criteria.Page.start).toBe(1);
                        response = { data: { totalItems: 2, nextStartIndex: 2 } };
                        serverCollection.parse(response);
                        expect(serverCollection.Criteria.Page.max).toBe(2);
                        expect(serverCollection.Criteria.Page.start).toBe(2);
                    });
                    it('serverSort calls expected event and fetch', function() {
                        testObject.sortSpy = _.noop;
                        spyOn(testObject, 'sortSpy');
                        testObject.listenTo(serverCollection, 'reset', function(collection, options) {
                            expect(_.get(options, 'state')).toBe('sorting');
                            testObject.sortSpy();
                        });
                        expect(serverCollection.fetch).not.toHaveBeenCalled();
                        serverCollection.serverSort('newAttr');
                        expect(serverCollection.fetch).toHaveBeenCalled();
                        expect(testObject.sortSpy).toHaveBeenCalled();
                        delete testObject.sortSpy;
                    });
                    it('serverFilter calls expected event and fetch', function() {
                        testObject.filterSpy = _.noop;
                        spyOn(testObject, 'filterSpy');
                        testObject.listenTo(serverCollection, 'reset', function(collection, options) {
                            expect(_.get(options, 'state')).toBe('filtering');
                            testObject.filterSpy();
                        });
                        expect(serverCollection.fetch).not.toHaveBeenCalled();
                        serverCollection.serverFilter();
                        expect(serverCollection.fetch).toHaveBeenCalled();
                        expect(testObject.filterSpy).toHaveBeenCalled();
                        delete testObject.filterSpy;
                    });
                });
            });
            afterAll(function() {
                testObject.destroy();
            });
        });
    });
