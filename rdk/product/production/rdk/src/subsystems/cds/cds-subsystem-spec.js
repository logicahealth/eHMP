'use strict';

var cds = require('./cds-subsystem');
var httpMocks = require('node-mocks-http');
var cdsSpecUtil = require('../../resources/cds-spec-util/cds-spec-util');
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');


    describe('CDS Subsystem Configurations Found.', function () {

        var req = buildRequest();
        cds.getSubsystemConfig(req.app, req.app.logger);

        describe('Testing CDS Configuration', function() {

            it('sets and configures cdsinvocation\'s URL correctly', function () {

                expect(cds.isCDSInvocationConfigured()).not.to.be.undefined();
                expect(cds.isCDSInvocationConfigured()).to.eql(true);

                expect(cds.getInvocationUrl()).not.to.be.undefined();
                expect(cds.getInvocationUrl()).to.eql('undefined://bar:47');
            });

            it('sets and configures mongodb\'s presence correctly', function () {

                req.app.subsystems.cds.getSubsystemConfig(req.app, req.app.logger);

                expect(cds.isCDSMongoServerConfigured()).not.to.be.undefined();
                expect(cds.isCDSMongoServerConfigured()).to.eql(true);

            });
        });
    });


    describe('MongoDB server configuration', function() {

        var db;

        it('MongoDB connection facility is functional', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            //db = cdsSpecUtil.createMockDb({
                //fill in extra items if needed for future tests, etc...
            //});

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, cdsSpecUtil.createMockDb());
            });

            var count = cds.getCDSDBCount();

            cds.getCDSDB('test1', null, function(error, dbConnection) {

                expect(cds.getCDSDBCount()).to.eql(count+1);
                expect(dbConnection.open).not.to.be.undefined();

            });

            cds.getCDSDB('test2', null, function(error, dbConnection) {

                expect(cds.getCDSDBCount()).to.eql(count+2);
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
            trace: function () {
            },
            debug: function () {
            },
            info: function () {
            },
            warn: function () {
            },
            error: function () {
            },
            fatal: function () {
            }
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
