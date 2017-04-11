/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
require.config({
    paths: {
        main: 'app/applets/orders/test/unit'
    }
});

define([
    'app/resources/writeback/orders/draft/model',
    'app/applets/orders/test/unit/specHelper'
], function(Draft, SpecHelper) {

    'use strict';

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

    SpecHelper.describe('Functionality related to the Orders:Draft ADK Resource object', function() {

        var draft = null;
        var testUid = 'urn:va:ehmp:1234567890:a90a38f9-ba31-4098-8222-81a93195485c';
        var testBasicPayload = {
            field1: 'one',
            field2: 'two'
        };

        var testResponse = {
            status: 200,
            data: {
                statusCode: 201,
                headers: {
                    date: 'Tue, 09 Feb 2016 00:02:35 GMT',
                    location: 'http://10.2.2.110:9080/clinicobj/' + testUid,
                    'content-type': 'application/json',
                    'content-length': '0'
                },
                request: {
                    uri: {
                        protocol: 'http:',
                        slashes: true,
                        auth: null,
                        host: '10.2.2.110:9080',
                        port: '9080',
                        hostname: '10.2.2.110',
                        hash: null,
                        search: null,
                        query: null,
                        pathname: '/clinicobj',
                        path: '/clinicobj',
                        href: 'http://10.2.2.110:9080/clinicobj'
                    },
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        'content-length': 794
                    }
                }
            }
        };

        var testDeleteResponse = {
            status: 200,
            data: {
                ok: true
            }
        };

        var testDraftOrderPayload = {
            availableLabTests: '5106',
            labTestText: 'Occult Blood',
            collectionTime: '00:00',
            collectionDate: '01/05/2016',
            collectionSample: '81',
            otherCollectionSample: '',
            collectionType: 'SP',
            defaultCollSamp: '3',
            immediateCollectionDate: '01/05/2016',
            immediateCollectionTime: '00:00',
            collectionDateTimePicklist: '',
            doseDate: '01/05/2016',
            doseTime: '00:00',
            drawDate: '01/05/2016',
            drawTime: '00:00',
            howOften: '28',
            howLong: '1x',
            labCollSamp: '999',
            location: '32',
            anticoagulant: 'no',
            sampleDrawnAt: '00:00',
            orderComment: 'testing',
            reqCom: 'ORDER COMMENT',
            specimen: '8759',
            otherSpecimen: '',
            urgency: '9',
            urgencyText: 'ROUTINE',
            forTest: '1111',
            urineVolume: '100ml',
            comments: 'comment data',
            additionalComments: '',
            problemRelationship: 'cough',
            activity: 'Follow up',
            pastDueDate: '20160301'
        };
        var partialDraftOrderPayload = {
            availableLabTests: '5106',
            collectionDate: '01/05/2016',
            collectionTime: '00:00',
            collectionSample: '81',
            otherCollectionSample: '',
            collectionType: 'SP',
            defaultCollSamp: '3',
            doseDate: '01/05/2016',
            doseTime: '00:00',
            drawDate: '01/05/2016',
            drawTime: '00:00',
            labCollSamp: '999',
            location: '32',
            sampleDrawnAt: '00:00',
            specimen: '8759',
            urgency: '9',
            forTest: '1111',
        };
        var testClinicalObject = {
            patientUid: '1234567890',
            authorUid: 'urn:va:user:9E7A:55555',
            domain: 'ehmp-order',
            subDomain: 'laboratory',
            uid: testUid,
            ehmpState: 'draft',
            displayName: '',
            visit: {
                'dateTime': '201603290000',
                'location': '0987654321',
                'serviceCategory': 'PSB'
            },
            data: testDraftOrderPayload,
        };

        beforeEach(function() {
            draft = new Draft({
                subDomain: 'laboratory'
            });

            // Mock the draft 'sync' function to simulate calls to the RDK via Backbone.
            spyOn(draft, 'sync').and.callFake(function(method, model, options) {
                var message = ':success';
                var response = {
                    data: {}
                };

                switch (method) {
                    case 'draft:create':
                        response = testResponse;
                        break;
                    case 'draft:read':
                        response.data = testClinicalObject;
                        break;
                    case 'draft:update':
                        response = testResponse;
                        break;
                    case 'draft:delete':
                        response = testDeleteResponse;
                        break;
                    case 'draft:save':
                        response = testResponse;
                        break;
                }
                if (_.isFunction(options.success)) {
                    options.success.call(model, response);
                }
                model.trigger(method + message);
            });
        });

        it('should properly handle accessor calls', function() {
            var uid = 'urn:va:ehmp:9E7A;8:a90a38f9-ba31-4098-8222-81a93195485c';

            draft.setPayload(testBasicPayload);
            draft.setUid(uid);

            expect(draft.getPayload()).toEqual(testBasicPayload);
            expect(draft.getUid()).toEqual(uid);

            var model = new Backbone.Model();
            model.set(partialDraftOrderPayload);
            var extractedPayload = draft.extractPayload(model);

            var extractedPayloadKeys = _.keys(extractedPayload);
            var expectedPayloadKeys = _.keys(testDraftOrderPayload);

            _.each(extractedPayloadKeys, function(key) {
                expect(_.indexOf(expectedPayloadKeys, key)).toBeGreaterThan(-1);
            });

            draft.resetDraft();
            expect(draft.getUid()).toEqual('');
            expect(draft.getPayload()).toEqual({});
        });

        it('should properly handle creating a draft order down the "happy" path', function(done) {
            draft.setPayload(testDraftOrderPayload);
            expect(draft.getUid()).toBe('');

            draft.on('draft:create:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:create');
                expect(draft.getUid()).not.toBeNull();
                expect(draft.getUid()).toBe(testUid);
                expect(draft.get('patientUid')).toBeDefined();
                expect(draft.get('patientUid')).toBe('1234567890');
                expect(draft.get('authorUid')).toBeDefined();
                expect(draft.get('authorUid')).toBe('urn:va:user:9E7A:55555');
                expect(draft.get('domain')).toBeDefined();
                expect(draft.get('domain')).toBe('ehmp-order');
                expect(draft.get('subDomain')).toBeDefined();
                expect(draft.get('subDomain')).toBe('laboratory');
                expect(draft.get('ehmpState')).toBe('draft');
                expect(draft.get('displayName')).toBe('Occult Blood - ROUTINE');

                var visit = draft.get('visit');
                expect(visit).toBeDefined();
                expect(visit.serviceCategory).toBe('PSB');
                expect(visit.location).toBe('0987654321');
                expect(visit.dateTime).toBe('201603290000');

                expect(draft.getPayload()).toBeDefined();

                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:create:error', function() {
                expect('Draft order "create" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });

            draft.createDraft();
        });

        it('should properly handle reading a draft order down the "happy" path', function(done) {
            draft.setUid(testUid);

            draft.on('draft:read:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:read');
                expect(draft.getUid()).not.toBeNull();
                expect(draft.getUid()).toBe(testUid);
                expect(draft.get('patientUid')).toBeDefined();
                expect(draft.get('patientUid')).toBe('1234567890');
                expect(draft.get('authorUid')).toBeDefined();
                expect(draft.get('authorUid')).toBe('urn:va:user:9E7A:55555');
                expect(draft.get('domain')).toBeDefined();
                expect(draft.get('domain')).toBe('ehmp-order');
                expect(draft.get('subDomain')).toBeDefined();
                expect(draft.get('subDomain')).toBe('laboratory');
                expect(draft.get('ehmpState')).toBe('draft');

                var visit = draft.get('visit');
                expect(visit).toBeDefined();
                expect(visit.serviceCategory).toBe('PSB');
                expect(visit.location).toBe('0987654321');
                expect(visit.dateTime).toBe('201603290000');

                expect(draft.getPayload()).toBeDefined();

                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:read:error', function() {
                expect('Draft order "read" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });

            draft.getDraft();
        });

        it('should properly handle updating a draft order down the "happy" path', function(done) {
            draft.set(testClinicalObject);
            draft.setPayload(testDraftOrderPayload);
            draft.setUid(testUid);
            expect(draft.getUid()).toBe(testUid);

            draft.on('draft:update:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:update');
                expect(draft.getUid()).not.toBeNull();
                expect(draft.getUid()).toBe(testUid);
                expect(draft.get('patientUid')).toBeDefined();
                expect(draft.get('patientUid')).toBe('1234567890');
                expect(draft.get('authorUid')).toBeDefined();
                expect(draft.get('authorUid')).toBe('urn:va:user:9E7A:55555');
                expect(draft.get('domain')).toBeDefined();
                expect(draft.get('domain')).toBe('ehmp-order');
                expect(draft.get('subDomain')).toBeDefined();
                expect(draft.get('subDomain')).toBe('laboratory');
                expect(draft.get('ehmpState')).toBe('draft');

                var visit = draft.get('visit');
                expect(visit).toBeDefined();
                expect(visit.serviceCategory).toBe('PSB');
                expect(visit.location).toBe('0987654321');
                expect(visit.dateTime).toBe('201603290000');

                expect(draft.getPayload()).toBeDefined();

                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:update:error', function() {
                expect('Draft order "update" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });

            draft.updateDraft();
        });

        it('should properly handle deleting a draft order down the "happy" path', function(done) {
            draft.set(testClinicalObject);
            draft.setUid(testUid);

            draft.on('draft:delete:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:delete');
                expect(draft.getUid()).toBe('');
                expect(draft.get('patientUid')).not.toBeUndefined();
                expect(draft.get('authorUid')).not.toBeUndefined();
                expect(draft.get('domain')).not.toBeUndefined();
                expect(draft.get('subDomain')).not.toBeUndefined();
                expect(draft.get('visit')).not.toBeUndefined();
                expect(draft.get('ehmpState')).not.toBeUndefined();
                expect(draft.get('displayName')).not.toBeUndefined();
                expect(draft.getPayload()).toEqual({});
                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:delete:error', function() {
                expect('Draft order "delete" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });

            draft.deleteDraft();
        });

        it('should properly handle saving a new draft order down the "happy" path', function(done) {
            draft.setPayload(testDraftOrderPayload);
            expect(draft.getUid()).toBe('');

            draft.on('draft:save:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:save');
                expect(draft.getUid()).not.toBeNull();
                expect(draft.getUid()).toBe(testUid);
                expect(draft.get('patientUid')).toBeDefined();
                expect(draft.get('patientUid')).toBe('1234567890');
                expect(draft.get('authorUid')).toBeDefined();
                expect(draft.get('authorUid')).toBe('urn:va:user:9E7A:55555');
                expect(draft.get('domain')).toBeDefined();
                expect(draft.get('domain')).toBe('ehmp-order');
                expect(draft.get('subDomain')).toBeDefined();
                expect(draft.get('subDomain')).toBe('laboratory');
                expect(draft.get('ehmpState')).toBe('draft');
                expect(draft.get('displayName')).toBe('Occult Blood - ROUTINE');

                var visit = draft.get('visit');
                expect(visit).toBeDefined();
                expect(visit.serviceCategory).toBe('PSB');
                expect(visit.location).toBe('0987654321');
                expect(visit.dateTime).toBe('201603290000');

                expect(draft.getPayload()).toBeDefined();

                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:save:error', function() {
                expect('Draft order "save new" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });
            draft.saveDraft();
        });


        it('should properly handle saving an existing draft order down the "happy" path', function(done) {
            draft.set(testClinicalObject);
            draft.setPayload(testDraftOrderPayload);
            draft.setUid(testUid);
            expect(draft.getUid()).toBe(testUid);

            draft.on('draft:save:success', function() {
                expect(draft.sync).toHaveBeenCalled();
                expect(draft.sync.calls.mostRecent().args[0]).toBe('draft:save');
                expect(draft.getUid()).not.toBeNull();
                expect(draft.getUid()).toBe(testUid);
                expect(draft.get('patientUid')).toBeDefined();
                expect(draft.get('patientUid')).toBe('1234567890');
                expect(draft.get('authorUid')).toBeDefined();
                expect(draft.get('authorUid')).toBe('urn:va:user:9E7A:55555');
                expect(draft.get('domain')).toBeDefined();
                expect(draft.get('domain')).toBe('ehmp-order');
                expect(draft.get('subDomain')).toBeDefined();
                expect(draft.get('subDomain')).toBe('laboratory');
                expect(draft.get('ehmpState')).toBe('draft');
                expect(draft.get('displayName')).toBe('Occult Blood - ROUTINE');

                var visit = draft.get('visit');
                expect(visit).toBeDefined();
                expect(visit.serviceCategory).toBe('PSB');
                expect(visit.location).toBe('0987654321');
                expect(visit.dateTime).toBe('201603290000');

                expect(draft.getPayload()).toBeDefined();

                expect(draft.validationError).toBeNull();
                done();
            });

            draft.on('draft:save:error', function() {
                expect('Draft order "save existing" happy path').toBe('a success but it failed: ' + draft.validationError);
                done();
            });
            draft.saveDraft();
        });

        describe('Error case handling', function() {

            describe('Model validation error handling', function() {

                it('should raise a validation error if a required clinical object attribute is missing on update', function(done) {
                    draft.set(testClinicalObject);
                    delete draft.attributes.authorUid;
                    expect(draft.get('authorUid')).toBeUndefined();

                    draft.on('draft:update:error', function() {
                        expect(draft.validationError).toBeDefined();
                        expect(draft.validationError).toBe('"authorUid" attribute is required');
                        done();
                    });

                    draft.on('draft:update:success', function() {
                        expect('Required clinical object attribute missing test').toBe('a failure but it actually succeeded, which is an error.');
                        done();
                    });
                    draft.updateDraft();
                });

                it('should raise a validation error if the uid is missing on read', function(done) {

                    expect(draft.getUid()).toBe('');
                    draft.on('draft:read:error', function() {
                        expect(draft.validationError).toBeDefined();
                        expect(draft.validationError).toBe('"uid" attribute is required');
                        done();
                    });

                    draft.on('draft:read:success', function() {
                        expect('Required uid missing on read test').toBe('a failure but it actually succeeded, which is an error.');
                        done();
                    });
                    draft.getDraft();
                });

                it('should raise a validation error if the uid is missing on delete', function(done) {

                    expect(draft.getUid()).toBe('');
                    draft.on('draft:delete:error', function() {
                        expect(draft.validationError).toBeDefined();
                        expect(draft.validationError).toBe('"uid" attribute is required');
                        done();
                    });

                    draft.on('draft:delete:success', function() {
                        expect('Required clinical object attribute missing on delete test').toBe('a failure but it actually succeeded, which is an error.');
                        done();
                    });
                    draft.deleteDraft();
                });
            });
        });
    });
});
