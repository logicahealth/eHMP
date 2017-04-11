/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/resources/abstract'],
    function($, Handlebars, Backbone, Marionette, Resources) {

        var testData = [{
            'string': 'hello',
            'number': 22,
            'array': [{
                'string': 'one'
            }, {
                'string': 'two'
            }, {
                'string': 'three'
            }],
            'object': {
                'string': 'one'
            }
        }, {
            'string': 'world',
            'number': 42,
            'array': [{
                'string': 'four'
            }, {
                'string': 'five'
            }, {
                'string': 'six'
            }],
            'object': {
                'string': 'two'
            }
        }, {
            'string': 'everyone',
            'number': 53,
            'array': [{
                'string': 'seven'
            }, {
                'string': 'eight'
            }, {
                'string': 'nine'
            }],
            'object': {
                'string': 'three'
            }
        }];

        describe('An abstract resource', function() {
            var Collection = Resources.Collection,
                Model = Resources.Model,
                abstractCollection,
                validateFullCollection = function(collection, Collection, Model) {
                    var model0 = collection.models[0],
                        model1 = collection.models[1],
                        model2 = collection.models[2];
                    return collection.length === 3 &&
                        _.size(model0.attributes) === 4 &&
                        model0.get('string') === 'hello' &&
                        model0.get('number') === 22 &&
                        model0.get('array') instanceof Collection &&
                        model0.get('array').length === 3 &&
                        model0.get('array').models[0].get('string') === 'one' &&
                        model0.get('array').models[1].get('string') === 'two' &&
                        model0.get('array').models[2].get('string') === 'three' &&
                        model0.get('object') instanceof Model &&
                        model0.get('object').get('string') === 'one' &&
                        _.size(model1.attributes) === 4 &&
                        model1.get('string') === 'world' &&
                        model1.get('number') === 42 &&
                        model1.get('array') instanceof Collection &&
                        model1.get('array').length === 3 &&
                        model1.get('array').models[0].get('string') === 'four' &&
                        model1.get('array').models[1].get('string') === 'five' &&
                        model1.get('array').models[2].get('string') === 'six' &&
                        model1.get('object') instanceof Model &&
                        model1.get('object').get('string') == 'two' &&
                        _.size(model2.attributes) == 4 &&
                        model2.get('string') === 'everyone' &&
                        model2.get('number') === 53 &&
                        model2.get('array') instanceof Collection &&
                        model2.get('array').length === 3 &&
                        model2.get('array').models[0].get('string') === 'seven' &&
                        model2.get('array').models[1].get('string') === 'eight' &&
                        model2.get('array').models[2].get('string') === 'nine' &&
                        model2.get('object') instanceof Model &&
                        model2.get('object').get('string') == 'three';
                };


            describe('is responsible for', function() {
                beforeEach(function() {
                    abstractCollection = new Collection(testData);
                });

                describe('parsing children', function() {
                    it('into models and collections', function() {
                        expect(abstractCollection instanceof Collection).toBe(true);
                        expect(validateFullCollection(abstractCollection, Collection, Model)).toBe(true);
                    });

                    it('after reset', function(done) {
                        abstractCollection.listenTo(abstractCollection, 'reset', function() {
                            expect(validateFullCollection(abstractCollection, Collection, Model)).toBe(true);
                            done();
                        });
                        abstractCollection.reset(testData);
                    });

                    it('after set objects', function(done) {
                        var objectModel = abstractCollection.models[0].get('object').clone();
                        abstractCollection.listenTo(abstractCollection, 'change', function() {
                            expect(validateFullCollection(abstractCollection, Collection, Model)).toBe(true);
                            done();
                        });
                        abstractCollection.models[0].set('object', objectModel);
                    });
                });
            });

        });

    });