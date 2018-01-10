/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, afterEach */
define(['jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'moment',
    'testUtil',
    'app/applets/video_visits/writeback/formModel'
], function($, Backbone, Marionette, jasminejquery, moment, testUtil, FormModel) {
    'use strict';

    describe('Video Visits - writeback form utils test suite', function() {
        var Model = FormModel.extend({
            initialize: function() {
                this.errorModel = new Backbone.Model();
            }
        });

        var model = new Model();
        describe('validate appointment date', function() {
            it('empty check', function() {
                model.validateAppointmentDate();
                expect(model.errorModel.get('appointmentDate')).toBeDefined();
                expect(model.errorModel.get('appointmentDate'), 'Invalid date');
            });
            it('invalid value set', function() {
                var appointmentDate = moment().add(91, 'day');
                model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                model.validateAppointmentDate();
                expect(model.errorModel.get('appointmentDate')).toBeDefined();
                expect(model.errorModel.get('appointmentDate'), 'Invalid date');
            });
            it('valid value set', function() {
                var appointmentDate = moment();
                model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                model.validateAppointmentDate();
                expect(model.errorModel.get('appointmentDate')).toBeUndefined();
            });
        });
        describe('validate appointment time', function() {
            it('empty check', function() {
                model.validateAppointmentTime();
                expect(model.errorModel.get('appointmentTime')).toBeDefined();
                expect(model.errorModel.get('appointmentTime'), 'Invalid time');
            });
            it('time set to 30 minutes prior to current time', function() {
                var appointmentDate = moment();
                appointmentDate.add(-30, 'm');
                model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                model.set('appointmentTime', appointmentDate.format('HH:mm'));
                model.validateAppointmentTime();
                expect(model.errorModel.get('appointmentTime')).toBeDefined();
                expect(model.errorModel.get('appointmentTime'), 'Invalid time - can be no more than 15 minutes prior to the current time');
            });
            it('valid value set on same day', function() {
                var appointmentDate = moment();
                appointmentDate.add(1, 'hour');
                model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                appointmentDate.minutes(30);
                model.set('appointmentTime', appointmentDate.format('HH:mm'));
                model.validateAppointmentTime();
                expect(model.errorModel.get('appointmentTime')).toBeUndefined();
            });
            it('valid value set on future day', function() {
                var appointmentDate = moment();
                appointmentDate.add(1, 'day');
                model.set('appointmentDate', appointmentDate.format('MM/DD/YYYY'));
                appointmentDate.hours(0);
                appointmentDate.minutes(0);
                model.set('appointmentTime', appointmentDate.format('HH:mm'));
                model.validateAppointmentTime();
                expect(model.errorModel.get('appointmentTime')).toBeUndefined();
            });
        });
        describe('validate appointment duration', function() {
            it('empty check', function() {
                model.unset('appointmentDuration');
                model.validateAppointmentDuration();
                expect(model.errorModel.get('appointmentDuration')).toBeDefined();
                expect(model.errorModel.get('appointmentDuration'), 'Invalid duration');
            });
            it('valid value set', function() {
                model.set('appointmentDuration', '20');
                model.validateAppointmentDuration();
                expect(model.errorModel.get('appointmentDuration')).toBeUndefined();
            });
        });
        describe('validate email', function() {
            it('empty check', function() {
                model.validateEmailAddress('patientEmail');
                expect(model.errorModel.get('patientEmail')).toBeDefined();
                expect(model.errorModel.get('patientEmail'), 'Invalid email');
            });
            it('invalid value set', function() {
                model.set('patientEmail', 'aa');
                model.validateEmailAddress('patientEmail');
                expect(model.errorModel.get('patientEmail')).toBeDefined();
                expect(model.errorModel.get('patientEmail'), 'Invalid email');
            });
            it('valid value set', function() {
                model.set('patientEmail',' PII       ');
                model.validateEmailAddress('patientEmail');
                expect(model.errorModel.get('patientEmail')).toBeUndefined();
            });
        });
        describe('validate patient phone number', function() {
            it('empty check', function() {
                model.validatePhoneNumber('patientPhone');
                expect(model.errorModel.get('patientPhone')).toBeDefined();
                expect(model.errorModel.get('patientPhone'), 'Invalid phone number');
            });
            it('invalid value set', function() {
                model.set('patientPhone', '123');
                model.validatePhoneNumber('patientPhone');
                expect(model.errorModel.get('patientPhone')).toBeDefined();
                expect(model.errorModel.get('patientPhone'), 'Invalid phone number');
            });
            it('valid value set', function() {
                model.set('patientPhone', '(123) 456-7890');
                model.validatePhoneNumber('patientPhone');
                expect(model.errorModel.get('patientPhone')).toBeUndefined();
            });
        });

    });
});
