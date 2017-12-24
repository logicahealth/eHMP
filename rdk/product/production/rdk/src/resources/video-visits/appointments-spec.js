'use strict';
var appointments = require('./appointments');
var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var bunyan = require('bunyan');
// var dummyLogger = {
//     trace: function() {},
//     debug: function() {},
//     info: function() {},
//     warn: function() {},
//     error: function() {},
//     fatal: function() {}
// };
//
// var dummyRequest = {
//     logger: dummyLogger
// };


var sampleAppointment = {
    'id': 'testidjson12',
    'sourceSystem': 'VideoVisitService',
    'patients': {
        'patient': [{
            'id': {
                'assigningAuthority': 'ICN',
                'uniqueId': '10110V004877'
            },
            'name': {
                'firstName': 'testing',
                'lastName': 'unit',
                'middleInitial': null
            },
            'contactInformation': {
                'mobile': '1234567890',
                'preferredEmail': 'test@accenturefederal.com',
                'alternativeEmail': null,
                'timeZone': 40
            },
            'location': {
                'type': 'NonVA',
                'facility': {
                    'name': 'patientfacility',
                    'siteCode': '1234',
                    'timeZone': 40
                },
                'clinic': {
                    'ien': '44',
                    'name': 'patientclinic'
                }
            },
            'virtualMeetingRoom': {
                'conference': 'conference',
                'pin': '12345',
                'url': 'http://test.com'
            }
        }]
    },
    'providers': {
        'provider': [{
            'name': {
                'firstName': 'testing',
                'lastName': 'unit',
                'middleInitial': null
            },
            'id': {
                'assigningAuthority': 'ICN',
                'uniqueId': '1008593069V747999'
            },
            'contactInformation': {
                'mobile': '1234567890',
                'preferredEmail': 'test@accenturefederal.com',
                'alternativeEmail': null,
                'timeZone': 4
            },
            'location': {
                'type': 'VA',
                'facility': {
                    'name': 'providerfacility',
                    'siteCode': '2345',
                    'timeZone': 4
                },
                'clinic': {
                    'ien': '33',
                    'name': 'providerclinic'
                }
            },
            'virtualMeetingRoom': {
                'conference': 'conference',
                'pin': '4321',
                'url': 'http://test.com'
            }
        }]
    },
    'dateTime': '2017-01-10T18:15:00.000',
    'duration': 30,
    'status': {
        'description': 'F',
        'code': 'FUTURE',
        'reason': null
    },
    'schedulingRequestType': 'NEXT_AVAILABLE_APPT',
    'type': 'REGULAR',
    'appointmentKind': 'ADHOC',
    'bookingNotes': 'testing',
    'desiredDate': 1484072100000,
    'version': null,
    'instruction': 'this is a test of instruction',
    'isInstructionsOther': false
};



