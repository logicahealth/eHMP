'use strict';

require('../../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var logger = require(global.VX_DUMMIES + 'dummy-logger');

// logger = require('bunyan').createLogger({
//     name: 'jds-client',
//     level: 'debug'
// });

var config = require(global.VX_ROOT + 'worker-config');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var jdsClient = new JdsClient(logger, logger, config);

var count = 1;

function buildErrorRecord(uid) {
    return {
        name: 'test record: ' + count++,
        timestamp: moment.utc().format(),
        test: true,
        uid: uid
    };
}

function getTestUid(number) {
    return 'urn:va:vxsyncerr:TEST' + number;
}

function deleteAllTestErrorRecords(callback) {
    jdsClient.deleteErrorRecordsByFilter('exists(test)', function(error, result) {
        callback(error, result);
    });
}

describe('jds-client.js (Error Record)', function() {
    describe('addErrorRecord()', function() {
        it('Successfully writes without error', function() {
            var complete;
            var expectedError;
            var expectedResult;

            runs(function() {
                jdsClient.addErrorRecord(buildErrorRecord(getTestUid(1)), function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult.statusCode).toBe(201);
            });
        });
    });

    describe('getErrorRecordCount()', function() {
        it('Successfully get error record count', function() {
            var complete;
            var expectedError;
            var expectedResponse;
            var expectedResult;

            runs(function() {
                async.series({
                    addErrorRecord: jdsClient.addErrorRecord.bind(jdsClient, buildErrorRecord(getTestUid(1))),
                    getErrorRecordCount: function(asyncCallback) {
                        jdsClient.getErrorRecordCount.bind(jdsClient, function(error, response, result) {
                            expectedResponse = response;
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResponse.statusCode).toBe(200);
                expect(expectedResult.getErrorRecordCount).toBeGreaterThan(0);
            });
        });
    });

    // Disabled so that this test does not affect pre-existing non-test records
    // that may already be in the error store
    xdescribe('deleteAllErrorRecords()', function() {
        it('Successfully deletes all error records', function() {
            var complete;
            var expectedError;
            var expectedResult;

            runs(function() {
                async.series({
                    deleteAllErrorRecords: jdsClient.deleteAllErrorRecords.bind(jdsClient),
                    getErrorRecordCount: jdsClient.getErrorRecordCount.bind(jdsClient)
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(val(expectedResult, ['deleteAllErrorRecords', 'statusCode'])).toBe(200);
                expect(String(expectedResult.getErrorRecordCount)).toBe('0');
            });
        });
    });

    describe('findErrorRecordByUid()', function() {
        it('Successfully retrieves a record by id', function() {
            var complete;
            var expectedError;
            var expectedResponse;
            var expectedResult;

            var record = {
                type: 'test',
                value: 'value',
                uid: getTestUid(1)
            };
            runs(function() {
                async.series({
                    addErrorRecord: jdsClient.addErrorRecord.bind(jdsClient, record),
                    findErrorRecordByUid: function(asyncCallback) {
                        jdsClient.findErrorRecordByUid.bind(jdsClient, record.uid, function(error, response, result) {
                            expectedResponse = response;
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResponse.statusCode).toEqual(200);
                expect(expectedResult.findErrorRecordByUid).toEqual(record);
            });
        });
    });

    describe('deleteErrorRecordByUid()', function() {
        it('Successfully deletes a record by id', function() {
            var complete;
            var expectedError;
            var expectedResult;

            var record = {
                type: 'test',
                value: 'value',
                uid: getTestUid(1)
            };

            runs(function() {
                async.series({
                    addErrorRecord: jdsClient.addErrorRecord.bind(jdsClient, record),
                    deleteErrorRecordByUid: function(asyncCallback) {
                        jdsClient.deleteErrorRecordByUid.bind(jdsClient, record.uid, function(error, response, result) {
                            expect(response.statusCode).toEqual(200);
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            var verifyComplete = false;
            runs(function() {
                expect(expectedError).toBeFalsy();

                jdsClient.findErrorRecordByUid(record.uid, function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toEqual(404);
                    expect(result).toBeTruthy();
                    verifyComplete = true;
                });
            });

            waitsFor(function() {
                return verifyComplete;
            }, 'Should complete verification without error', 4000);
        });
    });

    describe('findErrorRecords', function() {
        it('Successfully retrieves records (no filter, index, range)', function() {
            var complete;
            var expectedError;
            var expectedResult;

            var errorRecord = {
                type: 'error',
                value: 'error value'
            };

            runs(function() {
                async.series({
                    addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), errorRecord)),
                    findErrorRecordsByFilter: function(asyncCallback) {
                        jdsClient.findErrorRecords.bind(jdsClient, null, function(error, response, result) {
                            expect(response.statusCode).toEqual(200);
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(val(expectedResult, ['findErrorRecordsByFilter', 'items', 'length'])).toBeGreaterThan(0);
            });
        });

        it('Successfully retrieves records by index + filter', function() {
            var complete;
            var expectedError;
            var expectedResult;

            var errorRecord1 = {
                type: 'error',
                value: 'error value',
                timestamp: '1489688341630',
                test: true,
                filterTest: 'include'
            };

            var errorRecord2 = {
                type: 'error',
                value: 'error value',
                timestamp: '1490120383645',
                test: true,
                filterTest: 'exclude'
            };

            var query = {
                index: 'vxsyncerr-timestamp',
                filter: 'eq(filterTest,"include")'
            };

            runs(function() {
                async.series({
                    addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), errorRecord1)),
                    addErrorRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(2)), errorRecord2)),
                    findErrorRecordsByFilter: function(asyncCallback) {
                        jdsClient.findErrorRecords.bind(jdsClient, query, function(error, response, result) {
                            expect(response.statusCode).toEqual(200);
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(val(expectedResult, ['findErrorRecordsByFilter', 'items', 'length'])).toBe(1);
            });
        });

        it('Successfully retrieves records by index + range + filter', function() {
            var complete;
            var expectedError;
            var expectedResult;

            // the day of
            var errorRecord1 = {
                type: 'error',
                value: 'error value',
                timestamp: '1489688341630',
                test: true
            };

            // 5 days after
            var errorRecord2 = {
                type: 'error',
                value: 'error value',
                timestamp: '1490120383645',
                test: true,
                filterTest: 'include'
            };

            //5 days before
            var errorRecord3 = {
                type: 'error',
                value: 'error value',
                timestamp: '1489260061546',
                test: true
            };

            //10 days after
            var errorRecord4 = {
                type: 'error',
                value: 'error value',
                timestamp: '1490552469354',
                test: true
            };

            var range = '[' + errorRecord1.timestamp + '..' + errorRecord2.timestamp + ']';

            var query = {
                index: 'vxsyncerr-timestamp',
                range: range,
                filter: 'exists(filterTest)'
            };

            runs(function() {
                async.series({
                    addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), errorRecord1)),
                    addErrorRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(2)), errorRecord2)),
                    addErrorRecord3: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(3)), errorRecord3)),
                    addErrorRecord4: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(4)), errorRecord4)),
                    findErrorRecords: function(asyncCallback) {
                        jdsClient.findErrorRecords.bind(jdsClient, query, function(error, response, result) {
                            expect(response.statusCode).toEqual(200);
                            asyncCallback(error, result);
                        })();
                    }
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(val(expectedResult, ['findErrorRecords', 'items', 'length'])).toBe(1);
            });
        });

        describe('findErrorRecordsByFilter()', function() {
            it('Successfully retrieves records by filter', function() {
                var complete;
                var expectedError;
                var expectedResult;

                var errorRecord = {
                    type: 'error',
                    value: 'error value'
                };

                var jobRecord = {
                    type: 'job',
                    value: 'job value'
                };

                runs(function() {
                    async.series({
                        addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), errorRecord)),
                        addErrorRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(2)), errorRecord)),
                        addErrorRecord3: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(3)), errorRecord)),
                        addJobRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(4)), jobRecord)),
                        addJobRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(5)), jobRecord)),
                        findErrorRecordsByFilter: function(asyncCallback) {
                            jdsClient.findErrorRecordsByFilter.bind(jdsClient, 'eq(type,"job")', function(error, response, result) {
                                expect(response.statusCode).toEqual(200);
                                asyncCallback(error, result);
                            })();
                        }
                    }, function(error, result) {
                        expectedError = error;
                        expectedResult = result;
                        complete = true;
                    });
                });

                waitsFor(function() {
                    return complete;
                }, 'Should complete without error', 4000);

                runs(function() {
                    expect(expectedError).toBeFalsy();
                    expect(val(expectedResult, ['findErrorRecordsByFilter', 'items', 'length'])).toBe(2);
                });
            });
        });

        describe('findErrorRecordsByRange()', function() {
            it('Successfully retrieves records by index + range', function() {
                var complete;
                var expectedError;
                var expectedResult;

                // the day of
                var errorRecord1 = {
                    type: 'error',
                    value: 'error value',
                    timestamp: '1489688341630',
                    test: true
                };

                // 5 days after
                var errorRecord2 = {
                    type: 'error',
                    value: 'error value',
                    timestamp: '1490120383645',
                    test: true
                };

                //5 days before
                var errorRecord3 = {
                    type: 'error',
                    value: 'error value',
                    timestamp: '1489260061546',
                    test: true
                };

                //10 days after
                var errorRecord4 = {
                    type: 'error',
                    value: 'error value',
                    timestamp: '1490552469354',
                    test: true
                };

                var range = '[' + errorRecord1.timestamp + '..' + errorRecord2.timestamp + ']';

                runs(function() {
                    async.series({
                        addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), errorRecord1)),
                        addErrorRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(2)), errorRecord2)),
                        addErrorRecord3: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(3)), errorRecord3)),
                        addErrorRecord4: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(4)), errorRecord4)),
                        findErrorRecordsByRange: function(asyncCallback) {
                            jdsClient.findErrorRecordsByRange.bind(jdsClient, 'vxsyncerr-timestamp', range, function(error, response, result) {
                                expect(response.statusCode).toEqual(200);
                                asyncCallback(error, result);
                            })();
                        }
                    }, function(error, result) {
                        expectedError = error;
                        expectedResult = result;
                        complete = true;
                    });
                });

                waitsFor(function() {
                    return complete;
                }, 'Should complete without error', 4000);

                runs(function() {
                    expect(expectedError).toBeFalsy();
                    expect(val(expectedResult, ['findErrorRecordsByRange', 'items', 'length'])).toBe(2);
                });
            });
        });
    });

    describe('deleteErrorRecordsByFilter()', function() {
        it('Successfully deletes records by filter', function() {
            var complete;
            var expectedError;
            var expectedResult;

            var jobErrorRecord = {
                classification: 'job',
                type: 'error',
                value: 'error value',
                test: true
            };

            var pollerErrorRecord = {
                classification: 'poller',
                type: 'error',
                value: 'error value',
                test: true
            };

            runs(function() {
                async.series({
                    addErrorRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(1)), jobErrorRecord)),
                    addErrorRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(2)), jobErrorRecord)),
                    addErrorRecord3: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(3)), jobErrorRecord)),
                    addJobRecord1: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(4)), pollerErrorRecord)),
                    addJobRecord2: jdsClient.addErrorRecord.bind(jdsClient, _.extend(buildErrorRecord(getTestUid(5)), pollerErrorRecord)),
                    deleteErrorRecordsByFilter: function(asyncCallback) {
                        jdsClient.deleteErrorRecordsByFilter.bind(jdsClient, 'eq(classification,"job")', function(error, response) {
                            expect(response.statusCode).toEqual(200);
                            asyncCallback(error, response);
                        })();
                    },
                    findErrorRecordsByFilter: function(asyncCallback) {
                        jdsClient.findErrorRecordsByFilter.bind(jdsClient, 'eq(classification,"job")', function(error, response, result) {
                            expect(_.isEmpty(result)).toBe(true);
                            asyncCallback(error, result);
                        })();
                    },
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });

            waitsFor(function() {
                return complete;
            }, 'Should complete without error', 4000);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(_.isEmpty(expectedResult.findErrorRecordsByFilter.items)).toBe(true);
            });
        });
    });

    // Clean up test data in Error Storage
    afterEach(function() {
        var complete;
        var expectedError;
        var expectedResult;

        runs(function() {
            runs(function() {
                async.series({
                    deleteAllErrorRecords: deleteAllTestErrorRecords,
                    getErrorRecordCount: jdsClient.getErrorRecordCount.bind(jdsClient)
                }, function(error, result) {
                    expectedError = error;
                    expectedResult = result;
                    complete = true;
                });
            });
        });

        waitsFor(function() {
            return complete;
        }, 'Should complete without error', 4000);

        runs(function() {
            expect(expectedError).toBeFalsy();
        });
    });
});