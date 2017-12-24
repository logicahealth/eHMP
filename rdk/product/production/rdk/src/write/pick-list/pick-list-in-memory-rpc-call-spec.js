'use strict';

var _ = require('lodash');
var async = require('async');
var handler = require('./pick-list-in-memory-rpc-call');
var bunyan = require('bunyan');

var req = {
    app: require('./pick-list-config-mock'),
    param: null
};
var logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));
req.logger = logger;
req.app.logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));

function replaceArrayContents(array, newContents) {
    array.splice(0, array.length); // delete previous contents
    _.each(newContents, function(item) {
        array.push(item);
    });
}

describe('in-memory pick-list handler', function() {
    it('responds with the correct error for a missing required parameter when passed null', function(done) {
        req.param = function(x) {
                return null;
        };
        handler.inMemoryRpcCall(req, null, 'people-for-facility', function(err) {
            expect(err).to.be('Parameter \'facilityID\' cannot be null or empty');
            done();
        });
    });

    it('responds with the correct error for an empty required parameter when passed emptystring', function(done) {
        req.param = function(x) {
            return '';
        };

        handler.inMemoryRpcCall(req, null, 'people-for-facility', function(err) {
            expect(err).to.be('Parameter \'facilityID\' cannot be null or empty');
            done();
        });
    });
});

describe('Load large pick-list handler', function() {
    var originalPickListConfig;
    var vistaSites =  {
        'SITE': {
            'division': [{
                'id': '507',
                'name': 'KODAK'
            }, {
                'id': '613',
                'name': 'MARTINSBURG'
            }, {
                'id': '688',
                'name': 'WASHINGTON'
            }],
            'foo': 'bar'
        },
        'SITE': {
            'division': [{
                'id': '500',
                'name': 'PANORAMA'
            }]
        }
    };

    var internalQueue;

    before(function() {
        originalPickListConfig = req.app.config.inMemory.pickListConfig.slice();
    });

    after(function() {
        replaceArrayContents(req.app.config.inMemory.pickListConfig, originalPickListConfig);
    });

    beforeEach(function() {
        internalQueue = [];
        req.app.config.vistaSites = vistaSites;
        sinon.stub(async, 'queue', function() {
            return {
                drain: function() {},
                push: function(item) {
                    internalQueue = internalQueue.concat(item);
                }
            };
        });
    });

    it('queues up fetch requests for pick-lists with a largePickListRetry setting', function() {
        var configItem = {
            'name': 'teams-for-facility',
            'modulePath': 'team-management/teams-for-facility-fetch-list',
            'vistaContext': 'NOT APPLICABLE',
            'dataNeedsRefreshAfterMinutes': 3000,
            'largePickListRetry': 65,
            'requiredParams': ['facilityID'],
            'requiredPermissions': ['read-patient-record']
        };
        replaceArrayContents(req.app.config.inMemory.pickListConfig, [configItem]);
        handler.loadLargePickLists(req.app);
        expect(internalQueue.length).to.equal(2); // one for each site
        expect(_.isEqual(_.sortBy(_.map(internalQueue, 'site')), ['SITE', 'SITE'])).to.be.truthy();
    });

    it('does not queue up fetch requests for pick-lists without a largePickListRetry setting', function() {
        var configItem = {
            'name': 'teams-for-facility',
            'modulePath': 'team-management/teams-for-facility-fetch-list',
            'vistaContext': 'NOT APPLICABLE',
            'dataNeedsRefreshAfterMinutes': 3000,
            'needsFacilityGranularity': true,
            'requiredParams': ['facilityID'],
            'requiredPermissions': ['read-patient-record']
        };
        replaceArrayContents(req.app.config.inMemory.pickListConfig, [configItem]);
        expect(internalQueue.length).to.equal(0);
        handler.loadLargePickLists(req.app);
    });

    it('creates a queue entry for each initial load default parameter', function() {
        var configItem = {
            'name': 'teams-for-facility',
            'modulePath': 'team-management/teams-for-facility-fetch-list',
            'vistaContext': 'NOT APPLICABLE',
            'dataNeedsRefreshAfterMinutes': 3000,
            'largePickListRetry': 65,
            'requiredParams': ['facilityID'],
            'requiredPermissions': ['param1'],
            'initialLoadDefaultParams': [{
                'param1': '1A',
                'param2': '2A'
            }, {
                'param1': '1B',
                'param2': '2B'
            }]
        };
        replaceArrayContents(req.app.config.inMemory.pickListConfig, [configItem]);
        handler.loadLargePickLists(req.app);
        expect(internalQueue.length).to.equal(4);

        var siteParams = {};
        _.each(internalQueue, function(q) {
            if (!siteParams[q.site]) {
                siteParams[q.site] = {};
            }
            if (!siteParams[q.site].param1) {
                siteParams[q.site].param1 = [];
            }
            siteParams[q.site].param1.push(q.param1);
            if (!siteParams[q.site].param2) {
                siteParams[q.site].param2 = [];
            }
            siteParams[q.site].param2.push(q.param2);
        });
        expect(siteParams.SITE).to.not.be.undefined();
        expect(siteParams.SITE.param1.length).to.equal(2);
        expect(_.includes(siteParams.SITE.param1, '1A')).to.be.truthy();
        expect(_.includes(siteParams.SITE.param1, '1B')).to.be.truthy();
        expect(_.includes(siteParams.SITE.param2, '2A')).to.be.truthy();
        expect(_.includes(siteParams.SITE.param2, '2B')).to.be.truthy();

        expect(siteParams['SITE']).to.not.be.undefined();
        expect(siteParams['SITE'].param1.length).to.equal(2);
        expect(_.includes(siteParams['SITE'].param1, '1A')).to.be.truthy();
        expect(_.includes(siteParams['SITE'].param1, '1B')).to.be.truthy();
        expect(_.includes(siteParams['SITE'].param2, '2A')).to.be.truthy();
        expect(_.includes(siteParams['SITE'].param2, '2B')).to.be.truthy();

    });

    it('creates a queue entry for each site/division for pick-lists with needsFacilityGranularity set to true', function() {
        var configItem = {
            'name': 'teams-for-facility',
            'modulePath': 'team-management/teams-for-facility-fetch-list',
            'vistaContext': 'NOT APPLICABLE',
            'dataNeedsRefreshAfterMinutes': 3000,
            'largePickListRetry': 65,
            'needsFacilityGranularity': true,
            'requiredPermissions': ['param1']
        };
        replaceArrayContents(req.app.config.inMemory.pickListConfig, [configItem]);
        handler.loadLargePickLists(req.app);
        expect(internalQueue.length).to.equal(4); // one for each site/division
        expect(_.isEqual(_.sortBy(_.map(internalQueue, 'facilityID')), ['500', '507', '613', '688'])).to.be.truthy();
    });

    it('works on a copy of the site configuration', function() {
        var siteConfig = handler._getSiteConfig('SITE', req.app);
        expect(siteConfig !== req.app.config.vistaSites.SITE).to.be.truthy();
        expect(siteConfig.foo === req.app.config.vistaSites.SITE.foo).to.be.truthy();
    });

    it('sets division property to null in site configuration', function() {
        var siteConfig = handler._getSiteConfig('SITE', req.app);
        expect(siteConfig.division).to.be.null();
    });
});
