'use strict';

require('../../../../env-setup');

var handle = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var trackSolrStorage = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler').trackSolrStorage;
var writebackWrapper = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler').writebackWrapper;
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var val = require(global.VX_UTILS + 'object-utils').getProperty;


var log = require(global.VX_DUMMIES + 'dummy-logger');
//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//  name: 'test',
//  level: 'debug',
//  child: logUtil._createLogger
// });
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------
// log = require('bunyan').createLogger({
//     name: 'solr-record-storage-handler-spec',
//     level: 'debug'
// });

// var environment = {};
// environment.publisherRouter = {
//     'publish': jasmine.createSpy().andCallFake(function(job, callback) {
//         callback(null, [1]);
//     })
// };
// environment.metrics = log;
// environment.solr = {
//     'add': jasmine.createSpy().andCallFake(function(doc, callback) {
//         callback(null);
//     })
// };


//----------------------------------------------------------------------------------------
// Create the config object that is needed for testing.
//
// returns config: The config object.
//----------------------------------------------------------------------------------------
function createConfig() {
    var config = {
        'trackSolrStorage': true,
        'vista': {
            'domainsNoSolrTracking': [ 'patient', 'treatment' ]
        },
        'solrStorageRules': {
            'jds-domains': {},
            'store-to-solr-attribute': {},
            'ehmp-activity-data': {}
        }
    };
    return config;
}

//----------------------------------------------------------------------------------------
// Create the environment variable needed for the tests.
//
// config: The configuration settings to be used.
// solrErrorResponse: The value to return as the SOLR error response if the method solr.add
//                    method called.
// returns: The filled out environment variable.
//----------------------------------------------------------------------------------------
function createEnvironment(config, solrErrorResponse) {
    var environment = {
        jds: new JdsClientDummy(log, config),
        metrics: log,
        // publisherRouter: {
        //     'publish': jasmine.createSpy().andCallFake(function(job, callback) {
        //         callback(null, [1]);
        //     })
        // },
        // solr: {
        //     'add': jasmine.createSpy().andCallFake(function(doc, callback) {
        //         callback(null);
        //     })
        // }
        solr: {
            'add': function(solrDoc, callback) {
                callback(solrErrorResponse);
            }
        }
    };

    spyOn(environment.jds, 'getSimpleSyncStatus').andCallThrough();
    spyOn(environment.jds, 'setEventStoreStatus').andCallThrough();
    spyOn(environment.solr, 'add').andCallThrough();

    return environment;
}

//-----------------------------------------------------------------------------------------------
// This function returns a succesful response from JDS if it has stored Solr status for an event
// to JDS.
//
// returns: A "success" response that would occur if JDS had successfully stored status to SOLR.
//-----------------------------------------------------------------------------------------------
function createJdsSuccessSetEventStoreStatusResponse() {
    var response = {
        'statusCode': 201,
        'headers': {
            'date': 'Tue, 11 Oct 2016 16:36:18 GMT',
            'location': 'http://IP             /vpr/9E7A;33333/urn:va:allergy:9E7A:3:PORT',
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'content-length': '0'
        },
        'request': {
            'uri': {
                'protocol': 'http:',
                'slashes': true,
                'auth': null,
                'host': 'IP             ',
                'port': 'PORT',
                'hostname': 'IP        ',
                'hash': null,
                'search': null,
                'query': null,
                'pathname': '/status/9E7A;33333/store',
                'path': '/status/9E7A;33333/store',
                'href': 'http://IP             /status/9E7A;33333/store'
            },
            'method': 'POST',
            'headers': {
                'accept': 'application/json',
                'content-type': 'application/json',
                'content-length': 78
            }
        }
    };

    return response;
}

//-----------------------------------------------------------------------------------------------
// This function returns a valid allergy event.
//
// returns: A valid allergy event.
//-----------------------------------------------------------------------------------------------
function createAllergyEvent() {
    var allergyEvent = {
        'drugClasses': [{
            'code': 'AM114',
            'name': 'PENICILLINS AND BETA-LACTAM ANTIMICROBIALS',
            'summary': 'AllergyDrugClass{uid=\'\'}'
        }],
        'entered': '20050317200900',
        'facilityCode': '500',
        'facilityName': 'CAMP MASTER',
        'historical': true,
        'kind': 'Allergy/Adverse Reaction',
        'lastUpdateTime': '20050317200936',
        'localId': '751',
        'mechanism': 'PHARMACOLOGIC',
        'originatorName': 'VEHU,EIGHT',
        'pid': '9E7A;3',
        'products': [{
            'name': 'PENICILLIN',
            'summary': 'AllergyProduct{uid=\'\'}',
            'vuid': 'urn:va:vuid:'
        }],
        'reactions': [{
            'name': 'ITCHING,WATERING EYES',
            'summary': 'AllergyReaction{uid=\'\'}',
            'vuid': 'urn:va:vuid:'
        }],
        'reference': '125;GMRD(120.82,',
        'stampTime': '20050317200936',
        'summary': 'PENICILLIN',
        'typeName': 'DRUG',
        'uid': 'urn:va:allergy:9E7A:3:751',
        'verified': '20050317200936',
        'verifierName': '<auto-verified>'
    };

    return allergyEvent;
}


