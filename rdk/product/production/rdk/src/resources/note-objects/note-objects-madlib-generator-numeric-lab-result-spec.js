'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-numeric-lab-result').getMadlibString;

describe('The note-objects-madlib-generator-numeric-lab-result test for', function() {
    var errorMessage = [];

    describe('generateMadlibString is called', function() {

        it ('lab results parses the correct content', function () {
            var result = {
                'data':  {
                    'displayName': 'BLOOD',
                    'specimen' : 'CBD',
                    'observed': '20150411',
                    'interpretationName': 'High',
                    'result': '500',
                    'units': 'mg'
                }
            };

            var retVal = madlibGenerator(errorMessage, result);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('BLOOD, CBD, 04/11/2015, High, 500 mg');
        });
        it ('handles date normalization in the madlib generation process', function () {
            var result = {
                'data' : {
                    'displayName': 'GLUCOSE',
                    'specimen' : 'SERUM',
                    'observed': '20150129151700',
                    'interpretationName': 'High alert',
                    'result': '211',
                    'units': 'mg/dL'
                }
            };

            var retVal = madlibGenerator(errorMessage, result);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('GLUCOSE, SERUM, 01/29/2015, Critically High, 211 mg/dL');
        });
        it ('handles madlib generation with missing attributes', function () {
            var result = {
                'data' : {
                    'displayName': 'WBC',
                    'specimen' : 'BLOOD',
                    'observed': '20150329',
                    'result': '2300',
                    'units': 'k/cmm'
                }
            };

            var retVal = madlibGenerator(errorMessage, result);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('WBC, BLOOD, 03/29/2015, 2300 k/cmm');
        });
        it ('gracefully handles the case where the clinical object "data" attribute is not an object', function() {
            var result = {
                uid: 'ABC123'
            };

            var retVal = madlibGenerator(errorMessage, result);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('Default lab orders madlib for ABC123');
        });
        it ('gracefully handles the case where the clinical object is not an actual valid object', function() {
            var result = 'I am not an object!';
            var errors = [];

            var retVal = madlibGenerator(errors, result);
            expect(retVal).to.be.falsy();
            expect(errors.length).to.eql(1);
            expect(errors[0]).to.eql('sourceClinicalObject model is not an object');
        });
    });
});
