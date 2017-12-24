'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var moment = require('moment');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var RpcClient = require('vista-js').RpcClient;
var vixSubsystem = require('./vix-subsystem');

var app = {
    config: {
        rpcConfig: {
            context: 'HMP UI CONTEXT'
        },
        vix: {
            baseUrl: 'http://IP             ',
            api: {
                studyQuery:  '/vix/viewer/studyquery',
                studyDetails: '/vix/viewer/studydetails'
            },
            agentOptions: {
                pfx: null,
                rejectUnauthorized: null,
                requestCert: null,
                passphrase: null
            }
        },
        vistaSites: {
            'SITE': {
                division: [{id:'500',name:'PANORAMA'}],
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: PORT,
                production: false,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
                infoButtonOid: '1.3.6.1.4.1.3768',
                abbreviation: 'PAN',
                uatracker: true
            }
        }
    }
};

var logger = sinon.stub(bunyan.createLogger({
    name: 'vix-subsystem-spec'
}));

var user = {
    firstname: 'FIRST',
    lastname: 'LAST',
    ssn: '000000000',
    facility: 'SITE',
    site: 'PANORAMA',
    division: '500',
    duz: {
        'PANORAMA': '500'
    },
    'vixBseToken': '~1XWBAS1210-215869_2',
    'vixBseTokenExpires': moment().add(22, 'hours').format('X')
};

vixSubsystem._init(app, logger);

describe('vix-subsystem._init', function () {
    after(function () {
        vixSubsystem._vixServerConfigured = true;
    });

    it('Should be disabled if there is no baseUrl in the app config', function () {
        vixSubsystem._init({}, logger);
        expect(vixSubsystem._vixServerConfigured).to.be(false);
    });

    it('Should be enabled if there is a baseUrl in the app config', function () {
        vixSubsystem._init(app, logger);
        expect(vixSubsystem._vixServerConfigured).to.be(true);
    });
});

describe('vix-subsystem\'s healthcheck', function () {
    it('Should be skipped if the vix-subsystem is disabled', function (done) {
        var config = vixSubsystem.getSubsystemConfig(app, logger);
        vixSubsystem._vixServerConfigured = false;
        config.healthcheck.check(function (healthy) {
            expect(healthy).to.be(false);
            done();
        });
        vixSubsystem._vixServerConfigured = true;
    });

    it('Should ping vix if the vix-subsystem is enabled', function (done) {
        sinon.stub(http, 'get').callsFake(function(config, callback) {
            callback(null);
        });
        var config = vixSubsystem.getSubsystemConfig(app, logger);
        config.healthcheck.check(function (healthy) {
            expect(healthy).to.be(true);
            done();
        });
    });
});

