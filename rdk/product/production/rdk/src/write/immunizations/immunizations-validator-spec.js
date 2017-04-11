'use strict';

var _ = require('lodash');
var validateInput = require('./immunizations-validator')._validateInput;

describe('Immunizations input validator', function () {
    var logger;
    beforeEach(function() {
        logger = sinon.stub(require('bunyan').createLogger({name: 'immunization-validator'}));
    });

    describe ('Immunizations valid input', function () {

        it ('minimum valid input', function () {
            var model = {
                'encounterServiceCategory': 'E',
                'encounterDateTime' : '20150101',
                'immunizationIEN' : '44',
                'encounterPatientDFN' : '3',
                'encounterLocation' : '32'
            };
            var errors = [];
            var validator = validateInput(logger, model, errors);
            expect(_.size(errors)).to.equal(0);
        });

     });

    describe ('Immunizations invalid input', function () {

        it('missing model', function () {

            var errors = [];
            var validator = validateInput(logger, undefined, errors);
            expect(_.size(errors)).to.equal(1);
            expect(_.contains(errors, 'Missing model')).to.be.true();
        });

        it('missing encounterPatientDFN', function () {

            var model = {
                'encounterServiceCategory': 'E',
                'encounterDateTime': '201501010101',
                'immunizationIEN': '44',
                'encounterLocation' : '32'
            };
            var errors = [];
            var validator = validateInput(logger, model, errors);
            expect(_.size(errors)).to.equal(1);
            expect(_.contains(errors, 'Missing encounterPatientDFN')).to.be.true();
        });

        it('missing immunization', function () {

            var model = {
                'encounterServiceCategory': 'E',
                'encounterDateTime': '20150101',
                'encounterPatientDFN': '3',
                'encounterLocation' : '32'
            };

            var errors = [];
            var validator = validateInput(logger, model, errors);
            expect(_.size(errors)).to.equal(1);
            expect(_.contains(errors, 'Missing immunizationIEN')).to.be.true();
        });

        it('missing immunization and visit date and encounter', function () {

            var model = {
                'encounterPatientDFN': '3',
                'encounterLocation' : '32'
            };
            var errors = [];
            var validator = validateInput(logger, model, errors);
            expect(_.size(errors)).to.equal(3);
            expect(_.contains(errors, 'Missing immunizationIEN')).to.be.true();
            expect(_.contains(errors, 'Missing visit date')).to.be.true();
            expect(_.contains(errors, 'Missing encounter service category')).to.be.true();
        });

    });

});
