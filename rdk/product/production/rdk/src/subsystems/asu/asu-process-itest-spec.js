'use strict';

var details = '{\"data\":{\"items\":[{\"author\":\"VEHU,ONE\",\"authorDisplayName\":\"Vehu,One\",\"authorUid\":\"urn:va:user:C877:20001\",\"clinicians\":[{\"displayName\":\"Vehu,One\",\"name\":\"VEHU,ONE\",\"role\":\"AU\",\"summary\":\"DocumentClinician{uid=\'urn:va:user:C877:20001\'}\",\"uid\":\"urn:va:user:C877:20001\"}],\"documentDefUid\":\"urn:va:doc-def:C877:8\",\"status\":\"COMPLETED\",\"uid\":\"urn:va:document:C877:3:11605\"}]},\"actionNames\":[\"VIEW\",\"EDIT RECORD\",\"AMENDMENT\"],\"userdetails\":{\"site\":\"C877\",\"duz\":{\"C877\":\"10000000270\"}}}';
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
        httpConfig.baseUrl = 'http://IPADDRESS:POR'.replace(/:\d{4}$/, ':' + httpConfig.port);
        httpConfig.logger = logger;

        var expectedResponse = '[{"actionName":"VIEW","hasPermission":true},{"actionName":"EDIT RECORD","hasPermission":false},{"actionName":"PRINT RECORD","hasPermission":true}]';

        asu_process.evaluate(jsonParams, null, httpConfig, null, logger, function (error, response) {
            done();
            console.log('call java end point %j ', response);
            expect(response).to.eql(JSON.parse(expectedResponse));
        });
    });
});

