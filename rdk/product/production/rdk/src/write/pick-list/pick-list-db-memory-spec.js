'use strict';

var _ = require('lodash');
var pickListUtils = require('./pick-list-utils');
var MemoryDB = require('./pick-list-db-memory');
var dbList = new MemoryDB();
var bunyan = require('bunyan');

var testData = {
    one: {data: 1},
    two: {data: 2},
    three: {data: 3}
};

var app = require('./pick-list-config-mock');

app.logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));

var fakePickListName = pickListUtils.inMemoryConfig(app)[0].name;
var anotherFakePickListName = pickListUtils.inMemoryConfig(app)[1].name;

describe('verify database operations', function() {
    var fakeSiteHash = 'F4K3';

    it('loads an entry into the database', function(done) {
        var query = {
            site: fakeSiteHash,
            pickList: fakePickListName
        };

        dbList._database.find(query, function (err, docs) {
            expect(err).to.be.falsy();
            expect(docs).to.be.truthy();
            expect(docs.length).to.eql(0);

            dbList.store(app, { 'site': fakeSiteHash, 'pickList': fakePickListName }, testData, function (err, result) {
                expect(err).to.be.falsy();
                expect(result).to.be.truthy();
                expect(result).to.eql(testData);

                dbList._database.find(query, function(err, docs) {
                    expect(err).to.be.falsy();
                    expect(docs).to.be.truthy();
                    expect(docs.length).to.eql(1);
                    expect(docs[0].data).to.be.truthy();
                    expect(docs[0].data).to.eql(testData);
                    done();
                });
            });
        });
    });

    it('overwrites duplicate data', function(done) {
        dbList.store(app, {'site': fakeSiteHash, 'pickList': fakePickListName}, testData, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result).to.eql(testData);

            var query = {
                site: fakeSiteHash,
                pickList: fakePickListName
            };
            dbList._database.find(query, function(err, docs) {
                expect(err).to.be.falsy();
                expect(docs).to.be.truthy();
                expect(docs.length).to.eql(1);
                expect(docs[0].data).to.be.truthy();
                expect(docs[0].data).to.eql(testData);
                expect(docs[0].timeStamp).to.be.truthy();
                done();
            });
        });
    });
});

