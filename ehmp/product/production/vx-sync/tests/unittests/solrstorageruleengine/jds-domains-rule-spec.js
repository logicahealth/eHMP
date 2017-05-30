'use strict';
require('../../../env-setup');

var rule = require(global.VX_SOLRSTORAGERULES + 'jds-domains-rule');
var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('jds-domains-rule.js', function() {
    it('dataDomain is not a jds domain', function() {
        rule(log, null, null, 'ehmp-activity', {}, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(false);
        });
    });

    it('dataDomain is a jds consult domain', function() {
        rule(log, null, null, 'consult', {}, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(true);
        });
    });

    it('dataDomain is a jds vlerdocument domain', function() {
        rule(log, null, null, 'vlerdocument', {}, function(error, result) {
            expect(error).toBeFalsy();
            expect(result).toBe(true);
        });
    });
});