describe('vix-subsystem.addImagesToDocument', function() {
    var req, jdsResponse;

    beforeEach(function() {
        req = {
            app: app,
            body: {},
            interceptorResults: {
                'patientIdentifiers': {
                    'icn': '10108V420871',
                    'dfn': '3',
                },
                'jdsFilter': {}
            },
            logger: logger,
            query: {},
        };
        _.set(req, 'session.user', user);
        jdsResponse = {
            patientIcn: '10108V420871',
            data: {
                items: []
            }
        };
    });

    it('Aborts when vix-subsystem is disabled', function (done) {
        vixSubsystem._vixServerConfigured = false;
        _.set(req, 'interceptorResults.patientIdentifiers.siteDfn', 'SITE;3');
        vixSubsystem.addImagesToDocument(req, jdsResponse, function(error, innerJdsResponse) {
            vixSubsystem._vixServerConfigured = true;
            expect(error).to.eql({ error: 'vix is not configured' });
            done();
        });
    });

    function tryWithPidInQueryAndBody(pid, description, test, skipOrOnly) {
        if (skipOrOnly) {
            describe('(query pid)', function() {
                beforeEach(function() {
                    _.set(req, 'interceptorResults.patientIdentifiers.siteDfn', pid);
                });
                it[skipOrOnly](description, test);
            });
            describe('(body pid)', function() {
                beforeEach(function() {
                    _.set(req, 'interceptorResults.patientIdentifiers.siteDfn', pid);
                });
                it[skipOrOnly](description, test);
            });
        } else {
            describe('(query pid)', function() {
                beforeEach(function() {
                    _.set(req, 'interceptorResults.patientIdentifiers.siteDfn', pid);
                });
                it(description, test);
            });
            describe('(body pid)', function() {
                beforeEach(function() {
                    _.set(req, 'interceptorResults.patientIdentifiers.siteDfn', pid);
                });
                it(description, test);
            });
        }
    }

    tryWithPidInQueryAndBody.only = _.bind(tryWithPidInQueryAndBody, this, _, _, _, 'only');
    tryWithPidInQueryAndBody.skip = _.bind(tryWithPidInQueryAndBody, this, _, _, _, 'skip');

    tryWithPidInQueryAndBody('1234', 'skips enrichment with invalid icn/pid', function() {
        _.set(req, 'interceptorResults.patientIdentifiers.icn', '1234');
        _.set(req, 'interceptorResults.patientIdentifiers.pid', '1234');
        vixSubsystem.addImagesToDocument(req, jdsResponse, function(error, innerJdsResponse) {
            expect(error).to.eql('icn and site;dfn are not valid');
            expect(req.logger.error.calledWithMatch({error: 'icn and site;dfn are not valid - returning error'})).to.be.true();
        });
    });

    tryWithPidInQueryAndBody('SITE;3', 'does nothing with empty response from VIX', function() {
        sinon.stub(http, 'post').callsFake(function(config, callback) {
            callback(null, {body: {studies: []}});
        });
        vixSubsystem.addImagesToDocument(req, jdsResponse, function(error, innerJdsResponse) {
            expect(innerJdsResponse).to.eql(jdsResponse);
            expect(error).to.be.null();
            expect(req.logger.info.calledWithMatch('empty response from VIX')).to.be.true();
        });
    });

    tryWithPidInQueryAndBody('SITE;3', 'adds properties to records that have associated images', function() {
        sinon.stub(http, 'post').callsFake(function(config, callback) {
            callback(null, {body: {studies: [{
                    localId: 1
                }, {
                    localId: 2,
                    category: 'RA',
                    hasImages: true,
                    contextId: 'RPT^CPRS^3^RA^2^^^^^^^^1'
                }, {
                    localId: 3,
                    hasImages: true,
                    contextId: 'RPT^CPRS^3^TIU^3^^^^^^^^1'
                }, {
                    localId: 4,
                    facilityName: 'DOD',
                    thumbnails: [],
                    viewerUrl: '',
                    detailsUrl: '',
                    studyId: '',
                    contextId: 'RPT^CPRS^3^TIU^4^^DOD^^^^^^0',
                    imageCount: 2
                }
            ]}});
        });
        var jdsData = _.cloneDeep(jdsResponse);
        jdsData.data.items = [{
                localId: 1
            }, {
                localId: 2,
                category: 'RA',
                hasImages: true
            }, {
                localId: 3,
                hasImages: true
            }, {
                localId: 4,
                facilityName: 'DOD'
            }];
        vixSubsystem.addImagesToDocument(req, jdsData, function(error, innerJdsResponse) {
            expect(innerJdsResponse.data.items).to.eql([{
                    localId: 1
                }, {
                    localId: 2,
                    category: 'RA',
                    hasImages: true,
                    contextId: 'RPT^CPRS^3^RA^2^^^^^^^^1'
                }, {
                    localId: 3,
                    hasImages: true,
                    contextId: 'RPT^CPRS^3^TIU^3^^^^^^^^1'
                }, {
                    localId: 4,
                    facilityName: 'DOD',
                    thumbnails: [undefined],
                    viewerUrl: '',
                    detailsUrl: '',
                    studyId: '',
                    contextId: 'RPT^CPRS^3^TIU^4^^DOD^^^^^^0',
                    hasImages: true,
                    imageCount: 2
                }
            ]);
            expect(req.logger.debug.calledWith({
                postLoopVixBody: {
                    studies: [{
                        localId: 1
                    }, {
                        localId: 2,
                        category: 'RA',
                        hasImages: true,
                        contextId: 'RPT^CPRS^3^RA^2^^^^^^^^1'
                    }, {
                        localId: 3,
                        hasImages: true,
                        contextId: 'RPT^CPRS^3^TIU^3^^^^^^^^1'
                    }]
                }
            })).to.be.true();
        });
    });

    tryWithPidInQueryAndBody('SITE;3', 'does not add properties to records that have no associated images', function() {
        var jdsData = _.cloneDeep(jdsResponse);
        jdsData.data.items = [{
                localId: 1,
                category: 'RA',
                facilityCode: '500',
                facilityName: 'PANORAMA',
                kind: 'Imaging',
                name: 'CT SCAN'
            }, {
                localId: 2,
                category: 'RA',
                facilityCode: '500',
                facilityName: 'PANORAMA',
                kind: 'Imaging',
                name: 'CHEST SCAN'
            }, {
                localId: 3,
                facilityCode: '500',
                facilityName: 'PANORAMA',
                kind: 'Advance Directive',
                name: 'CT SCAN'
            }, {
                localId: 4,
                facilityCode: '507',
                facilityName: 'KODAK',
                kind: 'Crisis Note',
                name: 'CRISIS NOTE'
            }];
        vixSubsystem.addImagesToDocument(req, jdsData, function(error, innerJdsResponse) {
            expect(innerJdsResponse.data.items).to.eql([
                {
                    localId: 1,
                    category: 'RA',
                    facilityCode: '500',
                    facilityName: 'PANORAMA',
                    kind: 'Imaging',
                    name: 'CT SCAN'
                }, { localId: 2,
                    category: 'RA',
                    facilityCode: '500',
                    facilityName: 'PANORAMA',
                    kind: 'Imaging',
                    name: 'CHEST SCAN'
                }, { localId: 3,
                    facilityCode: '500',
                    facilityName: 'PANORAMA',
                    kind: 'Advance Directive',
                    name: 'CT SCAN'
                }, {
                    localId: 4,
                    facilityCode: '507',
                    facilityName: 'KODAK',
                    kind: 'Crisis Note',
                    name: 'CRISIS NOTE'
                }
            ]);
        });
    });

    tryWithPidInQueryAndBody('SITE;3', 'does nothing when vix is unavailable', function() {
        sinon.stub(vixSubsystem, '_getQueryConfig').callsFake(function(appConfig, logger, query) {
            return null;
        });
        vixSubsystem.addImagesToDocument(req, jdsResponse, function(error, innerJdsResponse) {
            expect(req.logger.error.calledWithMatch({error: {error: 'vix is not configured'}}));
            expect(error).to.eql({ error: 'vix is not configured' });
            expect(innerJdsResponse).to.eql(jdsResponse);
        });
    });
});

