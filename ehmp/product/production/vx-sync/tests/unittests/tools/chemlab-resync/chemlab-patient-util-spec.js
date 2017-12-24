'use strict';

require('../../../../env-setup');

var _ = require('underscore');

var chemLabUtil = require(global.VX_TOOLS + 'chemlab-resync/chemlab-patient-util.js');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// logger = require('bunyan').createLogger({
//     name: 'chemlab-patient-util-spec',
//     level: 'debug'
// });


describe('chemlab-patient-util.js', function() {
    var finished = false;
    var expectedError;
    var expectedResult;

    var callback = function(error, result) {
        expectedError = error;
        expectedResult = result;
        finished = true;
    };

    beforeEach(function() {
        finished = false;
        expectedError = null;
        expectedResult = null;
    });

    describe('loadPatientFile()', function() {
        it('verify fs.fileExistsSync() === false returns {}', function() {
            chemLabUtil.loadPatientFile(logger, 'test-file', callback, {
                existsSync: function() {
                    return false;
                }
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult).toEqual({});
            });
        });

        it('verify error reading file results in callback with error', function() {
            chemLabUtil.loadPatientFile(logger, 'test-file', callback, {
                existsSync: function() {
                    return true;
                },

                readFile: function(patientFile, options, callback) {
                    setTimeout(callback, 0, 'Unable to load file');
                }
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify error parsing file as JSON results in callback with error', function() {
            chemLabUtil.loadPatientFile(logger, 'test-file', callback, {
                existsSync: function() {
                    return true;
                },

                readFile: function(patientFile, options, callback) {
                    setTimeout(callback, 0, null, getInvalidJson());
                }
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify successfully read file returns patient collection', function() {
            var file = '{ "SITE;3": false, "SITE;8": false }';

            chemLabUtil.loadPatientFile(logger, 'test-file', callback, {
                existsSync: function() {
                    return true;
                },

                readFile: function(patientFile, options, callback) {
                    setTimeout(callback, 0, null, file);
                }
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult).toEqual(JSON.parse(file));
            });
        });
    });

    describe('fetchPatientDodChemLabUidList()', function() {
        it('verify error requesting results in callback with error', function() {
            chemLabUtil.fetchPatientDodChemLabUidList(logger, {}, 'SITE;3', callback, function(options, callback) {
                setTimeout(callback, 0, 'Unable to fetch results');
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify error parsing results as JSON results in callback with error', function() {
            chemLabUtil.fetchPatientDodChemLabUidList(logger, {}, 'SITE;3', callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 200
                }, getInvalidJson());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify status code !== 200 request results in callback with error', function() {
            chemLabUtil.fetchPatientDodChemLabUidList(logger, {}, 'SITE;3', callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 500
                }, getChemLabResponseAsString());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify successful request returns array of UIDs', function() {
            chemLabUtil.fetchPatientDodChemLabUidList(logger, {}, 'SITE;3', callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 200
                }, getChemLabResponseAsString());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult).toEqual(getUidResponseList());
            });
        });
    });

    describe('fetchSynchronizedPatientList()', function() {
        it('verify error requesting results in callback with error', function() {
            chemLabUtil.fetchSynchronizedPatientList(logger, {}, true, callback, function(options, callback) {
                setTimeout(callback, 0, 'Unable to fetch results');
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify status code !== 200 request results in callback with error', function() {
            chemLabUtil.fetchSynchronizedPatientList(logger, {}, true, callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 500
                }, getPatientListAsString());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify error parsing results as JSON results in callback with error', function() {
            chemLabUtil.fetchSynchronizedPatientList(logger, {}, true, callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 200
                }, getInvalidJson());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify allSyncedPatients === true results in all patients returned', function() {
            chemLabUtil.fetchSynchronizedPatientList(logger, {}, true, callback, function(options, callback) {
                setTimeout(callback, 0, null, {
                    statusCode: 200
                }, getPatientListAsString());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult).toEqual(getPatientIdentifierList());
            });
        });

        it('verify allSyncedPatients === false returns only patients with DOD ChemLabs', function() {
            chemLabUtil.fetchSynchronizedPatientList(logger, {}, false, callback, function(options, callback) {
                if (options.url.match('/vpr/all/patientlist')) {
                    return setTimeout(callback, 0, null, {
                        statusCode: 200
                    }, getPatientListAsString());
                }

                if (options.url.match('10108V420871')) {
                    return setTimeout(callback, 0, null, {
                        statusCode: 200
                    }, getChemLabResponseAsString());
                }

                return setTimeout(callback, 0, null, {
                    statusCode: 200
                }, getEmptyChemLabResponseAsString());
            });

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeFalsy();
                expect(expectedResult).toEqual(['10108V420871']);
            });
        });
    });

    describe('createPatientList()', function() {
        var writeContents;

        function loadFunction(logger, patientFile, callback) {
            setTimeout(callback, 0, null, {
                '10108V420871': true,
                'SITE;100888': true,
                'SITE;727': false
            });
        }

        function loadErrorFunction(logger, patientFile, callback) {
            setTimeout(callback, 0, 'Unable to load patient list file');
        }

        function fetchFunction(logger, jdsConfig, allSyncedPatients, callback) {
            setTimeout(callback, 0, null, ['10108V420871', '5000001538V221068']);
        }

        function fetchErrorFunction(logger, jdsConfig, allSyncedPatients, callback) {
            setTimeout(callback, 0, 'Unable to fetch patient list');
        }

        var fsWriteError = {
            writeFile: function(outputFile, fileOutput, options, callback) {
                setTimeout(callback, 0, 'Error writing file');
            }
        };

        var fsWrite = {
            writeFile: function(outputFile, fileOutput, options, callback) {
                writeContents = fileOutput;
                setTimeout(callback);
            }
        };

        beforeEach(function() {
            writeContents = null;
        });

        it('verify error loading patient list file results in callback with error', function() {
            chemLabUtil.createPatientList(logger, {}, 'testfile', true, true, callback, fsWrite, loadErrorFunction, fetchFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify error requesting results in callback with error', function() {
            chemLabUtil.createPatientList(logger, {}, 'testfile', true, true, callback, _.noop, loadFunction, fetchErrorFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify error write file in callback with error', function() {
            chemLabUtil.createPatientList(logger, {}, 'testfile', true, true, callback, fsWriteError, loadFunction, fetchFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                expect(expectedError).toBeTruthy();
            });
        });

        it('verify correct info written to file with no append', function() {
            chemLabUtil.createPatientList(logger, {}, 'testfile', false, true, callback, fsWrite, loadFunction, fetchFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                var resultAsObject = {
                    '10108V420871': false,
                    '5000001538V221068': false
                };

                var parsedFileContents;
                try {
                    parsedFileContents = JSON.parse(writeContents);
                } catch (error) {
                    parsedFileContents = null;
                }
                expect(expectedError).toBeFalsy();
                expect(parsedFileContents).toEqual(resultAsObject);
            });
        });

        it('verify correct info written to file with append', function() {
            chemLabUtil.createPatientList(logger, {}, 'testfile', true, true, callback, fsWrite, loadFunction, fetchFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                var resultAsObject = {
                    '10108V420871': true,
                    'SITE;100888': true,
                    'SITE;727': false,
                    '5000001538V221068': false
                };

                var parsedFileContents;
                try {
                    parsedFileContents = JSON.parse(writeContents);
                } catch (error) {
                    parsedFileContents = null;
                }
                expect(expectedError).toBeFalsy();
                expect(parsedFileContents).toEqual(resultAsObject);
            });
        });

        xit('verify correct info written to file and existing values are preserved', function() {
            var existingPatientData = {
                '10108V420871': true,
                'SITE;100888': true,
                'SITE;727': false
            };

            chemLabUtil.createPatientList(logger, {}, existingPatientData, 'testfile', true, callback, fsWrite, loadFunction, fetchFunction);

            waitsFor(function() {
                return finished;
            }, 100);

            runs(function() {
                var resultAsObject = {
                    '10108V420871': true,
                    '5000001538V221068': false,
                    'SITE;100888': true,
                    'SITE;727': false
                };

                var parsedFileContents;
                try {
                    parsedFileContents = JSON.parse(writeContents);
                } catch (error) {
                    parsedFileContents = null;
                }
                expect(expectedError).toBeFalsy();
                expect(parsedFileContents).toEqual(resultAsObject);
            });
        });
    });
});


