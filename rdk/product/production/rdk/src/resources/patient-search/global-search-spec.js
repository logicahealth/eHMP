'use strict';

var search = require('./global-search');
var fs = require('fs');
var _ = require('lodash');
var loadXML1305File = function(path, xml1305FilesObj, property) {
    fs.readFile(__dirname + path, function(error, results) {
        if (error) {
            xml1305FilesObj[property] = '';
        } else {
            xml1305FilesObj[property] = results.toString();
        }

    });
};
describe('Global Search', function() {
    var xml1305ActualFiles = {};
    var xml1305ExpectedFiles = {};

    before('Load xml1305 Files', function(done) {
        loadXML1305File('/xml/1305-ssn.xml', xml1305ExpectedFiles, 'xml1305SSN');
        loadXML1305File('/xml/1305-dob.xml', xml1305ExpectedFiles, 'xml1305DoB');
        loadXML1305File('/xml/1305-fullName.xml', xml1305ExpectedFiles, 'xml1305FullName');
        loadXML1305File('/xml/1305-firstName.xml', xml1305ExpectedFiles, 'xml1305FirstName');
        loadXML1305File('/xml/1305-lastName.xml', xml1305ExpectedFiles, 'xml1305LastName');
        loadXML1305File('/xml/1305.xml', xml1305ExpectedFiles, 'xml1305');
        var req = {
            session: {}
        };
        var res = {
            status: function(status) {
                res.status = status;
                return {
                    rdkSend: function(error) {
                        done();
                        return error;
                    }
                };
            }
        };
        search._loadXML1305Files(req, res, function(files) {
            xml1305ActualFiles = files;
            done();
        });
    });
    describe('xml1305 Validation', function() {
        describe('Actual values are not empty', function() {
            it(' xml1305ActualFiles is not empty ', function() {
                expect(_.isEmpty(xml1305ActualFiles)).to.equal(false);
            });
        });
        describe('Expected values are not empty', function() {
            it('xml1305ExpectedFiles is not empty ', function() {
                expect(_.isEmpty(xml1305ExpectedFiles)).to.equal(false);
            });
            it('xml1305SSN is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305SSN).to.not.equal('');
            });
            it('xml1305DoB is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305DoB).to.not.equal('');
            });
            it('xml1305FullName is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305FullName).to.not.equal('');
            });
            it('xml1305FirstName is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305FirstName).to.not.equal('');
            });
            it('xml1305LastName is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305LastName).to.not.equal('');
            });
            it('xml1305 is not empty', function() {
                expect(xml1305ExpectedFiles.xml1305).to.not.equal('');
            });
        });
        describe('xml1305SSN Validation', function() {
            it('xml1305SSN is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305SSN)).to.equal(false);
            });
            it('xml1305SSN is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305SSN)).to.equal(false);
            });
            it('xml1305SSN is expected value', function() {
                expect(xml1305ActualFiles.xml1305SSN).to.equal(xml1305ExpectedFiles.xml1305SSN);
            });
        });
        describe('xml1305DoB Validation', function() {
            it('xml1305DoB is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305DoB)).to.equal(false);
            });
            it('xml1305DoB is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305DoB)).to.equal(false);
            });
            it('xml1305DoB is expected value', function() {
                expect(xml1305ActualFiles.xml1305DoB).to.equal(xml1305ExpectedFiles.xml1305DoB);
            });
        });
        describe('xml1305FullName Validation', function() {
            it('xml1305FullName is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305FullName)).to.equal(false);
            });
            it('xml1305FullName is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305FullName)).to.equal(false);
            });
            it('xml1305FullName is expected value', function() {
                expect(xml1305ActualFiles.xml1305FullName).to.equal(xml1305ExpectedFiles.xml1305FullName);
            });
        });
        describe('xml1305FirstName Validation', function() {
            it('xml1305FirstName is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305FirstName)).to.equal(false);
            });
            it('xml1305FirstName is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305FirstName)).to.equal(false);
            });
            it('xml1305FirstName is expected value', function() {
                expect(xml1305ActualFiles.xml1305FirstName).to.equal(xml1305ExpectedFiles.xml1305FirstName);
            });
        });
        describe('xml1305LastName Validation', function() {
            it(' xml1305LastName is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305LastName)).to.equal(false);
            });
            it('xml1305LastName is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305LastName)).to.equal(false);
            });
            it('xml1305LastName is expected value', function() {
                expect(xml1305ActualFiles.xml1305LastName).to.equal(xml1305ExpectedFiles.xml1305LastName);
            });
        });
        describe('xml1305 Validation', function() {
            it('xml1305 is not Undefined', function() {
                expect(_.isUndefined(xml1305ActualFiles.xml1305)).to.equal(false);
            });
            it('xml1305 is not Empty', function() {
                expect(_.isEmpty(xml1305ActualFiles.xml1305)).to.equal(false);
            });
            it('xml1305 is expected value', function() {
                expect(xml1305ActualFiles.xml1305).to.equal(xml1305ExpectedFiles.xml1305);
            });
        });
    });
    describe('Parameter Validation', function() {
        it('No Search Params', function() {
            expect(search._checkInvalidGlobalSearchParameters({})).to.be.truthy();
        });

        it('Singular Search Param', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'KDUEKS'
            })).to.be.truthy();
        });

        it('Last Name contains illegal characters', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'kdjs!',
                fname: 'KDSJLD'
            })).to.be.truthy();
        });

        it('First Name contains illegal characters', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                fname: 'kdjs!@',
                lname: 'KDSJLD'
            })).to.be.truthy();
        });

        it('First Name and Last Name are lower case', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                fname: 'kdfjies',
                lname: 'asdkeisld'
            })).to.be.truthy();
        });

        it('First Name contains spaces', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                fname: 'KDF JIES',
                lname: 'DSKEIS'
            })).to.be.falsy();
        });

        it('Last Name not provided', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                fname: 'SKLDJSF',
                ssn: '123456789'
            })).to.be.truthy();
        });

        it('SSN invalid format', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                ssn: '1234a3k2i'
            })).to.be.truthy();
        });

        it('SSN too short', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                ssn: '1234'
            })).to.be.truthy();
        });

        it('DoB wrong format (no delimiter)', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02061974'
            })).to.be.truthy();
        });

        it('DoB wrong format (incorrect delimiter)', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02-06-1974'
            })).to.be.truthy();
        });

        it('DoB impossible date', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02/40/1974'
            })).to.be.truthy();
        });

        it('DoB field incorrect order', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '1945/05/10'
            })).to.be.truthy();
        });

        it.skip('DoB unreasonable historical date', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '01/01/1645'
            })).to.be.truthy();
        });
        it.skip('DoB unreasonable future date', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '01/01/2453'
            })).to.be.truthy();
        });

        it('DoB unknown default value', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '01/01/1910'
            })).to.be.falsy();
        });

        it('DoB missing zero padded month', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '1/01/1910'
            })).to.be.falsy();
        });

        it('DoB missing zero padded day', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '01/1/1910'
            })).to.be.falsy();
        });

        it('DoB missing zero padded month and day', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '1/1/1910'
            })).to.be.falsy();
        });

        it('DoB two digit year', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02/11/99'
            })).to.be.truthy();
        });

        it('Extra parameter', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02/11/1999',
                foo: 'bar'
            })).to.be.falsy();
        });

        it('All parameters', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '02/11/1999',
                fname: 'DKSLDE',
                ssn: '987654321'
            })).to.be.falsy();
        });
    });
    describe('Global Query Parameter Validation', function() {
        it('tests that global search params objects gets set on session', function() {
            var req = {
                session: {},
                query: {
                    'name.first': 'Test',
                    'name.last': 'User',
                    'ssn': '123456789',
                    'date.birth': '10/09/1969'
                }
            };
            search._getGlobalSearchParams(req);
            expect(typeof req.session.globalSearchParams).to.equal('object');
            expect(Object.keys(req.session.globalSearchParams).length).to.be.above(0);
        });
        it('tests that global search params objects gets set on session are valid', function() {
            var req = {
                session: {
                    globalSearchParams: {
                        lname: 'USER',
                        dob: '10/09/1969'
                    }
                },
                query: {
                    'name.first': 'u',
                    'name.last': 'USER',
                    'date.birth': '10/09/1969',
                    'ssn': '123456789'
                }
            };
            expect(typeof req.session.globalSearchParams).to.equal('object');
            expect(Object.keys(req.session.globalSearchParams).length).to.be.above(0);
            expect(search._checkInvalidGlobalSearchParameters(req.session.globalSearchParams)).to.be.falsy();
        });
    });
    describe('Global Search Patient Demographic With ICN', function() {
        it('tests that callback function gets invoked with error object when session has no global params', function(done) {
            var req = {
                session: {},
                query: {},
                logger: sinon.stub(require('bunyan').createLogger({
                    name: 'global-search-spec'
                }))
            };
            var res = {
                status: function(status) {
                    res.status = status;
                    return this;
                },
                json: function() {
                    done();
                }
            };
            var testICN = '4325679V4325679';
            var cb = function(err, globalPatient) {
                expect(err).to.match({
                    'message': 'Session has no global params',
                    'patientICN': '4325679V4325679',
                    'status': 500
                });
                expect(globalPatient).to.equal(null);
                done();
            };
            search._getPatientDemographicWithICN(req, res, testICN, cb);
        });
    });
});
