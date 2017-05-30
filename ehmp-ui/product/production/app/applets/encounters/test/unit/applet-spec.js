define([
    'underscore',
    'require',
    'backbone',
    'app/applets/encounters/GistView',
    'app/applets/encounters/appUtil',
    'app/applets/encounters/applet',
    'app/resources/fetch/encounters/aggregate'
], function(_, require, Backbone, GistView, Util, EncountersApplet, AggregateResource) {
    'use strict';

    describe('The encounters applet', function() {
        beforeEach(function() {
            window.ADK.UIResources = {
                Fetch: {
                    Encounters: {
                        Aggregate: AggregateResource
                    }
                }
            };


        });

        afterEach(function() {
            window.ADK.UIResources = undefined;
        });

        it('is defined when it is initialized', function() {
            var mockOptions = {
                appletConfig: {
                    text: 'Mock appletConfig'
                }
            };
            var encounterAppletView = new EncountersApplet.viewTypes[0].view(mockOptions);
            expect(encounterAppletView).toBeDefined();
            expect(encounterAppletView.dataGridOptions.enableModal).toBe(true);
            expect(encounterAppletView.dataGridOptions.filterEnabled).toBe(true);
            expect(encounterAppletView.dataGridOptions.shadowCollection instanceof Backbone.Collection).toBe(true);
            expect(encounterAppletView.dataGridOptions.collection instanceof ADK.UIResources.Fetch.Encounters.Aggregate).toBe(true);
            expect(encounterAppletView.dataGridOptions.appletConfig.text).toEqual('Mock appletConfig');
            expect(encounterAppletView.appletConfig.text).toEqual('Mock appletConfig');
        });

        it('queryCollection is called and the fetchCollection is called', function() {
            var MockCollection = Backbone.Collection.extend({
                fetchCollection: function(obj) {
                    this.hasBeenCalled = true;
                }
            });

            var testMockCollection = new MockCollection();

            EncountersApplet.viewTypes[0].view.prototype.queryCollection({
                buildJdsDateFilter: function() {
                    return {};
                }
            }, testMockCollection);

            expect(testMockCollection.hasBeenCalled).toBe(true);
        });

        it('onFilterCollection is called with view.dataGridView as undefined', function() {
            var testSearch = {
                text: 'This is a test search'
            };

            var mockView = {
                search: undefined,
                dataGridOptions: {}
            };

            EncountersApplet.viewTypes[0].view.prototype.onFilterCollection.call(mockView, testSearch);

            expect(_.isFunction(mockView.dataGridOptions.filter)).toBe(true);
            expect(mockView.search.text).toEqual('This is a test search');
            expect(mockView.dataGridView).toBe(undefined);
        });

        it('onFilterCollection is called with view.dataGridView as defined', function() {
            var testSearch = {
                text: 'This is a test search'
            };

            var mockView = {
                search: undefined,
                dataGridOptions: {},
                dataGridView: {
                    render: function() {
                        this.hasBeenCalled = true;
                    }
                }
            };

            EncountersApplet.viewTypes[0].view.prototype.onFilterCollection.call(mockView, testSearch);

            expect(_.isFunction(mockView.dataGridOptions.filter)).toBe(true);
            expect(mockView.search.text).toEqual('This is a test search');
            expect(_.isFunction(mockView.dataGridView.filter)).toBe(true);
            expect(mockView.dataGridView.hasBeenCalled).toBe(true);
        });

        it('onClearFilter is called with search', function() {
            var testSearch = {
                text: 'This is a test search'
            };

            var mockView = {
                search: undefined,
                dataGridOptions: {},
                onFilterCollection: EncountersApplet.viewTypes[0].view.prototype.onFilterCollection
            };

            EncountersApplet.viewTypes[0].view.prototype.onClearFilter.call(mockView, testSearch);

            expect(_.isFunction(mockView.dataGridOptions.filter)).toBe(true);
            expect(mockView.search.text).toEqual('This is a test search');
            expect(mockView.dataGridView).toBe(undefined);
        });

        it('onClearFilter is called with falsey search', function() {
            var testSearch = {
                text: 'This is a test search'
            };

            var mockView = {
                search: undefined,
                dataGridOptions: {}
            };

            EncountersApplet.viewTypes[0].view.prototype.onClearFilter.call(mockView, undefined);

            expect(mockView.dataGridOptions.filter).toBe(undefined);
            expect(mockView.search).toBe(undefined);
            expect(mockView.dataGridView).toBe(undefined);
        });

        it('onBeforeDestroy is called and dataGridOptions attributes are destroyed', function() {
            var mockView = {
                dataGridOptions: {
                    refresh: function() {},
                    shadowCollection: new Backbone.Collection(),
                    collection: new Backbone.Collection()
                }
            };

            EncountersApplet.viewTypes[0].view.prototype.onBeforeDestroy.call(mockView);

            expect(mockView.dataGridOptions.refresh).toBe(undefined);
            expect(mockView.dataGridOptions.shadowCollection).toBe(undefined);
            expect(mockView.dataGridOptions.collection).toBe(undefined);
        });

        it('showVisitDetail is called and params is set without recent_model', function() {
            spyOn(Util, 'showDetailView');
            var mockParam = {
                model: new Backbone.Model()
            };

            mockParam.model.set('collection', new Backbone.Collection({
                uid: 'testUID'
            }));

            mockParam.model.get('collection').at(0).uid = 'testUID2';

            EncountersApplet.viewTypes[0].view.prototype.showVisitDetail(mockParam);

            expect(mockParam.uid).toEqual('testUID2');
            expect(mockParam.model.get('recent_model')).toBe(undefined);
        });

        it('showVisitDetail is called and params is set with recent_model', function() {
            spyOn(Util, 'showDetailView');
            spyOn(Util, 'getCPTprocedureDetailViewModel').and.returnValue(new Backbone.Model());
            var mockParam = {
                model: new Backbone.Model()
            };

            mockParam.model.set('collection', new Backbone.Collection({
                uid: 'testUID',
                isCptDomain: true
            }));

            mockParam.model.get('collection').at(0).uid = 'testUID2';

            EncountersApplet.viewTypes[0].view.prototype.showVisitDetail(mockParam);

            expect(mockParam.uid).toEqual('testUID2');
            expect(mockParam.model.get('recent_model') instanceof Backbone.Model).toBe(true);
        });
    });
});