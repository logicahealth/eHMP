'use strict';
var _ = require('lodash');
var utils = require('./requests-picklists-utils');
var testVistaSitesConfig = {
    'ABCD': {
        division: [{
            id: '100',
            name: 'ABBBAA'
        }],
        abbreviation: 'DCBA'
    }
};
describe('Testing requests-picklists-utils Functionality', function() {
    it('getSiteCode returns expected Site Code', function(done) {
        expect(utils.getSiteCode(testVistaSitesConfig, 100)).to.be('ABCD');
        done();
    });
     it('getSiteAbbreviation returns expected Abbreviation', function(done) {
        expect(utils.getSiteAbbreviation(testVistaSitesConfig, 100)).to.be('DCBA');
        done();
    });
});
