/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

define(['underscore', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/models/models', 'api/UrlBuilder', 'main/ResourceDirectory'],
    function(_, $, Handlebars, Backbone, Marionette, ADKModels, UrlBuilder, ResourceDirectory) {
        'use strict';
        describe('A base model', function() {
            beforeAll(function() {
                var resourceDirectory = ResourceDirectory.instance();
                resourceDirectory.reset();
                resourceDirectory.add(_.extend({}, _.get(resourceDirectory, 'model.prototype.defaults', {}), {
                    "title": "test",
                    "href": "./test/unit/main/models/testResource.json"
                }));
            });
            var BaseModel = ADKModels.BaseModel.extend({
                parse: function(response) {
                    var parsedResponse;
                    if (response.data) {
                        if (response.data.item) {
                            parsedResponse = response.data.item;
                        } else {
                            parsedResponse = response.data;
                        }
                    } else {
                        parsedResponse = response;
                    }

                    return parsedResponse;
                }
            });
            var baseModel;
            var testObject = new Backbone.Marionette.Object();
            describe('consists of', function() {
                beforeEach(function() {
                    baseModel = new BaseModel();
                });
                describe('a Backbone.Model', function() {
                    var successCallback = function(model, response, xhrObj) {
                        expect(_.get(xhrObj, 'xhr.state')()).toBe('resolved');
                        // data as expected (from test resource)?
                        expect(model.get('id')).toBe('1');
                        expect(model.get('value')).toBe('value1');
                    };
                    var syncCallback = function(done) {
                        // should have been removed onSync in model
                        expect(_.get(baseModel, 'xhr.state')).toBe(undefined);
                        done();
                    };
                    it('that is of correct type', function() {
                        expect((baseModel instanceof ADKModels.BaseModel) &&
                            (baseModel instanceof Backbone.Model)).toBe(true);
                    });
                    it('that fetches correctly with resourceTitle', function(done) {
                        expect(baseModel.isEmpty()).toBe(true);
                        baseModel.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isObject(baseModel.xhr)).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(syncCallback, done));
                    });
                    it('that fetches correctly with url', function(done) {
                        expect(baseModel.isEmpty()).toBe(true);
                        baseModel.fetch({
                            url: "./test/unit/main/models/testResource.json",
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isObject(baseModel.xhr)).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(syncCallback, done));
                    });
                    it('that aborts correctly by calling abort', function(done) {
                        baseModel.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isFunction(_.get(baseModel, 'xhr.state'))).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        baseModel.xhr.fail(function() {
                            expect(_.get(baseModel, 'xhr')).toBe(undefined);
                            done();
                        });
                        expect(_.isFunction(baseModel.abort)).toBe(true);
                        expect(baseModel.abort()).toBe(true);
                    });
                    it('that aborts first fetch correctly by other quick fetch call', function(done) {
                        expect(baseModel.isEmpty()).toBe(true);
                        baseModel.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isFunction(_.get(baseModel, 'xhr.state'))).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        var failCalled = jasmine.createSpy('failCalled');
                        baseModel.xhr.fail(function() {
                            failCalled();
                            expect(_.get(baseModel, 'xhr')).toBe(undefined);
                        });
                        expect(failCalled).not.toHaveBeenCalled();
                        baseModel.fetch({
                            resourceTitle: 'test',
                            success: successCallback,
                            cache: false
                        });
                        expect(failCalled).toHaveBeenCalled();
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(syncCallback, done));
                    });
                    it('that fetches correctly with resourceTitle passed into initialize', function(done) {
                        expect(baseModel.isEmpty()).toBe(true);
                        baseModel = new BaseModel(null, {
                            resourceTitle: 'test'
                        });
                        expect(_.get(baseModel, 'resourceTitle')).toBe('test')
                        baseModel.fetch({
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isObject(baseModel.xhr)).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(syncCallback, done));
                    });
                    it('that saves correctly', function(done) {
                        expect(baseModel.isEmpty()).toBe(true);
                        baseModel = new BaseModel(null, {
                            resourceTitle: 'test'
                        });
                        expect(_.get(baseModel, 'resourceTitle')).toBe('test')
                        spyOn(baseModel, 'save').and.callThrough();
                        baseModel.save(null, {
                            success: successCallback,
                            cache: false
                        });
                        // has xhr on model
                        expect(_.isObject(baseModel.xhr)).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(syncCallback, done));
                        expect(baseModel.save).toHaveBeenCalled();
                    });
                    it('throws an error given a parse error', function(done) {
                        var ModelWithParseError = BaseModel.extend({
                            parse: function() {
                                var response = BaseModel.prototype.parse.apply(this, arguments);
                                expect(_.isEmpty(response)).toBe(false);
                                var shouldThrowError = notHereVariable;
                                return response;
                            }
                        });
                        baseModel = new ModelWithParseError(null, {
                            resourceTitle: 'test'
                        });
                        var onErrorObj = { onError: _.noop };
                        spyOn(onErrorObj, 'onError');
                        expect(_.get(baseModel, 'resourceTitle')).toBe('test');
                        baseModel.fetch({
                            cache: false
                        });
                        expect(_.isObject(baseModel.xhr)).toBe(true);
                        expect(_.get(baseModel, 'xhr.state')()).toBe('pending');
                        testObject.listenToOnce(baseModel, 'sync', _.partial(function(done) {
                            expect(onErrorObj.onError).toHaveBeenCalled();
                            expect(baseModel.isEmpty()).toBe(true);
                            done();
                        }, done));
                        testObject.listenToOnce(baseModel, 'error', onErrorObj.onError);
                    });
                });
            });
            afterAll(function() {
                testObject.destroy();
            });
        });
    });
