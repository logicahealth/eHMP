'use strict';

require('./_environment-setup');

const _ = require('lodash');
const logger = require('../dummies/dummy-logger');

// Uncomment these lines for debugging
// Comment them before pushing
// logger = require('bunyan').createLogger({
//     name: 'pjds-client',
//     level: 'debug'
// });

const pjdsConfig = {
    'ip_address': process.env.PJDS_IP_ADDRESS,
    'tcp_port': parseInt(process.env.PJDS_TCP_PORT, 10),
    'username': process.env.PJDS_USERNAME,
    'password': process.env.PJDS_PASSWORD,
    'namespace': process.env.PJDS_NAMESPACE
};

const PjdsClient = require('../../src/pjds-client');
const pjdsClient = new PjdsClient(logger, logger, pjdsConfig);


describe('jds-cache-api: pjds-client.js', function() {
    it('Is properly defined', function() {
        expect(pjdsClient).not.toBeUndefined();

        expect(pjdsClient.createPjdsStore).not.toBeUndefined();
        expect(pjdsClient.clearPjdsStore).not.toBeUndefined();
        expect(pjdsClient.getPjdsStoreInfo).not.toBeUndefined();
        expect(pjdsClient.getPjdsStoreData).not.toBeUndefined();
        expect(pjdsClient.setPjdsStoreData).not.toBeUndefined();
        expect(pjdsClient.deletePjdsStoreData).not.toBeUndefined();
        expect(pjdsClient.createPjdsStoreIndex).not.toBeUndefined();
        expect(pjdsClient.getPjdsStoreIndexData).not.toBeUndefined();
    });

    describe('Generic Data Store APIs', function() {
        const store = {
            'name': 'testdata',
            'longName': 'testdatastore',
            'badName': 'test+data',
            'missingName': 'missingName',
            'uid': 'urn:va:testdata:1',
            'secondUid': 'urn:va:testdata:2',
            'index': 'testindex',
            'missingIndex': 'missingIndex',
            'secondIndex': 'secondindex',
        };

        store.data = {
            'authorUid': 'urn:va:user:SITE:3',
            'displayName': 'Rheumatology',
            'domain': 'test-data',
            'ehmpState': 'active'
        };

        store.secondData = {
            'authorUid': 'urn:va:user:SITE:3',
            'displayName': 'Laboratory',
            'domain': 'test-data',
            'ehmpState': 'passive',
            'uid': 'urn:va:testdata:2'
        };

        store.badData = '{"authorUid":"urn:va:user:SITE:3","displayName":"Rheumatology","domain":"test-data","ehmpState":"active"}';

        store.indexData = {
            'indexName': store.index,
            'fields': 'authorUid',
            'sort': 'desc',
            'type': 'attr'
        };

        store.secondIndexData = {
            'indexName': store.secondIndex,
            'fields': 'ehmpState',
            'sort': 'asc',
            'type': 'attr'
        };

        store.badIndexData = '{"indexName":"testindex","fields":"authorUid","sort":"desc","type":"attr"}';


        describe('createPjdsStore()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.createPjdsStore(null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: store name too long', function(done) {
                pjdsClient.createPjdsStore(store.longName, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Store name too long or not specified',
                        reason: '252'
                    }));

                    done();
                });
            });

            it('Error: store name not alphanumeric', function(done) {
                pjdsClient.createPjdsStore(store.badName, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'Store name too long or not specified',
                        reason: '252'
                    }));

                    done();
                });
            });

            it('Success: create new store', function(done) {
                pjdsClient.createPjdsStore(store.name, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(201);
                    expect(result).toBeUndefined();

                    done();
                });
            });
        });

        describe('getPjdsStoreInfo()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.getPjdsStoreInfo(null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.getPjdsStoreInfo(store.missingName, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Success: retrieve data store information', function(done) {
                pjdsClient.getPjdsStoreInfo(store.name, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(result).toEqual({
                        'committed_update_seq': 0,
                        'compact_running': false,
                        'data_size': 0,
                        'db_name': 'testdata',
                        'disk_format_version': 1,
                        'disk_size': 0,
                        'doc_count': 0,
                        'doc_del_count': 0,
                        'instance_start_time': 0,
                        'purge_seq': 0,
                        'update_seq': 0
                    });

                    done();
                });
            });
        });

        describe('setPjdsStoreData()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.setPjdsStoreData(null, store.uid, store.data, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: missing data to store', function(done) {
                pjdsClient.setPjdsStoreData(store.name, store.uid, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No data passed in');

                    done();
                });
            });

            it('Error: bad data to store', function(done) {
                pjdsClient.setPjdsStoreData(store.name, store.uid, store.badData, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('Data passed in not in correct format');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.setPjdsStoreData(store.missingName, store.uid, store.data, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Error: uid mismatch between passed in uid and uid in data', function(done) {
                store.data.uid = store.secondData.uid;

                pjdsClient.setPjdsStoreData(store.name, store.uid, store.data, function(error, response, result) {
                    delete store.data.uid;

                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'UID Mismatch between URL and Document',
                        reason: '256'
                    }));

                    done();
                });
            });

            it('Success: add data item to store by uid passed in function', function(done) {
                pjdsClient.setPjdsStoreData(store.name, store.uid, store.data, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(201);
                    expect(result).toBeUndefined();

                    done();
                });
            });

            it('Success: add data item to store by uid passed in data', function(done) {
                pjdsClient.setPjdsStoreData(store.name, null, store.secondData, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(201);
                    expect(result).toBeUndefined();

                    done();
                });
            });

            it('Success: add data item to store without passing in a uid', function(done) {
                pjdsClient.setPjdsStoreData(store.name, null, store.data, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(201);
                    expect(result).toBeUndefined();

                    done();
                });
            });
        });

        describe('getPjdsStoreData()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.getPjdsStoreData(null, store.uid, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.getPjdsStoreData(store.missingName, store.uid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Success: retrieve one data item from store', function(done) {
                pjdsClient.getPjdsStoreData(store.name, store.uid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(result).toEqual({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Rheumatology',
                        'domain': 'test-data',
                        'ehmpState': 'active'
                    });

                    done();
                });
            });

            it('Success: retrieve another data item from store', function(done) {
                pjdsClient.getPjdsStoreData(store.name, store.secondUid, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(result).toEqual({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Laboratory',
                        'domain': 'test-data',
                        'ehmpState': 'passive',
                        'uid': 'urn:va:testdata:2'
                    });

                    done();
                });
            });

            it('Success: retrieve all data items from store', function(done) {
                pjdsClient.getPjdsStoreData(store.name, null, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(_.get(result, 'items')).toContain(jasmine.objectContaining({
                        authorUid: 'urn:va:user:SITE:3',
                        displayName: 'Rheumatology',
                        domain: 'test-data',
                        ehmpState: 'active'
                    }));

                    expect(_.get(result, 'items')).toContain(jasmine.objectContaining({
                        authorUid: 'urn:va:user:SITE:3',
                        displayName: 'Laboratory',
                        domain: 'test-data',
                        ehmpState: 'passive',
                        uid: 'urn:va:testdata:2'
                    }));

                    done();
                });
            });
        });

        describe('createPjdsStoreIndex()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.createPjdsStoreIndex(null, store.indexData, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: missing index data to create index', function(done) {
                pjdsClient.createPjdsStoreIndex(store.name, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No index data passed in');

                    done();
                });
            });

            it('Error: bad index data to create index', function(done) {
                pjdsClient.createPjdsStoreIndex(store.name, store.badIndexData, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('Data passed in not in correct format');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.createPjdsStoreIndex(store.missingName, store.indexData, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Error: missing the required indexName field from the index definition', function(done) {
                delete store.indexData.indexName;

                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    store.indexData.indexName = 'testindex';

                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'required field missing',
                        message: 'Unknown error',
                        reason: '273'
                    }));

                    done();
                });
            });

            it('Error: missing the required fields field from the index definition', function(done) {
                delete store.indexData.fields;

                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    store.indexData.fields = 'authorUid';

                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'required field missing',
                        message: 'Unknown error',
                        reason: '273'
                    }));

                    done();
                });
            });

            it('Error: missing the required sort field from the index definition', function(done) {
                delete store.indexData.sort;

                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    store.indexData.sort = 'desc';

                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'required field missing',
                        message: 'Unknown error',
                        reason: '273'
                    }));

                    done();
                });
            });

            it('Error: missing the required type field from the index definition', function(done) {
                delete store.indexData.type;

                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    store.indexData.type = 'attr';

                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'required field missing',
                        message: 'Unknown error',
                        reason: '273'
                    }));

                    done();
                });
            });

            it('Success: create new index', function(done) {
                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).toBeUndefined();

                    done();
                });
            });

            it('Error: index already exists', function(done) {
                pjdsClient.createPjdsStoreIndex(store.name, store.indexData, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'index name: ' + store.indexData.indexName,
                        message: 'Duplicate index found',
                        reason: '271'
                    }));

                    done();
                });
            });

            it('Success: create second new index', function(done) {
                pjdsClient.createPjdsStoreIndex(store.name, store.secondIndexData, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).toBeUndefined();

                    done();
                });
            });
        });

        describe('getPjdsStoreIndexData()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.getPjdsStoreIndexData(null, store.index, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: missing index name', function(done) {
                pjdsClient.getPjdsStoreIndexData(store.name, null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No index name passed in');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.getPjdsStoreIndexData(store.missingName, store.index, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Error: index missing from store', function(done) {
                pjdsClient.getPjdsStoreIndexData(store.name, store.missingIndex, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: store.missingIndex,
                        message: 'Invalid index name',
                        reason: '102'
                    }));

                    done();
                });
            });

            it('Success: retrieve data from index', function(done) {
                pjdsClient.getPjdsStoreIndexData(store.name, store.index, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Rheumatology',
                        'domain': 'test-data',
                        'ehmpState': 'active'
                    }));

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Laboratory',
                        'domain': 'test-data',
                        'ehmpState': 'passive',
                        'uid': 'urn:va:testdata:2'
                    }));

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Rheumatology',
                        'domain': 'test-data',
                        'ehmpState': 'active',
                        'uid': 'urn:va:testdata:3'
                    }));

                    done();
                });
            });

            it('Success: retrieve data from another index', function(done) {
                pjdsClient.getPjdsStoreIndexData(store.name, store.secondIndex, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Rheumatology',
                        'domain': 'test-data',
                        'ehmpState': 'active'
                    }));

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Laboratory',
                        'domain': 'test-data',
                        'ehmpState': 'passive',
                        'uid': 'urn:va:testdata:2'
                    }));

                    expect(_.get(result, ['items'])).toContain(jasmine.objectContaining({
                        'authorUid': 'urn:va:user:SITE:3',
                        'displayName': 'Rheumatology',
                        'domain': 'test-data',
                        'ehmpState': 'active',
                        'uid': 'urn:va:testdata:3'
                    }));

                    done();
                });
            });
        });

        describe('deletePjdsStoreData()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.deletePjdsStoreData(null, store.uid, false, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Error: store missing from pJDS', function(done) {
                pjdsClient.deletePjdsStoreData(store.missingName, store.uid, false, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        message: 'JDS isn\'t setup correctly, run VPRJCONFIG',
                        reason: '253'
                    }));

                    done();
                });
            });

            it('Error: missing uid without deleteAll set to true', function(done) {
                pjdsClient.deletePjdsStoreData(store.name, null, false, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(response).toBeDefined();
                    expect(_.get(response, 'statusCode')).toBe(400);
                    expect(_.get(response, 'body')).toBeDefined();
                    expect(result).toBeDefined();
                    expect(_.get(result, ['error', 'message'])).toBe('Bad Request');
                    expect(_.get(result, ['error', 'code'])).toBe('400');

                    expect(_.get(result, ['error', 'errors'])).toContain(jasmine.objectContaining({
                        domain: 'uid is blank',
                        message: 'Unrecognized parameter',
                        reason: '111'
                    }));

                    done();
                });
            });

            it('Success: delete one data item from store', function(done) {
                pjdsClient.deletePjdsStoreData(store.name, store.uid, false, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();
                    expect(_.get(result, 'ok')).not.toBeUndefined();
                    expect(_.get(result, 'ok')).toBe(true);

                    done();
                });
            });

            it('Success: delete another data item from store', function(done) {
                pjdsClient.deletePjdsStoreData(store.name, store.secondUid, false, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();
                    expect(_.get(result, 'ok')).not.toBeUndefined();
                    expect(_.get(result, 'ok')).toBe(true);

                    done();
                });
            });

            it('Success: delete all data items from store', function(done) {
                pjdsClient.deletePjdsStoreData(store.name, null, true, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();
                    expect(_.get(result, 'ok')).not.toBeUndefined();
                    expect(_.get(result, 'ok')).toBe(true);

                    done();
                });
            });
        });

        describe('clearPjdsStore()', function() {
            it('Error: missing store name', function(done) {
                pjdsClient.clearPjdsStore(null, function(error) {
                    expect(error).toBeDefined();
                    expect(_.get(error, 'type')).toBe('fatal-exception');
                    expect(_.get(error, 'message')).toBe('No store name passed in');

                    done();
                });
            });

            it('Success: clear and remove data store', function(done) {
                pjdsClient.clearPjdsStore(store.name, function(error, response, result) {
                    expect(error).toBeNull();
                    expect(_.get(response, 'statusCode')).toBe(200);
                    expect(result).not.toBeNull();
                    expect(_.get(result, 'ok')).not.toBeUndefined();
                    expect(_.get(result, 'ok')).toBe(true);

                    done();
                });
            });
        });
    });
});
