'use strict';

var _ = require('lodash');
var clinicalObjects = require('./clinical-objects-subsystem');
var logger = sinon.stub(require('bunyan').createLogger({name: 'clinical-objects-subsystem'}));
var nock = require('nock');

var buildOrderObject = function(ehmpState, referenceId, domain, subDomain){
    return {
        pid: '9E7A;3',
        model: {
            patientUid: 'urn:va:patient:9E7A:3:3',
            authorUid: 'mx1234',
            domain: domain,
            subDomain: subDomain,
            ehmpState: ehmpState,
            visit: {
                location: 'location',
                serviceCategory: 'serviceCategory',
                dateTime: 'dateTime'
            },
            referenceId: referenceId,
            data: {
                labTestText: 'Lab Text',
                currentItemCount: 1,
                items: [{
                    field1: 'field2'
                }],
                totalItems: 1,
                updated: '201601010111'
            },
        }
    };
};

//THIS SHOULD CHANGE ONCE WE SET THE CORRECT ENDPOINT!!
var endpoint = 'clinicobj';
var testEndpoint = 'http://IP_ADDRESS:PORT';

var appConfig = {
    generalPurposeJdsServer: {
        baseUrl: 'http://IP_ADDRESS:PORT'
    }
};

describe('Clinical object order validation tests', function() {


    describe('creating a clinical object', function(done){


        it('should create a clinical object when called with the correct parameters', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'laboratory');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.object();
                expect(err).to.be.null();
                done();
            });
        });

        it('should create an error when an order has the wrong subDomain', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'something');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.undefined;
                expect(err).not.to.be.null();
                expect(err.pop()).to.be('Invalid SubDomain');
                done();
            });
        });

        it('should create a clinical object when called with the correct parameters', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            var orderModel = buildOrderObject('active', 'testReferenceID', 'ehmp-order', 'consult');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.object();
                expect(err).to.be.null();
                done();
            });
        });

        it('should create an error when active order does not have a reference id', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            var orderModel = buildOrderObject('active', '', 'ehmp-order', 'consult');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.undefined;
                expect(err).not.to.be.null();
                expect(err.pop()).to.be('Active Order should have a referenceId');
                done();
            });
        });

        it('should create an error when draft order has a reference id', function(done) {

            nock(testEndpoint).post('/' + endpoint).reply(200, {});
            var orderModel = buildOrderObject('draft', '1234', 'ehmp-order', 'consult');
            clinicalObjects.create(logger, appConfig, orderModel.model, function(err, response) {
                expect(response).to.be.an.undefined;
                expect(err).not.to.be.null();
                expect(err.pop()).to.be('Draft Order should not have a referenceId');
                done();
            });
        });

    });
});
