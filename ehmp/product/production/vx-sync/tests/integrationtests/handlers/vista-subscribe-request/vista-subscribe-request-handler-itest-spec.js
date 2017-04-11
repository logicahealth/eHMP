'use strict';

require('../../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_DUMMIES + 'jds-client-dummy');
var handler = require(global.VX_HANDLERS + 'vista-subscribe-request/vista-subscribe-request-handler');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var JobStatusUpdater = require(global.VX_JOBFRAMEWORK + 'JobStatusUpdater');
// logger = require('bunyan').createLogger({
//     name: 'vista-subscribe-request-handler',
//     level: 'debug'
// });

var invalidIDSampleJob = {
  type: 'vista-9E7A-subscribe-request',
  patientIdentifier: {
    type: 'pid',
    value: '9E7A;0' },
  jpid: 'b2f63ba4-98dc-4d4a-b46e-df5e73d4c6eb',
  rootJobId: '1',
  jobId: '2'
};

describe('vista-subscribe-request-handler', function(){

    var environment = {
        jds: new JdsClient(logger, logger, config),
        vistaClient: new VistaClient(logger, logger, config, null)
    };
    environment.jobStatusUpdater = new JobStatusUpdater(logger, config, environment.jds);

    it('Handle failed subscribe jobs', function(){
        environment.jds._setResponseData(['200'],[null],[]);
        var complete = false;
        runs(function(){
            handler('9E7A', logger, config, environment, invalidIDSampleJob, function(error, result) {

                if(!error) {
                    environment.vistaClient.unsubscribe(invalidIDSampleJob.patientIdentifier.value,function(){});
                }
                expect(error).toBeTruthy();
                complete = true;
            });
        });
        waitsFor(function(){
            return complete;
        },'Handler to Finish');
    });
});