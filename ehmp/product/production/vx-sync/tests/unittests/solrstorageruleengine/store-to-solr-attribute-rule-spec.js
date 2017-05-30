'use strict';

require('../../../env-setup');

var rule = require(global.VX_SOLRSTORAGERULES + 'store-to-solr-attribute-rule');
var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('store-to-solr-attribute-rule.js', function() {
    it('record does not have storeToSolr attribute', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('record does have storeToSolr attribute set to false', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult', storeToSolr: false};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('record does have storeToSolr attribute set to true', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult', storeToSolr: true};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(true);
        });
    });

    it('record does have storeToSolr attribute set to null', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult', storeToSolr: null};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('record does have storeToSolr attribute set to a string of true', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult', storeToSolr: 'true'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });
});
