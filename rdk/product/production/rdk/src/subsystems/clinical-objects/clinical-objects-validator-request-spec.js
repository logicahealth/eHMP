'use strict';

var _ = require('lodash');
var moment = require('moment');

var validator = require('./clinical-objects-validator-request');
var pcmm = require('../jbpm/pcmm-subsystem');
var endToEndValidator = require('./clinical-objects-validator');

describe('request clinical object', function() {
    describe('validator', function() {
        var json;

        beforeEach(function() {
            var today = moment();
            var early = today.add(1, 'days');
            var late = today.add(4, 'days');
            json = {
                taskInstanceId: 'taskInstance',
                urgencyId: '5',
                urgency: 'urgent',
                earliestDate: moment(early).format('YYYYMMDDHHmmss'),
                latestDate: moment(late).format('YYYYMMDDHHmmss'),

            title: 'Post procedure follow-up',
                request: 'This is my request',
                submittedByUid: 'urn:va:user:9E7A:123',
                submittedTimeStamp: '20160420000000',
                visit: {
                    location: 'urn:va:location:9E7A:303',
                    serviceCategory: 'PSB',
                    dateTime: '20160420000000'
                }
            };

            sinon.stub(pcmm, 'validate', function(typeJson, instanceJson, appConfig, callback) {
                if ((instanceJson.code === 270) && (instanceJson.name === 'LM- Test Team 1')) {
                    callback(false, true);
                    return;
                }
                if ((instanceJson.code === 1130) && (instanceJson.name === 'Physical Therapy - KDK floor')) {
                    callback(false, true);
                    return;
                }
                if ((instanceJson.code === 19) && (instanceJson.name === 'CLERK')) {
                    callback(false, true);
                    return;
                }
                if ((instanceJson.code === 20) && (instanceJson.name === 'MEDICAL STUDENT')) {
                    callback(false, true);
                    return;
                }
                callback(false, false);
            });
        });

        afterEach(function() {
            pcmm.validate.restore();
        });

        it('validates for me', function(done) {
            json.assignTo = 'Me';

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('validates for person', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: '500',
                person: 'C877;5'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('validates for myTeams', function(done) {
            json.assignTo = 'My Teams';
            json.route = {
                team: {
                    code: 270,
                    name: 'LM- Test Team 1'
                },
                teamFocus: {
                    code: 270,
                    name: 'LM- Test Team 1'
                },
                patientsAssignment: true,
                assignedRoles: [{
                    code: 19,
                    name: 'CLERK'
                }, {
                    code: 20,
                    name: 'MEDICAL STUDENT'
                }],
                routingCode: '[TM:LM- Test Team 1(270)/TR:CLERK(19)],[TM:LM- Test Team 1(270)/TR:MEDICAL STUDENT(20)]'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('validates for anyTeam', function(done) {
            json.assignTo = 'Any Team';
            json.route = {
                facility: '500',
                team: {
                    code: 270,
                    name: 'LM- Test Team 1'
                },
                teamFocus: {
                    code: 270,
                    name: 'LM- Test Team 1'
                },
                patientsAssignment: true,
                assignedRoles: [{
                    code: 19,
                    name: 'CLERK'
                }, {
                    code: 20,
                    name: 'MEDICAL STUDENT'
                }],
                routingCode: '[TM:LM- Test Team 1(270)/TR:CLERK(19)/PA:(1)],[TM:LM- Test Team 1(270)/TR:MEDICAL STUDENT(20)/PA:(1)]'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('validates for anyTeam with three-letter code in team name', function(done) {
            json.assignTo = 'Any Team';
            json.route = {
                facility: '500',
                team: {
                    code: 270,
                    name: 'LM- Test Team 1 - ABC'
                },
                patientsAssignment: true,
                assignedRoles: [{
                    code: 19,
                    name: 'CLERK'
                }, {
                    code: 20,
                    name: 'MEDICAL STUDENT'
                }],
                routingCode: '[TM:LM- Test Team 1 - ABC(270)/TR:CLERK(19)/PA:(1)],[TM:LM- Test Team 1 - ABC(270)/TR:MEDICAL STUDENT(20)/PA:(1)]'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('validates for anyTeam with three-letter code in team name with another hyphenation in the name', function(done) {
            json.assignTo = 'Any Team';
            json.route = {
                facility: '500',
                team: {
                    code: 1130,
                    name: 'Physical Therapy - KDK floor - KDK'
                },
                patientsAssignment: true,
                assignedRoles: [{
                    code: 19,
                    name: 'CLERK'
                }, {
                    code: 20,
                    name: 'MEDICAL STUDENT'
                }],
                routingCode: '[TM:Physical Therapy - KDK floor - KDK(270)/TR:CLERK(19)/PA:(1)],[TM:Physical Therapy - KDK floor - KDK(270)/TR:MEDICAL STUDENT(20)/PA:(1)]'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
		_.each(errorMessages, function(message) {
		    console.log(message);
		});
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('rejects for me if the \'route\' field is not empty', function(done) {
            json.assignTo = 'Me';
            json.route = {
                facility: '500',
                person: 'C877;5'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages[0]).to.be('request \'route\' field contained unexpected data');
                done();
            });
        });

        describe('for dates', function() {
            beforeEach(function() {
                json.assignTo = 'Me';
            });

            afterEach(function() {
                json.assignTo = undefined;
            });

            it('rejects if latest date is malformed', function(done) {
                json.latestDate = '20160104240000';

                validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                    expect(errorMessages[0]).to.be('Invalid latest date provided');
                    done();
                });
            });

            it('...unless in draft state', function(done) {
                json.latestDate = '20160104240000';

                validator._validateRequestModel([], json, null, validator.DRAFT_STATE, function(errorMessages) {
                    expect(errorMessages.length).to.be(0);
                    done();
                });
            });

            it('...or in deleted state', function(done) {
                json.latestDate = '20160104240000';

                validator._validateRequestModel([], json, null, validator.DELETED_STATE, function(errorMessages) {
                    expect(errorMessages.length).to.be(0);
                    done();
                });
            });

            it('rejects if latest date is really malformed', function(done) {
                json.latestDate = '999';

                validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                    expect(errorMessages[0]).to.be('Invalid latest date provided');
                    done();
                });
            });

            it('rejects if earliest date is malformed', function(done) {
                json.earliestDate = '20160104240000';

                validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                    expect(errorMessages[0]).to.be('Invalid earliest date provided');
                    done();
                });
            });

            it('rejects if earliest date is later than latest date', function(done) {
                json.latestDate = '20160103120000';
                json.earliestDate = '20160104120000';

                validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                    expect(errorMessages[0]).to.be('Latest date is before earliest date');
                    done();
                });
            });
        });

        it('rejects if a UID is bad', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: '500',
                person: 'junk'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(1);
                expect(errorMessages[0]).to.be('request.route contained malformed person field: junk');
                done();
            });
        });

        it('allows a bad UID while in draft state', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: '500',
                person: 'junk'
            };

            validator._validateRequestModel([], json, null, validator.DRAFT_STATE, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('allows a bad UID while in deleted state', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: '500',
                person: 'junk'
            };

            validator._validateRequestModel([], json, null, validator.DELETED_STATE, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('rejects if a facilityCode is bad', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: 'junk',
                person: 'C877;5'
            };

            validator._validateRequestModel([], json, null, 'active', function(errorMessages) {
                expect(errorMessages.length).to.be(1);
                expect(errorMessages[0]).to.be('request.route contained malformed facility field: junk');
                done();
            });
        });

        it('allows a bad facilityCode while in draft state', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: 'junk',
                person: 'urn:va:person:C877:5'
            };

            validator._validateRequestModel([], json, null, validator.DRAFT_STATE, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('allows a bad facilityCode while in draft state', function(done) {
            json.assignTo = 'Person';
            json.route = {
                facility: 'junk',
                person: 'urn:va:person:C877:5'
            };

            validator._validateRequestModel([], json, null, validator.DRAFT_STATE, function(errorMessages) {
                expect(errorMessages.length).to.be(0);
                done();
            });
        });

        it('successfully performs end-to-end validation', function(done) {
            var endToEndExampleJson = {
                'deploymentId': 'VistaCore:Order:1.0',
                'processDefId': 'Order.Request',
                'parameter' : {
                    'requestActivity': {
                        'objectType' : 'requestActivity',
                        'uid': 'urn:va:ehmp-activity:9E7A:100716:0e55ec7b-01a2-44e3-867a-343eb33f035d',
                        'patientUid' : 'urn:va:patient:9E7A:100716:100716',
                        'authorUid' : '9E7A;100716',
                        'domain': 'ehmp-activity',
                        'subDomain': 'request',
                        'visit' : {
                            'location': 'urn:va:location:9E7A:100716',
                            'serviceCategory': 'PS',
                            'dateTime': '20160420130729'
                        },
                        'ehmpState': 'draft',
                        'displayName': 'Request Activity',
                        'referenceId': '',
                        'data': {
                            'activity': {
                                'deploymentId': 'VistaCore:Order:1.0',
                                'processDefinitionId': 'Order.Request',
                                'processInstanceId': '',
                                'state': 'draft',
                                'initiator': 'REDACTED',
                                'timeStamp': '20160420000000',
                                'urgency': 'Urgent',
                                'assignTo': 'Me',
                                'routingCode': ''
                            },
                            'signals': [],
                            'requests': [
                                {   'taskInstanceId':'',
                                    'urgencyId': '10',
                                    'urgency': 'Urgent',
                                    'earliestDate':'20160329000000',
                                    'latestDate': '20160420000000',
                                    'title': 'Post procedure follow-up',
                                    'assignTo': 'Me',
                                    'request': 'This is my request',
                                    'submittedByUid': '122',
                                    'submittedTimeStamp': '20160420000000',
                                    'visit' :
                                    {
                                        'location': 'urn:va:location:[site]:[IEN]',
                                        'serviceCategory': 'PSB',
                                        'dateTime': '20160420130729'
                                    }
                                }
                            ],
                            'responses': []
                        }
                    },
                    'icn' : '9E7A;100716',
                    'pid' : '9E7A;100716',
                    'formAction':'saved'
                }
            };
            endToEndValidator.validateUpdate([], endToEndExampleJson.parameter.requestActivity.uid, endToEndExampleJson.parameter.requestActivity, null, function(errorMessages) {
                _.each(errorMessages, function(err) {
                    console.log(err);
                });
                expect(errorMessages.length).to.be(1);
                expect(errorMessages[0]).to.be('data.activity.processInstanceId cannot be empty');
                done();
            });
        });
    });

    describe('pattern matchers', function() {
        it('recognizes valid people', function() {
            expect(validator._isValidPerson('9E7A;3')).to.be(true);
            expect(validator._isValidPerson('C877;33334')).to.be(true);
        });

        it('doesn\'t recognize bad/malformed people', function() {
            expect(validator._isValidPerson('urn:va:patient:ABCD:3:3')).to.be(false);
            expect(validator._isValidPerson('urn:va:location:ABCD:3')).to.be(false);
            expect(validator._isValidPerson('urn:va:patient:3:3')).to.be(false);

            expect(validator._isValidPerson('9E7;3')).to.be(false);
            expect(validator._isValidPerson('C877B;33334')).to.be(false);
            expect(validator._isValidPerson('9E7A;')).to.be(false);
            expect(validator._isValidPerson(';100')).to.be(false);

            expect(validator._isValidPerson('  ')).to.be(false);
            expect(validator._isValidPerson('')).to.be(false);

            expect(validator._isValidPerson(null)).to.be(false);
            expect(validator._isValidPerson(undefined)).to.be(false);

            expect(validator._isValidPerson(true)).to.be(false);
            expect(validator._isValidPerson(7)).to.be(false);
        });

        it('recognizes valid facility codes', function() {
            expect(validator._isValidFacilityCode('500')).to.be(true);
            expect(validator._isValidFacilityCode(7)).to.be(true);
        });

        it('doesn\'t recognize bad facility codes', function() {
            expect(validator._isValidFacilityCode('500a')).to.be(false);
            expect(validator._isValidFacilityCode('a500')).to.be(false);
            expect(validator._isValidFacilityCode('junk')).to.be(false);

            expect(validator._isValidFacilityCode('  ')).to.be(false);
            expect(validator._isValidFacilityCode('')).to.be(false);

            expect(validator._isValidFacilityCode(null)).to.be(false);
            expect(validator._isValidFacilityCode(undefined)).to.be(false);

            expect(validator._isValidFacilityCode(true)).to.be(false);
        });

        it('recognizes valid teams', function() {
            expect(validator._isValidTeam({code: '270', name: 'Lalit Test 1'})).to.be(true);
        });

        it('doesn\'t recognize malformed teams', function() {
            expect(validator._isValidTeam('urn:va:patient:ABCD:3:3')).to.be(false);
            expect(validator._isValidTeam({})).to.be(false);
            expect(validator._isValidTeam({code: '270'})).to.be(false);
            expect(validator._isValidTeam({name: 'Lalit Test 1'})).to.be(false);
            expect(validator._isValidTeam(null)).to.be(false);
        });

        it('recognizes valid roles', function() {
            expect(validator._isValidRole({code: '19', name: 'CLERK'})).to.be(true);
        });

        it('doesn\'t recognize malformed roles', function() {
            expect(validator._isValidRole('urn:va:patient:ABCD:3:3')).to.be(false);
            expect(validator._isValidRole({})).to.be(false);
            expect(validator._isValidRole({code: '19'})).to.be(false);
            expect(validator._isValidRole({name: 'CLERK'})).to.be(false);
            expect(validator._isValidRole(null)).to.be(false);
        });
    });
});