describe('vix-subsystem.getImagesForDocument', function() {
    var req;

    var singleVixResponse = {
        body: {
            studies: [{
                contextId: 'RPT^CPRS^3^RA^6839398.7969-1^86^CAMP MASTER^^^^^^1',
                externalContextId: 'RA-661',
                groupIEN: '1660',
                patientICN: '10108V420871',
                siteNumber: '500',
                detailsUrl: 'http://54.235.252.102:9911/vix/viewer/studydetails?ContextId=RPT%5eCPRS%5e3%5eRA%5e6839398.7969-1%5e86%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108V420871&SecurityToken=MjAxNy0wMi0xM1QwNTowMDowMC4wMDAwMDAwWnx0RkM4SDRreHl0d1FfTHgxZjJNOGZmQ2hHY2pJUS1hTmVmb0VrdlJTYlFPU1N0c21GZnpKXzloZWJzaTNIcDZwbkF2MnZOR2VEYXlub3VpemJUaVpsNTNPUjMtaU5ucXpKZDlhS2F5c3k2OD18M2JjMmVhM2QtNjYyMC00MWYzLWJkNjYtOTcwMDY0NzFmZDMzfGhSdm14QktUeGlzWlVTWTBEblJpUWZjb0lVNUpiUVhlSDRXRkEvK1RxSGkxSnQ3clFSZnE4Z3Y3bDEwVFk4V3FuOFN6VXJlYXU1bXBoK3VPTkVXd3ZDWW4rRlpZSzNLTUdYdGRSNFlOekpNPQ%3d%3d&AuthSiteNumber=500',
                viewerUrl: 'http://54.235.66.32:9911/vix/viewer/loader?ContextId=RPT%5eCPRS%5e3%5eRA%5e6839398.7969-1%5e86%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108V420871&SecurityToken=MjAxNy0wMi0xM1QwNTowMDowMC4wMDAwMDAwWnx0RkM4SDRreHl0d1FfTHgxZjJNOGZmQ2hHY2pJUS1hTmVmb0VrdlJTYlFPU1N0c21GZnpKXzloZWJzaTNIcDZwbkF2MnZOR2VEYXlub3VpemJUaVpsNTNPUjMtaU5ucXpKZDlhS2F5c3k2OD18M2JjMmVhM2QtNjYyMC00MWYzLWJkNjYtOTcwMDY0NzFmZDMzfGhSdm14QktUeGlzWlVTWTBEblJpUWZjb0lVNUpiUVhlSDRXRkEvK1RxSGkxSnQ3clFSZnE4Z3Y3bDEwVFk4V3FuOFN6VXJlYXU1bXBoK3VPTkVXd3ZDWW4rRlpZSzNLTUdYdGRSNFlOekpNPQ%3d%3d&AuthSiteNumber=500',
                thumbnailUrl: 'http://54.235.252.102:9911/vix/viewer/thumbnails?ContextId=aW1hZ2VVUk49dXJuOnZhaW1hZ2U6NTAwLTE2NjEtMTY2MC0xMDEwOFY0MjA4NzEmaW1hZ2VRdWFsaXR5PTIwJmNvbnRlbnRUeXBlPWltYWdlL2pwZWcsaW1hZ2UveC10YXJnYSxpbWFnZS9ibXAsKi8q&SecurityToken=MjAxNy0wMi0xM1QwNTowMDowMC4wMDAwMDAwWnx0RkM4SDRreHl0d1FfTHgxZjJNOGZmQ2hHY2pJUS1hTmVmb0VrdlJTYlFPU1N0c21GZnpKXzloZWJzaTNIcDZwbkF2MnZOR2VEYXlub3VpemJUaVpsNTNPUjMtaU5ucXpKZDlhS2F5c3k2OD18M2JjMmVhM2QtNjYyMC00MWYzLWJkNjYtOTcwMDY0NzFmZDMzfGhSdm14QktUeGlzWlVTWTBEblJpUWZjb0lVNUpiUVhlSDRXRkEvK1RxSGkxSnQ3clFSZnE4Z3Y3bDEwVFk4V3FuOFN6VXJlYXU1bXBoK3VPTkVXd3ZDWW4rRlpZSzNLTUdYdGRSNFlOekpNPQ%3d%3d&AuthSiteNumber=500',
                statusCode: '200',
                imageCount: 6,
                studyDescription: 'ECHO EXAM OF HEART',
                studyDate: '2016-06-01T20:30:00-04:00',
                acquisitionDate: '2016-06-13T20:16:00-04:00',
                studyId: 'urn:vastudy:500-1660-10108V420871',
                siteName: 'CAMP MASTER',
                event: 'ULTRASOUND',
                package: 'RAD',
                type: 'IMAGE',
                origin: 'VA',
                studyType: 'IMAGE',
                procedureDescription: 'RAD US',
                specialtyDescription: 'RADIOLOGY',
                studyClass: 'CLIN',
                isSensitive: false
            }],
            patientICN: '10108V420871',
            siteNumber: '500',
            authSiteNumber: '500'
        }
    };

    beforeEach(function() {
        req = {
            app: app,
            body: {},
            interceptorResults: {
                'patientIdentifiers': {
                    'icn': '10108V420871',
                    'dfn': '3',
                    'siteDfn': 'SITE;3'
                },
                'jdsFilter': {}
            },
            logger: logger,
            query: {
                siteNumber: '500',
                contextId: 'RPT^CPRS^3^RA^6839398.7969-1^86^CAMP MASTER^^^^^^1'
            },
        };
        _.set(req, 'session.user', user);
    });

    it('Aborts when vix-subsystem is disabled', function (done) {
        vixSubsystem._vixServerConfigured = false;
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            vixSubsystem._vixServerConfigured = true;
            expect(error).to.eql({ error: 'vix is not configured' });
            done();
        });
    });

    it('Should return an error with an invalid icn or pid', function() {
        var reqClone = _.cloneDeep(req);
        reqClone.interceptorResults.patientIdentifiers.icn = 'bad';
        reqClone.interceptorResults.patientIdentifiers.siteDfn = 'bad';
        vixSubsystem.getImagesForDocument(reqClone, function(error, response) {
            expect(error).to.eql('icn and site;dfn are not valid');
            expect(reqClone.logger.error.calledWithMatch({error: 'icn and site;dfn are not valid - returning error'})).to.be.true();
        });
    });

    it('Should return an error with an empty siteNumber', function() {
        var reqClone = _.cloneDeep(req);
        reqClone.query.siteNumber = '';
        vixSubsystem.getImagesForDocument(reqClone, function(error, response) {
            expect(error).to.eql('siteNumber is nullish');
            expect(reqClone.logger.error.calledWithMatch({error: 'siteNumber is nullish - returning error'})).to.be.true();
        });
    });

    it('Should return an error with an empty contextId', function() {
        var reqClone = _.cloneDeep(req);
        reqClone.query.contextId = '';
        vixSubsystem.getImagesForDocument(reqClone, function(error, response) {
            expect(error).to.eql('contextId is nullish');
            expect(reqClone.logger.error.calledWithMatch({error: 'contextId is nullish - returning error'})).to.be.true();
        });
    });

    it('Should return an error because the VIX is not configured', function() {
        sinon.stub(vixSubsystem, '_getQueryConfig').callsFake(function(appConfig, logger, query) {
            return null;
        });
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            expect(error).to.eql({ error: 'vix is not configured' });
        });
    });

    it('Should return an error if there is no VIX body', function() {
        sinon.stub(vixSubsystem, '_getStudyQuery').callsFake(function(req, bseToken, query, callback) {
            return callback(null, null);
        });
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            expect(error).not.to.be.undefined();
            expect(response).to.be.undefined();
            expect(req.logger.error.calledWithMatch({error: 'Empty response from VIX'})).to.be.true();
        });
    });

    it('Should return an error if the VIX Body is empty', function() {
        sinon.stub(vixSubsystem, '_getStudyQuery').callsFake(function(req, bseToken, query, callback) {
            return callback(null, {});
        });
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            expect(error).not.to.be.undefined();
            expect(response).to.be.undefined();
            expect(req.logger.error.calledWithMatch({error: 'Empty response from VIX'})).to.be.true();
        });
    });

    it('Should return an empty items array if the VIX Body.studies property is empty', function() {
        sinon.stub(vixSubsystem, '_getStudyQuery').callsFake(function(req, bseToken, query, callback) {
            return callback(null, {studies: []});
        });
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            expect(error).to.be.null();
            expect(response).not.to.be.undefined();
            expect(response.studies).to.eql(undefined);
            expect(response.items).to.eql([]);
        });
    });

    it('Should return the studies in the items array and not have a studies array', function() {
        sinon.stub(http, 'post').callsFake(function(config, callback) {
            return callback(null, singleVixResponse);
        });
        vixSubsystem.getImagesForDocument(req, function(error, response) {
            expect(response.items).to.not.be.empty();
            expect(response.studies).to.eql(undefined);
        });
    });
});

