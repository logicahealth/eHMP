'use strict';

var search = require('./global-search');

describe('Global Search', function() {
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

        xit('DoB unreasonable historical date', function() {
            expect(search._checkInvalidGlobalSearchParameters({
                lname: 'DSFJLDK',
                dob: '01/01/1645'
            })).to.be.truthy();
        });
        xit('DoB unreasonable future date', function() {
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
                logger: sinon.stub(require('bunyan').createLogger({name: 'global-search-spec'}))
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
                expect(err).to.match({ 'message': 'Session has no global params', 'patientICN': '4325679V4325679', 'status': 500 });
                expect(globalPatient).to.equal(null);
                done();
            };
            search._getPatientDemographicWithICN(req, res, testICN, cb);
        });
    });
});
