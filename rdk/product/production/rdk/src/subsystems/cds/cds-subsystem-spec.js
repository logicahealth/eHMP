'use strict';

var cds = require('./cds-subsystem');
var httpMocks = require('node-mocks-http');
var cdsSpecUtil = require('../../resources/cds-spec-util/cds-spec-util');
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

describe('CDS Subsystem Configurations Found.', function() {
    var req = buildRequest();
    cds.getSubsystemConfig(req.app, req.app.logger);

    describe('Testing CDS Configuration', function() {
        it('sets and configures cdsinvocation\'s URL correctly', function() {
            expect(cds.isCdsInvocationServerConfigured()).not.to.be.undefined();
            expect(cds.isCdsInvocationServerConfigured()).to.eql(true);

            expect(cds.getInvocationUrl()).not.to.be.undefined();
            expect(cds.getInvocationUrl()).to.eql('undefined://bar:47');
        });

        it('sets and configures mongodb\'s presence correctly', function() {
            req.app.subsystems.cds.getSubsystemConfig(req.app, req.app.logger);

            expect(cds.isCdsMongoServerConfigured()).not.to.be.undefined();
            expect(cds.isCdsMongoServerConfigured()).to.eql(true);
        });
    });
});


describe('MongoDB server configuration', function() {
    it('MongoDB connection facility is functional', function() {
        sinon.stub(MongoClient, 'connect').callsFake(function(string, options, callback) {
            callback(null, cdsSpecUtil.createMockDb());
        });

        var count = cds.getCDSDBCount();

        cds.getCDSDB(logger, 'test1', null, function(error, dbConnection) {
            expect(cds.getCDSDBCount()).to.eql(count + 1);
            expect(dbConnection.open).not.to.be.undefined();
        });

        cds.getCDSDB(logger, 'test2', null, function(error, dbConnection) {
            expect(cds.getCDSDBCount()).to.eql(count + 2);
            expect(dbConnection.open).not.to.be.undefined();
        });
    });
});


function buildRequest(defaults) {
    var request = _.merge(httpMocks.createRequest({
        method: 'GET',
        url: '/sync'
    }), defaults);

    var logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    };

    request.audit = {};

    request.app = {
        config: {
            cdsMongoServer: {
                host: 'foo',
                port: '42',
                options: 'ssl=true',
                username: 'cdsuser',
                password: 'abc123'
            },
            cdsInvocationServer: {
                host: 'bar',
                port: '47'
            }
        },
        subsystems: {},
        logger: logger
    };
    request.app.subsystems.cds = cds;
    return request;
}
