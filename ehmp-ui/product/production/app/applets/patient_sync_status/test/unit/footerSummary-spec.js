/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, window, ADK*/

'use strict';

define([
    "jquery",
    "backbone",
    "marionette",
    "jasminejquery",
    "test/stubs",
    "app/applets/patient_sync_status/views/footerSummary"
], function($, Backbone, Marionette, jasmine, Stubs, FooterSummary) {
    describe('The sync status footer summary', function() {
        var view;

        beforeEach(function() {
            spyOn(window, 'setTimeout');
            view = new FooterSummary();
        });

        describe('when is constructing the view', function() {
            it('should exist', function() {
                expect(view).toBeDefined();
            });

            describe('setSolrSyncCompletedFlag should set solrSyncCompleted to', function() {
                it('true if all VISTA sites\' isSolrSyncCompleted is true', function() {
                    view.setSolrSyncCompletedFlag(true);
                    expect(Stubs.getCurrentPatient().get('solrSyncCompleted')).toBe(true);
                });

                it('false if at least one VISTA site\'s isSolrSyncCompleted is false', function() {
                    view.setSolrSyncCompletedFlag(false);
                    expect(Stubs.getCurrentPatient().get('solrSyncCompleted')).toBe(false);
                });
            });

            describe('fetchDataStatus', function() {
                it('All syncs completed', function() {
                    spyOn(ADK.PatientRecordService, 'fetchCollection').and.callFake(function(options) {
                        var resp = {
                            data: {
                                VISTA: {
                                    '9E7A': {
                                        isSolrSyncCompleted: true
                                    },
                                    'C783': {
                                        isSolrSyncCompleted: true
                                    }
                                },
                                latestSourceStampTime: '20100303040200',
                                allSites: true
                            }
                        };

                        options.onSuccess.call(this, resp, resp);
                    });

                    spyOn(view, 'fetchSyncStatusDetail');

                    view.fetchDataStatus(true);
                    expect(view.model.get('syncStatus')[0].title).toEqual('My Site');
                    expect(view.model.get('syncStatus')[0].hoverTip).toEqual('My Site');
                    expect(view.model.get('syncStatus')[1].title).toEqual('All VA');
                    expect(view.model.get('syncStatus')[2].title).toEqual('DoD');
                    expect(view.model.get('syncStatus')[3].title).toEqual('Communities');
                    expect(view.syncCompleted).toBe(true);
                    expect(view.areAllVistasSolrSynced).toBe(true);
                    expect(ADK.PatientRecordService.getCurrentPatient().get('solrSyncCompleted')).toBe(true);
                    expect(view.fetchSyncStatusDetail).toHaveBeenCalled();
                });
            });

            describe('fetchDataStatus', function() {
                it('Sync not completed', function() {
                    spyOn(ADK.PatientRecordService, 'fetchCollection').and.callFake(function(options) {
                        var resp = {
                            data: {
                                VISTA: {
                                    '9E7A': {
                                        isSolrSyncCompleted: true
                                    },
                                    'C783': {
                                        isSolrSyncCompleted: false
                                    },
                                    '4432': {
                                        isSolrSyncCompleted: false
                                    }
                                },
                                latestSourceStampTime: '20100303040200',
                                allSites: false
                            }
                        };

                        options.onSuccess.call(this, resp, resp);
                    });

                    view.fetchDataStatus(true);
                    expect(view.model.get('syncStatus')[0].title).toEqual('My Site');
                    expect(view.model.get('syncStatus')[0].hoverTip).toEqual('My Site');
                    expect(view.model.get('syncStatus')[1].title).toEqual('All VA');
                    expect(view.model.get('syncStatus')[2].title).toEqual('DoD');
                    expect(view.model.get('syncStatus')[3].title).toEqual('Communities');
                    expect(ADK.PatientRecordService.getCurrentPatient().get('solrSyncCompleted')).toBe(false);
                    expect(view.syncCompleted).toBe(false);
                    expect(view.areAllVistasSolrSynced).toBe(false);
                    expect(window.setTimeout).toHaveBeenCalled();
                });
            });
        });
    });
});