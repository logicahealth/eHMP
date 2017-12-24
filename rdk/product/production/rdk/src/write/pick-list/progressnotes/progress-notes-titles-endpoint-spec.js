'use strict';

var endpoint = require('./progress-notes-titles-endpoint');
var asuProcess = endpoint._asuProcess;

function dummyLogFunction(x) {
    //console.log(x);
}

var dummyLogger = {
    fatal: dummyLogFunction,
    error: dummyLogFunction,
    warn: dummyLogFunction,
    info: dummyLogFunction,
    debug: dummyLogFunction,
    trace: dummyLogFunction
};

describe('progress-notes-titles-endpoint', function() {
    var mockConfiguration = {
        asuServer: {
            baseUrl: 'http://IP           ',
            timeout: '30000'
        }
    };

    var progressNotes = [];

    beforeEach(function() {
        progressNotes = [{
            ien: '001'
        }, {
            ien: '002'
        }];

        sinon.stub(asuProcess, 'evaluate');
    });

    afterEach(function() {
        asuProcess.evaluate.restore();
    });

    it('responds correctly (and without an error) when all responses include "hasPermission = true"', function(done) {
        asuProcess.evaluate.callsArgWith(5, null, [
            [{
                testId: '1',
                hasPermission: true
            }], [{
                testId: '2',
                hasPermission: true
            }]
        ]);

        endpoint._asuFilter(dummyLogger, mockConfiguration, null, null, null, null, 'SITE', progressNotes, function(err, filteredResults) {
            expect(asuProcess.evaluate.calledOnce).to.be.true();
            expect(err).to.be.falsy();
            expect(filteredResults).to.be.truthy();
            expect(filteredResults.length).to.be(2);
            expect(filteredResults[0].asuApproved).to.be.true();
            done();
        });
    });

    it('responds correctly (and without an error) when a response includes "hasPermission = false"', function(done) {
        progressNotes.push({ien: '003'});
        asuProcess.evaluate.callsArgWith(5, null, [
            [{
                testId: '1',
                hasPermission: true
            }], [{
                testId: '2',
                hasPermission: false
            }], [{
                testId: '3',
                hasPermission: true
            }]
        ]);

        endpoint._asuFilter(dummyLogger, mockConfiguration, null, null, null, null, 'SITE', progressNotes, function(err, filteredResults) {
            expect(asuProcess.evaluate.calledOnce).to.be.true();
            expect(err).to.be.falsy();
            expect(filteredResults).to.be.truthy();
            expect(filteredResults.length).to.be(2);
            done();
        });
    });

    it('responds with the expected error message (and doesn\'t crash) when an asuResponse without a "hasPermission" field is received', function(done) {
        progressNotes.push({ien: '003'}, {ien: '004'});
        var expectedError = 'progress-notes-titles-endpoint.asuFilter ERROR asuProcess.evaluate.asuResponse didn\'t include a hasPermission: [{"testId":"3","junk":"JUNK"}]';
        asuProcess.evaluate.callsArgWith(5, expectedError);

        endpoint._asuFilter(dummyLogger, mockConfiguration, null, null, null, null, 'SITE', progressNotes, function(err, filteredResults) {
            expect(asuProcess.evaluate.calledOnce).to.be.true();
            expect(filteredResults).to.be.falsy();
            expect(err).to.be.truthy();
            expect(err).to.match(/asuResponse didn't include a hasPermission: \[{"testId":"3","junk":"JUNK"}\]/);
            done();
        });
    });
});
