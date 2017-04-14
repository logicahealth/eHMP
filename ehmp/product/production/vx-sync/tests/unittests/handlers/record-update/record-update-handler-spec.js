'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'record-update/record-update-handler');
var log = require(global.VX_DUMMIES + '/dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var jobUtil = require(global.VX_UTILS + 'job-utils');

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-update-spec',
//     level: 'debug'
// });

var patientIdentifier = {
    type: 'pid',
    value: '9E7A;3'
};
var dataDomain = 'allergy';
var rootJobId = 1;

var originalVaAllergyRecord = {
    'drugClasses': [{
        'code': 'AM114',
        'name': 'PENICILLINS AND BETA-LACTAM ANTIMICROBIALS'
    }],
    'entered': 200503172009,
    'facilityCode': 500,
    'facilityName': 'CAMP MASTER',
    'historical': true,
    'kind': 'Allergy / Adverse Reaction',
    'lastUpdateTime': 20050317200936,
    'localId': 751,
    'mechanism': 'PHARMACOLOGIC',
    'originatorName': 'VEHU,EIGHT',
    'products': [{
        'name': 'PENICILLIN',
        'vuid': 'urn:va:vuid:1234'
    }],
    'reactions': [{
        'name': 'ITCHING,WATERING EYES',
        'vuid': 'urn:va:vuid:4019880'
    }],
    'reference': '125;GMRD(120.82,',
    'stampTime': 20050317200936,
    'summary': 'PENICILLIN',
    'typeName': 'DRUG',
    'pid': '9E7A;3',
    'uid': 'urn:va:allergy:9E7A:3:751',
    'verified': 20050317200936,
    'verifierName': '<auto-verified>',
    'comments': [{
        'entered': 200503172009,
        'comment': 'The allergy comment.'
    }],
    'observations': [{
        'date': 200503172009,
        'severity': 'bad'
    }]
};

var allergyMetaStamp = {
    'stampTime':20160506133145,
    'sourceMetaStamp':{
        '9E7A':{
            'pid':'9E7A;3',
            'localId':'3',
            'stampTime':20160506133145,
            'domainMetaStamp':{
                'allergy':{
                    'domain':'allergy',
                    'stampTime':20160506133145,
                    'eventMetaStamp':{
                        'urn:va:allergy:9E7A:3:751':{
                            'stampTime':20050317200936
                        }
                    }
                }
            }
        }
    }
};

var CODE_SYSTEMS = {
    CODE_SYSTEM_UMLS_CUI: 'urn:oid:2.16.840.1.113883.6.86',
    SYSTEM_DOD_ALLERGY_IEN: 'DOD_ALLERGY_IEN'
};

var jlvMappedCodeValue = {
    code: 'SomeCode',
    codeSystem: CODE_SYSTEMS.CODE_SYSTEM_UMLS_CUI,
    displayText: 'SomeText'
};
var jdsCodedValue = {
    code: jlvMappedCodeValue.code,
    system: jlvMappedCodeValue.codeSystem,
    display: jlvMappedCodeValue.displayText
};

//-----------------------------------------------------------------------------
// Mock JLV function that simulates the return of a valuid JLV terminology
// mapping.
//
// parameters are ignored for this mock...
//-----------------------------------------------------------------------------
function getJlvMappedCode_ReturnValidCode(mappingType, sourceCode, callback) {
    return callback(null, jlvMappedCodeValue);
}

function getJlvMappedCode_ReturnError(mappingType, sourceCode, callback) {
    return callback('error');
}

describe('record-update-handler', function() {
    it('Normal path', function() {
        var done1;
        var config = {
            'vista': {
                'domainsNoSolrTracking': [ 'patient', 'treatment' ]
            }
        };

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 201
        });

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };


        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    it('Error path: invalid job', function(){
        var job = {};

        var done1;
        var config = {
            'vista': {
                'domainsNoSolrTracking': [ 'patient', 'treatment' ]
            }
        };

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 201
        });

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(error.type).toEqual('fatal-exception');
                expect(error.message).toEqual('Invalid format for job');
                expect(result).toBeFalsy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    it('Error path: record enrichment error', function() {
        var done1;
        var config = {
            'vista': {
                'domainsNoSolrTracking': [ 'patient', 'treatment' ]
            }
        };

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 201
        });

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnError
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };
        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(error.type).toEqual('transient-exception');
                expect(error.message).toEqual('record-update-handler.recordEnrichmentStep: Record enrichment returned error.');
                expect(result).toBeFalsy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    it('Error path: store in JDS error', function() {
        var done1;
        var config = {};

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData('error', {
            statusCode: 500
        });

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };

        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(error.type).toEqual('transient-exception');
                expect(error.message).toEqual('record-update-handler.storeRecordStep: Got error while attempting to store record to JDS.');
                expect(result).toBeFalsy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    //Test disabled because SOLR storage handler never calls back with errors; always treats them as transient
    xit('Error path: store in SOLR error', function() {
        var done1;
        var config = {};

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, {
            statusCode: 201
        });

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback('error');
                }
            },
            metrics: log
        };
        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    it('Normal path with metaStamp', function() {
        var done1;
        var config = {
            'vista': {
                'domainsNoSolrTracking': [ 'patient', 'treatment' ]
            }
        };

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 200
        },{
            statusCode: 201
        }]);

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };


        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);
        job.metaStamp = allergyMetaStamp;

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });

    it('Error storing metaStamp', function() {
        var done1;
        var config = {};

        var jdsClientDummy = new JdsClientDummy(log, config);
        jdsClientDummy._setResponseData(null, [{
            statusCode: 500
        }]);

        var environment = {
            terminologyUtils: {
                CODE_SYSTEMS: CODE_SYSTEMS,
                getJlvMappedCode: getJlvMappedCode_ReturnValidCode
            },
            jds: jdsClientDummy,
            publisherRouter: {
                publish: function(jobsToPublish, callback) {
                    callback(null, 'success');
                }
            },
            solr: {
                add: function(solrRecord, callback) {
                    callback(null, 'success');
                }
            },
            metrics: log
        };


        //Deep copy test allergy object
        var record = JSON.parse(JSON.stringify(originalVaAllergyRecord));

        var job = jobUtil.createRecordUpdate(patientIdentifier, dataDomain, record, rootJobId);
        job.metaStamp = allergyMetaStamp;

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });
    });
});