describe('Video Visit Appointments Resource', function() {
    describe('Appointment Results Processor', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                callback(null);
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('doesn\'t crash if empty result passed', function() {
            var expectedOutput = {
                data: {
                    items: []
                }
            };

            var response = appointments.processAppointmentsResult([]);
            expect(response).to.eql(expectedOutput);
        });

        it('updates timeZone correctly within the appointment object', function() {
            var response = appointments.processAppointmentsResult([sampleAppointment]);
            expect(_.get(response, 'data.items[0].patients.patient[0].contactInformation.timeZone')).to.eql('EST');
            expect(_.get(response, 'data.items[0].patients.patient[0].location.facility.timeZone')).to.eql('EST');
            expect(_.get(response, 'data.items[0].providers.provider[0].contactInformation.timeZone')).to.eql('PST');
            expect(_.get(response, 'data.items[0].providers.provider[0].location.facility.timeZone')).to.eql('PST');
        });

        it('sets first provider object facility/clinic as appointment facility/clinic for non STORE_FORWARD appointments', function() {
            var response = appointments.processAppointmentsResult([sampleAppointment]);
            expect(_.get(response, 'data.items[0].facility')).to.eql('providerfacility');
            expect(_.get(response, 'data.items[0].clinic')).to.eql('providerclinic');
        });

        it('sets first patient object facility/clinic as appointment facility/clinic for STORE_FORWARD appointments', function() {
            sampleAppointment.appointmentKind = 'STORE_FORWARD';
            var response = appointments.processAppointmentsResult([sampleAppointment]);
            expect(_.get(response, 'data.items[0].facility')).to.eql('patientfacility');
            expect(_.get(response, 'data.items[0].clinic')).to.eql('patientclinic');
        });

    });
    describe('Timezone ID by Abbr', function() {
        it('returns timezone id', function() {
            expect(appointments.getTimezoneIdByAbbreviation('GMT')).to.eql('85');
        });
    });
    describe('get Video Visit Appointments', function() {
        it('Returns an error', function() {
            var asyncStub = sinon.stub(async, 'waterfall').callsFake(function(list, callback) {
                return callback('Error');
            });
            var req = {
                param: function(param) {
                    return 'pid';
                }
            };
            var res = {};
            res.rdkSend = function(body) {
                expect(body).to.include('rdk.400.1000');
                return this;
            };
            res.status = function(code) {
                expect(code).to.eql(400);
                return this;
            };
            appointments.getVideoVisitAppointments(req, res);
            asyncStub.restore();
        });
    });
    describe('Updates Timezone', function() {
        it('updates timezone abbrv to ID', function() {
            var appointment = {
                'patients': {
                    'patient': [{
                        'contactInformation': {
                            'mobile': '1234567890',
                            'preferredEmail': 'test@accenturefederal.com',
                            'alternativeEmail': null,
                            'timeZone': 'GMT'
                        },
                        'location': {
                            'type': 'NonVA',
                            'facility': {
                                'name': 'patientfacility',
                                'siteCode': '1234',
                                'timeZone': 'GMT'
                            }
                        }
                    }]
                },
                'providers': {
                    'provider': [{
                        'contactInformation': {
                            'mobile': '1234567890',
                            'preferredEmail': 'test@accenturefederal.com',
                            'alternativeEmail': null,
                            'timeZone': 'PST'
                        },
                        'location': {
                            'type': 'VA',
                            'facility': {
                                'name': 'providerfacility',
                                'siteCode': '2345',
                                'timeZone': 'PST'
                            }
                        }
                    }]
                }
            };
            var result = appointments.updateTimeZoneByAbbreviationToZoneId(appointment);
            expect(_.get(result, 'patients.patient[0].contactInformation.timeZone')).to.eql('85');
            expect(_.get(result, 'providers.provider[0].contactInformation.timeZone')).to.eql('4');
        });
    });
    describe('gets Appointments', function() {
        var req;
        beforeEach(function() {
            var logger = sinon.stub(bunyan.createLogger({
                name: 'test-logger'
            }));
            req = {
                param: function(param) {
                    if (param === 'date.start') {
                        return '2017-08-08T18:20:42.082Z';
                    }
                    if (param === 'date.end') {
                        return '2017-08-08T18:20:42.082Z';
                    }
                    return null;
                },
                audit: {
                    dataDomain: null,
                    logCategory: null
                }
            };
            _.set(req, 'logger', logger);
            _.set(req, 'app.config.videoVisit.vvService', {
                baseURL: 'sampleBaseURL'
            });
        });

        it('returns a successful callback with result', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
                var httpResponse = {
                    statusCode: 200
                };
                return callback(null, httpResponse, ['foo', 'bar']);
            });
            appointments.getAppointments(req, '1V1', function(err, results) {
                expect(err).to.be.null();
                expect(results).to.eql(['foo', 'bar']);
            });
            httpStub.restore();
        });
        it('returns an error when status is not 200 and not 204', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
                var httpResponse = {
                    statusCode: 503,
                    body: 'error message'
                };
                return callback(null, httpResponse, []);
            });
            appointments.getAppointments(req, '1V1', function(err, results) {
                expect(err).to.eql({
                    'error': 'error message'
                });
            });
            httpStub.restore();
        });
        it('returns a general error from httpUtil', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
                return callback('Error');
            });
            appointments.getAppointments(req, '1V1', function(err, results) {
                expect(err).to.eql('Error');
            });
            httpStub.restore();
        });
    });
});
