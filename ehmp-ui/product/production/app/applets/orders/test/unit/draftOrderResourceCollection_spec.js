/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
require.config({
    paths: {
        main: 'app/applets/orders/test/unit'
    }
});

define([
    'app/resources/writeback/orders/draft/collection',
    'app/applets/orders/test/unit/specHelper'
], function(Drafts, SpecHelper) {

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Note: This is the mocked ADK Resource object used for all tests: (orders/test/unit/ADK.js)
    //
    // this.user = new Backbone.Model({
    //     site: '9E7A',
    //     duz: {
    //         '9E7A': '55555'
    //     }
    // });
    // this.patient = new Backbone.Model({
    //     pid: '1234567890',
    //     visit: {
    //         serviceCategory: 'PSB',
    //         dateTime: '201603290000',
    //         locationIEN: '0987654321'
    //     }
    // });
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    'use strict';

    SpecHelper.describe('Functionality related to the Orders:Draft ADK Resource Collection class', function() {

        var drafts = null;
        var testFetchAttributes = null;
        var testUids = ['urn:va:ehmp:9E7A;8:0049c72c-fa97-4cb6-bff9-a95390958e42', 'urn:va:ehmp:9E7A;8:0079c47d-87ec-49ac-b511-727670b899fb'];

        var testResponse = {
            status: 200,
            data: {
                items: [
                    {
                        authorUid: 'urn:va:user:9E7A:10000000271',
                        data: {
                            activity: '',
                            additionalComments: '',
                            annotation: '',
                            anticoagulant: '',
                            availableLabTests: '480',
                            collectionDate: '02/16/2016',
                            collectionTime: '3160216.0000',
                            collectionSample: '1',
                            collectionType: 'SP',
                            defaultCollSamp: '1',
                            doseDate: '',
                            doseTime: '',
                            drawDate: '',
                            drawTime: '',
                            forTest: '',
                            howLong: '',
                            howOften: '28',
                            immediateCollectionDate: '',
                            immediateCollectionTime: '',
                            labTestText: '25 OH VITAMIN D',
                            orderComment: '',
                            problemRelationship: '',
                            sampleDrawnAt: '',
                            specimen: '72',
                            urgency: '9'
                        },
                        displayName: '',
                        domain: 'ehmp-order',
                        ehmpState: 'draft',
                        patientUid: '9E7A;8',
                        subDomain: 'laboratory',
                        uid: testUids[0],
                        visit: {
                            dateTime: '201602160950',
                            location: '195',
                            serviceCategory: 'I'
                        }
                    }, {
                        authorUid: 'urn:va:user:9E7A:10000000271',
                        data: {
                            activity: '',
                            additionalComments: '',
                            annotation: '',
                            anticoagulant: '',
                            availableLabTests: '480',
                            collectionDate: '02/12/2016',
                            collectionTime: '3160212.0000',
                            collectionSample: '1',
                            collectionType: 'LC',
                            defaultCollSamp: '1',
                            doseDate: '',
                            doseTime: '',
                            drawDate: '',
                            drawTime: '',
                            forTest: '',
                            howLong: '',
                            howOften: '28',
                            immediateCollectionDate: '',
                            immediateCollectionTime: '',
                            labTestText: '25 OH VITAMIN D',
                            orderComment: '',
                            problemRelationship: '',
                            sampleDrawnAt: '',
                            specimen: '72',
                            urgency: '9'
                        },
                        displayName: '',
                        domain: 'ehmp-order',
                        ehmpState: 'draft',
                        patientUid: '9E7A;8',
                        subDomain: 'laboratory',
                        uid: testUids[1],
                        visit: {
                            dateTime: '201602122140',
                            location: '195',
                            serviceCategory: 'I'
                        }
                    }
                ]
            }
        };

        var expectedSelectAllAttributes = {
            contentType: 'application/json',
            type: 'POST',
            data: {
                domain: 'ehmp-order',
                ehmpState: 'draft',
                patientUid: '1234567890'
            }
        };

        var expectedSelectWhereAttributes = {
            contentType: 'application/json',
            type: 'POST',
            data: {
                domain: 'ehmp-order',
                subDomain: 'laboratory',
                ehmpState: 'draft',
                patientUid: '1234567890',
                authorUid: 'urn:va:user:9E7A:10000000271'
            }
        };

        beforeEach(function() {
            drafts = new Drafts();

            // Mock the draft 'fetch' function to simulate calls to the RDK via Backbone.
            spyOn(drafts, 'fetch').and.callFake(function(attributes) {
                testFetchAttributes = attributes;
                var resp = drafts.parse(testResponse);
                drafts.set(resp);
            });
        });

        it('should properly handle selectAll calls', function() {
            drafts.selectAll();

            expect(drafts.length).toBe(2);
            expect(testFetchAttributes.contentType).toEqual(expectedSelectAllAttributes.contentType);
            expect(testFetchAttributes.type).toEqual(expectedSelectAllAttributes.type);
            expect(testFetchAttributes.data).not.toBeUndefined();

            var data = JSON.parse(testFetchAttributes.data);
            expect(data).toEqual(expectedSelectAllAttributes.data);
        });

        it('should properly handle selectWhere calls', function() {
            drafts.selectWhere({
                subDomain: 'laboratory',
                authorUid: 'urn:va:user:9E7A:10000000271'
            });

            expect(drafts.length).toBe(2);
            expect(testFetchAttributes.contentType).toEqual(expectedSelectWhereAttributes.contentType);
            expect(testFetchAttributes.type).toEqual(expectedSelectWhereAttributes.type);
            expect(testFetchAttributes.data).not.toBeUndefined();

            var data = JSON.parse(testFetchAttributes.data);
            expect(data).toEqual(expectedSelectWhereAttributes.data);
        });
    });
});