describe('vix-subsystem._waterfallGetToken', function() {
    var req;
    req = {
        logger: logger
    };
    it('Should error if checkBseToken returns an RPC error', function() {
        sinon.stub(vixSubsystem, '_checkBseToken').callsFake(function(req, callback) {
            return callback('Simulated RPC Error');
        });
        vixSubsystem._waterfallGetToken(req, function(error, response) {
            expect(req.logger.debug.calledWith({error: 'Simulated RPC Error'}));
            expect(error).to.eql('Simulated RPC Error');
        });
    });

    it('Should return a token after _saveBseToken tries to save it', function() {
        sinon.stub(vixSubsystem, '_checkBseToken').callsFake(function(req, callback) {
            return callback(null, 'token');
        });
        vixSubsystem._waterfallGetToken(req, function(error, response) {
            expect(response).to.eql('token');
        });
    });
});

describe('vix-subsystem._getStudyQuery', function() {
    var req, bseToken, query;
    req = {
        logger: logger,
        app: {
            config: {}
        },
        session: {
            user: {}
        }
    };
    it('Should return an error if the config is not setup for the VIX', function() {
        sinon.stub(vixSubsystem, '_getQueryConfig').callsFake(function(appConfig, logger, query) {
            return null;
        });
        vixSubsystem._getStudyQuery(req, bseToken, query, function(error, response) {
            expect(error).to.eql({error: 'vix is not configured'});
        });
    });

    it('Should return the error sent back from the VIX', function() {
        sinon.stub(vixSubsystem, '_getQueryConfig').callsFake(function(appConfig, logger, query) {
            return {};
        });
        sinon.stub(http, 'post').callsFake(function(config, callback) {
            return callback('Simulated VIX error');
        });
        vixSubsystem._getStudyQuery(req, bseToken, query, function(error, response) {
            expect(error).to.eql('Simulated VIX error');
        });
    });

    it('Should return the body of the VIX response', function() {
        sinon.stub(vixSubsystem, '_getQueryConfig').callsFake(function(appConfig, logger, query) {
            return {};
        });
        sinon.stub(http, 'post').callsFake(function(config, callback) {
            return callback(null, {body: 'Simulated VIX body'});
        });
        vixSubsystem._getStudyQuery(req, bseToken, query, function(error, response) {
            expect(response).to.eql('Simulated VIX body');
        });
    });
});

