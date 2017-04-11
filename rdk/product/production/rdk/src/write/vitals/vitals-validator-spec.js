/*jslint node: true */
'use strict';

var vitalsValidator = require('./vitals-validator');
var _ = require('lodash');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'vitals-vista-writer-validator'
}));

var sampleVital = {
    'locIEN': '67',
    'vitals': [{
        'fileIEN': '1',
        'reading': '80/30',
        'qualifiers': ['23', '59', '100']
    }, {
        'fileIEN': '3',
        'reading': '57',
        'qualifiers': ['47', '50']
    }]
};

describe('vitals write-back validator', function() {

    describe('Entered In Error', function() {

        it('complete model', function() {
            var model = {
                'ien': '67',
                'reason': 2
            };
            var errors = [];
            vitalsValidator._validateEnteredInError(logger, model, errors);

            expect(errors).to.be.empty();
        });

        it('tests missing model', function() {
            var errors = [];
            vitalsValidator._validateEnteredInError(logger, undefined, errors);

            expect(errors).not.be.empty();
        });

        it('tests not array', function() {
            var model = {
                'ien': '67',
                'reason': 2
            };
            var errors = '';
            var errorFree = vitalsValidator._validateEnteredInError(logger, model, errors);

            expect(errorFree).to.equal(false);
        });


        it('tests missing ien', function() {
            var model = {
                'reason': 2
            };

            var errors = [];
            vitalsValidator._validateEnteredInError(logger, model, errors);

            expect(errors).not.be.empty();
        });

        it('tests missing reason', function() {
            var model = {
                'ien': '67'
            };

            var errors = [];
            vitalsValidator._validateEnteredInError(logger, model, errors);

            expect(errors).not.be.empty();
        });
    });

    describe('call verifyInput', function() {
        it('tests not array', function() {
            var errors = '';
            var errorFree = vitalsValidator._validateInput(logger, sampleVital, errors);

            expect(errorFree).to.equal(false);
        });

        it('tests missing model', function() {
            var errors = [];
            vitalsValidator._validateInput(logger, undefined, errors);

            expect(errors).not.be.empty();
        });


        it('tests missing dateTime', function() {
            var errors = [];
            vitalsValidator._validateInput(logger, sampleVital, errors);

            expect(errors).not.be.empty();
        });



        it('tests missing enteredByIEN input', function() {
            var errors = [];
            sampleVital.dateTime = '20141029080000';

            vitalsValidator._validateInput(logger, sampleVital, errors);
            expect(errors).not.be.empty();
        });
    });

    describe('time formatter tests', function() {
        it ('valid time format', function() {

            var date = '20150511';
            expect(vitalsValidator._timeFormatter(date) > 0).to.be(true);

        });

        it ('invalid time format', function() {

            var date = '201501213';
            expect(vitalsValidator._timeFormatter(date) > 0).to.be(false);
        });
    });
});

