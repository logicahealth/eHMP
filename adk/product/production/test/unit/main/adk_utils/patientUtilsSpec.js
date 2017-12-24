define([
    'backbone',
    'marionette',
    'underscore',
    'jasminejquery',
    'api/Messaging',
    'main/adk_utils/patientUtils'
], function (Backbone, Marionette, _, jasmine, Messaging, PatientUtils) {
    'use strict';

    describe('PatientUtils', function () {
        describe('has a function named setPatientFetchParams', function () {
            var patient, spy;

            beforeAll(function () {
                spy = spyOn(PatientUtils, 'isPatientInPrimaryVista');
            });
            beforeEach(function () {
                patient = new Backbone.Model({ pid: 'SITE;1234', icn: '12345V67890' });
                spy.and.returnValue(true);
            });
            afterAll(function () {
                this.removeAllSpies();
            });

            it('returns options when no options are provided', function () {
                var result = PatientUtils.setPatientFetchParams(patient);
                expect(result).not.toBeUndefined();
                expect(result.criteria).not.toBeUndefined();
                expect(result.criteria.pid).not.toBeUndefined();
            });

            it('returns and adds to the passed-in options', function () {
                var options = { hi: 'lo', criteria: { red: 'green' } };
                var result = PatientUtils.setPatientFetchParams(patient, options);
                expect(result.hi).toBe(options.hi);
                expect(result.criteria.red).toBe(options.criteria.red);
                expect(result.criteria.pid).toBe(patient.get('pid'));
            });

            it('uses the options\' patientIdentifierType', function () {
                var options = { patientIdentifierType: 'icn' };
                var result = PatientUtils.setPatientFetchParams(patient, options);
                expect(result.criteria.pid).toBe(patient.get('icn'));
            });

            it('doesn\'t set _ack by default', function () {
                var result = PatientUtils.setPatientFetchParams(patient);
                expect(result.criteria._ack).toBeUndefined();
            });

            it('sets _ack when patient.acknowledged is true', function () {
                patient.set('acknowledged', true);
                var result = PatientUtils.setPatientFetchParams(patient);
                expect(result.criteria._ack).toBe('true');
            });
        });

        describe('has a function named getPatientIdentifier', function () {
            var patient, spy;

            beforeAll(function () {
                spy = spyOn(PatientUtils, 'isPatientInPrimaryVista');
            });
            beforeEach(function () {
                patient = new Backbone.Model({ pid: 'SITE;1234', icn: '12345V67890', id: '333' });
                spy.and.returnValue(true);
            });
            afterAll(function () {
                this.removeAllSpies();
            });

            it('returns the pid when in the primary site', function () {
                var result = PatientUtils.getPatientIdentifier(patient);
                expect(result).toBe(patient.get('pid'));
            });

            it('returns the icn when there is no pid', function () {
                patient.unset('pid');
                var result = PatientUtils.getPatientIdentifier(patient);
                expect(result).toBe(patient.get('icn'));
            });

            it('returns the icn when not in the primary site', function () {
                spy.and.returnValue(false);
                var result = PatientUtils.getPatientIdentifier(patient);
                expect(result).toBe(patient.get('icn'));
            });

            it('returns the pid when not in the primary site but there\'s no icn', function () {
                patient.unset('icn');
                spy.and.returnValue(false);
                var result = PatientUtils.getPatientIdentifier(patient);
                expect(result).toBe(patient.get('pid'));
            });

            it('returns the id when there is no pid or icn', function () {
                patient.unset('pid');
                patient.unset('icn');
                var result = PatientUtils.getPatientIdentifier(patient);
                expect(result).toBe(patient.get('id'));
            });

            it('returns the specified identifier type', function () {
                _.each(['pid', 'icn', 'id'], function (identifierType) {
                    var result = PatientUtils.getPatientIdentifier(patient, identifierType);
                    expect(result).toBe(patient.get(identifierType));
                });
            });

            it('returns the pid if the specified identifier type is invalid', function () {
                var result = PatientUtils.getPatientIdentifier(patient, 'blah');
                expect(result).toBe(patient.get('pid'));
            });
        });

        describe('has a function named isPatientInPrimaryVista', function () {
            var spy;

            beforeAll(function () {
                spy = spyOn(Messaging.getChannel('User'), 'request');
            });
            beforeEach(function () {
                spy.and.returnValue('SITE');
            });
            afterAll(function () {
                this.removeAllSpies();
            });

            it('returns true when the patient\'s pid matches the user\'s site', function () {
                var patient = new Backbone.Model({ pid: 'SITE;1234' });
                var result = PatientUtils.isPatientInPrimaryVista(patient);
                expect(result).toBe(true);
            });

            it('returns false when the patient\'s pid doesn\'t match the user\'s site', function () {
                var patient = new Backbone.Model({ pid: 'SITE;1234' });
                var result = PatientUtils.isPatientInPrimaryVista(patient);
                expect(result).toBe(false);
            });

            it('returns false when the patient has no pid', function () {
                var patient = new Backbone.Model();
                var result = PatientUtils.isPatientInPrimaryVista(patient);
                expect(result).toBe(false);
            });

            it('returns false when the user has no site', function () {
                var patient = new Backbone.Model({ pid: 'SITE;1234' });
                spy.and.returnValue(undefined);
                var result = PatientUtils.isPatientInPrimaryVista(patient);
                expect(result).toBe(false);
            });
        });

        describe('Test generating ICN checksum', function() {
            it('Should generate proper checksum values', function() {
                expect(PatientUtils.generateIcnChecksum(1008183996)).toEqual('307284');
                expect(PatientUtils.generateIcnChecksum(12345)).toEqual('389053');
                expect(PatientUtils.generateIcnChecksum(10108)).toEqual('420871');
                expect(PatientUtils.generateIcnChecksum(5000000341)).toEqual('359724');
            });
        });
    });
});