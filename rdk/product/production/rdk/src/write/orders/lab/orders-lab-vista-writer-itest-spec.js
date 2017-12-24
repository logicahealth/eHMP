'use strict';

var vistaWriter = require('./orders-lab-vista-writer');

var writebackContext = {
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'USER  ',
        verifyCode: 'PW      ',
        localIP: 'IP      ',
        localAddress: 'localhost',
        noReconnect: true
    },
    interceptorResults: {
        patientIdentifiers: {
            'dfn': '8'
        }
    },
    model: {
        'provider': '10000000238',
        'location': '285',
        'orderDialog': 'LR OTHER LAB TESTS',
        'displayGroup': '5',
        'quickOrderDialog': '2',
        'inputList': [{
            'inputKey': '4',
            'inputValue': '1191'
        }, {
            'inputKey': '126',
            'inputValue': '1'
        }, {
            'inputKey': '127',
            'inputValue': '72'
        }, {
            'inputKey': '180',
            'inputValue': '9'
        }, {
            'inputKey': '28',
            'inputValue': 'SP'
        }, {
            'inputKey': '6',
            'inputValue': 'TODAY'
        }, {
            'inputKey': '29',
            'inputValue': '28'
        }],
        'commentList': [{
            'comment': '~For Test: AMIKACIN'
        }, {
            'comment': '~Dose is expected to be at &UNKNOWN level.'
        }, {
            'comment': 'additional comment'
        }],
        'kind': 'Laboratory'
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'lab-vista-writer'
    }))
};

describe('write-back orders lab vista writer integration tests', function() {

    //Test w/o required DFN
    it('tests that save order returns error with no vprResponse & no vprModel', function(done) {
        this.timeout(5000);
        vistaWriter.create(writebackContext, function(err, result) {
            expect(err).to.be.truthy();
            expect(writebackContext.vprResponse).to.be.undefined();
            expect(writebackContext.vprModel).to.be.undefined();
            done();
        });
    });

    /*
        //This test will create a new lab order in Vista.  Uncomment to test locally
        it('tests that save order returns successful vprResponse & vprModel', function(done) {
            writebackContext.interceptorResults.patientIdentifiers.dfn = '100615';  //set missing DFN
            this.timeout(20000);
            vistaWriter.create(writebackContext, function(err, result) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.be.truthy();
                var jsonObj = JSON.parse(writebackContext.vprResponse);
                if (jsonObj.orderCheckList) {
                    writebackContext.vprResponse = null;
                    vistaWriter.create(writebackContext, function(err, result) {
                        expect(err).to.be.falsy();
                        expect(writebackContext.vprResponse).to.be.truthy();
                        jsonObj = JSON.parse(writebackContext.vprResponse);
                        expect(jsonObj.orderCheckList).to.be.truthy();
                        done();
                    });
                }else {
                    expect(writebackContext.vprModel).to.be.truthy();
                    done();
                }
            });
        });
    */

});
