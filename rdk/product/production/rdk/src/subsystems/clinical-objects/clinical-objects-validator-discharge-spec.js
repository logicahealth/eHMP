'use strict';

var validator = require('./clinical-objects-validator-discharge');

describe('discharge clinical object validator', function() {
    var dischargeModel;
    var dischargeDiagnosis;
    var discharge;
    var followupVisit;
    var followup;
    var contact;

    beforeEach(function() {
        dischargeDiagnosis = [{
            'id': '1',
            'code': '[code]',
            'description': '[diagnosis description]'
        }];
        discharge = {
            'dateTime': '20170320000000',
            'admitDateTime': '20170319000000',
            'fromFacilityId': '637',
            'disposition': '[discharged disposition]',
            'diagnosis': dischargeDiagnosis,
            'timeout': '[configurable timeout value]'
        };
        followupVisit = {
            'location': 'urn:va:location:[site]:[IEN]',
            'serviceCategory': 'PSB',
            'dateTime': 'YYYYMMDDHHmmss+0000'
        };
        followup = [{
            'actionId': '[actionId}',
            'actionText': 'Contact Attempt',
            'executionUserId': '[userId]',
            'executionUserName': '[user name]',
            'executionDateTime': '[timestamp]',
            'visit': followupVisit,
            'comment': 'Attempted to call but no answer from the patient',
            'attempt': '1'
        }];
        contact = {
            'dueDateTime': '20170322000000',
            'attempts': '0'
        };
        dischargeModel = {
            'uid': 'urn:va:ehmp-activity:[<patient identifier>]:[UUID]',
            'patientUid': 'urn:va:patient:[site]:[DFN]:[DFN]',
            'authorUid': 'urn:va:user:[site]:[DUZ]',
            'domain': 'ehmp-activity',
            'subDomain': 'discharge',
            'visit': {
                'location': 'urn:va:location:[site]:[IEN]',
                'serviceCategory': 'PSB',
                'dateTime': 'YYYYMMDDHHmmss+0000'
            },
            'ehmpState': 'active',
            'displayName': 'Discharge Follow-up',
            'referenceId': '',
            'createdDateTime': 'YYYYMMDDHHmmss+0000',
            'data': {
                'activity': {
                    'deploymentId': 'VistaCore:Order',
                    'processDefinitionId': 'Order:DischargeFollowup',
                    'type': 'Order',
                    'domain': 'discharge',
                    'processInstanceId': '123',
                    'instanceName': 'Discharge Followup',
                    'patientUid': 'urn:va:patient:[site]:[DFN]:[DFN]',
                    'clinicalObjectUid': '',
                    'sourceFacilityId': '',
                    'destinationFacilityId': '',
                    'state': 'completed',
                    'initiator': 'urn:va:user:[site]:[DUZ]',
                    'timeStamp': '20160420000000',
                    'urgency': '9',
                    'assignedTo': '',
                    'activityHealthy': 1,
                    'activityHealthDescription': ''
                },
                'discharge': discharge,
                'contact': contact,
                'follow-up': followup,
                'signals': [{
                    'name': 'COMPLETE',
                    'actionId': '[actionId]',
                    'actionText': 'Complete',
                    'history': '[generated value based on the data submitted and the history]',
                    'executionUserId': '[userId]',
                    'executionUserName': '[user name]',
                    'executionDateTime': '[timestamp]',
                    'data': {
                        'comment': 'Comment from UI Screen or Event'
                    }
                }]
            }
        };
    });

    describe('_validateDischargeDiagnosis', function() {
        it('validates a well formed discharge diagnosis section', function() {
            var err = validator._validateDischargeDiagnosis(dischargeDiagnosis);
            expect(err.length).to.be(0);
        });

        it('validates an empty discharge diagnosis array', function() {
            var err = validator._validateDischargeDiagnosis([]);
            expect(err.length).to.be(0);
        });

        it('does not error when missing discharge.diagnosis.id', function() {
            delete dischargeDiagnosis[0].id;
            var err = validator._validateDischargeDiagnosis(dischargeDiagnosis);
            expect(err.length).to.be(0);
        });

        it('does not error when empty discharge.diagnosis.id', function() {
            dischargeDiagnosis[0].id = '';
            var err = validator._validateDischargeDiagnosis(dischargeDiagnosis);
            expect(err.length).to.be(0);
        });
    });

    describe('_validateDischarge', function() {
        it('validates a well formed discharge section', function() {
            var err = validator._validateDischarge(discharge);
            expect(err.length).to.be(0);
        });

        it('does not error when missing discharge.disposition', function() {
            delete discharge.disposition;
            var err = validator._validateDischarge(discharge);
            expect(err.length).to.be(0);
        });

        it('does not error when empty discharge.disposition', function() {
            discharge.disposition = '';
            var err = validator._validateDischarge(discharge);
            expect(err.length).to.be(0);
        });
    });

    describe('_validateFollowupVisit', function() {
        it('validates a well formed followup visit section', function() {
            var err = validator._validateFollowupVisit(followupVisit);
            expect(err.length).to.be(0);
        });

        it('errors when missing followup.visit.location', function() {
            delete followupVisit.location;
            var err = validator._validateFollowupVisit(followupVisit);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object followup.visit has invalid location field type');
        });

        it('errors when empty followup.visit.location', function() {
            followupVisit.location = '';
            var err = validator._validateFollowupVisit(followupVisit);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object followup.visit has invalid location field content');
        });
    });

    describe('_validateFollowUp', function() {
        it('validates a well formed followup section', function() {
            var err = validator._validateFollowUp(followup);
            expect(err.length).to.be(0);
        });

        it('errors when missing followup.attempt', function() {
            delete followup[0].attempt;
            var err = validator._validateFollowUp(followup);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object followup has invalid attempt field type');
        });

        it('errors when empty followup.attempt', function() {
            followup[0].attempt = '';
            var err = validator._validateFollowUp(followup);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object followup has invalid attempt field content');
        });
    });

    describe('_validateContact', function() {
        it('validates a well formed contact section', function() {
            var err = validator._validateContact(contact);
            expect(err.length).to.be(0);
        });

        it('errors when missing contact.attempts', function() {
            delete contact.attempts;
            var err = validator._validateContact(contact);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object contact has invalid attempts field type');
        });

        it('errors when empty contact.attempts', function() {
            contact.attempts = '';
            var err = validator._validateContact(contact);
            expect(err.length).to.be(1);
            expect(err[0]).to.equal('Discharge FollowUp clinical object contact has invalid attempts field content');
        });
    });

    describe('validateModel', function() {
        it('validates a well formed discharge activity', function(done) {
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(0);
                done();
            });
        });

        it('errors when called with the wrong subDomain', function(done) {
            dischargeModel.subDomain = 'discharge-followup-down-allaround';
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(1);
                expect(err[0]).to.equal('Discharge FollowUp clinical object invalid subDomain');
                done();
            });
        });

        it('errors when called with the no displayName', function(done) {
            delete dischargeModel.displayName;
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(1);
                expect(err[0]).to.equal('Discharge FollowUp clinical object has invalid displayName field type');
                done();
            });
        });

        it('errors when with no discharge', function(done) {
            delete dischargeModel.data.discharge;
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(1);
                expect(err[0]).to.equal('Discharge FollowUp clinical object discharge section is not an object');
                done();
            });
        });

        it('errors when with no contact', function(done) {
            delete dischargeModel.data.contact;
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(1);
                expect(err[0]).to.equal('Discharge FollowUp clinical object contact section is not an object');
                done();
            });
        });

        it('errors when with no followup', function(done) {
            delete dischargeModel.data['follow-up'];
            validator.validateModel([], dischargeModel, null, function(err, result) {
                expect(err.length).to.be(1);
                expect(err[0]).to.equal('Discharge FollowUp clinical object follow-up section is not an array');
                done();
            });
        });
    });

});
