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
                    'connectString': 'IP_ADDRESS:PORT/xe'
                }
            },
            jdsServer: {
                'baseUrl': 'http://IP_ADDRESS:PORT',
                'urlLengthLimit': 120
            }
        }
    },
    session: {
        user: { //pu1234
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
        }
    },
    body: {}
};

describe('tasks resource integration test', function() {
    before(function(){
        //set up overall database
        console.log('setting up database');
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
                console.log(util.inspect(response, {
                    showHidden: true,
                    depth: null,
                    colors: true
                }));
                done();
            },
            status: function(status) {
                this.localStatus = status;
            },
            localStatus: ''
        };
        // var fakeResponse = {};

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
            status: 'Created,Ready,Reserved,InProgress',
            startDate: '201406270000',
            endDate: '201612272359'
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
        // setTimeout(function() {
        //     console.log('done waiting');
        //     done();
        // }, 10000);
    });

    after(function(){
        //tear down database
        console.log('cleaning up database');
    });
});
