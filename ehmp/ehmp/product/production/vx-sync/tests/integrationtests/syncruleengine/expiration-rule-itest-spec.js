'use strict';

var _ = require('underscore');

require('../../../env-setup');
var SyncRulesEngine = require(global.VX_SYNCRULES + 'rules-engine');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'expiration-rule-itest-spec',
//     level: 'debug'
// });

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//
// config:  The config object to be used in the environment.
// returns: The environment that was created.
//---------------------------------------------------------------------
function createEnvironment(config) {
    var environment = {
        jds: new JdsClient(log, log, config),
        metrics: log
    };

    spyOn(environment.jds, 'getSimpleSyncStatus').andCallThrough();

    return environment;
}

//--------------------------------------------------------------------------------
// Create the config needed for the tests.
//--------------------------------------------------------------------------------
function createConfig() {
    var config = {
        vistaSites: {
            'AAAA': {},
            'BBBB': {}
        },
        jds: _.defaults(wConfig.jds, {
            protocol: 'http',
            host: '10.2.2.110',
            port: 9080
        }),
        rules: {
            'expiration': {
                'default': 300000, // 5 minutes
                'dod': 60000, // 1 minute
                'hdr': 120000, // 2 minutes
                'vler': 180000 // 3 minutes
            }
        },
        'hdr': {
            'operationMode': 'REQ/RES'
        }
    };
    return config;
}

//---------------------------------------------------------------------------------
// This function creates the pid based on the site and icn and returns it.
//
// site: The site for which the pid is being created.
// icn: The ICN for this patient.
// dfn:  The DFN to use for the VistA sites.
// edipi: The edipi to use for DoD.
// returns: The pid that was created.
//---------------------------------------------------------------------------------
function createPid(site, icn, dfn, edipi) {
    var patientId = '';
    if (site === 'DOD') {
        patientId = edipi;
    } else if (_.contains(['HDR', 'VLER'], site)) {
        patientId = icn;
    } else {
        patientId = dfn;
    }

    return site + ';' + patientId;
}

//-----------------------------------------------------------------------------------
// Create the set of patientIdentifiers that will be used for this testing.
//
// sites: The sites to create the patient identifiers for.
// icn: The ICN for this patient.
// jpid: The JPID for this patient.
// dfn:  The DFN to use for the VistA sites.
// edipi: The edipi to use for DoD.
// returns: The patientIdentifiers array.
//-----------------------------------------------------------------------------------
function createPatientIdentifiers(sites, icn, jpid, dfn, edipi) {
    var patientIdentifiers = [{
        'type': 'icn',
        'value': icn
    }, {
        'type': 'pid',
        'value': 'JPID;' + jpid
    }];

    _.each(sites, function(site) {
        var patientIdentifier = {
            'type': 'pid',
            'value': createPid(site, icn, dfn, edipi)
        };
        patientIdentifiers.push(patientIdentifier);

    });


    return patientIdentifiers;
}

//---------------------------------------------------------------------------------------
// This function creates the set of identifiers that will be stored in JDS for this
// test patient.
//
// sites: The sites to put in the patient identifier list.
// returns: The patient identifiers to be stored to JDS.
//---------------------------------------------------------------------------------------
function createJDSPatientIdentifierList(sites, icn, dfn, edipi) {
    var jdsPatientIdentifiers = {
        patientIdentifiers: [icn]
    };

    _.each(sites, function(site) {
        var pid = createPid(site, icn, dfn, edipi);
        jdsPatientIdentifiers.patientIdentifiers.push(pid);
    });

    return jdsPatientIdentifiers;
}


//-----------------------------------------------------------------------------------------------------
//  Store a set of identifiers so that we can use it for our test.
//
//  jdsPatientIdentifiers:  The patient identifiers to link together in JDS.
//  environment: The environment information to be used.
//  callback:  The callback function.
//              function(error, jpid)
//             Where:
//                   error: The error that occurred.
//                   jpid: The jpid that was created by JDS for these identifiers.
//-----------------------------------------------------------------------------------------------------
function storeJdsPatientIdentifiers(jdsPatientIdentifiers, environment, callback) {
    environment.jds.storePatientIdentifier(jdsPatientIdentifiers, function(error, response, result) {
        expect(error).toBeFalsy();
        expect(response).toBeTruthy();
        expect(response.statusCode).toBe(201);
        expect(response.headers).toBeTruthy();
        expect(response.headers.location).toBeTruthy();
        expect(_.isString(response.headers.location)).toBe(true);
        expect(result).toBeFalsy();

        var jpid = '';
        var tokens = response.headers.location.split('jpid/');
        if ((tokens) && (_.isArray(tokens)) && (tokens.length === 2)) {
            jpid = tokens[1];
        }
        expect(jpid).toBeTruthy();

        return callback(null, jpid);
    });
}

describe('expiration-rule-itest', function() {
    it('Run expiration rule on unsynchronized patient.', function() {
        var config = createConfig();
        var environment = createEnvironment(config);
        var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
        var icn = '555555555555V5555555555';
        var dfn = '56565656';
        var edipi = '5050505050';
        var jdsPatientIdentifiers = createJDSPatientIdentifierList(sites, icn, dfn, edipi);

        // Store the Identifiers we will need to use.
        //-------------------------------------------
        var finishedJdsIdStore = false;
        var jpid = '';
        runs(function() {
            storeJdsPatientIdentifiers(jdsPatientIdentifiers, environment, function(error, assignedJpid) {
                expect(error).toBeFalsy();
                expect(assignedJpid).toBeTruthy();
                jpid = assignedJpid;
                finishedJdsIdStore = true;
            });
        });

        waitsFor(function() {
            return finishedJdsIdStore;
        });

        // Make our call to expiration rules engine.   In this case, since no sync has been done on the patient, the rules
        // should return all entries for this patient.
        //-----------------------------------------------------------------------------------------------------------------
        var engine = new SyncRulesEngine(log, config, environment);
        var patientIdentifiers = createPatientIdentifiers(sites, icn, jpid, dfn, edipi);
        var patientIdentifiersExpected = createPatientIdentifiers(sites, icn, jpid, dfn, edipi);

        var finishedRulesEngineCall = false;
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toEqual(patientIdentifiersExpected);
                finishedRulesEngineCall = true;
            });

        });

        waitsFor(function() {
            return finishedRulesEngineCall;
        });


        // Clean up what we created...
        //-----------------------------
        var finishedCleanup = false;
        runs(function() {
            environment.jds.deletePatientByPid(patientIdentifiers[0].value, function(error) {
                expect(error).toBeFalsy();
                finishedCleanup = true;
            });
        });

        waitsFor(function() {
            return finishedCleanup;
        }, 10000);
    });
    // it('Run expiration rule on full synchronized patient.', function() {
    //     var finished = false;
    //     runs(function() {
    //         engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, ids) {
    //             expect(val(ids, 'length')).toBe(3);
    //             finished = true;
    //         });
    //     });

    //     waitsFor(function() {
    //         return finished;
    //     });
    // });
});