describe('vix-subsystem._getQueryConfig', function() {
    var appConfig, query;
    appConfig = {};
    appConfig.vix = app.config.vix;
    query = 'studyQuery';
    it('Should return null if the subsystem is not initialized', function() {
        vixSubsystem._vixServerConfigured = false;
        var response = vixSubsystem._getQueryConfig(appConfig, logger, query);
        expect(response).to.eql(null);
        vixSubsystem._vixServerConfigured = true;
    });

    it('Should return a query config Node http can use to talk to the VIX', function() {
        var response = vixSubsystem._getQueryConfig(appConfig, logger, query);
        expect(response.baseUrl).to.eql(app.config.vix.baseUrl);
    });
});

describe('vix-subsystem._convertCategory', function() {
    it('Should make an empty category a TIU', function() {
        var response = vixSubsystem._convertCategory('');
        expect(response).to.eql('TIU');
    });

    it('Should keep a RA category the same', function() {
        var response = vixSubsystem._convertCategory('RA');
        expect(response).to.eql('RA');
    });

    //TODO expand to cover all categories covered by TIU
    it('Should make a LR category a TIU', function() {
        var response = vixSubsystem._convertCategory('LR');
        expect(response).to.eql('TIU');
    });
});

describe('vix-subsystem._buildContextId', function() {
    var req, record;
    //req.interceptorResults.patientIdentifiers.dfn;
    req = {
        interceptorResults: {
            patientIdentifiers: {
                dfn: '3'
            }
        }
    };
    it('Should create a proper RA contextId', function() {
        record = {
            hasImages: true,
            category: 'RA',
            localId: '6839398.7969-1',
            case: '86',
            facilityName: 'CAMP MASTERS'
        };
        var response = vixSubsystem._buildContextId(req, record);
        expect(response).to.eql('RPT^CPRS^3^RA^6839398.7969-1^86^CAMP MASTERS^^^^^^1');
    });

    it('Should create a proper TIU contextId', function() {
        record = {
            hasImages: true,
            category: 'TIU',
            localId: '12349',
            case: '86',
            facilityName: 'CAMP MASTERS'
        };
        var response = vixSubsystem._buildContextId(req, record);
        expect(response).to.eql('RPT^CPRS^3^TIU^12349^86^CAMP MASTERS^^^^^^1');
    });

    it('Should create a proper DOD contextId', function() {
        record = {
            hasImages: false,
            category: 'DOD',
            localId: '1000000648',
            case: '',
            facilityName: 'DOD'
        };
        var response = vixSubsystem._buildContextId(req, record);
        expect(response).to.eql('RPT^CPRS^3^DOD^1000000648^^DOD^^^^^^0');
    });
});

