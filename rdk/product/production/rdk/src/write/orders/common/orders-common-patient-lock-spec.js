'use strict';

var patientLock = require('./orders-common-patient-lock');

describe('Checks the patient lock parameters', function() {

    it('tests that getParameters returns correct parameters array', function(done) {

        var writebackContext = {
            interceptorResults: {
                patientIdentifiers: {
                    dfn: '100615'
                }
            }
        };
        var expectedArray = ['100615'];
        var parameters = patientLock._getParameters(writebackContext);
        expect(parameters).to.eql(expectedArray);
        done();
    });

});
