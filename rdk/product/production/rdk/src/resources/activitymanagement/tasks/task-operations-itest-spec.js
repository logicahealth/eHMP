'use strict';

var tasksResource = require('./task-operations-resource');
var _ = require('lodash');
var util = require('util');

var fakeRequest = {
    app: {
        config: {
            jbpm: {
                activityDatabase: {
                    'user': 'activitydbuser',
                    'password': 'activitydb$11',
                    'connectString': 'IP             /xe'
                }
            },
            jdsServer: {
                'baseUrl': 'http://IP             ',
                'urlLengthLimit': 120
            }
        }
    },
    session: {
        user: { //PW    
            duz: {
                '9E7A': '10000000270'
            },
            site: '9E7A'
        }
    },
    logger: {
        debug: function(msg, val) {
            console.log('DEBUG:');
            console.log(msg, val);
        },
        error: function(msg, val) {
            console.log('ERROR:');
            console.log(msg, val);
        },
        info: function(msg, val) {
            console.log('INFO:');
            console.log(msg, val);
        },
        trace: function(msg, val) {
            console.log('TRACE:');
            console.log(msg, val);
        },
        warn: function(msg, val) {
            console.log('WARN:');
            console.log(msg, val);
        },
        fatal: function(msg, val) {
            console.log('FATAL:');
            console.log(msg, val);
        }
    },
    body: {}
};

describe('tasks resource integration test', function() {
    before(function() {
        //set up overall database
        console.log('setting up database');
    });

    it('calls jpid', function(done) {
        var cb = function(err, res, result) {
            expect(err).to.be(null);
            expect(result.hasOwnProperty('patientIdentifiers')).to.be(true);
            expect(result.patientIdentifiers.length).to.be.gt(1);
            done(err);
        };

        var pid = '9E7A;3';

        tasksResource.callJpid(fakeRequest, pid, cb);
    });

    //TODO move to unit test?
    it('skips jpid when null', function(done) {
        var cb = function(err, res, result) {
            expect(err).not.to.be(null);
            done();
        };

        tasksResource.callJpid(fakeRequest, null, cb);
    });

    it('checks for icn', function(done) {
        var spy = sinon.spy(tasksResource, 'callJpid');

        var testPid = '9E7A;3';

        var cb2 = function(err, result) {
            expect(err).to.be(null);
            expect(spy.called).to.be(true);
            done(err);
        };

        tasksResource.getIcn(fakeRequest, testPid, [], cb2);
    });

    //TODO move to unit test?
    it('uses cached patient identifiers when passed', function(done) {
        var spy = sinon.spy(tasksResource, 'callJpid');
        var testIdentifiers = [
            '9E7A;3',
            'C877;3',
            'DOD;0000000003',
            'HDR;10108V420871',
            'JPID;07201c12-a760-41e7-b07b-99cbc2cb4132',
            'VLER;10108V420871'
        ];
        var testIcn = '10108V420871';
        testIdentifiers.push(testIcn);

        var testPid = '9E7A;3';

        var cb3 = function(err, result) {
            expect(err).to.be(null);
            expect(spy.called).to.be(false);
            expect(result).to.be.equal(testIcn);
            done(err);
        };

        tasksResource.getIcn(fakeRequest, testPid, testIdentifiers, cb3);
    });

    // it('runs', function() {
    //     var teamStub = sinon.stub(tasksResource, 'getTeams', function(req, staffIEN, patientID, next) {
    //         console.log('team stub called');
    //         return next(null, true);
    //     });

    //     var icnStub = sinon.stub(tasksResource, 'getIcn', function(req, pid, next) {
    //         console.log('icn stub called');
    //         return next(null, '1');
    //     });

    //     var namesStub = sinon.stub(tasksResource, 'getNamesFromIcns', function(icnToNameMap, req, cb) {
    //         console.log('names stub called');
    //         return cb([]);
    //     });



    //     tasksResource.buildTasksResponse([], [], fakeRequest, {
    //         subContext: 'teamroles',
    //         facility: '9E7A',
    //         status: 'Created,Ready,Reserved,InProgress',
    //         startDate: '201406230000',
    //         endDate: '201612232359'
    //     }, function(result) {
    //         console.log(result);
    //     });
    // });

    it('runs on buildTaskQuery', function(done) {
        var fakeResponse = {
            rdkSend: function(response) {
                console.log('rdk send stub called');
                done();
            },
            status: function(status) {
                this.localStatus = status;
            },
            localStatus: ''
        };

        // var routesStub = sinon.stub(tasksResource, 'queryTasksRoutes', function(req, res, tasks, parameters) {
        //     console.log('task routes stub called');
        //     console.log(util.inspect(tasks, {
        //         showHidden: true,
        //         depth: null,
        //         colors: true
        //     }));
        //     return done();
        // });

        var parameters = {
            subContext: 'teamroles',
            facility: '9E7A',
            status: 'Created,Ready,Reserved,InProgress'
        };

        var localRequest = _.cloneDeep(fakeRequest);
        localRequest.body.context = 'user';

        tasksResource.buildTaskQuery(localRequest, fakeResponse, parameters);

        // console.log(util.inspect(fakeResponse.rdkSend.args, {
        //     showHidden: true,
        //     depth: null,
        //     colors: true
        // }));
        //expect(fakeResponse.rdkSend.called).to.be.truthy();
    });

    after(function() {
        //tear down database
        console.log('cleaning up database');
    });
});
