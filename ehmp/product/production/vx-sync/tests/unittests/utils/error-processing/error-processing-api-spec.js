'use strict';

require('../../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'poller-utils-spec',
//     level: 'debug'
// });

var errorProcessingApi = require(global.VX_UTILS + 'error-processing/error-processing-api');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var environment = { publisherRouter: {
    publish: function(jobsToPublish, handlerCallback) {
        handlerCallback(null, jobsToPublish);
    }
}};

var config = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }
};

describe('error-processing-api', function() {
    describe('ErrorProcessingContext', function() {
        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
        });

        it('constraints undefined defined', function() {
            var context = errorProcessingApi.ErrorProcessingContext(logger, config, environment);
            expect(context.ignoreRetry).toBeFalsy();
            expect(context.deleteOnly).toBeFalsy();
            expect(context.keepRecord).toBeFalsy();

            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});
            expect(context.ignoreRetry).toBeFalsy();
            expect(context.deleteOnly).toBeFalsy();
            expect(context.keepRecord).toBeFalsy();
        });

        it('all constraints defined', function() {
            var constraints = {
                'ignore-retry': true,
                'delete-only': true,
                'keep-record': true,
                index: 'index-x',
                range: 'x>y>z',
                filter: 'eq(source,"z")',
                limit: '100'
            };

            var context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, constraints);
            expect(context.ignoreRetry).toBeTruthy();
            expect(context.deleteOnly).toBeTruthy();
            expect(context.keepRecord).toBeTruthy();
            expect(context.query).toBeTruthy();
            expect(context.query.index).toBe('index-x');
            expect(context.query.range).toBe('x>y>z');
            expect(context.query.filter).toBe('eq(source,"z")');
            expect(context.query.limit).toBe('100');
        });
    });

    describe('fetchErrors', function() {
        var context, called;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('error thrown', function() {
            environment.jds._setResponseData(['Connection Error'], [null], null);

            runs(function() {
                errorProcessingApi.fetchErrors(context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds response has error', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingApi.fetchErrors(context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('successful fetch', function() {
            environment.jds._setResponseData([null], [{statusCode: 200}], {items: []});

            runs(function() {
                errorProcessingApi.fetchErrors(context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results.items).toBeDefined();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('submit', function() {
        var context, called;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('fetch error thrown', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingApi.submit(context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds returns no items', function() {
            environment.jds._setResponseData([null], [{statusCode: 200}], {items: []});

            runs(function() {
                errorProcessingApi.submit(context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBe('No records to process.');

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('successful submit', function() {
            environment.jds._setResponseData(
                [null],
                [{statusCode: 200}, {statusCode: 200}, {statusCode: 200}],
                {items: [{uid: '1'}]});

            runs(function() {
                errorProcessingApi.submit(context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(context.results).toBeDefined();
                    expect(context.results.length).toBe(1);

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('submitByBatchQuery', function() {
        var context, called;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('fetch error thrown', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingApi.submitByBatchQuery(context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('successful submit', function() {
            environment.jds._setResponseData(
                [null, null, null, null],
                [{statusCode: 200}, {statusCode: 200}, {statusCode: 200}, {statusCode: 200}],
                [{items: [{uid: '1'}]}, null, null, {items: []}]);

            runs(function() {
                errorProcessingApi.submitByBatchQuery(context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(context.results).toBeDefined();
                    expect(context.results.length).toBe(1);

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

    });

    describe('submitByUid', function() {
        var context, called;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('fetch error thrown', function() {
            environment.jds._setResponseData(['Connection Error'], [null], null);

            runs(function() {
                errorProcessingApi.submitByUid(1, context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds response error', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingApi.submitByUid(1, context, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds returns no items', function() {
            environment.jds._setResponseData([null], [{statusCode: 200}], {});

            runs(function() {
                errorProcessingApi.submitByUid(1, context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBe('No record to process.');

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('successful submit', function() {
            environment.jds._setResponseData(
                [null],
                [{statusCode: 200}, {statusCode: 200}, {statusCode: 200}],
                {items: [{uid: '1'}]});

            runs(function() {
                errorProcessingApi.submitByUid(1, context, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(context.results).toBeDefined();
                    expect(context.results.length).toBe(1);

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });
});
