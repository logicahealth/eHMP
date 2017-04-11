'use strict';

require('../../../../env-setup');

var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var PjdsClientDummy = require(global.VX_DUMMIES + 'pjds-client-dummy');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
var OsyncClinicUtils = require(global.VX_UTILS + 'osync/osync-clinic-utils');

var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//  name: 'test',
//  level: 'debug',
//  child: logUtil._createLogger
// });

var config = {};

function createEnvironment(log, config) {
    return {
        jds: new JdsClientDummy(log, config),
        pjds: new PjdsClientDummy(log, config),
        publisherRouter: new PublisherRouterDummy(log, config, PublisherDummy)
    };
}

describe('osync-clinic-utils', function() {
    describe('osyncClinicAdd', function() {
        it('Error path: Pass site without clinic, no uid option', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            osyncClinicUtils.osyncClinicAdd('9E7A', undefined, undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: You must provide either site and clinic, or uid');
            });
        });

        it('Error path: Pass override with site and clinic, no uid option', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, true, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: You must provide the uid parameter when you set override to true');
            });
        });

        it('Error path: Pass override with uid option, error response from pJDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, true, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error adding UID urn:va:location:9E7A:110 to osynclinic store');
            });
        });

        it('Error path: Pass override with uid option, 404 response from pJDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, true, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error adding UID urn:va:location:9E7A:110 to osynclinic store');
            });
        });

        it('Normal path: Pass override with uid option', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, true, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 added to osynclinic store');
            });
        });

        it('Error path: Pass uid option, error response from pJDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving location operational data from JDS for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, 404 response from JDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving location operational data from JDS for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, uid not in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 0
                }
            }]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: UID urn:va:location:9E7A:110 is not stored in JDS');
            });
        });

        it('Error path: Pass uid and type options, type does not match in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        type: 'W'
                    }]
                }
            }]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', 'C', false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: Type C does not match JDS operational data type W');
            });
        });

        it('Normal path: Pass uid option with type, uid in ODS and type matches', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        type: 'C'
                    }]
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [null]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', 'C', false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 added to osynclinic store');
            });
        });

        it('Normal path: Pass uid option, uid in ODS matches', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: ['']
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [null]);

            osyncClinicUtils.osyncClinicAdd(undefined, undefined, 'urn:va:location:9E7A:110', undefined, false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 added to osynclinic store');
            });
        });

        it('Error path: Pass site and clinic options, error response from JDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving location operational data from JDS for clinic 4E NORTH at site 9E7A');
            });
        });

        it('Error path: Pass site and clinic options, 404 response from JDS', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);


            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving location operational data from JDS for clinic 4E NORTH at site 9E7A');
            });
        });

        it('Error path: Pass site and clinic with type options, type does not match in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        type: 'OR'
                    }]
                }
            }]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, 'C', false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: Clinic 4E NORTH at site 9E7A of type C is not stored in JDS');
            });
        });

        it('Error path: Pass site and clinic options, no matches in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 0
                }
            }]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: Clinic 4E NORTH at site 9E7A is not stored in JDS');
            });
        });

        it('Normal path: Pass site and clinic with type options, type matches in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        uid: 'urn:va:location:9E7A:110',
                        type: 'C'
                    }]
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 added to osynclinic store');
            });
        });

        it('Normal path: Pass site and clinic options, one match in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        uid: 'urn:va:location:9E7A:110'
                    }]
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 added to osynclinic store');
            });
        });

        it('Normal path: Pass site and clinic options, one match in ODS data (all-numeric site hash)', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 1,
                    items: [{
                        uid: 'urn:va:location:1234:110'
                    }]
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd(1234, '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:1234:110 added to osynclinic store');
            });
        });

        it('Normal path: Pass site and clinic options, multiple matches in ODS data', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                data: {
                    totalItems: 2,
                    items: [{
                        uid: 'urn:va:location:9E7A:110'
                    }, {
                        uid: 'urn:va:location:9E7A:111'
                    }]
                }
            }]);

            environment.pjds._setResponseData([null], [{
                statusCode: 201
            }], [undefined]);

            osyncClinicUtils.osyncClinicAdd('9E7A', '4E NORTH', undefined, undefined, false, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('There are 2 clinics to choose from, please rerun with uid');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110', 'urn:va:location:9E7A:111']);
            });
        });
    });

    describe('osyncClinicRemove', function() {
        it('Error path: Don\'t pass site or uid options', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            osyncClinicUtils.osyncClinicRemove(undefined, undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: You must provide either site or uid');
            });
        });

        it('Error path: Pass uid option, error response from pJDS during verification', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicRemove(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, 404 response from pJDS during verification', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);

            osyncClinicUtils.osyncClinicRemove(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, error response from pJDS during delete', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([
                null,
                true
            ], [{
                statusCode: 200
            },
                ''
            ], [{
                data: {
                    totalItems: 1,
                    items: ['']
                }
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error removing UID urn:va:location:9E7A:110 from osynclinic store');
            });
        });

        it('Normal path: Pass uid option, uid in ODS matches', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([
                null,
                null
            ], [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toEqual('UID urn:va:location:9E7A:110 removed from osynclinic store');
            });
        });

        it('Error path: Pass site option, error response from pJDS during clinic retrieval', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicRemove('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for site 9E7A');
            });
        });

        it('Error path: Pass site option, error response from pJDS during multi-clinic removal of first clinic', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, true], [{
                statusCode: 200
            },
                ''
            ], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(error).toEqual('Error removing UID urn:va:location:9E7A:110 from osynclinic store');
                expect(result).toEqual('Successfully removed 0 clinic(s)');
                expect(clinicList).toEqual([]);
            });
        });

        it('Error path: Pass site option, error response from pJDS during multi-clinic removal of second clinic', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, true], [{
                statusCode: 200
            }, {
                statusCode: 200
            },
                ''
            ], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(error).toEqual('Error removing UID urn:va:location:9E7A:111 from osynclinic store');
                expect(result).toEqual('Successfully removed 1 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110']);
            });
        });

        it('Normal path: Pass site option, multi-clinic removal of two clinics', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully removed 2 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110', 'urn:va:location:9E7A:111']);
            });
        });

        it('Normal path: Pass site option, multi-clinic removal of two clinics (all-numeric site hash)', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:1234:110'
                }, {
                    uid: 'urn:va:location:1234:111'
                }]
            },
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRemove(1234, undefined, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully removed 2 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:1234:110', 'urn:va:location:1234:111']);
            });
        });
    });

    describe('osyncClinicGet', function() {
        it('Error path: Pass site option, error response from pJDS during clinic retrieval', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicGet('9E7A', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for site 9E7A');
            });
        });

        it('Error path: Pass site option, 404 response from pJDS during clinic retrieval', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);

            osyncClinicUtils.osyncClinicGet('9E7A', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for site 9E7A');
            });
        });

        it('Normal path: Pass site option, return one clinic', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicGet('9E7A', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully listed 1 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110']);
            });
        });

        it('Normal path: Pass site option, return one clinic (all-numeric site hash)', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:1234:110'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicGet(1234, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully listed 1 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:1234:110']);
            });
        });

        it('Normal path: Pass site option, return two clinics', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicGet('9E7A', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully listed 2 clinic(s)');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110', 'urn:va:location:9E7A:111']);
            });
        });

        //Add osyncClinicGet for multiple sites - 9E7A,C877
        // 2 results
        // >2 results

        it('Normal path: Pass more than 1 site, return 1 per site', function(){
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                },{
                    uid: 'urn:va:location:C877:110'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicGet('9E7A,C877', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully listed 2 clinic(s)');
                expect(clinicList).toContain('urn:va:location:9E7A:110');
                expect(clinicList).toContain('urn:va:location:C877:110');
            });
        });
        it('Normal path: Pass more than 1 site, return 1 per site', function(){
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                },{
                    uid: 'urn:va:location:9E7A:111'
                },{
                    uid: 'urn:va:location:C877:110'
                },{
                    uid: 'urn:va:location:C877:111'
                }]
            },
                undefined
            ]);

            osyncClinicUtils.osyncClinicGet('9E7A,C877', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully listed 4 clinic(s)');
                expect(clinicList).toContain('urn:va:location:9E7A:110');
                expect(clinicList).toContain('urn:va:location:C877:110');
                expect(clinicList).toContain('urn:va:location:9E7A:111');
                expect(clinicList).toContain('urn:va:location:C877:111');
            });
        });
    });

    describe('osyncClinicRun', function() {
        it('Error path: Don\'t pass site or uid options', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            osyncClinicUtils.osyncClinicRun(undefined, undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error: You must provide either site or uid');
            });
        });

        it('Error path: Pass uid option, error response from pJDS during verification', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicRun(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, 404 response from pJDS during verification', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 404
            }], [undefined]);

            osyncClinicUtils.osyncClinicRun(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for UID urn:va:location:9E7A:110');
            });
        });

        it('Error path: Pass uid option, error response from pJDS during publish', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [{
                data: {
                    totalItems: 1,
                    items: ['urn:va:location:9E7A:110']
                }
            }]);

            osyncClinicUtils.osyncClinicRun(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for UID urn:va:location:9E7A:110');
            });
        });

        it('Normal path: Pass uid option, published one clinic to osync-appointments tube', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null], [{
                statusCode: 200
            }], [
                undefined
            ]);

            osyncClinicUtils.osyncClinicRun(undefined, 'urn:va:location:9E7A:110', function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeUndefined();
                expect(result).toContain('Published jobId');
                expect(result).toContain('to osync-appointments tube');
            });
        });

        it('Error path: Pass site option, error response from pJDS during clinic retrieval', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([true], [''], [undefined]);

            osyncClinicUtils.osyncClinicRun('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                expect(clinicList).toBeUndefined();
                expect(error).toEqual('Error retrieving clinics from osynclinic data store for site 9E7A');
            });
        });

        it('Error path: Pass site option, error response from pJDS during multi-clinic publish of first clinic', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, true], [{
                statusCode: 200
            },
                ''
            ], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined
            ]);

            spyOn(environment.publisherRouter, 'publish').andCallFake(function(jobs, callback){
                callback('Publisher error');
            });

            osyncClinicUtils.osyncClinicRun('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(error).toContain('Error publishing jobId');
                expect(result).toEqual('Successfully published 0 osync clinic job(s) to osync-appointments tube');
                expect(clinicList).toEqual([]);
            });
        });

        it('Error path: Pass site option, error response from pJDS during multi-clinic publish of second clinic', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, true], [{
                statusCode: 200
            }, {
                statusCode: 200
            },
                ''
            ], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined,
                undefined
            ]);

            spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback){
                callback(job.clinic === '111' ?'Publisher error':null);
            });

            osyncClinicUtils.osyncClinicRun('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeTruthy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(error).toContain('Error publishing jobId');
                expect(result).toEqual('Successfully published 1 osync clinic job(s) to osync-appointments tube');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110']);
            });
        });

        it('Normal path: Pass site option, multi-clinic publish job to osync-appointments tube of two clinics', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:9E7A:110'
                }, {
                    uid: 'urn:va:location:9E7A:111'
                }]
            },
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRun('9E7A', undefined, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully published 2 osync clinic job(s) to osync-appointments tube');
                expect(clinicList).toEqual(['urn:va:location:9E7A:110', 'urn:va:location:9E7A:111']);
            });
        });

         it('Normal path: Pass site option, multi-clinic publish job to osync-appointments tube of two clinics (all-numeric site hash)', function() {
            var environment = createEnvironment(log, config);
            var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

            environment.pjds._setResponseData([null, null, null], [{
                statusCode: 200
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [{
                items: [{
                    uid: 'urn:va:location:1234:110'
                }, {
                    uid: 'urn:va:location:1234:111'
                }]
            },
                undefined,
                undefined
            ]);

            osyncClinicUtils.osyncClinicRun(1234, undefined, function(error, result, clinicList) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(clinicList).toBeDefined();
                expect(result).toEqual('Successfully published 2 osync clinic job(s) to osync-appointments tube');
                expect(clinicList).toEqual(['urn:va:location:1234:110', 'urn:va:location:1234:111']);
            });
        });
    });
});

