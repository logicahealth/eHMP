'use strict';
var rdk = require('../../core/rdk');
var _ = require('lodash');
var http = rdk.utils.http;
var patientPhotoResource = require('./patient-photo-resource');
var bunyan = require('bunyan');
var data = require('./patient-photo-resource-data').data;

describe('Patient Photo Resource Test', function() {
    it('tests that getResourceConfig() is setup correctly for getPatientPhoto', function() {
        var resources = patientPhotoResource.getResourceConfig();
        expect(resources.length).to.equal(1);
        expect(resources[0].name).to.equal('patientphoto-getPatientPhoto');
        expect(resources[0].path).to.equal('');
    });

    it.skip('tests that getPatientPhoto returns a photo', function() {
        var statusObject = {
            send: function(data) {
                return data;
            }
        };
        var res = {
            status: function(statusCode) {
                this.statusCode = statusCode;
                return this;
            },
            send: function(responseBody) {
                this.responseBody = responseBody;
                expect(responseBody).not.to.be.undefined();
            },
            type: function() {
                return this;
            },
            set: function() {
                return this;
            }
        };

        var request = {
            //logger:bunyan.createLogger({name: 'patient-photo-resource-spec.js'}),
            logger: sinon.stub(bunyan.createLogger({
                name: 'patient-photo-resource-spec.js'
            })),
            audit: {
                dataDomain: '',
                logCategory: ''
            },
            interceptorResults: {
                patientIdentifiers: {
                    dfn: '9E7A;8',
                    vhic: 'VHIC;32758',
                    site: '9E7A'
                }
            },
            app: {
                config: {
                    vhic: {
                        baseUrl: 'http://10.2.2.108/vhicSend',
                        search: {
                            path: 'cardi-id'
                        }
                    },
                    rpcConfig: {

                    },
                    vistaSites: {
                        '9E7A': {
                            accessCode: 'pu1234',
                            verifyCode: 'pu1234!!'
                        }
                    }
                }
            },
            session: {
                user: {
                    site: '9E7A'
                }
            },
            param: function() {}
        };
        sinon.mock(request).expects('param').withArgs('pid').twice().returns('9E7A;8');
        sinon.stub(http, 'post', function(vhicHttpConfig, cb) {
            var response = {
                statusCode: 200
            };
            return cb(null, response, data);
        });
        var spy = sinon.spy(res, 'status').withArgs(rdk.httpstatus.ok);
        sinon.spy(statusObject, 'send').withArgs(data);
        patientPhotoResource.getPatientPhoto(request, res);
        expect(patientPhotoResource.getPatientPhoto(request, res)).not.to.be(undefined);
        expect(spy.withArgs(rdk.httpstatus.ok).calledOnce);
        expect(spy.withArgs(data).calledOnce);
    });

    it('tests that getPatientPhoto calls the rpc to get the Vhic Id from local instance or mvi', function() {
        var statusObject = {
            send: function(data) {
                return data;
            }
        };
        var res = {
            status: function(statusCode) {
                this.statusCode = statusCode;
                return this;
            },
            send: function(responseBody) {
                this.responseBody = responseBody;
                expect(responseBody).not.to.be.undefined();
            },
            type: function() {
                return this;
            },
            set: function() {
                return this;
            }
        };

        var request = {
            logger: sinon.stub(bunyan.createLogger({
                name: 'patient-photo-resource-spec.js'
            })),
            audit: {
                dataDomain: '',
                logCategory: ''
            },
            interceptorResults: {
                patientIdentifiers: {
                    dfn: '9E7A;8',
                    vhic: 'VHIC;32758',
                    site: '9E7A'
                }
            },
            app: {
                config: {
                    vhic: {
                        baseUrl: 'http://10.2.2.108/vhicSend',
                        search: {
                            path: 'cardi-id'
                        }
                    },
                    rpcConfig: {

                    },
                    vistaSites: {
                        '9E7A': {
                            accessCode: 'pu1234',
                            verifyCode: 'pu1234!!'
                        }
                    }
                }
            },
            session: {
                user: {
                    site: '9E7A'
                }
            },
            vistaConfig: {},
            param: function() {}
        };
        sinon.mock(request).expects('param').withArgs('pid').twice().returns('9E7A;8');
        sinon.stub(http, 'post', function(vhicHttpConfig, cb) {
            var response = {
                statusCode: 200
            };
            return cb(null, response, data);
        });
        sinon.spy(res, 'status').withArgs(rdk.httpstatus.ok);
        sinon.spy(statusObject, 'send').withArgs(data);
        var cb = function() {
            expect(rpcCallBackStub.callCount).to.be(1);
        };
        var rpcCallBackStub = sinon.stub(patientPhotoResource, '_getPatientPhotoCallRpcCallback', function(error, result, request, res) {
            return cb();
        });
        patientPhotoResource.getPatientPhoto(request, res);
        rpcCallBackStub.restore();
    });

    it('tests that getPatientPhoto calls JDS to get the Vhic Id', function() {
        var res = {
            status: function(statusCode) {
                this.statusCode = statusCode;
                return this;
            },
            send: function(responseBody) {
                this.responseBody = responseBody;
                expect(responseBody).not.to.be.undefined();
            },
            type: function() {
                return this;
            },
            set: function() {
                return this;
            }
        };

        var request = {
            logger: sinon.stub(bunyan.createLogger({
                name: 'patient-photo-resource-spec.js'
            })),
            audit: {
                dataDomain: '',
                logCategory: ''
            },
            interceptorResults: {
                patientIdentifiers: {
                    icn: '9E7A;8',
                    dfn: '9E7A;8',
                    vhic: 'VHICID;32758',
                    site: '9E7A'
                }
            },
            app: {
                config: {
                    vhic: {
                        baseUrl: 'http://10.2.2.108/vhicSend',
                        search: {
                            path: 'cardi-id'
                        }
                    },
                    rpcConfig: {

                    },
                    vistaSites: {
                        '9E7A': {
                            accessCode: 'pu1234',
                            verifyCode: 'pu1234!!'
                        }
                    }
                }
            },
            session: {
                user: {
                    site: '9E7A'
                }
            },
            vistaConfig: {},
            param: function() {}
        };
        var jdsResponse = {
            apiVersion: '1.0',
            data: {
                updated: 20160510153022,
                totalItems: 1,
                currentItemCount: 1,
                items: [{
                    lastUpdateTime: '20160509171929',
                    localId: '08f1bc84-d11f-46cc-80e1-6fb801215e48',
                    pid: 'JPID;08f1bc84-d11f-46cc-80e1-6fb801215e48',
                    stampTime: '20160509171929',
                    uid: 'urn:va:vhic-id:JPID:08f1bc84-d11f-46cc-80e1-6fb801215e48:08f1bc84-d11f-46cc-80e1-6fb801215e48',
                    vhicIds: [{
                        active: true,
                        vhicId: '32758'
                    }]
                }]
            }
        };
        sinon.mock(request).expects('param').withArgs('pid').twice().returns('9E7A;8');
        sinon.stub(http, 'get', function(vhicHttpConfig, cb) {
            var response = {
                statusCode: 200
            };
            return cb(null, response, jdsResponse);
        });
        sinon.stub(http, 'post', function(vhicHttpConfig, cb) {
            var response = {
                statusCode: 200
            };
            return cb(null, response, data);
        });
        sinon.spy(res, 'status').withArgs(rdk.httpstatus.ok);
        var cb = function() {
            expect(rpcCallBackStub.callCount).to.be(1);
        };
        var rpcCallBackStub = sinon.stub(patientPhotoResource, '_getPatientPhotoCallRpcCallback', function(error, result, request, res) {
            return cb();
        });
        patientPhotoResource.getPatientPhoto(request, res);
        rpcCallBackStub.restore();
    });

    describe('getVHICHttpConfig', function() {
        var req;
        beforeEach(function() {
            req = {};
            _.set(req, 'app.config.vhic.search.path', '/vhic');
            _.set(req, 'app.config.vhic.baseUrl', 'https://localhost:8896');
            _.set(req, 'app.config.logger',
                sinon.stub(bunyan.createLogger({
                    name: 'patient-photo-resource-spec.js'
                }))
            );
        });
        it('creates a config object', function() {
            var config = patientPhotoResource._getVHICHttpConfig(req);
            expect(config).to.eql({
                search: {
                    path: '/vhic'
                },
                baseUrl: 'https://localhost:8896',
                url: '/vhic',
                logger: req.logger,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                }
            });
        });
    });

});
