/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, window, ADK*/

define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'require',
    'test/stubs',
    'app/applets/military_hist/applet'
], function($, Backbone, Marionette, jasminejquery, require, Stubs, MilitaryHistoryApplet) {
    'use strict';

    describe('While testing the Military History applet', function() {
        var view;
        var resources = window.ADK.UIResources;
        Stubs.bootstrapViewTest();

        beforeEach(function() {
            window.ADK.UIResources = {
                Fetch: {
                    MilitaryHistory: {
                        MetaCollection: ADK.Resources.Collection.extend({
                            fetchCollection: function() {
                                return ADK.PatientRecordService.fetchCollection({}, this);
                            }
                        }),
                        SiteCollection: ADK.Resources.Collection.extend({
                            fetchCollection: function() {
                                return ADK.PatientRecordService.fetchCollection({}, this);
                            }
                        }),
                        UserCollection: ADK.Resources.Collection.extend({
                            fetchCollection: function() {
                                return ADK.PatientRecordService.fetchCollection({}, this);
                            }
                        })
                    }
                }
            };
        });

        afterEach(function() {
            window.ADK.UIResources = resources;
        });

        describe('when initializing the applet', function() {
            it('expect the applet to be created successfully', function() {
                view = new MilitaryHistoryApplet.viewTypes[1].view({
                    appletConfig: {
                        viewTypes: 'viewType'
                    }
                });
                expect(view).toBeDefined(true);
            });
        });

        describe('when MetaCollection is fetched', function() {
            it('expect collection parse to be called with response', function() {
                spyOn(ADK.PatientRecordService, 'fetchCollection');
                view = new MilitaryHistoryApplet.viewTypes[1].view({
                    appletConfig: {
                        viewTypes: 'viewType'
                    }
                });

                expect(ADK.PatientRecordService.fetchCollection).toHaveBeenCalled();
            });

            it('expect collection parse to be called without response', function() {
                spyOn(ADK.PatientRecordService, 'fetchCollection');
                view = new MilitaryHistoryApplet.viewTypes[1].view({
                    appletConfig: {
                        viewTypes: 'viewType'
                    }
                });

                expect(ADK.PatientRecordService.fetchCollection).toHaveBeenCalled();
            });
        });

        describe('when MetaCollection sync is triggered', function() {
            it('expect userCollection and siteCollection to be returned', function() {
                spyOn(ADK.PatientRecordService, 'fetchCollection');
                view = {
                    columnsViewType: 'expanded',
                    collection: new ADK.UIResources.Fetch.MilitaryHistory.MetaCollection(),
                    sites: new ADK.UIResources.Fetch.MilitaryHistory.SiteCollection(),
                    bindEntityEvents: function(collection, event) {}
                };

                view.collection.add([{
                    'description': 'This is 2nd testing text row 1',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121018',
                    'name': 'Branch of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 2',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121055',
                    'name': 'Years of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 3',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121115',
                    'name': 'Areas of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 4',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121137',
                    'name': 'Occupational Specialties',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }]);

                MilitaryHistoryApplet.viewTypes[1].view.prototype.collectionEvents.sync.call(view);
                expect(ADK.PatientRecordService.fetchCollection.calls.count()).toEqual(2);
            });
        });

        describe('when SiteCollection sync is triggered', function() {
            var mockView;

            beforeEach(function() {
                mockView = {
                    collection: new ADK.UIResources.Fetch.MilitaryHistory.MetaCollection(),
                    sites: new ADK.UIResources.Fetch.MilitaryHistory.SiteCollection()
                };

                mockView.collection.add([{
                    'description': 'This is 2nd testing text row 1',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121018',
                    'name': 'Branch of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 2',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121055',
                    'name': 'Years of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 3',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121115',
                    'name': 'Areas of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 4',
                    'siteHash': 'C874',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121137',
                    'name': 'Occupational Specialties',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }]);
            });

            it('expect MetaCollection to be processed with siteDisplayName', function() {
                mockView.sites.add([{
                    'name': 'KODAK',
                    'division': '507',
                    'production': false,
                    'siteCode': 'SITE'
                }, {
                    'name': 'MARTINSBURG',
                    'division': '613',
                    'production': false,
                    'siteCode': 'C874'
                }, {
                    'name': 'PANORAMA',
                    'division': '500',
                    'production': false,
                    'siteCode': 'SITE'
                }, {
                    'name': 'WASHINGTON',
                    'division': '688',
                    'production': false,
                    'siteCode': 'C872'
                }]);

                MilitaryHistoryApplet.viewTypes[1].view.prototype.siteCollectionEvents.sync.call(mockView);

                expect(mockView.collection.at(0).get('siteDisplayName')).toEqual('PANORAMA');
                expect(mockView.collection.at(1).get('siteDisplayName')).toEqual('KODAK');
                expect(mockView.collection.at(2).get('siteDisplayName')).toEqual('PANORAMA');
                expect(mockView.collection.at(3).get('siteDisplayName')).toEqual('MARTINSBURG');
            });

            it('expect MetaCollection to be processed with siteDisplayName of empty string when sites collection is empty', function() {
                MilitaryHistoryApplet.viewTypes[1].view.prototype.siteCollectionEvents.sync.call(mockView);

                expect(mockView.collection.at(0).get('siteDisplayName')).toEqual('');
                expect(mockView.collection.at(1).get('siteDisplayName')).toEqual('');
                expect(mockView.collection.at(2).get('siteDisplayName')).toEqual('');
                expect(mockView.collection.at(3).get('siteDisplayName')).toEqual('');
            });

            it('expect MetaCollection to be processed with siteDisplayName of empty string when siteHash is falsy', function() {
                mockView.collection.at(0).set('siteHash', '');
                mockView.collection.at(2).set('siteHash', '');

                mockView.sites.add([{
                    'name': 'KODAK',
                    'division': '507',
                    'production': false,
                    'siteCode': 'SITE'
                }, {
                    'name': 'MARTINSBURG',
                    'division': '613',
                    'production': false,
                    'siteCode': 'C874'
                }, {
                    'name': 'PANORAMA',
                    'division': '500',
                    'production': false,
                    'siteCode': 'SITE'
                }, {
                    'name': 'WASHINGTON',
                    'division': '688',
                    'production': false,
                    'siteCode': 'C872'
                }]);

                MilitaryHistoryApplet.viewTypes[1].view.prototype.siteCollectionEvents.sync.call(mockView);

                expect(mockView.collection.at(0).get('siteDisplayName')).toEqual('');
                expect(mockView.collection.at(1).get('siteDisplayName')).toEqual('KODAK');
                expect(mockView.collection.at(2).get('siteDisplayName')).toEqual('');
                expect(mockView.collection.at(3).get('siteDisplayName')).toEqual('MARTINSBURG');
            });
        });

        describe('when UserCollection sync is triggered', function() {
            var mockView;
            var userCollection;

            beforeEach(function() {
                mockView = {
                    collection: new ADK.UIResources.Fetch.MilitaryHistory.MetaCollection()
                };

                mockView.collection.add([{
                    'description': 'This is 2nd testing text row 1',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121018',
                    'name': 'Branch of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 2',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000236',
                    'touchedOn': '20161212121055',
                    'name': 'Years of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 3',
                    'siteHash': 'SITE',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121115',
                    'name': 'Areas of Service',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }, {
                    'description': 'This is 2nd testing text row 4',
                    'siteHash': 'C874',
                    'touchedBy': 'urn:va:user:SITE:10000000235',
                    'touchedOn': '20161212121137',
                    'name': 'Occupational Specialties',
                    'version': '2.0.r01',
                    'appletId': 'military_hist',
                    '_labelsForSelectedValues': {}
                }]);

                userCollection = new Backbone.Collection([{
                    'uid': 'urn:va:user:SITE:10000000235',
                    'name': 'EHMP,UATTHREE'
                }, {
                    'uid': 'urn:va:user:SITE:10000000236',
                    'name': 'EHMP,UATTWO'
                }]);
            });

            it('expect MetaCollection to be processed with touchedByName', function() {
                MilitaryHistoryApplet.viewTypes[1].view.prototype.userCollectionEvents.sync.call(mockView, userCollection);

                expect(mockView.collection.at(0).get('touchedByName')).toEqual('UATTWO EHMP');
                expect(mockView.collection.at(1).get('touchedByName')).toEqual('UATTWO EHMP');
                expect(mockView.collection.at(2).get('touchedByName')).toEqual('UATTHREE EHMP');
                expect(mockView.collection.at(3).get('touchedByName')).toEqual('UATTHREE EHMP');
            });

            it('expect MetaCollection to be processed with touchedByName of empty string when uid is not found', function() {
                userCollection.at(0).set('uid', 'urn:va:user:SITE:10000000232');
                MilitaryHistoryApplet.viewTypes[1].view.prototype.userCollectionEvents.sync.call(mockView, userCollection);

                expect(mockView.collection.at(0).get('touchedByName')).toEqual('UATTWO EHMP');
                expect(mockView.collection.at(1).get('touchedByName')).toEqual('UATTWO EHMP');
                expect(mockView.collection.at(2).get('touchedByName')).toEqual('');
                expect(mockView.collection.at(3).get('touchedByName')).toEqual('');
            });
            // });
        });
    });
});