function getInvalidJson() {
    return '} RANDOM noise not parseable as JSON[]';
}

function getUidResponseList() {
    return [
        'urn:va:lab:DOD:0000000003:1000000434_6951',
        'urn:va:lab:DOD:0000000003:1000010436_6079',
        'urn:va:lab:DOD:0000000003:1000010438_6827'
    ];
}

function getPatientListAsString() {
    return JSON.stringify(getPatientList());
}

function getPatientIdentifierList() {
    return _.map(getPatientList().items, function(patient) {
        return _.first(patient.patientIdentifiers);
    });
}

function getPatientList() {
    return {
        items: [{
            jpid: '1d32a224-dc50-41c4-b068-8ce81b4cd8a4',
            lastAccessTime: 20170509130818,
            patientIdentifiers: [
                '10108V420871',
                'SITE;3',
                'SITE;3',
                'DOD;0000000003',
                'HDR;10108V420871',
                'JPID;1d32a224-dc50-41c4-b068-8ce81b4cd8a4',
                'VLER;10108V420871'
            ]
        }, {
            jpid: '00444299-9010-4165-b2a8-28a18d70f233',
            lastAccessTime: 20170508132928,
            patientIdentifiers: [
                'SITE;727',
                'JPID;00444299-9010-4165-b2a8-28a18d70f233'
            ]
        }, {
            jpid: '005fa2aa-74a8-436d-b261-0295656c8ba6',
            lastAccessTime: 20170509003013,
            patientIdentifiers: [
                'SITE;100888',
                'JPID;005fa2aa-74a8-436d-b261-0295656c8ba6'
            ]
        }, {
            jpid: '00c5a7a8-2c72-45ab-9282-6de1c8ae04da',
            lastAccessTime: 20170508132928,
            patientIdentifiers: [
                '5000001538V221068',
                'SITE;100886',
                'SITE;100886',
                'HDR;5000001538V221068',
                'JPID;00c5a7a8-2c72-45ab-9282-6de1c8ae04da',
                'VLER;5000001538V221068'
            ]
        }]
    };
}

