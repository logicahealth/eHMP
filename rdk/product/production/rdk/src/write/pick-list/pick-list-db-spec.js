'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var Readable = require('stream').Readable;
var dbList = require('./pick-list-db');
var pickListUtils = require('./pick-list-utils');
var bunyan = require('bunyan');
var app = require('./pick-list-config-mock');

var logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));
app.logger = logger;

var pickListConfig = pickListUtils.inMemoryConfig(app);

var testData;
var fetchCalled = false;
var fetchDelay = 0;
var fetchError = false;

var fakedb = {
    retrieve: function (app, logger, dataNeedsRefreshAfterMinutes, query, callback) {
        var result = {
            data: this.data,
            status: !this.data ? dbList.REFRESH_STATE_NOT_LOADED : dataNeedsRefreshAfterMinutes ? dbList.REFRESH_STATE_NORMAL : dbList.REFRESH_STATE_STALE
        };
        callback(null, result);
    },
    store: function (app, params, data, callback) {
        this.data = data;
        callback(null, data);
    }
};
dbList.db = fakedb;

module.exports.fetch = function(logger, siteConfig, callback) {
    fetchCalled = true;
    if (fetchDelay) {
        if (fetchError) {
            setTimeout(callback, fetchDelay, 'forced error');
        } else {
            setTimeout(callback, fetchDelay, null, testData);
        }
    } else {
        if (fetchError) {
            callback('forced error');
        } else {
            callback(null, testData);
        }
    }
};

