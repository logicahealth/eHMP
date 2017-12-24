'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var RpcClient = require('vista-js').RpcClient;
var search = require('./default-search');

describe('Default Search', function() {
    it('Vista Configuration', function() {
        var request = {
            session: {
                user: {
                    site: 'abc123',
                    accessCode: 'def456',
                    verifyCode: 'def456!!',
                    division: 'abc123'
                }
            },
            app: {
                config: {
                    rpcConfig: {
                        host: '127.0.0.1',
                        port: 'PORT'
                    },
                    vistaSites: {
                        badsite: {},
                        abc123: {
                            path: '/give/me/data',
                            division: [{
                                id: 'abc123',
                                name: 'mysite'
                            }],
                        },
                        def456: {}
                    }
                }
            }
        };
        var expected = {
            accessCode: 'def456',
            verifyCode: 'def456!!',
            siteCode: 'abc123',
            host: '127.0.0.1',
            port: 'PORT',
            path: '/give/me/data',
            division: 'abc123'
        };
        expect(search._getVistaConfig(request)).to.eql(expected);
    });

    it('returns a "No results found." message when there are no results', function(done) {
        sinon.stub(RpcClient, 'callRpc', function(logger, config, rpc, args, callback) {
            var resultList = {};
            _.set(resultList, 'data.patients', []);
            return callback(null, JSON.stringify(resultList));
        });
        var req = {};
        _.set(req, 'logger', sinon.stub(bunyan.createLogger({name: 'default-search-spec'})));
        _.set(req, 'session.user', {
            site: 'abc123',
            accessCode: 'def456',
            verifyCode: 'def456!!'
        });
        _.set(req, 'app.config', {
            jdsServer: {
                baseUrl: 'foo'
            },
            rpcConfig: {
                host: '127.0.0.1',
                port: 'PORT'
            },
            vistaSites: {
                badsite: {},
                abc123: {
                    path: '/give/me/data'
                },
                def456: {}
            }
        });
        _.set(req, 'app.subsystems.authorization.execute', function(authObj, callback) {
            var err = null;
            var result = {};
            _.set(result, 'data.items', []);
            return callback(err, result);
        });
        var res = {};
        res.status = function(status) {
            expect(status).to.equal(200);
            return this;
        };
        res.rdkSend = function(result) {
            expect(result.message).to.match(/No results found. Please make sure/);
            done();
        };

        search.getMyCPRS(req, res);
    });
});
