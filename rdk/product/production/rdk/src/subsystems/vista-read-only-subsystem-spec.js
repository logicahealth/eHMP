'use strict';

var vistaReadOnlySubsystem = require('./vista-read-only-subsystem');
var RpcClient = require('vista-js').RpcClient;
var logger = sinon.stub(require('bunyan').createLogger({name: 'vista-read-only-subsystem'}));
var vistaConfig = {};
var req = {
    vistaConfig: {
      division: '500'
    },
    app: {
        config: {
            rpcConfig: {
                context: 'ORQOR DETAIL',
                siteHash: '9E7A'
            },
            vistaSites: {
                '9E7A': {
                    division: [{
                        id: '500',
                        name: 'PANORAMA'
                    }],
                    host: '10.2.2.101',
                    port: 9210,
                    production: false,
                    accessCode: 'pu1234',
                    verifyCode: 'pu1234!!',
                    localIP: '10.2.2.1',
                    localAddress: 'localhost'
                },
                'C877': {
                    division: [{
                        id: '500',
                        name: 'KODAK'
                    }],
                    host: '10.2.2.102',
                    port: 9210,
                    production: false,
                    accessCode: 'pu1234',
                    verifyCode: 'pu1234!!'
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

    it('Tests that get readonly vista config returns correct config', function(done) {
        var config = vistaReadOnlySubsystem._getReadOnlyVistaConfig(req, '9E7A');
        expect(config).not.to.be.null();

        //division is simple value
        expect(config.division).eql('500');
        done();
    });
});
