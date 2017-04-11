'use strict';

var _ = require('lodash');
var validator = require('./allergies-validator');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'allergies-vista-writer-validator'
}));

describe('Allergies input validator', function () {

    describe ('Allergies valid input', function () {

        it ('minimum historical input', function () {
            var model = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'eventDateTime': '20150120114900',
                'historicalOrObserved': 'h^HISTORICAL',
                'dfn' : '3',
                'enteredBy' : '2'
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.be.empty();
        });

        it ('minimum observed input', function () {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.be.empty();
        });

        it ('allows fuzzy observed date with only month and year', function() {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '20150100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.be.empty();
        });

        it ('allows fuzzy observed date with only year', function() {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '20150000',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.be.empty();
        });

        it ('missing dfn and allergy name and enteredBy', function () {
            var model = {
                'natureOfReaction': 'A^ALLERGY',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.not.be.empty();
            expect(_.size(errors)).eql(3);

            errors = errors.join(';');
            expect(errors).eql('patient dfn is missing;allergy name is missing;The enteredBy is missing');
        });

        it ('missing natureOfReaction model', function () {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.not.be.empty();
            expect(_.size(errors)).eql(1);

        });

        it ('missing symptoms IEN model', function () {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.not.be.empty();
            expect(_.size(errors)).eql(1);
        });

        it ('comment in observed model', function () {
            var model = {
                'dfn': '3',
                'enteredBy' : '2',
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'comment' : 'sample comment',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var errors = [];
            validator._validateInput(logger, model, errors);
            expect(errors).to.be.empty();
        });
    });
});
