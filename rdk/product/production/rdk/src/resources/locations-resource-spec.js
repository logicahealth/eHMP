'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var locationsResource = require('./locations-resource');
var jdsFilterInterceptor = require('../interceptors/jds-filter-interceptor');

var patientSelect = require('./patient-search/hmp-patient-select');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};


function createReqWithParam(map) {
    map = map || {};
    var req = {
        param: (function param(map, name, defaultValue) {
            if (_.has(map, name)) {
                return map[name] !== null ? String(map[name]) : null;
            }

            if (defaultValue !== undefined && defaultValue !== null) {
                String(defaultValue);
            }

            return defaultValue;
        }).bind(null, map),
        session: {
            user: {
                site: '9E7A'
            }
        },
        query: map,
        interceptorResults: {
            jdsFilter: {
                filter: []
            }
        },
        logger: logger,
        app: {
            config: {
                jdsServer: {
                    baseUrl: ''
                },
                rpcConfig: {}
            }
        }
    };
    var res = {};
    var next = (function() {});
    jdsFilterInterceptor(req, res, next);
    return req;
}


describe('createReqWithParam() tester', function() {
    it('test createReqWithParam', function() {
        var req = createReqWithParam();

        expect(req.param('test')).to.be.undefined();
        expect(req.param('test', 'default')).to.equal('default');
    });

    it('test createReqWithParam', function() {
        var req = createReqWithParam({
            name: 'value'
        });

        expect(req.param('name')).to.equal('value');
    });

    it('test createReqWithParam', function() {
        var req = createReqWithParam({
            name: 'test',
            start: 0,
            limit: 10,
            bogus: null
        });

        expect(req.param('name')).to.equal('test');
        expect(req.param('start')).to.equal('0');
        expect(req.param('limit')).to.equal('10');
        expect(req.param('bogus')).to.be.null();
        expect(req.param('undefined')).to.be.undefined();
    });
});

describe('locationsResource tester', function() {
    it('tests that handleError() correctly handles and logs an error', function() {
        var res = {
            status: sinon.spy(function() {
                return res;
            }),
            rdkSend: sinon.spy()
        };
        var error = {
            value: 'error string'
        };
        var logger = {
            error: sinon.spy()
        };

        locationsResource._handleError(logger, res, error, 'wards', 'filterValue');

        expect(logger.error.called).to.be.true();

        expect(res.status.calledWith(rdk.httpstatus.internal_server_error)).to.be.true();
        expect(res.rdkSend.calledWith('There was an error processing your request. The error has been logged.')).to.be.true();
    });

    it('tests that getResourceConfig() is setup for clinics properly', function() {
        var resources = locationsResource.getResourceConfig();
        expect(resources.length).to.equal(2);

        expect(resources[0].name).to.equal('locations-wards-search');
        expect(resources[0].path).to.equal('wards/patients');
        expect(resources[0].interceptors).to.eql({
            jdsFilter: true,
            synchronize: false
        });
        expect(resources[0].subsystems).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup for clinics properly', function() {
        var resources = locationsResource.getResourceConfig();
        expect(resources.length).to.equal(2);

        expect(resources[1].name).to.equal('locations-clinics-search');
        expect(resources[1].path).to.equal('clinics/patients');
        expect(resources[1].interceptors).to.eql({
            jdsFilter: true,
            synchronize: false
        });
        expect(resources[1].subsystems).not.to.be.undefined();
    });
});

