'use strict';

var logger;
var asu_process = require('./asu-process');

describe('Asu test', function () {

    beforeEach(function () {
        logger = require('bunyan').createLogger({
            name: 'asu-process-spec.js'
        });
    });

    it.skip('call java end point', function (done) {
        var jsonParams = {
            'userClassUids': [
                'urn:va:asu-class:9E7A:561'
            ],
            'docDefUid': 'urn:va:doc-def:9E7A:3',
            'docStatus': 'COMPLETED',
            'roleNames': [
                'AUTHOR/DICTATOR',
                'EXPECTED SIGNER',
                'EXPECTED COSIGNER',
                'ATTENDING PHYSICIAN'
            ],
            'actionNames': [
                'VIEW',
                'EDIT RECORD',
                'PRINT RECORD']
        };
        var httpConfig = {
            'timeout': 30000,
            'url': '/asu/rules/getDocPermissions',
            'port': 9000
        };
        httpConfig.baseUrl = 'http://10.3.3.6:8080'.replace(/:\d{4}$/, ':' + httpConfig.port);
        httpConfig.logger = logger;

        var expectedResponse = '[{"actionName":"VIEW","hasPermission":true},{"actionName":"EDIT RECORD","hasPermission":false},{"actionName":"PRINT RECORD","hasPermission":true}]';

        asu_process.evaluate(jsonParams, null, httpConfig, null, logger, function (error, response) {
            done();
            console.log('call java end point %j ', response);
            expect(response).to.eql(JSON.parse(expectedResponse));
        });
    });
});

