'use strict';

var scResource = require('./service-connected-resource');
var scdis = require('./get-service-connected-and-rated-disabilities');
var scsel = require('./get-service-connected-and-service-exposure-list');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('Service Connected Resource', function(){
    it('should be set up correctly for using getServiceConnectedAndRatedDisabilities', function() {
        var resources = scResource.getResourceConfig();
        expect(resources.length).to.equal(2);

        expect(resources[0].name).to.eql('patient-service-connected-serviceConnected');
        expect(resources[0].path).to.eql('/serviceconnectedrateddisabilities');
        expect(resources[0].interceptors).to.eql({
            //pep: true, ***PEP no longer appears in service-connecte-resource.js***
            operationalDataCheck: false,
            synchronize: true,
            convertPid: true
        });
        expect(resources[0].subsystems).not.to.be.undefined();
        expect(resources[0].get).not.to.be.undefined();
    });

    it('should be set up correctly for using getServiceConnectedAndServiceExposure', function() {
        var resources = scResource.getResourceConfig();
        expect(resources.length).to.equal(2);

        expect(resources[1].name).to.eql('patient-service-connected-scButtonSelection');
        expect(resources[1].path).to.eql('/serviceconnectedserviceexposurelist');
        expect(resources[1].interceptors).to.eql({
            //pep: true, ***PEP no longer appears in service-connecte-resource.js***
            operationalDataCheck: false,
            synchronize: true,
            convertPid: true
        });
        expect(resources[1].subsystems).not.to.be.undefined();
        expect(resources[1].get).not.to.be.undefined();
    });


    describe('getServiceConnectedAndRatedDisabilities', function(){

        beforeEach(function() {
            sinon.stub(httpUtil, 'get');
        });

        it('should call httpUtil', function(){
            var req = {
                interceptorResults: {
                    patientIdentifiers: {
                        siteDfn: '9E7A;3'
                    }
                },
                logger: {
                    info: function(log) {
                        return log;
                    },
                    debug: function(debug) {
                        return debug;
                    }
                },
                session: {
                    user: {
                        site: '9E7A'
                    }
                },
                param: function(name){
                    if(name === 'pid'){
                        return '10108V420871';
                    }
                },
                app: {
                    config: {
                        rpcConfig: {
                            context: 'HMP UI CONTEXT',
                            siteHash: '9E7A'
                        },
                        vistaSites: {
                            '9E7A': {
                                name: 'PANORAMA',
                                division: '500',
                                host: 'IP        ',
                                port: PORT,
                                production: false,
                                accessCode: 'REDACTED',
                                verifyCode: 'REDACTED'
                            },
                            'C877': {
                                name: 'KODAK',
                                division: '500',
                                host: 'IP        ',
                                port: PORT,
                                production: false,
                                accessCode: 'REDACTED',
                                verifyCode: 'REDACTED'
                            }
                        }
                    }
                },
                audit: {}
            };

            var res = {
                send: function(message, error) {
                    return;
                }
            };

            scdis._getServiceConnectedAndRatedDisabilities(req, res);
            expect(httpUtil.get.called).to.be.true();
        });

    });

    describe('getServiceConnectedAndServiceExposureList', function(){

        beforeEach(function() {
            sinon.stub(httpUtil, 'get');
        });

        it('should call httpUtil', function(){
            var req = {
                interceptorResults: {
                    patientIdentifiers: {
                        siteDfn: '9E7A;3'
                    }
                },
                logger: {
                    info: function(log) {
                        return log;
                    },
                    debug: function(debug) {
                        return debug;
                    }
                },
                session: {
                    user: {
                        site: '9E7A'
                    }
                },
                param: function(name){
                    if(name === 'pid'){
                        return '10108V420871';
                    }
                },
                app: {
                    config: {
                        rpcConfig: {
                            context: 'HMP UI CONTEXT',
                            siteHash: '9E7A'
                        },
                        vistaSites: {
                            '9E7A': {
                                name: 'PANORAMA',
                                division: '500',
                                host: 'IP        ',
                                port: PORT,
                                production: false,
                                accessCode: 'REDACTED',
                                verifyCode: 'REDACTED'
                            },
                            'C877': {
                                name: 'KODAK',
                                division: '500',
                                host: 'IP        ',
                                port: PORT,
                                production: false,
                                accessCode: 'REDACTED',
                                verifyCode: 'REDACTED'
                            }
                        }
                    }
                },
                audit: {}
            };

            var res = {
                send: function(message, error) {
                    return;
                }
            };

            scsel._getServiceConnectedAndServiceExposureList(req, res);
            expect(httpUtil.get.called).to.be.true();
        });

    });
});
