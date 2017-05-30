/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define([
    'backbone',
    'marionette',
    'underscore',
    'api/Errors'
], function(
    Backbone,
    Marionette,
    _,
    Errors
) {

    // to avoid models being added in test suite
    Errors.collection.add = _.noop;

    describe('The Errors api', function() {

        describe('contains omitNonJSONDeep function', function() {
            var executeArr = function(targetObj, key) {
                var expectedArr = [{
                    bool: true,
                    string: 'test string1',
                    array: [0, 1, 2, 3],
                    object: {
                        nestedBool: false,
                        nestedstring: 'nested test string1',
                        nestedArray: [],
                    },
                    number: 2
                }, {
                    bool: false,
                    string: 'test string2',
                    array: [10, 11, 12, 13],
                    object: {
                        nestedBool: true,
                        nestedstring: 'nested test string2',
                        nestedArray: []
                    }
                }];

                var sourceArr = [{
                    bool: true,
                    func: _.noop,
                    string: 'test string1',
                    array: [0, 1, 2, 3],
                    error: new Error('test error1'),
                    object: {
                        nestedBool: false,
                        nestedFunc: function() {
                            return;
                        },
                        nestedstring: 'nested test string1',
                        nestedArray: [_.noop, _.get, _.set],
                        nestedError: new Error('nested test error1'),
                    },
                    null: null,
                    number: 2,
                    view: new Backbone.Marionette.ItemView(),
                    View: Backbone.Marionette.ItemView.extend()
                }, {
                    bool: false,
                    func: _.get,
                    string: 'test string2',
                    array: [10, 11, 12, 13],
                    error: new Error('test error2'),
                    object: {
                        nestedBool: true,
                        nestedFunc: function() {
                            return false;
                        },
                        nestedstring: 'nested test string2',
                        nestedArray: [_.each, _.map, _.transform],
                        nestedError: new Error('nested test error2'),
                    },
                    model: new Backbone.Model,
                    Collection: Backbone.Collection.extend()
                }];
                Errors.omitNonJSONDeep(sourceArr, (key || 'arr'), targetObj);
                expect(_.isEqual(expectedArr, targetObj[key || 'arr'])).toBe(true);
                return targetObj;
            };

            var executeObj = function(targetObj, key) {
                var clonedTargetObj = _.cloneDeep(targetObj);
                var expectedParsedArgs = [clonedTargetObj];
                if (key) expectedParsedArgs.push(key);
                var expectedObj = {
                    bool: true,
                    string: 'test string',
                    array: [0, 1, 2, 3],
                    object: {
                        nestedBool: false,
                        nestedstring: 'nested test string',
                        nestedArray: [],
                        nestedObj: {
                            doubleNestedObj: {
                                bottomBool: true
                            },
                            doubleNestedString: 'double nested string',
                            doubleNestedArgs: expectedParsedArgs
                        }
                    },
                    number: 2
                };

                var sourceObj = {
                    bool: true,
                    func: _.noop,
                    string: 'test string',
                    array: [0, 1, 2, 3],
                    error: new Error('test error1'),
                    object: {
                        nestedBool: false,
                        nestedFunc: function() {
                            return;
                        },
                        nestedstring: 'nested test string',
                        nestedArray: [_.noop, _.get, _.set],
                        nestedObj: {
                            doubleNestedObj: {
                                bottomBool: true
                            },
                            doubleNestedString: 'double nested string',
                            doubleNestedArgs: arguments
                        },
                        nestedError: new Error('nested test error1')
                    },
                    null: null,
                    number: 2,
                    view: new Backbone.Marionette.ItemView(),
                    View: Backbone.Marionette.ItemView.extend(),
                    model: new Backbone.Model(),
                    Collection: Backbone.Collection.extend()
                };

                Errors.omitNonJSONDeep(sourceObj, (key || 'obj'), targetObj);
                expect(_.isEqual(expectedObj, targetObj[key || 'obj'])).toBe(true);
                return targetObj;
            };

            it('that is of type function', function() {
                expect(_.isFunction(Errors.omitNonJSONDeep)).toBe(true);
            });

            it('that accepts an array', function() {
                var targetObj = executeArr({});
                expect(_.keys(targetObj).length).toBe(1);
                expect(_.has(targetObj, 'arr')).toBe(true);
            });

            it('that accepts an object', function() {
                var targetObj = executeObj({});
                expect(_.keys(targetObj).length).toBe(1);
                expect(_.has(targetObj, 'obj')).toBe(true);
            });

            it('that accepts an object and array', function() {
                var targetObj = executeObj({});
                targetObj = executeArr(targetObj);
                expect(_.keys(targetObj).length).toBe(2);
                expect(_.has(targetObj, 'obj')).toBe(true);
                expect(_.has(targetObj, 'arr')).toBe(true);
            });

            it('that accepts multiple objects and arrays', function() {
                var targetObj = executeArr({});
                targetObj = executeObj(targetObj);
                expect(_.keys(targetObj).length).toBe(2);
                expect(_.has(targetObj, 'obj')).toBe(true);
                expect(_.has(targetObj, 'arr')).toBe(true);
                targetObj = executeArr(targetObj, 'arr2');
                targetObj = executeObj(targetObj, 'obj2');
                expect(_.keys(targetObj).length).toBe(4);
                expect(_.has(targetObj, 'obj2')).toBe(true);
                expect(_.has(targetObj, 'arr2')).toBe(true);
                expect(_.has(targetObj, 'obj')).toBe(true);
                expect(_.has(targetObj, 'arr')).toBe(true);
            });
        });
    });
});
