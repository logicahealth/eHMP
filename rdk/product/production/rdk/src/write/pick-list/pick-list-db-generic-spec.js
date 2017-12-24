'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var pickListDb = require('./pick-list-db');
var pickListUtils = require('./pick-list-utils');
var MemoryDB = require('./pick-list-db-memory');
var FileDB = require('./pick-list-db-file');
var bunyan = require('bunyan');
var app = require('./pick-list-config-mock');

var logger = sinon.stub(bunyan.createLogger({
        name: 'test-logger'
}));
app.logger = logger;

var dbs = [new MemoryDB(), new FileDB()];
var pickListConfig = pickListUtils.inMemoryConfig(app);

_.each(dbs, function (db) {

    describe('verify pick list backend ' + db.constructor.name, function () {

        var fakeSiteHash = 'F4K3';
        var testData = {
            one: {data: 1},
            two: {data: 2},
            three: {data: 3}
        };
        var query;
        var fakePickListName;

        before(function () {
            FileDB.cleanupCache();
            pickListConfig.push({
                name: 'fake-pick-list',
                optionalParams: ['searchString']
            });


            fakePickListName = pickListConfig[pickListConfig.length - 1].name;
        });

        after(function () {
            FileDB.cleanupCache();
            pickListConfig.pop();
        });

        beforeEach(function () {
            query = {
                site: fakeSiteHash,
                pickList: fakePickListName
            };
        });

        it('retrieves nothing when nothing was stored', function (done) {
            db.retrieve(app, logger, 10, query, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.be.truthy();
                expect(result.status).to.be(pickListDb.REFRESH_STATE_NOT_LOADED);
                expect(result.data).to.be.falsy();
                done();
            });
        });

        it('retrieves something after something was stored', function (done) {
            db.store(app, query, testData, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql(testData);

                db.retrieve(app, logger, 10, query, function (err, result) {
                    expect(err).to.be.falsy();
                    expect(result).to.be.truthy();
                    expect(result.status).to.be(pickListDb.REFRESH_STATE_NORMAL);
                    expectDataMatches(result.data, testData, done);
                });
            });
        });

        it('updates existing stored data', function (done) {
            var updatedData = [
                { count: 1 },
                { count: 2 },
                { count: 4 }
            ];

            db.store(app, query, testData, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql(testData);

                db.retrieve(app, logger, 10, query, function (err, result) {
                    expect(err).to.be.falsy();
                    expect(result).to.be.truthy();
                    expectDataMatches(result.data, testData, function () {

                        db.store(app, query, updatedData, function (err, result) {
                            expect(err).to.be.falsy();
                            expect(result).to.eql(updatedData);

                            db.retrieve(app, logger, 10, query, function (err, result) {
                                expect(err).to.be.falsy();
                                expect(result).to.be.truthy();
                                expectDataMatches(result.data, updatedData, done);
                            });
                        });
                    });
                });
            });
        });

        it('doesn\'t retrieve something when given a too specific query', function (done) {
            db.store(app, query, testData, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql(testData);

                var specificQuery = _.defaults({ searchString: 'test' }, query);

                db.retrieve(app, logger, 10, specificQuery, function (err, result) {
                    expect(err).to.be.falsy();
                    expect(result).to.be.truthy();
                    expect(result.status).to.be(pickListDb.REFRESH_STATE_NOT_LOADED);
                    expect(result.data).to.be.falsy();
                    done();
                });
            });
        });

        it('stores and retrieves an empty object', function (done) {
            db.store(app, query, {}, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql({});

                db.retrieve(app, logger, 10, query, function (err, result) {
                    expect(err).to.be.falsy();
                    expect(result).to.be.truthy();
                    expect(result.status).to.be(pickListDb.REFRESH_STATE_NORMAL);
                    expectDataMatches(result.data, {}, done);
                });
            });
        });

        it('stores and retrieves null', function (done) {
            db.store(app, query, null, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.eql({});

                db.retrieve(app, logger, 10, query, function (err, result) {
                    expect(err).to.be.falsy();
                    expect(result).to.be.truthy();
                    expect(result.status).to.be(pickListDb.REFRESH_STATE_NORMAL);
                    expectDataMatches(result.data, null, done);
                });
            });
        });

        it('expires an item after a while', function (done) {
            db.store(app, query, testData, function (err, result) {
                expect(err).to.be.falsy();

                setTimeout(function () {
                    db.retrieve(app, logger, 0, query, function (err, result) {
                        expect(err).to.be.falsy();
                        expect(result).to.be.truthy();
                        expect(result.status).to.be(pickListDb.REFRESH_STATE_STALE);
                        done();
                    });
                }, 10);
            });
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
