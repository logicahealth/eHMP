'use strict';

var _ = require('lodash');
var validateAddInput = require('./problems-validator')._validateAddInput;

describe('Problems input validator', function () {
    var logger;
    beforeEach(function() {
        logger = sinon.stub(require('bunyan').createLogger({name: 'problems-validator'}));
    });

    describe ('Problems valid input', function () {

        it ('patient IEN is present', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(0);
        });

        it ('patient name is present', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(0);
        });

        it ('user IEN is present', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(0);
        });

        it ('Bad errors parameter', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors;
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(0);
        });


        it ('missing patient IEN and problem name', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientName": "EIGHT,OUTPATIENT",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(2);
            errors = errors.join(';');
            expect(errors).eql('patient IEN is missing;problem name is missing');
        });

        it ('missing status', function () {
            var model ={
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "responsibleProviderIEN": "10000000226",
                "serviceConnected": "64^AUDIOLOGY"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(1);
        });

        it ('missing provider IEN model', function () {
            var model = {
                "MST" : "No",
                "comments": [ "test comment one", "test comment two"],
                "dateOfOnset": "20141113",
                "dateRecorded": "20141113",
                "enteredBy": "USER,PANORAMA",
                "enteredByIEN": "10000000226",
                "headOrNeckCancer": "No",
                "lexiconCode": "",
                "patientIEN": "100615",
                "patientName": "EIGHT,OUTPATIENT",
                "problemName": "soven test",
                "problemText": "soven test",
                "recordingProvider": "USER,PANORAMA",
                "responsibleProvider": "USER,PANORAMA",
                "serviceConnected": "64^AUDIOLOGY",
                "status": "A^ACTIVE"
            };

            var errors = [];
            validateAddInput(logger, model, errors);
            expect(_.size(errors)).to.equal(1);
        });
    });
});
