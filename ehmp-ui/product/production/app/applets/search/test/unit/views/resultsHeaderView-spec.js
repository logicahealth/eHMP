define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/search/views/resultsHeaderView'
], function($, Backbone, Marionette, jasmine, Stubs, ResultsHeaderView) {
    'use strict';

    describe('The Search Results Header View', function() {
        var view;
        var mockModel;
        var resources = window.ADK.UIResources;
        Stubs.bootstrapViewTest();

        beforeEach(function() {
            $.fn.extend({
                popover: function(options) {}
            });
            window.ADK.UIResources = {
                Fetch: {
                    TextSearch: {
                        Collection: ADK.Resources.Collection.extend({
                            fetchCollection: function() {
                                return new Backbone.Collection();
                            }
                        })
                    }
                }
            };

            mockModel = new Backbone.Model({
                searchTerm: 'mockSearchTerm'
            });
            view = new ResultsHeaderView({
                model: mockModel
            });
        });

        afterEach(function() {
            window.ADK.UIResources = resources;
            delete $.fn.popover;
        });

        describe('when constructing the view', function() {
            it('should exist', function() {
                expect(view).toBeDefined();
            });

            it('should have headerHidden set to true', function() {
                expect(view.headerHidden).toBe(true);
            });
        });

        describe('when rendered', function() {
            it('should create the numberofResultsRegion', function() {
                view.render();
                expect(view.getRegion('numberofResultsRegion').currentView).toBeDefined();
            });

            it('should create the synonymsButtonRegion', function() {
                view.render();
                expect(view.getRegion('synonymsButtonRegion').currentView).toBeDefined();
                expect(view.getRegion('synonymsButtonRegion').currentView.synonymsFetched).toBe(false);
            });

            it('should create the solrSyncStatusRegion', function() {
                view.render();
                expect(view.getRegion('solrSyncStatusRegion').currentView).toBeDefined();
            });
        });

        describe('when handleEnterOrSpaceBar is called', function() {
            it('with undefined event', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                synonymsButtonView.handleEnterOrSpaceBar(undefined);
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });

            it('with defined event with keyCode of 13', function() {
                view.render();

                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockEvent = {
                    keyCode: 13,
                    currentTarget: synonymsButtonView.$('.text-search-synonyms')[0]
                };

                synonymsButtonView.handleEnterOrSpaceBar(mockEvent);
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });

            it('with defined event with keyCode of 32', function() {
                view.render();

                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockEvent = {
                    keyCode: 32,
                    currentTarget: synonymsButtonView.$('.text-search-synonyms')[0]
                };

                synonymsButtonView.handleEnterOrSpaceBar(mockEvent);
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });

            it('with defined event with which of 32', function() {
                view.render();

                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockEvent = {
                    which: 32,
                    currentTarget: synonymsButtonView.$('.text-search-synonyms')[0]
                };

                synonymsButtonView.handleEnterOrSpaceBar(mockEvent);
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });

            it('with defined event with which of 27', function() {
                view.render();

                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockEvent = {
                    which: 27,
                    currentTarget: synonymsButtonView.$('.text-search-synonyms')[0]
                };

                synonymsButtonView.handleEnterOrSpaceBar(mockEvent);
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });
        });

        describe('when onShowSynonymsPopover is called', function() {
            it('properties on the view and synonyms button are set', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                spyOn(synonymsButtonView, 'fetchSynonyms');
                synonymsButtonView.onShowSynonymsPopover();
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('btn-default');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'true');
                expect(synonymsButtonView.fetchSynonyms).toHaveBeenCalled();
            });
        });

        describe('when onHideSynonymsPopover is called', function() {
            it('properties on the view and synonyms button are set', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                synonymsButtonView.onHideSynonymsPopover();
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('btn-primary');
                expect(synonymsButtonView.$('.text-search-synonyms')).not.toHaveClass('popover-shown');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveClass('btn-default');
                expect(synonymsButtonView.$('.text-search-synonyms')).toHaveAttr('aria-expanded', 'false');
            });
        });

        describe('when fetchSynonyms is called', function() {
            it('and this.synonymsFetched is true and this.synonymsFetching is false', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                spyOn(synonymsButtonView.collection, 'fetchCollection');
                synonymsButtonView.synonymsFetched = true;
                synonymsButtonView.synonymsFetching = false;
                synonymsButtonView.fetchSynonyms();
                expect(synonymsButtonView.synonymsFetching).toBe(false);
                expect(synonymsButtonView.collection.fetchCollection).not.toHaveBeenCalled();
            });

            it('and this.synonymsFetched is false and this.synonymsFetching is true', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                spyOn(synonymsButtonView.collection, 'fetchCollection');
                synonymsButtonView.synonymsFetched = false;
                synonymsButtonView.synonymsFetching = true;
                synonymsButtonView.fetchSynonyms();
                expect(synonymsButtonView.synonymsFetching).toBe(true);
                expect(synonymsButtonView.collection.fetchCollection).not.toHaveBeenCalled();
            });

            it('and this.synonymsFetched is false and this.synonymsFetching is false', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                spyOn(synonymsButtonView.collection, 'fetchCollection');
                synonymsButtonView.synonymsFetched = false;
                synonymsButtonView.synonymsFetching = false;
                synonymsButtonView.fetchSynonyms();
                expect(synonymsButtonView.synonymsFetching).toBe(true);
                expect(synonymsButtonView.collection.fetchCollection).toHaveBeenCalled();
            });
        });

        describe('when setSynonymList is called', function() {
            it('and synonymArray is undefined then the model\'s synonymList should only have the search term', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockSynonymArray;
                synonymsButtonView.setSynonymList(mockSynonymArray);
                expect(synonymsButtonView.model.get('synonymList')).toEqual('mocksearchterm');
            });

            it('and synonymArray is defined and does not contain the searchTerm then the model\'s synonymList should contain the synonymArray + searchTerm', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockSynonymArray = ['apple', 'pear', 'orange'];
                synonymsButtonView.setSynonymList(mockSynonymArray);
                expect(synonymsButtonView.model.get('synonymList')).toEqual('apple, mocksearchterm, orange, pear');
            });

            it('and synonymArray is defined and does contain the searchTerm then the model\'s synonymList should contain the synonymArray + searchTerm', function() {
                view.render();
                var synonymsButtonView = view.getRegion('synonymsButtonRegion').currentView;
                var mockSynonymArray = ['apple', 'pear', 'orange', 'mockSearchTerm'];
                synonymsButtonView.setSynonymList(mockSynonymArray);
                expect(synonymsButtonView.model.get('synonymList')).toEqual('apple, mocksearchterm, orange, pear');
            });
        });
        describe('Patient Sync status message', function() {
            var MY_SITE_MESSAGE = 'Search results limited to only data from My Site';
            var ALL_VA_MESSAGE = 'Search results limited to only data from All VA Sites';
            var runSyncStatusMessageTest = function(stats, message, allDataSynced) {
                spyOn(ADK.PatientRecordService, 'getCurrentPatient').and.callFake(function() {
                    return new Backbone.Model(stats);
                });
                view = new ResultsHeaderView({
                    model: mockModel
                });
                view.render();
                var solrSyncStatusView = view.getRegion('solrSyncStatusRegion').currentView;
                if (allDataSynced) {
                    expect(solrSyncStatusView.$('.redo-text-search').length).toEqual(0);
                } else {
                    expect(solrSyncStatusView.$('.redo-text-search')).toBeDefined();
                    expect(solrSyncStatusView.$('.alert-content p').html()).toEqual(message);
                }

            };
            describe('when only mySite is synced', function() {
                it('syncStatsForAllVa "isSolrSyncCompleted" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": false
                        },
                        "syncStatsForDoD": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, MY_SITE_MESSAGE);
                });
                it('syncStatsForAllVa "complete" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": false,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, MY_SITE_MESSAGE);
                });
                it('syncStatsForAllVa "isSolrSyncCompleted" & "complete" are false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        },
                        "syncStatsForDoD": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, MY_SITE_MESSAGE);
                });
                it('Patient only has vista sites syncStatsForAllVa "isSolrSyncCompleted" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": false
                        }
                    }, MY_SITE_MESSAGE);
                });
                it('Patient only has vista sites syncStatsForAllVa "completed" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": false,
                            "isSolrSyncCompleted": true
                        }
                    }, MY_SITE_MESSAGE);
                });
                it('Patient only has vista sites syncStatsForAllVa "isSolrSyncCompleted" & "completed" are false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, MY_SITE_MESSAGE);
                });
            });
            describe('when only AllVA is synced', function() {
                it('syncStatsForDoD "isSolrSyncCompleted" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": true,
                            "isSolrSyncCompleted": false
                        }
                    }, ALL_VA_MESSAGE);
                });
                it('syncStatsForDoD "completed" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": false,
                            "isSolrSyncCompleted": true
                        }
                    }, ALL_VA_MESSAGE);
                });
                it('syncStatsForDoD "isSolrSyncCompleted" & "completed" are false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, ALL_VA_MESSAGE);
                });
                it('syncStatsForCommunities "isSolrSyncCompleted" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForCommunities": {
                            "completed": true,
                            "isSolrSyncCompleted": false
                        }
                    }, ALL_VA_MESSAGE);
                });
                it('syncStatsForCommunities "completed" is false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForCommunities": {
                            "completed": false,
                            "isSolrSyncCompleted": true
                        }
                    }, ALL_VA_MESSAGE);
                });
                it('syncStatsForCommunities "isSolrSyncCompleted" & "completed" are false', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForCommunities": {
                            "completed": false,
                            "isSolrSyncCompleted": false
                        }
                    }, ALL_VA_MESSAGE);
                });
            });
            describe('when all data is synced', function() {
                it('Patient only has vista sites', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        }
                    }, null, true);
                });
                it('all vista data & DoD is synced no Communities data available', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        }
                    }, null, true);
                });
                it('all vista data & Communities is synced no DoD data available', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForCommunities": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        }
                    }, null, true);
                });
                it('all vista data & Communities & DoD is synced', function() {
                    runSyncStatusMessageTest({
                        "syncStatsForMySite": {
                            "isSolrSyncCompleted": true,
                            "completed": true,
                        },
                        "syncStatsForAllVa": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForDoD": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        },
                        "syncStatsForCommunities": {
                            "completed": true,
                            "isSolrSyncCompleted": true
                        }
                    }, null, true);
                });
            });
        });
    });
});