describe('vix-subsystem._checkBseToken', function() {
    var req;
    req = {
        logger: logger,
        session: {
            user: {
                vixBseToken: '~1XWBAS1210-215869_2',
                vixBseTokenExpires: moment().add(22, 'hours').format('X')
            }
        }
    };
    it('Should return an error if the session object is empty or malformed.', function() {
        var regenStub = sinon.stub(vixSubsystem, '_regenerateBseToken').callsFake(function(req, callback) {
            return;
        });
        var badReq = {
            logger: logger
        };
        vixSubsystem._checkBseToken(badReq, function(error, response) {
            expect(req.logger.error.calledWithMatch({location: 'vix-subsystem._saveBseToken', error: 'User object is empty'}));
            expect(regenStub).to.be.called();
            expect(error).to.eql('User object is empty');
        });
    });

    it('Should try to regenerate the token if there is a problem with the token or token expiration keys', function() {
        var regenStub = sinon.stub(vixSubsystem, '_regenerateBseToken').callsFake(function(req, callback) {
            return;
        });
        var modReq = _.cloneDeep(req);
        modReq.session.user.vixBseToken = null;
        vixSubsystem._checkBseToken(modReq, function(error, response) {
            expect(modReq.logger.debug.calledWith({location: 'vix-subsystem._checkBseToken', error: 'There is a problem with token or token expiration'})).to.true();
            expect(regenStub).to.be.called();
        });
    });

    it('Should try to regenerate the token if the token is expired', function() {
        var regenStub = sinon.stub(vixSubsystem, '_regenerateBseToken').callsFake(function(req, callback) {
            return;
        });
        var modReq = _.cloneDeep(req);
        modReq.session.user.vixBseTokenExpires = moment().subtract(1, 'hours').format('X');
        vixSubsystem._checkBseToken(modReq, function(error, response) {
            expect(modReq.logger.debug.calledWith({location: 'vix-subsystem._checkBseToken', error: 'BSE token has expired'})).to.true();
            expect(regenStub).to.be.called();
        });
    });

    it('Should return the token', function() {
        vixSubsystem._checkBseToken(req, function(error, response) {
            expect(response).to.eql('~1XWBAS1210-215869_2');
        });
    });
});

