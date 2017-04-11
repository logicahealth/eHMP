'use strict';

var locationsResource = require('./locations-resource');
var namecaseUtil = require('../utils/namecase-utils');
var _ = require('lodash');

describe('using getLocationData()', function() {
    var mockResponse, mockStatus, mockRequest, mockApp, mockUser, mockSession = null;
    var spies = null;
    var fetchDone;
    var setFetchDone = function() {
        fetchDone = true;
    };
    var checkFetchDone = function() {
        return fetchDone;
    };

    var dummyLogger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    };

    var afterFetchDoneDo = function(cb) {
        if (!fetchDone) {
            setTimeout(function() {afterFetchDoneDo(cb)}, 500);
            return;
        }

        cb();
    };

    beforeEach(function() {
        fetchDone = false;

        mockStatus = {
            rdkSend: function() {
                // no-op
            }
        };
        mockResponse = {
            status: function(x) {
                return mockStatus;
            }
        };

        spies = {};
        _.set(spies, 'rdkSend', sinon.stub(mockStatus, 'rdkSend', setFetchDone));
        _.set(spies, 'status', sinon.spy(mockResponse, 'status'));

        mockApp = {
            config: require('../../config/rdk-fetch-server-config.json')
        };
        mockUser = {
            accessCode: 'PW    ',
            verifyCode: 'PW    !!'
        };
        mockSession = {
            user: mockUser
        }
        mockRequest = {
            param: function(x) {
                if (x === 'site.code') {
                    return '9E7A';
                } else {
                    return undefined;
                }
            },
            logger: dummyLogger,
            audit: {},
            app: mockApp,
            session: mockSession
        };
    });

    describe('to fetch wards', function() {
        it('succeeds', function(done) {
            this.timeout(10000);
            locationsResource._getLocationData('wards', mockRequest, mockResponse);
            afterFetchDoneDo(function() {
                expect(spies.status.called).to.be.true();
                expect(spies.status.calledOnce).to.be.true();
                expect(spies.status.args[0][0]).to.eql(200);

                expect(spies.rdkSend.called).to.be.true();
                expect(spies.rdkSend.calledOnce).to.be.true();
                expect(spies.rdkSend.args[0][0].items.length).to.eql(29);
                for (var i = 0; i < 29; i++) {
                    var wardJson = spies.rdkSend.args[0][0].items[i];

                    expect(wardJson.refId).to.exist();
                    expect(wardJson.uid).to.exist();
                    expect(wardJson.uid).to.eql('urn:va:location:9E7A:w' + wardJson.refId);

                    expect(wardJson.name).to.exist();
                    expect(wardJson.displayName).to.exist();
                    expect(wardJson.displayName).to.eql(namecaseUtil.namecase(wardJson.name));

                    expect(wardJson.type).to.exist();
                    expect(wardJson.type).to.eql('W');
                }

                done();
            });
        });

        it('fails if site.code is missing', function(done) {
            this.timeout(10000);
            mockRequest.param = function() {return undefined};
            locationsResource._getLocationData('wards', mockRequest, mockResponse);
            afterFetchDoneDo(function() {
                expect(spies.status.called).to.be.true();
                expect(spies.status.calledOnce).to.be.true();
                expect(spies.status.args[0][0]).to.eql(500);

                expect(spies.rdkSend.called).to.be.true();
                expect(spies.rdkSend.calledOnce).to.be.true();
                expect(spies.rdkSend.args[0][0]).to.eql('Site Code was missing.');

                done();
            });
        });
    });

    describe('to fetch clinics', function() {
        it('succeeds', function(done) {
            this.timeout(10000);
            locationsResource._getLocationData('clinics', mockRequest, mockResponse);
            afterFetchDoneDo(function() {
                expect(spies.status.called).to.be.true();
                expect(spies.status.calledOnce).to.be.true();
                expect(spies.status.args[0][0]).to.eql(200);

                expect(spies.rdkSend.called).to.be.true();
                expect(spies.rdkSend.calledOnce).to.be.true();
                expect(spies.rdkSend.args[0][0].items.length).to.eql(36);
                for (var i = 0; i < 36; i++) {
                    var clinicJson = spies.rdkSend.args[0][0].items[i];

                    expect(clinicJson.refId).to.exist();
                    expect(clinicJson.uid).to.exist();
                    expect(clinicJson.uid).to.eql('urn:va:location:9E7A:' + clinicJson.refId);

                    expect(clinicJson.name).to.exist();
                    expect(clinicJson.displayName).to.exist();
                    expect(clinicJson.displayName).to.eql(namecaseUtil.namecase(clinicJson.name));

                    expect(clinicJson.type).to.exist();
                    expect(clinicJson.type).to.eql('C');
                }

                done();
            });
        });

        it('fails if site.code is missing', function(done) {
            this.timeout(10000);
            mockRequest.param = function() {return undefined};
            locationsResource._getLocationData('clinics', mockRequest, mockResponse);
            afterFetchDoneDo(function() {
                expect(spies.status.called).to.be.true();
                expect(spies.status.calledOnce).to.be.true();
                expect(spies.status.args[0][0]).to.eql(500);

                expect(spies.rdkSend.called).to.be.true();
                expect(spies.rdkSend.calledOnce).to.be.true();
                expect(spies.rdkSend.args[0][0]).to.eql('Site Code was missing.');

                done();
            });
        });
    });

    describe('with a junk location type', function() {
        it('fails', function(done) {
            this.timeout(10000);
            locationsResource._getLocationData('bogus', mockRequest, mockResponse);
            afterFetchDoneDo(function() {
                expect(spies.status.called).to.be.true();
                expect(spies.status.calledOnce).to.be.true();
                expect(spies.status.args[0][0]).to.eql(400);

                expect(spies.rdkSend.called).to.be.true();
                expect(spies.rdkSend.calledOnce).to.be.true();
                expect(spies.rdkSend.args[0][0]).to.eql('Did not recognize location type: bogus');

                done();
            });
        });
    });
});
