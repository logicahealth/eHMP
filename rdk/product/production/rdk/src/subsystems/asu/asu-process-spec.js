'use strict';

var asu_process = require('./asu-process');
var rdk = require('../../core/rdk');
var _ = require('lodash');

var nullchecker = require('../../utils/nullchecker');
var nock = require('nock');
var logger;


describe('Asu test', function() {

    var getDocPermissionResult='[{"actionName": "VIEW","hasPermission": true},{"actionName": "EDIT RECORD","hasPermission": false}]';
    var details='{\"data\":{\"items\":[{\"author\":\"VEHU,ONE\",\"authorDisplayName\":\"Vehu,One\",\"authorUid\":\"urn:va:user:C877:20001\",\"clinicians\":[{\"displayName\":\"Vehu,One\",\"name\":\"VEHU,ONE\",\"role\":\"AU\",\"summary\":\"DocumentClinician{uid=\'urn:va:user:C877:20001\'}\",\"uid\":\"urn:va:user:C877:20001\"}],\"documentDefUid\":\"urn:va:doc-def:C877:8\",\"status\":\"COMPLETED\",\"uid\":\"urn:va:document:C877:3:11605\"}]},\"actionNames\":[\"VIEW\",\"EDIT RECORD\",\"AMENDMENT\"],\"userdetails\":{\"site\":\"C877\",\"duz\":{\"C877\":\"10000000270\"}}}';
    var defaultUserClassResult='{\"apiVersion\":\"1.0\",\"data\":{\"updated\":20151208113330,\"totalItems\":2,\"currentItemCount\":2,\"items\":[{\"abbreviation\":\"USR\",\"active\":true,\"displayName\":\"User\",\"localId\":561,\"name\":\"USER\",\"stampTime\":20151202115611,\"subClass\":[{\"name\":\"PROVIDER\",\"uid\":\"urn:va:asu-class:9E7A:546\"},{\"name\":\"MEDICAL INFORMATION SECTION\",\"uid\":\"urn:va:asu-class:9E7A:555\"},{\"name\":\"REMOTE USER\",\"uid\":\"urn:va:asu-class:9E7A:414\"}],\"uid\":\"urn:va:asu-class:9E7A:561\"},{\"abbreviation\":\"USR\",\"active\":true,\"displayName\":\"User\",\"localId\":561,\"name\":\"USER\",\"stampTime\":20151202115608,\"subClass\":[{\"name\":\"PROVIDER\",\"uid\":\"urn:va:asu-class:C877:546\"},{\"name\":\"MEDICAL INFORMATION SECTION\",\"uid\":\"urn:va:asu-class:C877:555\"},{\"name\":\"REMOTE USER\",\"uid\":\"urn:va:asu-class:C877:414\"}],\"uid\":\"urn:va:asu-class:C877:561\"}]}}';

    beforeEach(function () {
        logger = require('bunyan').createLogger({
            name: 'asu-process-spec.js'
        });
        nock.cleanAll();
        nock.disableNetConnect();

        nock('http://IP             ')
            .get('/data/find/asu-class?filter=eq(%22name%22,%22USER%22)')
            .reply(200,
            defaultUserClassResult);

        nock('http://IP           ')
            .post('/asu/rules/getDocPermissions')
            .reply(200,
            '[{"actionName": "VIEW","hasPermission": true},{"actionName": "EDIT RECORD","hasPermission": false}]');
   });


    it('get getDefaultUserClass', function (done) {
        var req = {};
        req.app = {};
        req.audit = {};
        req.logger = logger;
        req.app.config = {};
        req.session = {};
        req.app.config.vxSyncServer = {};
        req.app.config.vxSyncServer.baseUrl = 'http://IP           ';
        req.app.config.jdsServer = {};
        req.app.config.jdsServer.baseUrl = 'http://IP             ';
        asu_process.getDefaultUserClass(req, function (error, response, body) {
            done();
            expect(body).to.eql(defaultUserClassResult);
        });
    });

    it('test getAsuPermissionForActionNames', function (done) {
        var mock;
        var req = {};
        req.app = {};
        req.audit = {};
        req.logger = logger;
        req.app.config = {};
        req.app.config.asu = {};
        req.session = {};
        req.app.config.asuServer = {};
        req.app.config.asuServer.baseUrl = 'http://IP           ';
        req.app.config.vxSyncServer = {};
        req.app.config.vxSyncServer.baseUrl = 'http://IP           ';
        req.app.config.jdsServer = {};
        req.app.config.jdsServer.baseUrl = 'http://IP             ';
        mock = sinon.spy(asu_process, 'getAsuPermission');
        asu_process.getAsuPermissionForActionNames(req, JSON.parse(details), function (asuError, asuResult) {
            done();
             expect(asuResult).to.eql(JSON.parse(getDocPermissionResult));
        });
    });

});