describe('vix-subsystem._regenerateBseToken', function() {
    var req;
    req = {
        logger: logger
    };
    it('Should return an error if there is an error with the RPC call', function() {
        sinon.stub(vixSubsystem, '_getBseToken').callsFake(function(req, callback) {
            return callback('error');
        });
        vixSubsystem._regenerateBseToken(req, function(error, response) {
            expect(error).to.eql('error');
        });
    });

    it('Should return the token', function() {
        sinon.stub(vixSubsystem, '_getBseToken').callsFake(function(req, callback) {
            return callback(null, 'token');
        });
        sinon.stub(vixSubsystem, '_saveBseToken').callsFake(function(req, token, callback) {
            return callback(null, 'token');
        });
        vixSubsystem._regenerateBseToken(req, function(error, response) {
            expect(response).to.eql('token');
        });
    });
});

describe('vix-subsystem._getBseToken', function() {
    var req = {
        app: app,
        logger: logger,
        session: {
            user: {
                accessCode: app.config.vistaSites['SITE'].accessCode,
                verifyCode: app.config.vistaSites['SITE'].verifyCode,
                division: '500',
                site: 'SITE'
            }
        }
    };
    it('Should return an error if the site is not set', function() {
        var badReq = _.cloneDeep(req);
        badReq.session.user.site = 'bad';
        vixSubsystem._getBseToken(badReq, function(error, response) {
            expect(error).to.eql({error: 'user site not configured'});
        });
    });

    it('Should return an error if the RPC returns an error', function() {
        sinon.stub(RpcClient, 'callRpc').callsFake(function(logger, config, rpcName, parameters, callback) {
            return callback('rpcError');
        });
        vixSubsystem._getBseToken(req, function(error, response) {
            expect(error).to.eql('rpcError');
        });
    });

    it('Should return the token', function() {
        sinon.stub(RpcClient, 'callRpc').callsFake(function(logger, config, rpcName, parameters, callback) {
            return callback(null, 'rpcData');
        });
        vixSubsystem._getBseToken(req, function(error, response) {
            expect(response).to.eql('rpcData');
        });
    });
});

describe('vix-subsystem._saveBseToken', function() {
    var req, token;
    req = {
        logger: logger,
        session: {
            user: {
                uid: 'urn:va:user:SITE:10000000270'
            }
        }
    };
    token = '~1XWBAS1210-215869_2';

    it('Should return an error if the token is null', function() {
        vixSubsystem._saveBseToken(req, '', function(error, response) {
            expect(error).to.eql('Token not provided from VistA');
        });
    });

    it('Should log an error but return the token if the uid is not set', function() {
        var badReq = {
            logger: logger
        };
        vixSubsystem._saveBseToken(badReq, token, function(error, response) {
            expect(error).to.eql('User object is empty');
            expect(req.logger.error.calledWith({location: 'vix-subsystem._saveBseToken', error: 'User object is empty'}));
        });
    });

    it('Should return the token', function() {
        vixSubsystem._saveBseToken(req, token, function(error, response) {
            expect(response).to.eql('~1XWBAS1210-215869_2');
        });
    });
});
