/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/collections/collections', 'api/UrlBuilder', 'main/ResourceDirectory'],
    function(_, $, Handlebars, Backbone, Marionette, ADKCollections, UrlBuilder, ResourceDirectory) {
        'use strict';
        describe('A base collection', function() {
            beforeAll(function() {
                var resourceDirectory = ResourceDirectory.instance();
                resourceDirectory.reset();
                resourceDirectory.add(_.extend({}, _.get(resourceDirectory, 'model.prototype.defaults', {}), {
                    "title": "test",
                    "href": "./test/unit/main/collections/testResource.json"
                }));
            });
            var BaseCollection = ADKCollections.BaseCollection.extend({
                parse: function(response) {
                    var parsedResponse;
                    if (response.data) {
                        if (response.data.items) {
                            parsedResponse = response.data.items;
                        } else {
                            parsedResponse = response.data;
                        }
                    } else {
                        parsedResponse = response;
                    }

                    if (this.collectionParse) {
                        this.reset(parsedResponse, { silent: true });
                        parsedResponse = this.collectionParse(this);
                    }
                    return parsedResponse;
                }
            });
            var baseCollection;
            var testObject = new Backbone.Marionette.Object();
            describe('consists of', function() {
                beforeEach(function() {
                    baseCollection = new BaseCollection();
                });
                describe('a Backbone.Collection', function() {
                    var expectedDataLength = 2;
                    var successCallback = function(collection, response, xhrObj) {
                        expect(_.get(xhrObj, 'xhr.state')()).toBe('resolved');
                        // data as expected (from test resource)?
                        expect(collection.at(0).get('id')).toBe('1');
                        expect(collection.at(1).get('value')).toBe('value2');
                        expect(collection.length).toBe(expectedDataLength);
                    };
                    var syncCallback = function(done) {
                        // should have been removed onSync in collection
                        expect(_.get(baseCollection, 'xhr.state')).toBe(undefined);
                        // test getTotalItems function
                        expect(baseCollection.getTotalItems()).toBe(expectedDataLength);
                        done();
                    };
                    it('that is of correct type', function() {
                        expect((baseCollection instanceof ADKCollections.BaseCollection) &&
                            (baseCollection instanceof Backbone.Collection)).toBe(true);
                    });
                    it('that fetches correctly with resourceTitle', function(done) {
                        expect(baseCollection.length).toBe(0);
                        baseCollection.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on collection
                        expect(_.isObject(baseCollection.xhr)).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(syncCallback, done));
                    });
                    it('that fetches correctly with url', function(done) {
                        expect(baseCollection.length).toBe(0);
                        baseCollection.fetch({
                            url: "./test/unit/main/collections/testResource.json",
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on collection
                        expect(_.isObject(baseCollection.xhr)).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(syncCallback, done));
                    });
                    it('that aborts correctly by calling abort', function(done) {
                        baseCollection.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on collection
                        expect(_.isFunction(_.get(baseCollection, 'xhr.state'))).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        baseCollection.xhr.fail(function() {
                            expect(_.get(baseCollection, 'xhr')).toBe(undefined);
                            done();
                        });
                        expect(_.isFunction(baseCollection.abort)).toBe(true);
                        expect(baseCollection.abort()).toBe(true);
                    });
                    it('that aborts first fetch correctly by other quick fetch call', function(done) {
                        expect(baseCollection.length).toBe(0);
                        baseCollection.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on collection
                        expect(_.isFunction(_.get(baseCollection, 'xhr.state'))).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        var failCalled = jasmine.createSpy('failCalled');
                        baseCollection.xhr.fail(function() {
                            failCalled();
                            expect(_.get(baseCollection, 'xhr')).toBe(undefined);
                        });
                        expect(failCalled).not.toHaveBeenCalled();
                        baseCollection.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        expect(failCalled).toHaveBeenCalled();
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(syncCallback, done));
                    });
                    it('that fetches correctly with resourceTitle passed into initialize', function(done) {
                        expect(baseCollection.length).toBe(0);
                        baseCollection = new BaseCollection(null, {
                            resourceTitle: 'test'
                        });
                        expect(_.get(baseCollection, 'resourceTitle')).toBe('test')
                        baseCollection.fetch({
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on collection
                        expect(_.isObject(baseCollection.xhr)).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(syncCallback, done));
                    });
                    it('that fetches correctly with type POST', function(done) {
                        expect(baseCollection.length).toBe(0);
                        baseCollection = new BaseCollection(null, {
                            resourceTitle: 'test'
                        });
                        expect(_.get(baseCollection, 'resourceTitle')).toBe('test')
                        spyOn(baseCollection, 'post').and.callThrough();
                        baseCollection.fetch({
                            success: successCallback,
                            cache: false,
                            type: 'POST'
                        });
                        // has xhr on collection
                        expect(_.isObject(baseCollection.xhr)).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(syncCallback, done));
                        expect(baseCollection.post).toHaveBeenCalled();
                    });
                    it('throws an error given a parse error', function(done) {
                        var CollectionWithParseError = BaseCollection.extend({
                            parse: function() {
                                var response = BaseCollection.prototype.parse.apply(this, arguments);
                                expect(_.isEmpty(response)).toBe(false);
                                expect(response.length).toBe(expectedDataLength);
                                var shouldThrowError = notHereVariable;
                                return response;
                            }
                        });
                        baseCollection = new CollectionWithParseError(null, {
                            resourceTitle: 'test'
                        });
                        var onErrorObj = { onError: _.noop };
                        spyOn(onErrorObj, 'onError');
                        expect(_.get(baseCollection, 'resourceTitle')).toBe('test');
                        baseCollection.fetch({
                            cache: false
                        });
                        expect(_.isObject(baseCollection.xhr)).toBe(true);
                        expect(_.get(baseCollection, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseCollection, 'sync', _.partial(function(done) {
                            expect(onErrorObj.onError).toHaveBeenCalled();
                            expect(baseCollection.length).toBe(1);
                            expect(_.isEmpty(baseCollection.first().toJSON())).toBe(true);
                            done();
                        }, done));
                        testObject.listenToOnce(baseCollection, 'error', onErrorObj.onError);
                    });
                });
            });
            afterAll(function() {
                testObject.destroy();
            });
        });
    });
