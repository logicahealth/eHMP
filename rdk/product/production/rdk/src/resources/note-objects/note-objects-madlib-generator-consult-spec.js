'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-consult').getMadlibString;

describe('The note-objects-madlib-generator-consult test for', function() {
    var errorMessage = [];

    describe('generateMadlibString is called', function() {

        it ('consult parses the correct content', function () {
            var order = {
                'data':  {
                    'consultOrders': [{
                        'consultName': 'Rheumatology Consult',
                        'condition': 'Hypertension',
                        'date': '01/01/15',
                        'requestQuestion': 'Evaluate flexibility in lower back.',
                        'requestComment': 'Patient is having trouble with sitting'
                    }]
                }
            };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('Rheumatology Consult, Assoc: Hypertension\n' +
                    'Reason for Consult:\nRequest - Evaluate flexibility in lower back.\n' +
                    'Comment (Clinical History) - Patient is having trouble with sitting\n'
                    );
        });

        it ('consult parses the correct content without condition', function () {
            var order = {
                'data':  {
                    'consultOrders': [{
                        'consultName': 'Rheumatology Consult',
                        'date': '01/01/2016',
                        'condition': '',
                        'requestQuestion': 'Evaluate flexibility in lower back.',
                        'requestComment': 'Patient is having trouble with sitting'
                    }]
                }
            };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Rheumatology Consult\n' +
                    'Reason for Consult:\nRequest - Evaluate flexibility in lower back.\n' +
                    'Comment (Clinical History) - Patient is having trouble with sitting\n'
                    );
        });

        it ('consult parses the correct content without comment', function () {
            var order = {
                'data':  {
                    'consultOrders': [{
                        'consultName': 'Rheumatology Consult',
                        'condition': 'Hypertension',
                        'date': '01/01/2016',
                        'requestQuestion': 'Evaluate flexibility in lower back.'
                    }]
                }
            };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Rheumatology Consult, Assoc: Hypertension\n' +
                    'Reason for Consult:\nRequest - Evaluate flexibility in lower back.\n'
                    );
        });

        it ('consult parses the correct content without data', function () {
            var order = {
                    'uid': 'urn:va:ehmp-note:C877:773:92620ee6-c79e-463a-95d7-b7bf344e884a',
                };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Default clinical madlib for urn:va:ehmp-note:C877:773:92620ee6-c79e-463a-95d7-b7bf344e884a');
        });

    });
});
