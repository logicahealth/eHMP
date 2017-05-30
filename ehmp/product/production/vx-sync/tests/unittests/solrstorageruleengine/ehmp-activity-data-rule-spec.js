'use strict';

require('../../../env-setup');

var rule = require(global.VX_SOLRSTORAGERULES + 'ehmp-activity-data-rule');
var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('ehmp-activity-data-rule.js', function() {
    it('record is is not ehmp activity', function() {
        var record = {ehmpState: 'active', domain: 'medication'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('ehmp consult activity is not active', function() {
        var record = {ehmpState: 'draft', domain: 'ehmp-activity', subDomain: 'consult'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('ehmp activity is active but not a consult or request', function() {
        var record = {ehmpState: 'draft', domain: 'ehmp-activity', subDomain: 'medication'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('ehmp activity is an active consult', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'consult'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(true);
        });
    });

    it('ehmp activity is an active request', function() {
        var record = {ehmpState: 'active', domain: 'ehmp-activity', subDomain: 'request'};

        rule(log, null, null, 'ehmp-activity', record, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(true);
        });
    });
});
