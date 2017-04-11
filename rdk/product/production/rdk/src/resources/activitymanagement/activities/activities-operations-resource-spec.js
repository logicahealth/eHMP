'use strict';
var activityOperationsResource = require('./activities-operations-resource');
var instances = require('./all-instances-resource');
var _ = require('lodash');
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var activityDb = rdk.utils.jbpmDatabase;
var httpMocks = require('node-mocks-http');

describe('Activity Operations Resource', function() {
    var appConfig = {
        config: {
            jdsServer: {
                baseUrl: ''
            }
        }
    };

    function getLogger(){
        return {
            error: function(){

            },
            info: function(){

            },
            debug: function(){

            }
        }
    }

    describe('Testing retrieveUserAndPatientDataFromJds', function() {
        it('Should return successful when retrieving user data', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    data: {
                        items: [{
                            'name': 'USER,TEST'
                        }]
                    }
                };
                return callback(null, fakeResponse, fakeBody);
            });

            instances._retrieveUserAndPatientDataFromJds(appConfig, 'user', '9E7A;1234', getLogger(), function(error, results) {
                expect(results.data.items[0].name).to.equal('USER,TEST');
            });
        });

        it('Should return successful when retrieving patient data', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    data: {
                        items: [{
                            'fullName': 'PATIENT,TEST',
                            'last4': '8888',
                            'sensitive': false
                        }]
                    }
                };
                return callback(null, fakeResponse, fakeBody);
            });

            instances._retrieveUserAndPatientDataFromJds(appConfig, 'user', '9E7A;1234', getLogger(), function(error, results) {
                expect(results.data.items[0].fullName).to.equal('PATIENT,TEST');
                expect(results.data.items[0].last4).to.equal('8888');
                expect(results.data.items[0].sensitive).to.be.false();
            });
        });

        it('Should return empty object if data node does not exist', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    'dummyNode': false
                };
                return callback(null, fakeResponse, fakeBody);
            });

            instances._retrieveUserAndPatientDataFromJds(appConfig, 'user', '9E7A;1234', getLogger(), function(error, results) {
                expect(results.data).to.be.undefined();
            });
        });

        it('Should return err in callback if err exists', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 500
                };
                return callback({message: 'failure'}, fakeResponse);
            });

            instances._retrieveUserAndPatientDataFromJds(appConfig, 'user', '9E7A;1234', getLogger(), function(error, results) {
                expect(error.message).to.be.equal('failure');
            });
        });
    });

    describe('Testing addPatientAndUserJdsDataToActivities call', function(){
        it('Should build callback object correctly without patient data', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    data: {
                        items: []
                    }
                };

                if(options.url.indexOf('1234') > 0){
                    fakeBody.data.items.push({
                        'name': 'USER,TEST',
                        'uid': 'urn:va:user:9E7A:1234'
                    });
                } else if (options.url.indexOf('4321') > 0){
                    fakeBody.data.items.push({
                        'name': 'USER,ONE',
                        'uid': 'urn:va:user:9E7A:4321'
                    });
                }
                return callback(null, fakeResponse, fakeBody);
            });

            var activities = [{
                CREATEDBYID: '9E7A;1234',
                ASSIGNEDTOID: '9E7A;4321'            },
            {
                CREATEDBYID: '9E7A;1111'
            }];

            var req = {
                app: appConfig,
                logger: getLogger()
            };

            instances._addPatientAndUserJdsDataToActivities(activities, req, false, function(err, results){
                expect(results.users['9E7A;1234']).to.be.equal('USER,TEST');
                expect(results.users['9E7A;4321']).to.be.equal('USER,ONE');
            });
        });

        it('Should build callback object correctly with patient data', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    data: {
                        items: []
                    }
                };

                if(options.url.indexOf('1234') > 0){
                    fakeBody.data.items.push({
                        'name': 'USER,TEST',
                        'uid': 'urn:va:user:9E7A:1234'
                    });
                } else if (options.url.indexOf('4321') > 0){
                    fakeBody.data.items.push({
                        'name': 'USER,ONE',
                        'uid': 'urn:va:user:9E7A:4321'
                    });
                } else if(options.url.indexOf('55555') > 0){
                    fakeBody.data.items.push({
                        'fullName': 'PATIENT,ONE',
                        'last4': '1111',
                        'sensitive': true,
                        'uid': 'urn:va:patient:9E7A;55555',
                        'pid': '9E7A;55555'
                    });
                }
                return callback(null, fakeResponse, fakeBody);
            });

            var activities = [{
                CREATEDBYID: '9E7A;1234',
                ASSIGNEDTOID: '9E7A;1234',
                PID: '9E7A;55555'
            }];

            var req = {
                app: appConfig,
                logger: getLogger()
            };

            instances._addPatientAndUserJdsDataToActivities(activities, req, true, function(err, results){
                expect(results.users['9E7A;1234']).to.be.equal('USER,TEST');
                expect(results.patients['9E7A;55555'].fullName).to.be.equal('PATIENT,ONE');
                expect(results.patients['9E7A;55555'].last4).to.be.equal('1111');
                expect(results.patients['9E7A;55555'].sensitive).to.be.true();
            });
        });

        it('Should return err callback if JDS call fails', function(){
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var fakeResponse = {
                    statusCode: 500
                };

                var err = {
                    message: 'Call failed'
                };
                return callback(err, fakeResponse);
            });

            var activities = [{
                CREATEDBYID: '9E7A;1234',
                ASSIGNEDTOID: '9E7A;1234',
                PID: '9E7A;55555'
            }];

            var req = {
                app: appConfig,
                logger: getLogger()
            };

            instances._addPatientAndUserJdsDataToActivities(activities, req, true, function(err, results){
                expect(err.message).to.be.equal('Call failed');
                expect(results).to.be.undefined();
            });
        });
    });
});