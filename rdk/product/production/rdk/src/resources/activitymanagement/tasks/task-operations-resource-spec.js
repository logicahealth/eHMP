'use strict';

var buildTasksResponse = require('./task-operations-resource').buildTasksResponse;
var checkEarliestDate = require('./task-operations-resource').checkEarliestDate;
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var moment = require('moment');
var bunyan = require('bunyan');
var taskOperationsResource = require('./task-operations-resource');
var pepSubsystem = require('../../../subsystems/pep/pep-subsystem');
var _ = require('lodash');
var logger = _.noop;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');

var dummyLogger = sinon.stub(bunyan.createLogger({
    name: 'task-operations-resource'
}));

var dummyRequest = {
    logger: dummyLogger,
    app: {
        config: {
            jbpm: {
                activityDatabase: 'dummydb'
            },
            jdsServer: {
                baseUrl: 'https://fakejds'
            },
            oracledb: {
                activityDatabase: 'dummydb'
            }
        }
    },
    session: {
        user: {
            division: '9999'
        }
    },
    body: {
        context: ''
    }
};

describe('Task Operations Resource', function() {
    describe('Tasks response generator', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                callback(null);
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('doesn\'t crash if passed null parameters', function(done) {
            buildTasksResponse(null, null, dummyRequest, null, null, function(formattedResponse) {}, function(err) {
                expect(err).to.be.falsy();
                done();
            });
        });
    });

    describe('checkEarliestDate', function() {
        it('returns true if beforeEarliestDate is true', function() {
            expect(checkEarliestDate(true, 'it doesnt matter what earliestDate is passed')).to.be.true();
        });

        it('returns true if earliestDate is today and not beforeEarliestDate', function() {
            var today = new Date();
            expect(checkEarliestDate(false, new Date(today.getFullYear(), today.getMonth(), today.getDate()))).to.be.true();
        });

        it('returns true if earliestDate is the last MS of today and not beforeEarliestDate', function() {
            var today = new Date();
            expect(checkEarliestDate(false, new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999))).to.be.true();
        });

        it('returns true if earliestDate is yesterday and not beforeEarliestDate', function() {
            var today = new Date();
            var impreciseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var yesterday = moment(impreciseToday).subtract(1, 'days').toDate();
            expect(checkEarliestDate(false, yesterday)).to.be.true();
        });

        it('returns true if earliestDate is last MS of yesterday and not beforeEarliestDate', function() {
            var today = new Date();
            var impreciseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            var yesterday = moment(impreciseToday).subtract(1, 'days').toDate();
            expect(checkEarliestDate(false, yesterday)).to.be.true();
        });

        it('returns false if earliestDate is tomorrow and not beforeEarliestDate', function() {
            var today = new Date();
            var impreciseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var tomorrow = moment(impreciseToday).add(1, 'days').toDate();
            expect(checkEarliestDate(false, tomorrow)).to.be.false();
        });

        it('returns false if earliestDate is the first MS of tomorrow and not beforeEarliestDate', function() {
            var today = new Date();
            var impreciseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            var tomorrow = moment(impreciseToday).add(1, 'days').toDate();
            expect(checkEarliestDate(false, tomorrow)).to.be.false();
        });
    });

    describe('buildTasksResponse', function() {
        it('An error is logged when the facility does not have a matching stationnumber', function() {
            var mockTaskList = [{
                TASKINSTANCEID: 1,
                PATIENTASSIGNMENT: 0,
                TEAM: 16
            }];

            var mockParameters = {};

            sinon.stub(activityDb, 'doExecuteProcWithParams', function(req, config, procQuery, procParams, callback) {
                var result = [{
                    STATIONNUMBER: '9999'
                }];
                callback(null, result);
            });

            var errors = [];
            dummyRequest.logger.error = function(err) {
                errors.push(err);
            };

            buildTasksResponse(null, mockTaskList, dummyRequest, mockParameters, null, function(formattedResponse) {}, function(err) {
                expect(err).to.be.falsy();
                expect(errors[0]).to.be.equal('Facility code matching the station number 9999 cannot be found.');
            });
        });

        it('An error is not logged when the facility does have a matching stationnumber', function() {
            var mockTaskList = [{
                TASKINSTANCEID: 1,
                PATIENTASSIGNMENT: 0,
                TEAM: 16
            }];

            var mockParameters = {};

            sinon.stub(activityDb, 'doExecuteProcWithParams', function(req, config, procQuery, procParams, callback) {
                var result = [{
                    STATIONNUMBER: '500'
                }];
                callback(null, result);
            });

            dummyRequest.session.user.division = '500';

            var errors = [];
            dummyRequest.logger.error = function(err) {
                errors.push(err);
            };

            buildTasksResponse(null, mockTaskList, dummyRequest, mockParameters, null, function(formattedResponse) {}, function(err) {
                expect(err).to.be.falsy();
                expect(errors.length).to.be.equal(0);
            });
        });
    });
});

describe('Test task-operations-resource - hasPermissions:', function() {
    var pep;
    beforeEach(function() {
        pep = sinon.stub(pepSubsystem, 'execute');
    });
    afterEach(function() {
        pep.restore();
    });


    it('Should return true if the task has undefined permissions', function() {
        var task = {
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the task has no permissions', function() {
        var task = {
            permissions: {},
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the task has no required ehmp permissions and the user has no specified permissions', function() {
        var task = {
            permissions: {
                ehmp: []
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the task has no required ehmp permissions and the user has specified permissions', function() {
        var task = {
            permissions: {
                ehmp: []
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request',
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.true();
        });
    });

    it('Should return true if user has the permission required by the task', function() {
        var task = {
            permissions: {
                ehmp: ['edit-coordination-request']
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request',
                        'edit-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.true();
        });
    });

    it('Should return false if user does not have the permission required by the task', function() {
        var task = {
            permissions: {
                ehmp: ['edit-coordination-request']
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback({
                message: 'The user does not have all the required permissions'
            });
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.false();
        });
    });

    it('Should return false if user does not have all the permissions required by the task', function() {
        var task = {
            permissions: {
                ehmp: [
                    'add-coordination-request',
                    'edit-coordination-request'
                ]
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback({
                message: 'The user does not have all the required permissions'
            });
        });
        taskOperationsResource.hasPermissions(task, req, function() {
            expect(task.hasPermissions).to.be.false();
        });
    });
});
