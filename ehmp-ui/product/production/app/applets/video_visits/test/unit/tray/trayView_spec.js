/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, afterEach */
define(['jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'moment',
    'underscore',
    'testUtil',
    'app/applets/video_visits/writeback/formView',
    'app/applets/video_visits/writeback/formModel'
], function($, Backbone, Marionette, jasminejquery, moment, _, testUtil, FormView, FormModel) {
    'use strict';

    describe('Video Visits - tray view test suite', function() {
        var Model = FormModel.extend({
            initialize: function() {
                this.errorModel = new Backbone.Model();
            }
        });
        var View = FormView.extend({
            onInitialize: _.noop
        });
        var form = new View({ model: new Model() });

        describe('validate appointment date', function() {
            it('empty check', function() {
                form.validateAppointmentDate();
                expect(form.model.errorModel.get('appointmentDate')).toBeUndefined();
            });
            it('invalid value set', function() {
                var appointmentDate = moment().add(91, 'day');
                form.model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                form.validateAppointmentDate();
                expect(form.model.errorModel.get('appointmentDate')).toBeDefined();
                expect(form.model.errorModel.get('appointmentDate'), 'Invalid date');
            });
            it('valid value set', function() {
                var appointmentDate = moment();
                form.model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                form.validateAppointmentDate();
                expect(form.model.errorModel.get('appointmentDate')).toBeUndefined();
            });
        });
        describe('validate appointment time', function() {
            it('empty check', function() {
                form.validateAppointmentTime();
                expect(form.model.errorModel.get('appointmentTime')).toBeUndefined();
            });
            it('time set to 30 minutes prior to current time', function() {
                var appointmentDate = moment();
                form.model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                appointmentDate.add(-30, 'minute');
                form.model.set('appointmentTime', appointmentDate.format('HH:mm'));
                form.validateAppointmentTime();
                expect(form.model.errorModel.get('appointmentTime')).toBeDefined();
                expect(form.model.errorModel.get('appointmentTime'), 'Invalid time - can be no more than 15 minutes prior to the current time');
            });
            it('valid value set on same day', function() {
                var appointmentDate = moment();
                appointmentDate.add(1, 'hour');
                form.model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                appointmentDate.minutes(30);
                form.model.set('appointmentTime', appointmentDate.format('HH:mm'));
                form.validateAppointmentTime();
                expect(form.model.errorModel.get('appointmentTime')).toBeUndefined();
            });
            it('valid value set on future day', function() {
                var appointmentDate = moment();
                appointmentDate.add(1, 'day');
                form.model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                appointmentDate.hours(0);
                appointmentDate.minutes(0);
                form.model.set('appointmentTime', appointmentDate.format('HH:mm'));
                form.validateAppointmentTime();
                expect(form.model.errorModel.get('appointmentTime')).toBeUndefined();
            });
        });
        describe('validate patient email', function() {
            beforeEach(function() {
                form.patientContactInfo = new Backbone.Model({ emailAddress: '', phones: [] });
                form.patientProfileServiceError = false;
                form.model.set('loading', false);
            });
            it('empty check', function() {
                form.validateEmailAddress('patientEmail');
                expect(form.model.errorModel.get('patientEmail')).toBeUndefined();
            });
            it('invalid value set', function() {
                form.model.set('patientEmail', 'aa');
                form.validateEmailAddress('patientEmail');
                expect(form.model.errorModel.get('patientEmail')).toBeDefined();
                expect(form.model.errorModel.get('patientEmail'), 'Invalid email');
            });
            it('valid value set', function() {
                form.model.set('patientEmail', PII       ');
                form.validateEmailAddress('patientEmail');
                expect(form.model.errorModel.get('patientEmail')).toBeUndefined();
                expect(form.patientContactInfo.get('emailAddress'), form.model.get('patientEmail'));
            });
        });
        describe('validate patient phone number', function() {
            beforeEach(function() {
                form.patientDemographicsObj = new Backbone.Model({ emailAddress: '', phones: [] });
                form.patientProfileServiceError = false;
                form.model.set('loading', false);
            });
            it('empty check', function() {
                form.validatePhoneNumber('patientPhone');
                expect(form.model.errorModel.get('patientPhone')).toBeUndefined();
            });
            it('invalid value set', function() {
                form.model.set('patientPhone', '123');
                form.validatePhoneNumber('patientPhone');
                expect(form.model.errorModel.get('patientPhone')).toBeDefined();
                expect(form.model.errorModel.get('patientPhone'), 'Invalid phone number');
            });
            it('valid value set', function() {
                form.model.set('patientPhone', '(123) 456-7890');
                form.validatePatientPhone();
                expect(form.model.errorModel.get('patientPhone')).toBeUndefined();
                expect(form.patientDemographicsObj.get('phones')[0].number, form.model.get('patientPhone'));
                expect(form.patientDemographicsObj.get('isPatientContactInfoChanged'), true);
            });
        });
        describe('check patient phone type change tracked', function() {
            beforeEach(function() {
                form.patientDemographicsObj = new Backbone.Model({ emailAddress: '', phones: [] });
                form.patientProfileServiceError = false;
                form.model.set('loading', false);
            });
            it('phone type set to Home', function() {
                form.model.set('patientPhoneType', 'Home');
                form.handlePatientPhoneType();
                expect(form.model.errorModel.get('patientPhoneType')).toBeUndefined();
                expect(form.patientDemographicsObj.get('phones')[0].type, form.model.get('patientPhoneType'));
                expect(form.patientDemographicsObj.get('isPatientContactInfoChanged'), true);
            });
        });
        describe('validate provider email', function() {
            beforeEach(function() {
                form.providerContactInfo = new Backbone.Model({ email: '', phone: '' });
                form.model.set('loading', false);
            });
            it('empty check', function() {
                form.validateEmailAddress('providerEmail');
                expect(form.model.errorModel.get('providerEmail')).toBeUndefined();
            });
            it('invalid value set', function() {
                form.model.set('providerEmail', 'aa');
                form.validateEmailAddress('providerEmail');
                expect(form.model.errorModel.get('providerEmail')).toBeDefined();
                expect(form.model.errorModel.get('providerEmail'), 'Invalid email');
            });
            it('valid value set', function() {
                form.model.set('providerEmail', PII       ');
                form.validateEmailAddress('providerEmail');
                expect(form.model.errorModel.get('providerEmail')).toBeUndefined();
                expect(form.providerContactInfo.get('email'), form.model.get('providerEmail'));
            });
        });
        describe('validate provider phone number', function() {
            beforeEach(function() {
                form.providerContactInfo = new Backbone.Model({ email: '', phone: '' });
                form.model.set('loading', false);
            });
            it('empty check', function() {
                form.validatePhoneNumber('providerPhone');
                expect(form.model.errorModel.get('providerPhone')).toBeUndefined();
            });
            it('invalid value set', function() {
                form.model.set('providerPhone', '123');
                form.validatePhoneNumber('providerPhone');
                expect(form.model.errorModel.get('providerPhone')).toBeDefined();
                expect(form.model.errorModel.get('providerPhone'), 'Invalid phone number');
            });
            it('valid value set', function() {
                form.model.set('providerPhone', '(123) 456-7890');
                form.validatePhoneNumber('providerPhone');
                expect(form.model.errorModel.get('providerPhone')).toBeUndefined();
                expect(form.providerContactInfo.get('phone'), form.model.get('providerPhone'));
            });
        });

    });
});