describe('verify database operations', function () {
    var originalPickListConfig;
    var fakeSiteHash = 'F4K3';
    var fakeSiteConfig = {};
    var query;

    before(function () {
        originalPickListConfig = _.clone(pickListConfig);
        pickListConfig.splice(0, pickListConfig.length);

        pickListConfig.push({
            name: 'fake-pick-list',
            modulePath: 'pick-list-db-spec',
            optionalParams: ['r']
        });
        pickListConfig.push({
            name: 'another-fake-pick-list',
            modulePath: 'pick-list-db-spec',
            largePickListRetry: 65,
            optionalParams: ['r']
        });
        query = _.map(pickListConfig, function (config) {
            return {
                site: fakeSiteHash,
                pickList: config.name
            };
        });
    });

    after(function () {
        pickListConfig.splice(0, pickListConfig.length);
        pickListConfig.push.apply(pickListConfig, originalPickListConfig);
    });

    beforeEach(function () {
        fetchCalled = false;
        fetchDelay = 0;
        fetchError = false;
        delete fakedb.data;
        testData = {
            one: {data: 1},
            two: {data: 2},
            three: {data: 3}
        };
    });

    describe('retrievePickList', function () {

        it('fetches and caches a pick list', function (done) {
            var q = query[0];

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.be.falsy();
                expect(fetchCalled).to.be.true();
                expect(result).to.be.truthy();
                expectDataMatches(result, testData, function () {
                    fetchCalled = false;

                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(fetchCalled).to.be.false();
                        expect(result).to.be.truthy();
                        expectDataMatches(result, testData, done);
                    });
                });
            });
        });

        it('fetches and caches a large pick list, with a "loading" message', function (done) {
            var q = query[1];

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.eql('Pick list (another-fake-pick-list) is now loading.  See Retry-After seconds (in the header) for the length of time to wait.');
                expect(result).to.be.falsy();

                setImmediate(function () {
                    expect(fetchCalled).to.be.true();

                    fetchCalled = false;

                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(fetchCalled).to.be.false();
                        expect(result).to.be.truthy();
                        expectDataMatches(result, testData, done);
                    });
                });
            });
        });

        it('returns an "still loading" message after loading was already started', function (done) {
            var q = query[1];
            fetchDelay = 50;

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.eql('Pick list (another-fake-pick-list) is now loading.  See Retry-After seconds (in the header) for the length of time to wait.');
                expect(result).to.be.falsy();

                setImmediate(function () {
                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                        expect(err).to.eql('Pick list (another-fake-pick-list) is still being retrieved.  See Retry-After seconds (in the header) for the length of time to wait.');
                        expect(result).to.be.falsy();

                        setTimeout(function () {
                            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                                expect(err).to.be.falsy();
                                expect(result).to.be.truthy();
                                expectDataMatches(result, testData, done);
                            });
                        }, 60);
                    });
                });
            });
        });

        it('reloads stale cache after returning results', function (done) {
            var q = query[0];

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.be.falsy();
                expect(fetchCalled).to.be.true();
                expect(result).to.be.truthy();
                expectDataMatches(result, testData, function () {
                    fetchCalled = false;

                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 0, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(fetchCalled).to.be.false();
                        expect(result).to.be.truthy();

                        setImmediate(function () {
                            expect(fetchCalled).to.be.true();
                            done();
                        });
                    });
                });
            });
        });

        it('returns results as an object if asked', function (done) {
            var q = query[0];
            var data = [
                { 'user': 'barney', 'age': 36, 'active': true },
                { 'user': 'fred',   'age': 40, 'active': false }
            ];
            testData = createReadable(JSON.stringify(data));

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.be.an.instanceof(EventEmitter);
                expectDataMatches(result, data, function () {

                    delete fakedb.data;
                    testData = createReadable(JSON.stringify(data));
                    q = _.extend({ parseStreams: true }, q);

                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(result).to.not.be.an.instanceof(EventEmitter);
                        expectDataMatches(result, data, done);
                    });
                });
            });
        });

    });

    describe('initialLoadPickList', function () {

        it('marks the picklist as loading until done', function (done) {
            var q = query[1];
            fetchDelay = 50;

            dbList.initialLoadPickList(app, fakeSiteConfig, q, 'pick-list-db-spec', function (err, result) {
                // we don't care about the eventual result
            });

            expect(fetchCalled).to.be.true();

            dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                expect(err).to.eql('Pick list (another-fake-pick-list) is still being retrieved.  See Retry-After seconds (in the header) for the length of time to wait.');
                expect(result).to.be.falsy();

                setTimeout(function () {
                    fetchCalled = false;

                    dbList.retrievePickList(app, logger, fakeSiteConfig, q, null, 'pick-list-db-spec', 10, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(fetchCalled).to.be.false();
                        expect(result).to.be.truthy();
                        expectDataMatches(result, testData, done);
                    });
                }, 60);
            });
        });

    });

    describe('refresh', function () {

        it('refreshes all pick lists for all sites', function (done) {
            dbList.refresh(app, true, function (err, results) {
                expect(err).to.be.falsy();
                _.each(results, function(result) {
                    expect(result).must.be.a.permutationOf([testData, testData]);
                });
                done();
            });
        });

        it('ignores simultaneous refresh requests', function (done) {
            fetchDelay = 10;
            dbList.refresh(app, true, function (err) {
                expect(err).to.be.falsy();
                done();
            });
            dbList.refresh(app, true, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql('Refresh in progress');
            });
        });

        it('calls back only once if an error happened', function (done) {
            fetchDelay = 2;
            fetchError = true;
            var callsback = 0;
            dbList.refresh(app, true, function (err) {
                expect(err).to.be('forced error');
                callsback++;
            });
            setTimeout(function countCallsback() {
                expect(callsback).to.be(1);
                done();
            }, 10);
        });

    });

    describe('filterResults', function () {

        var data = [
            { 'user': 'barney', 'age': 36, 'active': true },
            { 'user': 'fred',   'age': 40, 'active': false }
        ];
        var filter;

        beforeEach(function () {
            filter = {
                fieldToCheckAgainst: 'user',
                stringToSearchFor: 'ar'
            };
        });

        it('ignores a null filter', function () {
            var filtered = dbList._filterResults(data, null);
            expect(filtered).to.be(data);
        });

        it('ignores a filter without a fieldToCheckAgainst', function () {
            filter.fieldToCheckAgainst = null;
            var filtered = dbList._filterResults(data, filter);
            expect(filtered).to.be(data);
        });

        it('ignores a filter without a stringToSearchFor', function () {
            filter.stringToSearchFor = null;
            var filtered = dbList._filterResults(data, filter);
            expect(filtered).to.be(data);
        });

        it('filters an array', function () {
            var filtered = dbList._filterResults(data, filter);
            expect(filtered).to.be.an.array();
            expect(filtered.length).to.be(1);
            expect(filtered[0]).to.eql(data[0]);
        });

        it('filters a stream', function (done) {
            var stream = createReadable(JSON.stringify(data));
            var filtered = dbList._filterResults(stream, filter);
            expect(filtered).to.be.truthy();
            expect(filtered instanceof EventEmitter).to.be.true();
            expectDataMatches(filtered, [data[0]], done);
        });

    });

});

function expectDataMatches(actual, expected, done) {
    if (actual instanceof EventEmitter && typeof actual.pipe === 'function') {
        var result = '';
        actual.on('data', function (data) {
            result += data.toString();
        });
        actual.on('end', function () {
            result = JSON.parse(result);
            expect(result).to.eql(expected);
            done();
        });
    } else {
        expect(actual).to.eql(expected);
        done();
    }
}

function createReadable(string) {
    var stream = new Readable();
    for (var i = 0; i < string.length; i += 20) {
        stream.push(string.substring(i, i + 20));
    }
    stream.push(null);
    return stream;
}
