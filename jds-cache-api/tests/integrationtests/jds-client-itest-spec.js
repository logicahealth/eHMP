'use strict';

require('./_environment-setup');

const _ = require('lodash');
const logger = require('../dummies/dummy-logger');

// Uncomment these lines for debugging
// Comment them before pushing
// logger = require('bunyan').createLogger({
//     name: 'jds-client',
//     level: 'debug'
// });

const jdsConfig = {
    'ip_address': process.env.JDS_IP_ADDRESS,
    'tcp_port': parseInt(process.env.JDS_TCP_PORT, 10),
    'username': process.env.JDS_USERNAME,
    'password': process.env.JDS_PASSWORD,
    'namespace': process.env.JDS_NAMESPACE
};

const JdsClient = require('../../src/jds-client');
const jdsClient = new JdsClient(logger, logger, jdsConfig);


describe('jds-cache-api: jds-client.js', function() {
    const patientIdentifier = {
        'pid': 'SITE;3000000000',
        'icn': '10108V300000',
        'uid': 'urn:va:patient:SITE:3000000000:3000000000',
        'badPid': 'SITE;1111111',
        'badIcn': '11111V111111',
        'badUid': 'urn:va:patient:SITE:1111111:1111111'
    };

    it('Is properly defined', function() {
        expect(jdsClient).not.toBeUndefined();

        expect(jdsClient.getPtDemographicsByPid).not.toBeUndefined();
        expect(jdsClient.getPtDemographicsByIcn).not.toBeUndefined();
        expect(jdsClient.getPatientIndexData).not.toBeUndefined();
        expect(jdsClient.getPatientDomainData).not.toBeUndefined();
        expect(jdsClient.getPatientCountData).not.toBeUndefined();
        expect(jdsClient.getPatientDataByPidAndUid).not.toBeUndefined();
        expect(jdsClient.getPatientDataByUid).not.toBeUndefined();
        expect(jdsClient.getAllPatientIndexData).not.toBeUndefined();
        expect(jdsClient.getAllPatientDomainData).not.toBeUndefined();
        expect(jdsClient.getAllPatientCountData).not.toBeUndefined();
        expect(jdsClient.getOperationalDataByUid).not.toBeUndefined();
        expect(jdsClient.getOperationalIndexData).not.toBeUndefined();
        expect(jdsClient.getOperationalDataCount).not.toBeUndefined();
        expect(jdsClient.getOperationalDataCollection).not.toBeUndefined();
    });

    describe('Patient Data APIs', function() {
        describe('getPtDemographicsByPid(), getPtDemographicsByIcn()', function() {
            it('Error: retrieve by pid with missing pid', function(done) {
                jdsClient.getPtDemographicsByPid(null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No pid passed in');

                    done();
                });
            });

            it('Error: retrieve by pid with unsynced patient', function(done) {
                jdsClient.getPtDemographicsByPid(patientIdentifier.badPid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('400');
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'Identifier ' + patientIdentifier.badPid,
                        message: 'Patient Demographics not on File',
                        reason: '225'
                    }));

                    done();
                });
            });

            it('Success: retrieve by pid', function(done) {
                jdsClient.getPtDemographicsByPid(patientIdentifier.pid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        pid: patientIdentifier.pid,
                        uid: patientIdentifier.uid
                    }));

                    done();
                });
            });

            it('Error: retrieve by icn with missing icn', function(done) {
                jdsClient.getPtDemographicsByIcn(null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No icn passed in');

                    done();
                });
            });

            it('Error: retrieve by icn with unsynced patient', function(done) {
                jdsClient.getPtDemographicsByIcn(patientIdentifier.badIcn, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('400');
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'Identifier ' + patientIdentifier.badIcn,
                        message: 'JPID Not Found',
                        reason: '224'
                    }));

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Patient Demographics not on File',
                        reason: '225'
                    }));

                    done();
                });
            });

            it('Success: retrieve by icn', function(done) {
                jdsClient.getPtDemographicsByIcn(patientIdentifier.icn, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        pid: patientIdentifier.pid,
                        uid: patientIdentifier.uid
                    }));

                    done();
                });
            });
        });

        describe('Get patient data', function() {
            it('Error: retrieve all data from the \'consult\' index with missing pid', function(done) {
                jdsClient.getPatientIndexData(null, 'consult', function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No pid passed in');

                    done();
                });
            });

            it('Error: retrieve all data from the \'consult\' index with missing index', function(done) {
                jdsClient.getPatientIndexData(patientIdentifier.pid, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No index passed in');

                    done();
                });
            });

            it('Error: retrieve all data from the \'consult\' index with unsynced patient', function(done) {
                jdsClient.getPatientIndexData(patientIdentifier.badPid, 'consult', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('404');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Missing patient identifiers',
                        reason: '211'
                    }));

                    done();
                });
            });

            it('Success: retrieve all data from the \'consult\' index', function(done) {
                jdsClient.getPatientIndexData(patientIdentifier.pid, 'consult', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        pid: patientIdentifier.pid,
                        uid: 'urn:va:consult:SITE:3000000000:886'
                    }));

                    done();
                });
            });

            it('Error: retrieve all data from the \'patient\' domain with missing pid', function(done) {
                jdsClient.getPatientDomainData(null, 'paitent', function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No pid passed in');

                    done();
                });
            });

            it('Error: retrieve all data from the \'patient\' domain with missing domain', function(done) {
                jdsClient.getPatientDomainData(patientIdentifier.pid, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No domain passed in');

                    done();
                });
            });

            it('Error: retrieve all data from the \'patient\' domain with unsynced patient', function(done) {
                jdsClient.getPatientDomainData(patientIdentifier.badPid, 'patient', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('404');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Missing patient identifiers',
                        reason: '211'
                    }));

                    done();
                });
            });

            it('Success: retrieve all data from the \'patient\' domain', function(done) {
                jdsClient.getPatientDomainData(patientIdentifier.pid, 'patient', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        pid: patientIdentifier.pid,
                        uid: patientIdentifier.uid
                    }));

                    done();
                });
            });

            it('Error: retrieve count data from the \'collection\' tally index with missing pid', function(done) {
                jdsClient.getPatientCountData(null, 'collection', function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No pid passed in');

                    done();
                });
            });

            it('Error: retrieve count data from the \'collection\' tally index with missing countName', function(done) {
                jdsClient.getPatientCountData(patientIdentifier.pid, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No countName passed in');

                    done();
                });
            });

            it('Error: retrieve count data from the \'collection\' tally index with unsynced patient', function(done) {
                jdsClient.getPatientCountData(patientIdentifier.badPid, 'collection', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('404');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Missing patient identifiers',
                        reason: '211'
                    }));

                    done();
                });
            });

            it('Success: retrieve count data for the \'collection\' tally index', function(done) {
                jdsClient.getPatientCountData(patientIdentifier.pid, 'collection', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        topic: 'patient'
                    }));

                    done();
                });
            });

            it('Error: retrieve the data item for the \'patient\' by pid and uid with missing pid', function(done) {
                jdsClient.getPatientCountData(null, patientIdentifier.uid, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No pid passed in');

                    done();
                });
            });

            it('Error: retrieve the data item for the \'patient\' by pid and uid with missing uid', function(done) {
                jdsClient.getPatientDataByPidAndUid(patientIdentifier.pid, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No uid passed in');

                    done();
                });
            });

            it('Error: retrieve the data item for the \'patient\' by pid and uid with unsynced patient', function(done) {
                jdsClient.getPatientDataByPidAndUid(patientIdentifier.badPid, patientIdentifier.uid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Not Found');
                    expect(_.get(result, ['error', 'code'])).toBe('404');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'Pid:' + patientIdentifier.badPid + ' Key:' + patientIdentifier.uid,
                        message: 'Bad key',
                        reason: '104'
                    }));

                    done();
                });
            });

            it('Success: retrieve the data item for the \'patient\' by pid and uid', function(done) {
                jdsClient.getPatientDataByPidAndUid(patientIdentifier.pid, patientIdentifier.uid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        pid: patientIdentifier.pid,
                        uid: patientIdentifier.uid
                    }));

                    done();
                });
            });
        });
    });

    describe('Cross-patient Data APIs', function() {
        describe('getPatientDataByUid()', function() {
            it('Error: retrieve nonexistent uid', function(done) {
                jdsClient.getPatientDataByUid('urn:va:-7:-7:-7', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(result).toBeDefined();
                    expect(result).toEqual({
                        error: {
                            code: '404',
                            errors: [{
                                message: 'Unable to determine patient',
                                reason: '203'
                            }],
                            message: 'Not Found'
                        }
                    });
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    done();
                });
            });

            it('Success: retrieve uid', function(done) {
                jdsClient.getPatientDataByUid(patientIdentifier.uid, function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toEqual(1);
                    expect(_.get(result, 'data.items[0]')).toMatch(jasmine.any(Object));
                    done();
                });
            });
        });

        describe('getAllPatientIndexData()', function() {
            it('Error: retrieve nonexistent index', function(done) {
                jdsClient.getAllPatientIndexData('badindex', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(result).toBeDefined();
                    expect(result).toEqual({
                        error: {
                            code: '400',
                            errors: [{domain: 'badindex', message: 'Invalid index name', reason: '102'}],
                            message: 'Bad Request'
                        }
                    });
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    done();
                });
            });

            it('Success: retrieve index', function(done) {
                jdsClient.getAllPatientIndexData('patient', function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toBeGreaterThan(1);
                    done();
                });
            });

            it('Success: retrieve index with pagination', function(done) {
                const options = {
                    limit: 2
                };
                jdsClient.getAllPatientIndexData('patient', options, function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toEqual(2);
                    expect(_.get(result, 'data.currentItemCount')).toEqual(2);
                    done();
                });
            });
        });

        describe('getAllPatientDomainData()', function() {
            it('Error: retrieve nonexistent domain', function(done) {
                jdsClient.getAllPatientDomainData('baddomain', 'exists(uid)', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toBe(0);
                    expect(_.get(result, 'data.currentItemCount')).toBe(0);
                    done();
                });
            });

            it('Success: retrieve domain', function(done) {
                jdsClient.getAllPatientDomainData('surgery', 'exists(uid)', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toBeGreaterThan(1);
                    done();
                });
            });

            it('Success: retrieve domain with pagination', function(done) {
                const options = {
                    limit: 2
                };
                jdsClient.getAllPatientDomainData('patient', 'exists(uid)', options, function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toBe(2);
                    expect(_.get(result, 'data.currentItemCount')).toBe(2);
                    done();
                });
            });
        });

        describe('getAllPatientCountData()', function() {
            it('Success: retrieve nonexistent count', function(done) {
                jdsClient.getAllPatientCountData('badcount', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.totalItems')).toBe(0);
                    expect(_.get(result, 'data.items.length')).toBe(0);
                    done();
                });
            });

            it('Success: retrieve count', function(done) {
                jdsClient.getAllPatientCountData('collection', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data.items.length')).toBeGreaterThan(1);
                    done();
                });
            });
        });
    });

    describe('Operational Data APIs', function() {
        const operationalTestData = {
            'uid': 'urn:va:vital-type:SITE:2',
            'badUid': 'urn:va:vtal-type:SITE:111111',
            'index': 'vital-type-uid',
            'domain': 'vital-type',
            'count': 'collection'
        };

        describe('getOperationalDataByUid()', function() {
            it('Error: retrieve with missing uid', function(done) {
                jdsClient.getOperationalDataByUid(null, function(error, response, result) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No uid passed in');

                    done();
                });
            });

            it('Error: retrieve with bad uid', function(done) {
                jdsClient.getOperationalDataByUid(operationalTestData.badUid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(404);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'code'])).toBe('404');
                    expect(_.get(result, ['error', 'message'])).toBe('Not Found');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'UID:' + operationalTestData.badUid,
                        message: 'Bad key',
                        reason: '104'
                    }));

                    done();
                });
            });

            it('Success: retrieve by uid', function(done) {
                jdsClient.getOperationalDataByUid(operationalTestData.uid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        uid: operationalTestData.uid,
                    }));

                    done();
                });
            });
        });

        describe('getOperationalIndexData()', function() {
            it('Error: retrieve with missing index', function(done) {
                jdsClient.getOperationalIndexData(null, function(error, response, result) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No index passed in');

                    done();
                });
            });

            it('Success: retrieve by index', function(done) {
                jdsClient.getOperationalIndexData(operationalTestData.index, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        uid: operationalTestData.uid,
                    }));

                    done();
                });
            });

        });

        describe('getOperationalDataCount()', function() {
            it('Error: retrieve with missing count', function(done) {
                jdsClient.getOperationalDataCount(null, function(error, response, result) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No countName passed in');

                    done();
                });
            });

            it('Success: retrieve by count', function(done) {
                jdsClient.getOperationalDataCount(operationalTestData.count, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).not.toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        topic: operationalTestData.domain,
                    }));

                    done();
                });
            });

        });

        describe('getOperationalDataCollection()', function() {
            it('Error: retrieve with missing collection', function(done) {
                jdsClient.getOperationalDataCollection(null, function(error, response, result) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No collection passed in');

                    done();
                });
            });

            it('Success: retrieve by collection', function(done) {
                jdsClient.getOperationalDataCollection(operationalTestData.domain, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(_.get(result, 'data')).toBeDefined();
                    expect(_.get(result, ['data', 'totalItems'])).toBeDefined();
                    expect(_.get(result, ['data', 'currentItemCount'])).toBeDefined();

                    expect(_.get(result, ['data', 'items'])).toContain(jasmine.objectContaining({
                        uid: operationalTestData.uid,
                    }));

                    done();
                });
            });
        });
    });
});
