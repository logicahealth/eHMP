'use strict';

var rdk = require('./../../../../core/rdk');
var http = rdk.utils.http;
var rpcClientFactory = require('../../utils/rpc-client-factory');
var clinicsFetchList = require('./clinics-fetch-list');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'clinics-fetch-list'
}));

describe('unit test to validate clinics-fetch-list', function() {

    var validJdsResponse = {
        'data': {
            'updated': 20170130151816,
            'totalItems': 1,
            'currentItemCount': 1,
            'items': [{
                'localId': '448',
                'name': 'TESTCLINIC008',
                'oos': false,
                'refId': '448',
                'shortName': '008',
                'stampTime': '20170130095710',
                'type': 'C',
                'uid': 'urn:va:location:SITE:448',
                'displayName': 'TESTCLINIC008',
                'summary': 'Location{uid="urn:va:location:SITE:448"}',
                'typeName': 'Clinic'
            }]
        }
    };

    var missingJdsResponse = {
        'error': {
            'code': 404,
            'errors': [{
                'domain': 'UID:urn:va:location:SITE:64',
                'message': 'Bad key',
                'reason': 104
            }],
            'message': 'Not Found',
            'request': 'GET /data/urn:va:location:SITE:64 '
        }
    };

    var smallRpcResponse = '441^TESTCLINIC001^M\r\n442^TESTCLINIC002^M\r\n443^TESTCLINIC003^M\r\n444^TESTCLINIC004^M\r\n' +
        '445^TESTCLINIC005^M\r\n446^TESTCLINIC006^M\r\n447^TESTCLINIC007^M\r\n448^TESTCLINIC008^M\r\n449^TESTCLINIC009^M';

    var largeRpcResponse = '64^AUDIOLOGY^M\r\n195^CARDIOLOGY^M\r\n137^COMP AND PEN^M\r\n246^CWT CLINIC^M\r\n228^DENTAL^M\r\n62^DERMATOLOGY^M\r\n285^DIABETIC^M\r\n' +
        '191^DIABETIC TELERET READER LOCAL^M\r\n193^DIABETIC TELERET READER REMOTE^M\r\n190^DIABETIC TELERETINAL IMAGER^M\r\n' +
        '133^EMPLOYEE HEALTH^M\r\n422^ENDOCRINE^M\r\n426^Emergency Department^M\r\n23^GENERAL MEDICINE^M\r\n298^GENERAL SURGERY^M\r\n935^GYNECOLOGIST CLINIC^M\r\n' +
        '229^HEMATOLOGY^M\r\n128^M\r\nAMMOGRAM^M\r\n17^M\r\nENTAL HEALTH^M\r\n438^M\r\nENTAL HEALTH GROUP THERAPY^M\r\n26^M\r\nENTAL HYGIENE-OPC^M\r\n430^NEUROLOGY^M\r\n' +
        '432^NEUROSURGERY^M\r\n114^NUCLEAR MEDICINE^M\r\n234^OBSERVATION^M\r\n437^OPHTHALMOLOGY^M\r\n433^PHYSICAL THERAPY^M\r\n127^PLASTIC SURGERY^M\r\n' +
        '233^PODIATRY^M\r\n32^PRIMARY CARE^M\r\n435^PRIMARY CARE TELEPHONE^M\r\n427^REHAB MEDICINE^M\r\n31^SOCIAL WORK^M\r\n431^SPEECH PATHOLOGY^M\r\n' +
        '239^SURGICAL CLINIC^M\r\n441^TESTCLINIC001^M\r\n442^TESTCLINIC002^M\r\n443^TESTCLINIC003^M\r\n444^TESTCLINIC004^M\r\n445^TESTCLINIC005^M\r\n' +
        '446^TESTCLINIC006^M\r\n447^TESTCLINIC007^M\r\n448^TESTCLINIC008^M\r\n449^TESTCLINIC009^M\r\n';

    it('processJdsReponse adds to clinic list and properly executes callback', function(done) {
        var clinicList = [];
        clinicsFetchList.processJDSResponse(logger, clinicList, function(err) {
            expect(err).to.be.falsy();
            expect(clinicList.length).to.equal(1);
            done();
        }, null, '200', validJdsResponse);
    });

    it('processJdsResponse leaves clinicList empty if no clinic is found in jds', function(done) {
        var clinicList = [];
        clinicsFetchList.processJDSResponse(logger, clinicList, function(err) {
            expect(err).to.be.falsy();
            expect(clinicList.length).to.equal(0);
            done();
        }, null, '200', missingJdsResponse);
    });

    it('getClinicFromJds correctly converts the rpc response to a jds query', function(done) {
        var clinicList = [];
        var jdsOptions = {
            timeout: 120000,
            logger: logger,
            json: true
        };

        clinicsFetchList.http = sinon.stub(http, 'get', function(options, callback) {
            return callback(null);
        });

        clinicsFetchList.getClinicFromJds(logger, 'SITE', clinicList, jdsOptions, '64^AUDIOLOGY', function(err) {
            expect(jdsOptions.url).to.equal('/data/urn:va:location:SITE:64');
            done();
        });
        clinicsFetchList.http.restore();
    });

    it('callRpcRecursively is called once when less than 44 items are returned', function(done) {

        var mockConfig = {
            host: '1.1.1.1',
            port: PORT,
            accessCode: 'null',
            verifyCode: 'null!!',
            context: 'HMP UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000
        };

        var rpcClient = rpcClientFactory.getClient(logger, mockConfig);

        sinon.stub(rpcClient, 'execute', function(rpcname, searchString, option, callback) {
            return callback(null, smallRpcResponse);
        });

        sinon.stub(clinicsFetchList, 'getClinicFromJds', function(logger, site, clinicList, jdsOptions, clinic, callback) {
            return callback();
        });

        clinicsFetchList.callRpcRecursively(logger, rpcClient, {}, [], '', function(err) {
            expect(rpcClient.execute.calledOnce).to.be.true();
            done();
        }, null);

        rpcClient.execute.restore();
        clinicsFetchList.getClinicFromJds.restore();
    });

    it('callRpcRecursively is called more than once when 44 items are returned', function(done) {

        var mockConfig = {
            host: '1.1.1.1',
            port: PORT,
            accessCode: 'null',
            verifyCode: 'null!!',
            context: 'HMP UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000
        };

        var rpcClient = rpcClientFactory.getClient(logger, mockConfig);

        var vistaResponse = sinon.stub();
        vistaResponse.onCall(0).returns(largeRpcResponse);
        vistaResponse.onCall(1). returns(smallRpcResponse);

        sinon.stub(rpcClient, 'execute', function(rpcname, searchString, option, callback) {
            return callback(null, vistaResponse());
        });

        sinon.stub(clinicsFetchList, 'getClinicFromJds', function(logger, site, clinicList, jdsOptions, clinic, callback) {
            return callback();
        });

        clinicsFetchList.callRpcRecursively(logger, rpcClient, {}, [], '', function(err) {
            expect(rpcClient.execute.calledTwice).to.be.true();
            done();
        }, null);

        rpcClient.execute.restore();
        clinicsFetchList.getClinicFromJds.restore();
    });



});