function getEmptyChemLabResponseAsString() {
    return JSON.stringify(getEmptyChemLabResponse());
}

function getEmptyChemLabResponse() {
    return {
        data: {
            updated: 20170509130046,
            totalItems: 0,
            currentItemCount: 0,
            items: []
        }
    };
}

function getChemLabResponseAsString() {
    return JSON.stringify(getChemLabResponse());
}

function getChemLabResponse() {
    return {
        data: {
            updated: 20170509130046,
            totalItems: 4,
            currentItemCount: 4,
            items: [{
                abnormal: true,
                categoryCode: 'urn:va:lab-category:CH',
                categoryName: 'Laboratory',
                codes: [{
                    code: '6951',
                    system: 'DOD_NCID'
                }, {
                    code: '2947-0',
                    display: 'Sodium [Moles/volume] in Blood',
                    system: 'http://loinc.org'
                }],
                comment: '3001 GREENBAY ROAD ATTENTION LABORATORY SERVICES NORTH CHICAGO, IL 60064 556 = NORTH CHICAGO VETERAN\'S ADMINISTRATION HOSP Test performed at:',
                displayName: 'Sodium, Blood Quantitative',
                facilityCode: 'DOD',
                facilityName: 'NH Great Lakes IL/0056',
                high: '146',
                interpretationCode: '',
                interpretationName: '',
                kind: 'Laboratory',
                labType: 'CH',
                localId: '130507 BCH 1662^CH',
                low: '134',
                micro: false,
                observed: '20130507104300',
                orderId: '130507-00006',
                organizerType: 'organizerType',
                pid: 'DOD;0000000003',
                qualifiedName: 'Sodium, Blood Quantitative (PLASMA)',
                result: '139',
                resultNumber: 139,
                resulted: '20130507104450',
                sensitive: false,
                specimen: 'PLASMA',
                stampTime: '20170505124533',
                statusCode: 'urn:va:lab-status:Final',
                statusName: 'Final',
                summary: 'Sodium, Blood Quantitative (PLASMA) 139<em>undefined</em> mmol/L',
                typeName: 'Sodium, Blood Quantitative',
                uid: 'urn:va:lab:DOD:0000000003:1000000434_6951',
                units: 'mmol/L'
            }, {
                abnormal: true,
                categoryCode: 'urn:va:lab-category:CH',
                categoryName: 'Laboratory',
                codes: [{
                    code: '6079',
                    system: 'DOD_NCID'
                }, {
                    code: '2075-0',
                    display: 'Chloride [Moles/volume] in Serum or Plasma',
                    system: 'http://loinc.org'
                }],
                comment: '3001 GREENBAY ROAD ATTENTION LABORATORY SERVICES NORTH CHICAGO, IL 60064 556 = NORTH CHICAGO VETERAN\'S ADMINISTRATION HOSP Test performed at:',
                displayName: 'Chloride, Serum or Plasma Quantitative',
                facilityCode: 'DOD',
                facilityName: 'NH Great Lakes IL/0056',
                high: '107',
                interpretationCode: '',
                interpretationName: '',
                kind: 'Laboratory',
                labType: 'CH',
                localId: '130505 BCH 1658^CH',
                low: '98',
                micro: false,
                observed: '20130505141000',
                orderId: '130505-00002',
                organizerType: 'organizerType',
                pid: 'DOD;0000000003',
                qualifiedName: 'Chloride, Serum or Plasma Quantitative (PLASMA)',
                result: '101',
                resultNumber: 101,
                resulted: '20130505141017',
                sensitive: false,
                specimen: 'PLASMA',
                stampTime: '20170505124533',
                statusCode: 'urn:va:lab-status:Final',
                statusName: 'Final',
                summary: 'Chloride, Serum or Plasma Quantitative (PLASMA) 101<em>undefined</em> mmol/L',
                typeName: 'Chloride, Serum or Plasma Quantitative',
                uid: 'urn:va:lab:DOD:0000000003:1000010436_6079',
                units: 'mmol/L'
            }, {
                abnormal: true,
                categoryCode: 'urn:va:lab-category:CH',
                categoryName: 'Laboratory',
                codes: [{
                    code: '6827',
                    system: 'DOD_NCID'
                }, {
                    code: '2823-3',
                    display: 'Potassium [Moles/volume] in Serum or Plasma',
                    system: 'http://loinc.org'
                }],
                comment: '3001 GREENBAY ROAD ATTENTION LABORATORY SERVICES NORTH CHICAGO, IL 60064 556 = NORTH CHICAGO VETERAN\'S ADMINISTRATION HOSP Test performed at:',
                displayName: 'Potassium, Serum or Plasma Quantitative',
                facilityCode: 'DOD',
                facilityName: 'NH Great Lakes IL/0056',
                high: '4.7',
                interpretationCode: 'urn:hl7:observation-interpretation:H',
                interpretationName: 'High',
                kind: 'Laboratory',
                labType: 'CH',
                localId: '130505 BCH 1659^CH',
                low: '3.5',
                micro: false,
                observed: '20130505141000',
                orderId: '130505-00003',
                organizerType: 'organizerType',
                pid: 'DOD;0000000003',
                qualifiedName: 'Potassium, Serum or Plasma Quantitative (PLASMA)',
                result: '5.4',
                resultNumber: 5.4,
                resulted: '20130505141017',
                sensitive: false,
                specimen: 'PLASMA',
                stampTime: '20170505124533',
                statusCode: 'urn:va:lab-status:Final',
                statusName: 'Final',
                summary: 'Potassium, Serum or Plasma Quantitative (PLASMA) 5.4<em>H</em> mmol/L',
                typeName: 'Potassium, Serum or Plasma Quantitative',
                uid: 'urn:va:lab:DOD:0000000003:1000010438_6827',
                units: 'mmol/L'
            }]
        }
    };
}

// fileSystem.readFile(outputFile, 'utf8', function(error, data){});