describe('extractDfnsFromRpc', function() {
    var callback;
    beforeEach(function() {
        callback = sinon.spy();
    });
    it('should handle expected server errors', function() {
        locationsResource._extractDfnsFromRpc(null, 'clinic', '^Server Error', callback);
        expect(callback.calledWith(new Error('Server Error'))).to.be.true();
    });
    it('should handle unexpected server errors', function() {
        locationsResource._extractDfnsFromRpc(null, 'clinic', '^Unknown Error', callback);
        expect(callback.calledWith('Unknown Error')).to.be.true();
    });
    it('should handle no patients found', function() {
        locationsResource._extractDfnsFromRpc(null, 'clinic', '^No patients found.\r\n', callback);
        expect(callback.calledWith('No patients found.')).to.be.true();
    });
    it('should return a list of patients with room/bed numbers when given a patient for a ward', function() {
        var rpcResponse = '100708^ONE,INPATIENT^722-^3130830.1\r\n100710^TWO,INPATIENT^722-^3131002.13\r\n100711^THREE,INPATIENT^724-^3131003.13\r\n100712^FOUR,INPATIENT^724-^3131010.13\r\n100713^FIVE,INPATIENT^724-^3131202.13\r\n';
        var expectedDfns = [{
            dfn: '100708',
            roomBed: '722-'
        }, {
            dfn: '100710',
            roomBed: '722-'
        }, {
            dfn: '100711',
            roomBed: '724-'
        }, {
            dfn: '100712',
            roomBed: '724-'
        }, {
            dfn: '100713',
            roomBed: '724-'
        }];
        locationsResource._extractDfnsFromRpc(null, 'ward', rpcResponse, callback);
        expect(callback.calledWith(null, expectedDfns)).to.be.true();
    });
    it('should consolidate dfns for a ward', function() {
        var rpcResponse = '100708^ONE,INPATIENT^722-^3130830.1\r\n100708^ONE,INPATIENT^723-^3130830.1\r\n';
        var expectedDfns = [{
            dfn: '100708',
            roomBed: '722-'
        }];
        locationsResource._extractDfnsFromRpc(null, 'ward', rpcResponse, callback);
        expect(callback.calledWith(null, expectedDfns)).to.be.true();
    });
    it('should return a list of patients with appointment times when given a patient for a clinic', function() {
        var rpcResponse = '100708^ONE,INPATIENT^722-^3130830.1\r\n100710^TWO,INPATIENT^722-^3131002.13\r\n100711^THREE,INPATIENT^724-^3131003.13\r\n100712^FOUR,INPATIENT^724-^3131010.13\r\n100713^FIVE,INPATIENT^724-^3131202.13\r\n';
        var expectedDfns = [{
            dfn: '100708',
            appointmentTime: '20130830100000'
        }, {
            dfn: '100710',
            appointmentTime: '20131002130000'
        }, {
            dfn: '100711',
            appointmentTime: '20131003130000'
        }, {
            dfn: '100712',
            appointmentTime: '20131010130000'
        }, {
            dfn: '100713',
            appointmentTime: '20131202130000'
        }];
        locationsResource._extractDfnsFromRpc(null, 'clinic', rpcResponse, callback);
        expect(callback.calledWith(null, expectedDfns)).to.be.true();
    });
    it('should not consolidate dfns for a clinic', function() {
        var rpcResponse = '100708^ONE,INPATIENT^722-^3130830.1\r\n100708^ONE,INPATIENT^723-^3130830.1\r\n';
        var expectedDfns = [{
            dfn: '100708',
            appointmentTime: '20130830100000'
        }, {
            dfn: '100708',
            appointmentTime: '20130830100000'
        }];
        locationsResource._extractDfnsFromRpc(null, 'clinic', rpcResponse, callback);
        expect(callback.calledWith(null, expectedDfns)).to.be.true();
    });
});

describe('selectPatientsFromDfnsInBatches', function() {
    var req;

    beforeEach(function() {
        req = createReqWithParam();
    });

    it('calls selectPatientsFromDfns', function() {
        var mockResponses = [
            [{
                localId: '4',
                familyName: 'EIGHT',
                givenName: 'IMAGEPATIENT',
                sensitive: true
            }], // Marking these as 'sensitive' so it won't try to check JDS for sensitivity.
            [{
                localId: '222',
                familyName: 'EIGHT',
                givenName: 'PATIENT',
                sensitive: true
            }],
            []
        ];
        var jdsCalls = 0;

        sinon.stub(patientSelect, 'fetch', function(req, params, site, callback) {
            ++jdsCalls;
            callback(undefined, mockResponses.pop());
        });

        var dfns = [];
        for (var i = 0; i < 3; i++) {
            dfns.push({
                dfn: String(i)
            });
        }
        var expectedPatientItems = {
            data: {
                items: [{
                    localId: '222',
                    familyName: 'EIGHT',
                    givenName: 'PATIENT',
                    sensitive: true
                }, {
                    localId: '4',
                    familyName: 'EIGHT',
                    givenName: 'IMAGEPATIENT',
                    sensitive: true
                }, ]
            }
        };
        locationsResource._selectPatientsFromDfnsInBatches(req, 'clinic', '9E7A', dfns, function(err, patientItems) {
            expect(err).to.be.falsy();
            jdsCalls.must.equal(3);
            patientItems.must.eql(expectedPatientItems);
        });
    });
});