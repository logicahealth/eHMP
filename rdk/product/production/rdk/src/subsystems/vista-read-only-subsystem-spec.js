'use strict';

var vistaReadOnlySubsystem = require('./vista-read-only-subsystem');
var RpcClient = require('vista-js').RpcClient;
var logger = sinon.stub(require('bunyan').createLogger({name: 'vista-read-only-subsystem'}));
var vistaConfig = {};
var req = {
    app: {
        config: {
            rpcConfig: {
                context: 'ORQOR DETAIL',
                siteHash: '9E7A'
            },
            vistaSites: {
                '9E7A': {
                    name: 'PANORAMA',
                    division: '500',
                    host: 'IP_ADDRESS',
                    port: 9210,
                    production: false,
                    accessCode: 'PW',
                    verifyCode: 'PW',
                    localIP: 'IPADDRES',
                    localAddress: 'localhost'
                },
                'C877': {
                    name: 'KODAK',
                    division: '500',
                    host: 'IP_ADDRESS',
                    port: 9210,
                    production: false,
                    accessCode: 'PW',
                    verifyCode: 'PW'
                }
            }
        }
    },
    logger: logger,
    _rpcSystemClients: {}
};

describe('vista-read-only-subsystem', function() {

    it('Tests that get RPC system client returns the client', function(done) {

        sinon.stub(RpcClient.prototype, 'connect', function(callback) {
            callback();
        });

        vistaReadOnlySubsystem.getRpcSystemClient(req, '9E7A', function(err, client) {
            expect(err).to.be.null();
            expect(client).not.to.be.null();
            done();

        });
    });

    it('Tests that close all RPC system clients close the clients', function(done) {
        req._rpcSystemClients['9E7A'] = RpcClient.create(logger, vistaConfig);
        vistaReadOnlySubsystem.closeAllRpcSystemClients(req);
        expect(req._rpcSystemClients).eql({});
        done();
    });

    it('Tests that get subsystem config returns correct config', function(done) {
        var config = vistaReadOnlySubsystem.getSubsystemConfig();
        expect(config).not.to.be.null();
        expect(config.healthcheck).not.to.be.undefined();
        expect(config.healthcheck.name).eql('vista-read-only-subsystem');
        done();
    });

});
