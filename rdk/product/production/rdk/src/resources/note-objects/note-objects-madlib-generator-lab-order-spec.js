'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-lab-order').getMadlibString;

describe('The note-objects-madlib-generator-lab-order test for', function() {
    var errorMessage = [];

    describe('generateMadlibString is called', function() {

        it ('lab order parses the correct content', function () {
            var order = {
                'data':  {
                    'content': '11-DEOXYCORTISOL BLOOD   SERUM SP LB #18607\r\n',
                    'statusName': 'PENDING'
                }
            };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).not.to.be.null();
            expect(retVal).to.eql('Ordered 11-DEOXYCORTISOL BLOOD   SERUM SP LB #18607\r\n PENDING');
        });
        it ('lab order parses the correct content', function () {
            var order = {
                    'data' : {
                        'content': 'GAS PANEL - ARTERIAL ARTERIAL BLOOD SP\r\nPREPOSITIONING LAB DATA LB #18543\r\n',
                        'statusName': 'PENDING'
                    }
                };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Ordered GAS PANEL - ARTERIAL ARTERIAL BLOOD SP\r\nPREPOSITIONING LAB DATA LB #18543\r\n PENDING');
        });

        it ('lab order parses the correct content', function () {
            var order = {
                    'data' : {
                        'content': 'GAS PANEL - ARTERIAL ARTERIAL BLOOD SP\r\nPREPOSITIONING LAB DATA LB #18543\r\n',
                        'statusName': 'PENDING'
                    }
                };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Ordered GAS PANEL - ARTERIAL ARTERIAL BLOOD SP\r\nPREPOSITIONING LAB DATA LB #18543\r\n PENDING');
        });

        it ('lab order parses the correct content and strips away *UNSIGNED*', function () {
            var order = {
                    'data' : {
                        'content': 'BLOOD GASES ARTERIAL BLOOD STAT SP LB #18607\r\n <Entered in error> *UNSIGNED*',
                        'statusName': 'DISCONTINUED'
                    }
                };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Ordered BLOOD GASES ARTERIAL BLOOD STAT SP LB #18607\r\n <Entered in error> *UNSIGNED* DISCONTINUED');
        });

        it ('lab order parses the correct content and strips away *UNSIGNED*', function () {
            var order = {
                    'data' : {
                        'content': 'GBLOOD GASES ARTERIAL BLOOD STAT SP LB #18607\r\n <Entered in error> *UNSIGNED*',
                        'statusName': 'DISCONTINUED'
                    }
                };

            var retVal = madlibGenerator(errorMessage, order);
            expect(retVal).to.eql('Ordered GBLOOD GASES ARTERIAL BLOOD STAT SP LB #18607\r\n <Entered in error> *UNSIGNED* DISCONTINUED');
        });
    });
});
