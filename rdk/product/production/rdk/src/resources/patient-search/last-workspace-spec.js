'use strict';

var lastWorkspace = require('./last-workspace');
var httpMocks = require('node-mocks-http');
var req;
var res;

describe('last-workspace', function() {
    var spyStatus;

    beforeEach(function() {
        req = {
            session: {
                user: {
                    site: 'SITE',
                    uid: '10000000270',
                    duz: {
                        'SITE': '10000000270',
                    },
                }
            },
            logger: sinon.stub(require('bunyan').createLogger({
                name: 'get-last-workspace'
            })),
            parameters: {
                pid: 'SITE;10000000270'
            }
        };
        req.param = function(param) {
            return req.parameters[param] || undefined;
        };
        req.app = {};
        req.app.config = {};
        req.app.config.generalPurposeJdsServer = {
            host: 'dummy',
            port: 0
        };

        res = httpMocks.createResponse();
        res.rdkSend = sinon.spy();
        spyStatus = sinon.spy(res, 'status');
    });
    afterEach(function() {
        spyStatus.reset();
    });

    describe('getLastWorkspace', function() {
        it('lastWorkspace no pid', function() {
            delete req.parameters.pid;
            lastWorkspace.getLastWorkspace(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Missing pid')).to.be.true();
        });

        it('lastWorkspace no uid', function() {
            delete req.session.user.uid;
            lastWorkspace.getLastWorkspace(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Missing uid')).to.be.true();
        });

        it('lastWorkspace invalid pid', function() {
            req.parameters.pid = 'hdhjdiu163hfd';
            lastWorkspace.getLastWorkspace(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Invalid Pid. Please pass either ICN or Primary Site ID.')).to.be.true();
        });
    });
});