describe('verify parameterized database operations', function() {
    var fakeSiteHash = 'F4K3';
    //var fakeSiteName = 'FAKESITE';
    //var fakeSiteConfig = {
    //    name: fakeSiteName
    //};

    var fakePickListConfig = {
        name: anotherFakePickListName,
        param_one: 'one',
        param_two: 1,
        modulePath: 'pick-list-db-memory-spec',
        dataNeedsRefreshAfterMinutes: {}
    };
    fakePickListConfig.dataNeedsRefreshAfterMinutes[fakeSiteHash] = 1;

    it('can store a picklist with parameters', function(done) {
        var pickListData = {
            pickList: fakePickListConfig.name,
            site: fakeSiteHash,
            param_one: fakePickListConfig.param_one,
            param_two: fakePickListConfig.param_two,
            timeStamp: new Date(),
            data: testData
        };
        dbList._database.insert(pickListData, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.params).to.eql(fakePickListConfig.params);
            expect(result.data).to.eql(testData);

            var query = {
                pickList: fakePickListConfig.name,
                site: fakeSiteHash,
                param_one: 'one',
                param_two: 1
            };
            dbList._database.find(query, function(err, docs) {
                expect(err).to.be.falsy();
                expect(docs).to.be.truthy();
                expect(docs).to.be.an.array();
                expect(docs.length).to.eql(1);
                expect(docs[0].data).to.eql(testData);
                done();
            });
        });
    });

    var differentTestData = 'a string';
    it('can store a different picklist with different parameters separately', function(done) {
        var pickListData = {
            pickList: fakePickListConfig.name,
            site: fakeSiteHash,
            param_one: 'one',
            param_two: 2,
            timeStamp: new Date(),
            data: differentTestData
        };
        dbList._database.insert(pickListData, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.params).to.eql(fakePickListConfig.params);
            expect(result.data).to.eql(differentTestData);

            var query = {
                pickList: fakePickListConfig.name,
                site: fakeSiteHash,
                param_one: 'one',
                param_two: 2
            };
            dbList._database.find(query, function(err, docs) {
                expect(err).to.be.falsy();
                expect(docs).to.be.truthy();
                expect(docs).to.be.an.array();
                expect(docs.length).to.eql(1);
                expect(docs[0].data).to.eql(differentTestData);
                expect(docs[0].data).to.eql('a string');

                query.param_two = 1;
                dbList._database.find(query, function(err, docs) {
                    expect(err).to.be.falsy();
                    expect(docs).to.be.truthy();
                    expect(docs).to.be.an.array();
                    expect(docs.length).to.eql(1);
                    expect(docs[0].data).to.eql(testData);
                    done();
                });
            });
        });
    });

    it('can find all stored data for a pick-list', function(done) {
        dbList._database.find({pickList: fakePickListConfig.name}, function(err, docs) {
            expect(err).to.be.falsy();
            expect(docs).to.be.truthy();
            expect(docs).to.be.an.array();
            expect(docs.length).to.eql(2);
            expect(docs[0]).not.to.eql(docs[1]);
            _.each(docs, function(doc) {
                expect(doc.pickList).to.eql(anotherFakePickListName);
                expect(doc.pickList).not.to.eql(fakePickListName);
            });
            done();
        });
    });

    it('can find all stored data for a site', function(done) {
        dbList._database.find({site: 'F4K3'}, function(err, docs) {
            expect(err).to.be.falsy();
            expect(docs).to.be.truthy();
            expect(docs).to.be.an.array();
            expect(docs.length).to.eql(3);
            var found = [0,0];
            _.each(docs, function(doc) {
                expect(doc.site).to.eql('F4K3');
                if (doc.pickList === fakePickListName) {
                    found[0]++;
                }
                if (doc.pickList === anotherFakePickListName) {
                    found[1]++;
                }
            });
            expect(found).to.eql([1,2]);
            done();
        });
    });

    it('can find all stored data', function(done) {
        dbList._database.find({}, function(err, docs) {
            expect(err).to.be.falsy();
            expect(docs).to.be.truthy();
            expect(docs).to.be.an.array();
            expect(docs.length).to.eql(3);
            var found = [0,0];
            _.each(docs, function(doc) {
                expect(doc.site).to.eql('F4K3');
                if (doc.pickList === fakePickListName) {
                    found[0]++;
                }
                if (doc.pickList === anotherFakePickListName) {
                    found[1]++;
                }
            });
            expect(found).to.eql([1,2]);
            done();
        });
    });

    it('can handle null values for (optional) parameters', function(done) {
        var nullParamData = 'the data that was stored with null params';
        var insertQuery = {
            pickList: fakePickListConfig.name,
            site: fakeSiteHash,
            param_one: null,
            param_two: null,
            timeStamp: new Date(),
            data: nullParamData
        };
        dbList._database.insert(insertQuery, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.data).to.eql(nullParamData);

            dbList._database.find({site: fakeSiteHash}, function(err, docs) {
                expect(err).to.be.falsy();
                expect(docs).to.be.truthy();
                expect(docs).to.be.an.array();
                expect(docs.length).to.eql(4);

                dbList._database.find({site: fakeSiteHash, pickList: fakePickListConfig.name}, function(err, docs) {
                    expect(err).to.be.falsy();
                    expect(docs).to.be.truthy();
                    expect(docs).to.be.an.array();
                    expect(docs.length).to.eql(3);

                    dbList._database.find({site: fakeSiteHash, pickList: fakePickListConfig.name, param_one: null}, function(err, docs) {
                        expect(err).to.be.falsy();
                        expect(docs).to.be.truthy();
                        expect(docs).to.be.an.array();
                        expect(docs.length).to.eql(1);
                        expect(docs[0].data).to.eql(nullParamData);

                        dbList._database.find({site: fakeSiteHash, pickList: fakePickListConfig.name, param_two: 2}, function(err, docs) {
                            expect(err).to.be.falsy();
                            expect(docs).to.be.truthy();
                            expect(docs).to.be.an.array();
                            expect(docs.length).to.eql(1);
                            expect(docs[0].data).to.eql(differentTestData);
                            done();
                        });
                    });
                });
            });
        });
    });
});
