/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/resources/resources'],
    function($, Handlebars, Backbone, Marionette, Resources) {

        describe('An abstract resource', function() {
            describe('is capable of', function() {
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

                beforeEach(function() {
                    abstractCollection = new Collection(testData, {
                        parse: true
                    });
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

            describe('can aggregate data', function() {
                var response = [{
                    'index': 1,
                    'date': '20120202',
                    'name': 'palmetto'
                }, {
                    'index': 2,
                    'date': '20120202',
                    'name': 'palmetto'
                }, {
                    'index': 3,
                    'date': '20150122',
                    'name': 'palmetto'
                }, {
                    'index': 4,
                    'date': '20150121',
                    'name': 'palmetto'
                }, {
                    'index': 5,
                    'date': '20171230',
                    'name': 'oak'
                }, {
                    'index': 6,
                    'date': '20171220',
                    'name': 'oak'
                }, ];

                describe('with a single layer', function() {
                    var AggregateModel = Resources.Aggregate.Model.extend({
                        update: function(model) {
                            var collection = this.getCollection();
                            var result = {
                                'count': collection.length,
                                'maxDate': collection.max('date'),
                                'name': model.get('name'),
                                'date': model.get('date')
                            };
                            this.set(result);
                        }
                    });

                    var Aggregate = Resources.Aggregate.Collection.extend({
                        initialize: function() {
                            this.setFullCollection(new Backbone.Collection());
                        },
                        comparator: 'maxDate',
                        Model: AggregateModel
                    });

                    describe('groups by \'name\'', function() {
                        describe('and the model with atttribute {name: \'palmetto\'}', function() {
                            var aggregateExample, palmettoModel, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                palmettoModel = aggregateExample.findWhere({
                                    'name': 'palmetto'
                                });
                            });
                            it('exists', function() {
                                expect(palmettoModel instanceof AggregateModel).toBe(true);
                            });
                            it('has 4 items', function() {
                                expect(palmettoModel.get('count')).toEqual(4);
                            });

                            it('correctly calculates maxDate', function() {
                                var maxDate = palmettoModel.get('maxDate');
                                var calculatedMax = _.max(calculatedGroup.palmetto, function(model) {
                                    return model.get('date');
                                });
                                expect(maxDate === calculatedMax).toEqual(true);
                                expect(maxDate.get('index')).toEqual(3);
                            });
                        });

                        describe('and the model with atttribute {name: \'oak\'}', function() {
                            var aggregateExample, oakModel, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                oakModel = aggregateExample.findWhere({
                                    'name': 'oak'
                                });
                            });
                            it('exists', function() {
                                expect(oakModel instanceof AggregateModel).toBe(true);
                            });
                            it('has 2 items', function() {
                                expect(oakModel.get('count')).toEqual(2);
                            });

                            it('correctly calculates maxDate', function() {
                                var maxDate = oakModel.get('maxDate');
                                var calculatedMax = _.max(calculatedGroup.oak, function(model) {
                                    return model.get('date');
                                });
                                expect(maxDate === calculatedMax).toEqual(true);
                                expect(maxDate.get('index')).toEqual(5);
                            });
                        });

                        describe('and is able to add a new item with {name: \'oak\'} ', function() {
                            var aggregateExample;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                            });

                            it('that changes count to 3 and will contain the new maxDate model', function() {
                                var obj = {
                                    'index': 7,
                                    'date': '20200101',
                                    'name': 'oak'
                                };
                                aggregateExample.collection.add(obj);
                                var oakModel = aggregateExample.findWhere({
                                    'name': 'oak'
                                });
                                expect(oakModel.get('maxDate').get('date') === '20200101').toBe(true);
                                expect(oakModel.get('count')).toEqual(3);
                            });

                            it('using reset', function() {
                                var obj = {
                                    'index': 7,
                                    'date': '20200101',
                                    'name': 'oak'
                                };
                                aggregateExample.collection.reset(obj);
                                expect(aggregateExample.length).toEqual(1);
                            });
                        });

                        describe('and is able to remove item[s] with', function() {
                            var aggregateExample;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                            });

                            it('{name: \'oak\', date: \'20171230\'} that changes count to 1 and will contain the new maxDate model', function() {
                                var removeModel = aggregateExample.collection.findWhere({
                                    index: 5
                                });
                                aggregateExample.collection.remove(removeModel);
                                var oakModel = aggregateExample.findWhere({
                                    'name': 'oak'
                                });
                                expect(oakModel.get('maxDate').get('date') === '20171220').toBe(true);
                                expect(oakModel.get('count')).toEqual(1);
                            });

                            it('{name: \'oak\'} that should remove entire \'oak\' aggregate entry', function() {
                                var removeModels = aggregateExample.collection.filter({
                                    name: 'oak'
                                });
                                aggregateExample.collection.remove(removeModels);
                                var oakModel = aggregateExample.filter({
                                    'name': 'oak'
                                });
                                expect(oakModel.length).toEqual(0);
                                expect(aggregateExample.length).toEqual(1);
                            });

                            it('reset', function() {
                                aggregateExample.collection.reset();
                                expect(aggregateExample.length).toEqual(0);
                            });
                        });

                        describe('when collection is assigned after the fact', function() {
                            var aggregateExample;
                            var ModifiedAggregate = Aggregate.extend({
                                'groupId': 'name',
                                initialize: function() {}
                            });

                            it('and no collection is set initially', function() {
                                aggregateExample = new ModifiedAggregate();
                                var testCollection = new Backbone.Collection(response);
                                aggregateExample.setFullCollection(testCollection);
                                expect(aggregateExample.length).toEqual(2);
                                expect(aggregateExample.findWhere({
                                    'name': 'oak'
                                }).getCollection().length).toEqual(2);
                                expect(aggregateExample.findWhere({
                                    'name': 'palmetto'
                                }).getCollection().length).toEqual(4);
                            });


                            it('and a collection is set initially', function() {
                                aggregateExample = new(ModifiedAggregate.extend({
                                    initialize: function() {
                                        this.setFullCollection(new Backbone.Collection([{
                                            'name': 'woot'
                                        }, {
                                            'name': 'woot'
                                        }]));
                                    }
                                }))();

                                expect(aggregateExample.length).toEqual(1);

                                var testCollection = new Backbone.Collection(response);
                                aggregateExample.setFullCollection(testCollection);
                                expect(aggregateExample.length).toEqual(2);
                                expect(aggregateExample.findWhere({
                                    'name': 'oak'
                                }).getCollection().length).toEqual(2);
                                expect(aggregateExample.findWhere({
                                    'name': 'palmetto'
                                }).getCollection().length).toEqual(4);
                            });
                        });
                    });

                    describe('groups by \'name\' and \'date\'', function() {
                        describe('and the models with atttribute {name: \'palmetto\'}', function() {
                            var aggregateExample, palmettoModels, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': ['name', 'date']
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                palmettoModels = aggregateExample.filter({
                                    'name': 'palmetto'
                                });
                            });

                            it('makes up 3 groups', function() {
                                expect(palmettoModels.length).toBe(3);
                            });

                            it('that also have {date: \'20120202\'}', function() {
                                var dateModel = _.find(palmettoModels, function(model) {
                                    return model.get('date') === '20120202';
                                });
                                expect(dateModel.get('count')).toEqual(2);
                            });

                            it('that also have {date: \'20150121\'}', function() {
                                var dateModel = _.find(palmettoModels, function(model) {
                                    return model.get('date') === '20150121';
                                });
                                expect(dateModel.get('count')).toEqual(1);
                            });

                            it('that also have {date: \'20150122\'}', function() {
                                var dateModel = _.find(palmettoModels, function(model) {
                                    return model.get('date') === '20150122';
                                });
                                expect(dateModel.get('count')).toEqual(1);
                            });
                        });

                        describe('and the model with atttribute {name: \'oak\'}', function() {
                            var aggregateExample, oakModels, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': ['name', 'date']
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                oakModels = aggregateExample.filter({
                                    'name': 'oak'
                                });
                            });

                            it('makes up 2 groups', function() {
                                expect(oakModels.length).toBe(2);
                            });

                            it('that also have {date: \'20171220\'}', function() {
                                var dateModel = _.find(oakModels, function(model) {
                                    return model.get('date') === '20171220';
                                });
                                expect(dateModel.get('count')).toEqual(1);
                            });

                            it('that also have {date: \'20171230\'}', function() {
                                var dateModel = _.find(oakModels, function(model) {
                                    return model.get('date') === '20171230';
                                });
                                expect(dateModel.get('count')).toEqual(1);
                            });
                        });
                    });
                });

                describe('with a nested layer', function() {
                    var AggregateModel = Resources.Aggregate.Model.extend({
                        defaults: function() {
                            var ChildCollection = this.Collection.extend({
                                comparator: 'date'
                            });
                            var SubAggregate = Resources.Aggregate.Collection.extend({
                                groupId: 'date',
                                initialize: function() {
                                    this.setFullCollection(new Backbone.Collection());
                                },
                                Model: AggregateModel.extend({
                                    defaults: {
                                        //don't define groupByDate so we can switch against it recursively
                                        'count': 0,
                                        'maxDate': undefined,
                                        'name': undefined,
                                        'date': undefined
                                    }
                                })
                            });
                            return {
                                'count': 0,
                                'maxDate': undefined,
                                'name': undefined,
                                'groupByDate': new SubAggregate(),
                                'collection': new ChildCollection()
                            };
                        },
                        update: function(model) {
                            var collection = this.getCollection();
                            var result = {
                                'count': collection.length,
                                'maxDate': collection.max('date'),
                                'name': model.get('name'),
                                'date': model.get('date')
                            };
                            var subCollection = this.get('groupByDate');

                            if (subCollection) {
                                subCollection.collection.add(model);
                            }
                            this.set(result);
                        }
                    });

                    var Aggregate = Resources.Aggregate.Collection.extend({
                        initialize: function() {
                            this.setFullCollection(new Backbone.Collection());
                        },
                        comparator: 'maxDate',
                        Model: AggregateModel
                    });

                    describe('groups by \'name\'', function() {
                        describe('and the model with atttribute {name: \'palmetto\'}', function() {
                            var aggregateExample, palmettoModel, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                palmettoModel = aggregateExample.findWhere({
                                    'name': 'palmetto'
                                });
                            });
                            it('exists', function() {
                                expect(palmettoModel instanceof AggregateModel).toBe(true);
                            });
                            it('has 4 items', function() {
                                expect(palmettoModel.get('count')).toEqual(4);
                            });

                            it('correctly calculates maxDate', function() {
                                var maxDate = palmettoModel.get('maxDate');
                                var calculatedMax = _.max(calculatedGroup.palmetto, function(model) {
                                    return model.get('date');
                                });
                                expect(maxDate === calculatedMax).toEqual(true);
                                expect(maxDate.get('index')).toEqual(3);
                            });

                            it('correctly divides dates into the sub collections', function() {
                                var groupByDate = palmettoModel.get('groupByDate');
                                expect(groupByDate.length).toEqual(3);
                                expect(groupByDate.findWhere({'date':'20120202'}).get('count')).toEqual(2);
                                expect(groupByDate.findWhere({'date':'20150121'}).get('count')).toEqual(1);
                                expect(groupByDate.findWhere({'date':'20150122'}).get('count')).toEqual(1);
                            });
                        });
                        describe('and the model with atttribute {name: \'oak\'}', function() {
                            var aggregateExample, oakModel, calculatedGroup;
                            beforeEach(function() {
                                aggregateExample = new(Aggregate.extend({
                                    'groupId': 'name'
                                }))();
                                aggregateExample.collection.set(response);
                                calculatedGroup = aggregateExample.collection.groupBy('name');
                                oakModel = aggregateExample.findWhere({
                                    'name': 'oak'
                                });
                            });
                            it('exists', function() {
                                expect(oakModel instanceof AggregateModel).toBe(true);
                            });
                            it('has 2 items', function() {
                                expect(oakModel.get('count')).toEqual(2);
                            });

                            it('correctly calculates maxDate', function() {
                                var maxDate = oakModel.get('maxDate');
                                var calculatedMax = _.max(calculatedGroup.oak, function(model) {
                                    return model.get('date');
                                });
                                expect(maxDate === calculatedMax).toEqual(true);
                                expect(maxDate.get('index')).toEqual(5);
                            });

                            it('correctly divides dates into the sub collections', function() {
                                var groupByDate = oakModel.get('groupByDate');
                                expect(groupByDate.length).toEqual(2);
                                expect(groupByDate.findWhere({'date':'20171230'}).get('count')).toEqual(1);
                                expect(groupByDate.findWhere({'date':'20171220'}).get('count')).toEqual(1);
                            });
                        });
                    });
                });
            });
        });

    });