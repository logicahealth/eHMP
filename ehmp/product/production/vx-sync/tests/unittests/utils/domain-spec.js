'use strict';

/**
 * Unit tests for domain.js utility
 * 
 * Author: Matt Spoon
 */

require('../../../env-setup');
var domain = require(global.VX_UTILS + 'domain');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var _ = require('lodash');

let vlerDomainList = [
        'vlerDocuments'
];

let vlerDasDomainList = [
        'vlerDasDocuments'
];

let vlerDomainConfig = {
    _vlerSelector: 'vler',
    _vlerDomainList: vlerDomainList,
    _vlerDasDomainList: vlerDasDomainList
};

let vlerDasDomainConfig = {
    _vlerSelector: 'vlerdas',
    _vlerDomainList: vlerDomainList,
    _vlerDasDomainList: vlerDasDomainList
};

describe('domain.js', function() {
    describe('unit test to validate domains return correctly', function() {
        it('should return the correct domain list for vler domains', function () {
            const ret = domain.getVlerDomainList(vlerDomainConfig);
            expect(ret).toContain('vlerDocuments');
            expect(ret).not.toContain('vlerDasDocuments');
        });
        it('should return the correct domain list for vlerdas domains', function() {
            const ret = domain.getVlerDomainList(vlerDasDomainConfig);
            expect(ret).toContain('vlerDasDocuments');
            expect(ret).not.toContain('vlerDocuments');
        });
    });
});