describe('solr-record-storage-handler.js', function() {
    describe('store Method', function() {
        it('Test patient domain - make sure it tracks storage - but does not actually store to SOLR.', function() {
            var config = createConfig();
            var dataDomain = 'patient';
            var environment = createEnvironment(config, null);
            var record = {
                'familyName': 'EIGHT',
                'givenNames': 'PATIENT',
                'uid': 'urn:va:patient:9E7A:3:3',
                'stampTime': '20071217151354',
                'pid': '9E7A;3'
            };
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test treatment domain - make sure it tracks storage - but does not actually store to SOLR.', function() {
            var config = createConfig();
            var dataDomain = 'treatment';
            var environment = createEnvironment(config, null);
            var record = {
                'uid': 'urn:va:treatment:9E7A:3:12275',
                'stampTime': '20071217151354',
                'pid': '9E7A;3'
            };
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test allergy domain - make sure it stores to solr and also tracks storage.', function() {
            var config = createConfig();
            var dataDomain = 'allergy';
            var solrResponse = null;    // Success response
            var environment = createEnvironment(config, solrResponse);
            var record = createAllergyEvent();
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test allergy domain - Simulate Solr error - make sure it behaves correctly.', function() {
            var config = createConfig();
            var dataDomain = 'allergy';
            var solrResponse = 'An error occurred.';    // Success response
            var environment = createEnvironment(config, solrResponse);
            var record = createAllergyEvent();
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(response).toBeUndefined();
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test allergy domain - Simulate situation where Solr Xform fails to transform the record.', function() {
            var config = createConfig();
            var dataDomain = 'allergy';
            var solrResponse = 'An error occurred.';    // Success response
            var environment = createEnvironment(config, solrResponse);
            environment.solrXform = function (record, log, config, callback) {
                return callback(null);
            };
            var record = createAllergyEvent();
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(response).toBeUndefined();
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test allergy domain - Simulate situation where Solr Xform returns an error', function() {
            var config = createConfig();
            var dataDomain = 'allergy';
            var solrResponse = 'An error occurred.';    // Success response
            var environment = createEnvironment(config, solrResponse);
            environment.solrXform = function (record, log, config, callback) {
                return callback('error!');
            };
            var record = createAllergyEvent();
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(response).toBeUndefined();
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test ehmp activity that should not be transformed', function() {
            var config = createConfig();
            var dataDomain = 'ehmp-activity';
            var solrResponse = null;
            var environment = createEnvironment(config, solrResponse);
            var record = {domain: 'ehmp-activity', subDomain: 'medication'};
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                writebackWrapper(log, config, environment, dataDomain, record, function(error, response) {
                    expect(error).toBeNull();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });
    });

    describe('trackSolrStorage Method', function() {
        it('Test where trackSolrStorage is turned off.', function() {
            var config = createConfig();
            config.trackSolrStorage = false;
            var environment = createEnvironment(config, null);
            var record = {};

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record is null.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = null;

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record is undefined.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record;

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record is empty object.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {};

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.uid is undefined.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction'
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.uid is null.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': null
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.uid is an empty string.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': ''
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.stampTime is undefined.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751'
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.stampTime is null.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': null
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.stampTime is an empty string.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': ''
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.pid is undefined.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354'
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.pid is null.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354',
                'pid': null
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Invalid parameter - record.pid is an empty string.', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354',
                'pid': ''
            };

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('fatal-exception');
                    expect(environment.jds.setEventStoreStatus).not.toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Error response from JDS when attempting to call setEventStoreStatus', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354',
                'pid': '9E7A;33333'
            };
            environment.jds._setResponseData(['Failed to store record.'], [undefined], [undefined]);

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Error response from JDS when attempting to call setEventStoreStatus', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354',
                'pid': '9E7A;33333'
            };
            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            jdsResponse.statusCode = 400;
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeTruthy();
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    expect(response).toBeUndefined();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });

        it('Test trackSolrStorage failure: Successful response from JDS when attempting to call setEventStoreStatus', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);
            var record = {
                'kind': 'Allergy/Adverse Reaction',
                'uid': 'urn:va:allergy:9E7A:3:751',
                'stampTime': '20071217151354',
                'pid': '9E7A;33333'
            };

            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished;
            runs(function() {
                trackSolrStorage(log, config, environment, record, function(error, response) {
                    expect(error).toBeNull();
                    expect(response).toBeTruthy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    finished = true;
                });

            });

            waitsFor(function() {
                return finished;
            });
        });
    });

    describe('handle()', function() {
        it('handles a solr-record-storage job', function() {
            var config = createConfig();
            var environment = createEnvironment(config, null);

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };
            var allergyRecord = createAllergyEvent();
            var storageJob = {
                'patientIdentifier': patientIdentifier,
                'record': allergyRecord,
                'jpid': '21EC2020-3AEA-4069-A2DD-08002B30309D',
                'dataDomain': 'allergy',
                'type': 'solr-record-storage'
            };

            var jdsResponse = createJdsSuccessSetEventStoreStatusResponse();
            environment.jds._setResponseData([null], [jdsResponse], [undefined]);

            var finished = false;
            runs(function() {
                handle(log, config, environment, storageJob, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    finished = true;
                }, function() {});
            });

            waitsFor(function() {
                return finished;
            });
        });
    });
});
