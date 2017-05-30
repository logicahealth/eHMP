define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'test/stubs', 'app/applets/ccd_grid/util', 'app/applets/ccd_grid/applet'],
    function($, Backbone, Marionette, jasminejquery, Stubs, Util, CcdGridApplet) {
        'use strict';

        describe('Test for community health summaries utilities functions', function() {

            var response = null;

            var originalFormatDate = ADK.utils.formatDate;

            beforeEach(function(done) {
                ADK.utils.formatDate = jasmine.createSpy('formatDate').and.callFake(function(date, format) {
                    return '06/17/2014';
                });
                response = getInitializeResponse();
                done();
            });

            afterEach(function(done) {
                ADK.utils.formatDate = originalFormatDate;
                response = null;
                done();
            });

            function getInitializeResponse() {
                var initialResponse = {
                    'ccdDateTime': '20140617014108'
                };
                return initialResponse;
            }

            it('Test getReferenceDateDisplay and getReferenceDateTimeDisplay is formatted', function() {
                var referenceDateDisplay = Util.getReferenceDateDisplay(response.ccdDateTime);
                var referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(response.ccdDateTime);
                expect(ADK.utils.formatDate).toHaveBeenCalled();

                delete response.ccdDateTime;
                referenceDateDisplay = Util.getReferenceDateDisplay(response.ccdDateTime);
                expect(referenceDateDisplay).toEqual('N/A');
                referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(response.ccdDateTime);
                expect(referenceDateTimeDisplay).toEqual('N/A');
            });
        });


        describe('When the CCD Grid applet channel reply callback is executed', function() {
            var fetchCollectionIsCalled;
            var callbackValue;
            var params = {
                uid: 'uid',
                model: new Backbone.Model()
            };

            beforeEach(function() {
                fetchCollectionIsCalled = false;
                spyOn(ADK.Messaging, 'getChannel').and.callFake(function() {
                    return {
                        request: function() {
                            return new Backbone.Collection({});
                        }
                    };
                });

                window.ADK.UIResources = {
                    Fetch: {
                        CommunityHealthSummaries: {
                            Collection: Backbone.Collection.extend( {
                                fetchCollection: function(options) {
                                    fetchCollectionIsCalled = true;
                                }
                            })
                        }
                    }
                };

                callbackValue = Stubs.messagingChannelsReplyCallbacks.ccd_grid(params);
            });

            it('the callback returns the detailView data', function() {
                expect(callbackValue.title).toEqual('Loading...');
                expect(_.isFunction(callbackValue.view)).toBe(true);
                expect(_.isFunction(callbackValue.headerView)).toBe(true);
            });

            it('and the callback view is instantiated, the view is initialized', function() {
                var view = new callbackValue.view();
                expect(view.collection instanceof ADK.UIResources.Fetch.CommunityHealthSummaries.Collection).toBe(true);
                expect(view.model).toEqual(params.model);
            });

            it('and the callback view is instantiated and onBeforeShow is called, the collection is fetched', function() {
                var view = new callbackValue.view();
                view.onBeforeShow();
                expect(fetchCollectionIsCalled).toBe(true);
            });

            it('and the callback view is instantiated and onBeforeShow is called, the collection is fetched', function() {
                var view = new callbackValue.view();
                view.onBeforeShow();
                expect(fetchCollectionIsCalled).toBe(true);
            });

            it('and the callback view is instantiated and collection sync is triggered, the model is updated', function() {
                var view = new callbackValue.view();
                var mockCollection = new Backbone.Collection({fullHtml: 'sample html'});
                spyOn(Util, 'highlightSearchTerm').and.returnValue(mockCollection.at(0).get('fullHtml'));
                view.collection.trigger('sync', mockCollection);
                expect(view.model.get('fullHtml')).toEqual('sample html');
            });

            it('and the callback headerView is instantiated, the headerView is initialized', function() {
                var headerView = new callbackValue.headerView();
                expect(headerView.collection instanceof ADK.UIResources.Fetch.CommunityHealthSummaries.Collection).toBe(true);
                expect(headerView.model).toEqual(params.model);
                expect(headerView.isSynced).toBe(false);
            });

            it('and the callback headerView is instantiated and collection sync is triggered, the model is updated', function() {
                var headerView = new callbackValue.view();
                var mockCollection = new Backbone.Collection({fullHtml: 'sample html'});
                spyOn(Util, 'highlightSearchTerm').and.returnValue(mockCollection.at(0).get('fullHtml'));
                headerView.collection.trigger('sync', mockCollection);
                expect(headerView.model.get('fullHtml')).toEqual('sample html');
            });
        });
    });
