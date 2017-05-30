'use strict';

require('../../../env-setup');

var RulesEngine = require(global.VX_SOLRSTORAGERULES + 'solr-storage-rules-engine');
var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('store-storage-rules-engine.js', function() {
    var config = {
        solrStorageRules: {
            'jds-domains': {},
            'store-to-solr-attribute': {},
            'ehmp-activity-data': {}
        }
    };

    var environment = {
        metrics: log
    };

    var done = false;

    beforeEach(function() {
        done = false;
    });

    it('no rules are configured for the rules engine', function() {
        var rulesEngine = new RulesEngine(log, {}, environment);

        runs(function () {
            rulesEngine.store('ehmp-activity', {}, function (error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe(false);

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);

    });

    it('dataDomain parameter is null', function() {
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function () {
            rulesEngine.store(null, {}, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('dataDomain parameter is undefined', function() {
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store(undefined, {}, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('record parameter is null', function() {
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store('ehmp-activity', null, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('record parameter is undefined', function() {
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store('ehmp-activity', undefined, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('returned true for a jds domain', function() {
        var record = {};
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store('consult', record, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe(true);

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('returned true when the record storeToSolr flag is true', function() {
        var record = {storeToSolr: true};
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store('ehmp-activity', record, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe(true);

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });

    it('returned true when the record is an active ehmp consult activity', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult'};
        var rulesEngine = new RulesEngine(log, config, environment);

        runs(function() {
            rulesEngine.store('ehmp-activity', record, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe(true);

                done = true;
            });
        });

        waitsFor(function() { return done; }, 'done', 200);
    });
});
