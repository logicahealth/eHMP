'use strict';

require('../../../env-setup');

var _ = require('underscore');

var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');

var configReqRes = {
    'vistaSites': {
        'SITE': {
            'name': 'panorama',
            'stationNumber': 500,
        },
        'SITE': {
            'name': 'kodak',
            'stationNumber': 500,
        }
    },
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

var configPubSub = {
    'vistaSites': {
        'SITE': {
            'name': 'panorama',
            'stationNumber': 500,
        },
        'SITE': {
            'name': 'kodak',
            'stationNumber': 500,
        }
    },
    'hdr': {
        'hdrSites': {
           '3A8B': { 'stationNumber': 42 },
           'CF2A': { 'stationNumber': 101 },
           '72A0': { 'stationNumber': 13 },
           '8211': { 'stationNumber': 1337 },
           '84F0': { 'stationNumber': 578 }
        },
        'operationMode': 'PUB/SUB'
    }
};

describe('patient-identifier.js', function() {
    describe('create()', function() {
        it('verify correct structure', function() {
            var id = idUtil.create('icn', '10110V004877');
            expect(id).toEqual({
                type: 'icn',
                value: '10110V004877'
            });
        });
    });

    describe('extractIdsOfTypes()', function() {
        var pIds = [{
            type: 'icn',
            value: '10110V004877'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'hdr',
            value: 'HDR:10110V004877'
        }, {
            type: 'edipi',
            value: '0000000003'
        }];

        it('verify icn match', function() {
            var icns = idUtil.extractIdsOfTypes(pIds, 'icn');
            expect(icns).toEqual([{
                type: 'icn',
                value: '10110V004877'
            }]);
        });
        it('verify pid match', function() {
            var pids = idUtil.extractIdsOfTypes(pIds, 'pid');
            expect(pids).toEqual([{
                type: 'pid',
                value: 'SITE;8'
            }, {
                type: 'pid',
                value: 'SITE;8'
            }]);
        });
        it('verify edipi match', function() {
            var edipis = idUtil.extractIdsOfTypes(pIds, 'edipi');
            expect(edipis).toEqual([{
                type: 'edipi',
                value: '0000000003'
            }]);
        });

        it('verify undefined and null type', function() {
            var pids = idUtil.extractIdsOfTypes(pIds);
            expect(pids).toEqual([]);
            idUtil.extractIdsOfTypes(pIds, null);
            expect(pids).toEqual([]);
        });

        it('verify not present type', function() {
            var pids = idUtil.extractIdsOfTypes(pIds, 'dod');
            expect(pids).toEqual([]);
        });

        it('verify multiple present types', function() {
            var pids = idUtil.extractIdsOfTypes(pIds, ['icn', 'hdr']);
            expect(pids).toEqual([{
                type: 'icn',
                value: '10110V004877'
            }, {
                type: 'hdr',
                value: 'HDR:10110V004877'
            }]);
        });

        it('verify undefined and null patientIdentifiers', function() {
            expect(idUtil.extractIdsOfTypes(undefined, 'icn')).toEqual([]);
            expect(idUtil.extractIdsOfTypes(null, 'icn')).toEqual([]);
            expect(idUtil.extractIdsOfTypes([], 'icn')).toEqual([]);
            expect(idUtil.extractIdsOfTypes('', 'icn')).toEqual([]);
        });
    });

    describe('hasIdsOfTypes()', function() {
        var pIds = [{
            type: 'icn',
            value: '10110V004877'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'hdr',
            value: 'HDR:10110V004877'
        }, {
            type: 'edipi',
            value: '0000000003'
        }];

        it('verify icn match', function() {
            var icns = idUtil.hasIdsOfTypes(pIds, 'icn');
            expect(icns).toBe(true);
        });

        it('verify pid match', function() {
            var pids = idUtil.hasIdsOfTypes(pIds, 'pid');
            expect(pids).toBe(true);
        });

        it('verify edipi match', function() {
            var icns = idUtil.hasIdsOfTypes(pIds, 'edipi');
            expect(icns).toBe(true);
        });

        it('verify undefined and null type', function() {
            var pids = idUtil.hasIdsOfTypes(pIds);
            expect(pids).toBe(false);
            idUtil.hasIdsOfTypes(pIds, null);
            expect(pids).toBe(false);
        });

        it('verify not present type', function() {
            var pids = idUtil.hasIdsOfTypes(pIds, 'dod');
            expect(pids).toBe(false);
        });

        it('verify multiple present types', function() {
            var pids = idUtil.hasIdsOfTypes(pIds, ['icn', 'hdr']);
            expect(pids).toBe(true);
        });

        it('verify undefined and null patientIdentifiers', function() {
            expect(idUtil.hasIdsOfTypes(undefined, 'icn')).toBe(false);
            expect(idUtil.hasIdsOfTypes(null, 'icn')).toBe(false);
            expect(idUtil.hasIdsOfTypes([], 'icn')).toBe(false);
            expect(idUtil.hasIdsOfTypes('', 'icn')).toBe(false);
        });
    });

    describe('extractPidBySite()', function() {
        var pIds = [{
            type: 'icn',
            value: '10110V004877'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'pid',
            value: 'SITE;8'
        }, {
            type: 'pid',
            value: 'HDR;10110V004877'
        }];

        it('verify site found', function() {
            var pidList = idUtil.extractPidBySite(pIds, 'HDR');
            expect(pidList).toEqual([{
                type: 'pid',
                value: 'HDR;10110V004877'
            }]);
        });

        it('verify no site found', function() {
            var pidList = idUtil.extractPidBySite(pIds, 'AAAA');
            expect(pidList).toEqual([]);
        });
    });


    describe('isIdFormatValid()', function() {
        it('verify undefined type', function() {
            expect(idUtil.isIdFormatValid(undefined, '10110V004877', configReqRes)).toBe(false);
        });

        it('verify null type', function() {
            expect(idUtil.isIdFormatValid(null, '10110V004877', configReqRes)).toBe(false);
        });

        it('verify invalid type', function() {
            expect(idUtil.isIdFormatValid('xyz', '10110V004877', configReqRes)).toBe(false);
        });


        it('verify icn undefined id false', function() {
            expect(idUtil.isIdFormatValid('icn')).toBe(false);
        });

        it('verify icn null id false', function() {
            expect(idUtil.isIdFormatValid('icn', null)).toBe(false);
        });
        it('verify icn null id false', function() {
            expect(idUtil.isIdFormatValid('icn', null, configReqRes)).toBe(false);
        });
        it('verify icn empty id false', function() {
            expect(idUtil.isIdFormatValid('icn', '')).toBe(false);
        });
        it('verify icn empty id false', function() {
            expect(idUtil.isIdFormatValid('icn', '', configReqRes)).toBe(false);
        });
        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid('icn', '10110V004877')).toBe(false);
        });
        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid('icn', '10110V004877', configReqRes)).toBe(true);
        });


        it('verify dfn undefined id false', function() {
            expect(idUtil.isIdFormatValid('dfn')).toBe(false);
        });

        it('verify dfn null id false', function() {
            expect(idUtil.isIdFormatValid('dfn', null)).toBe(false);
        });
        it('verify dfn empty id false', function() {
            expect(idUtil.isIdFormatValid('dfn', '')).toBe(false);
        });
        it('verify dfn invalid id false', function() {
            expect(idUtil.isIdFormatValid('dfn', '10110V004877')).toBe(false);
        });
        it('verify dfn invalid id false', function() {
            expect(idUtil.isIdFormatValid('dfn', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify dfn valid id true', function() {
            expect(idUtil.isIdFormatValid('dfn', 'SITE;8')).toBe(false);
        });
        it('verify dfn valid id true', function() {
            expect(idUtil.isIdFormatValid('dfn', 'SITE;8', configReqRes)).toBe(true);
        });


        it('verify pid undefined id false', function() {
            expect(idUtil.isIdFormatValid('pid')).toBe(false);
        });

        it('verify pid null id false', function() {
            expect(idUtil.isIdFormatValid('pid', null)).toBe(false);
        });
        it('verify pid empty id false', function() {
            expect(idUtil.isIdFormatValid('pid', '')).toBe(false);
        });
        it('verify pid invalid id false', function() {
            expect(idUtil.isIdFormatValid('pid', '10110V004877')).toBe(false);
        });
        it('verify pid invalid id false', function() {
            expect(idUtil.isIdFormatValid('pid', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify pid valid id true', function() {
            expect(idUtil.isIdFormatValid('pid', 'SITE;8')).toBe(false);
        });
        it('verify pid valid id true', function() {
            expect(idUtil.isIdFormatValid('pid', 'SITE;8', configReqRes)).toBe(true);
        });
        it('verify pid valid DOD id true', function() {
            expect(idUtil.isIdFormatValid('pid', 'DOD;000000008', configReqRes)).toBe(true);
        });
        it('verify pid valid HDR id true', function() {
            expect(idUtil.isIdFormatValid('pid', 'HDR;10083V1903', configReqRes)).toBe(true);
        });
        it('verify pid valid VLER id true', function() {
            expect(idUtil.isIdFormatValid('pid', 'VLER;10083V1903', configReqRes)).toBe(true);
        });
        it('verify pid valid id numeric site hash is true', function() {
            expect(idUtil.isIdFormatValid('pid', '1011;1008', configReqRes)).toBe(true);
        });
        it('verify pid valid id long site hash is true', function() {
            expect(idUtil.isIdFormatValid('pid', 'AE34F62;1008', configReqRes)).toBe(true);
        });


        it('verify hdr undefined id false', function() {
            expect(idUtil.isIdFormatValid('hdr')).toBe(false);
        });

        it('verify hdr null id false', function() {
            expect(idUtil.isIdFormatValid('hdr', null)).toBe(false);
        });
        it('verify hdr empty id false', function() {
            expect(idUtil.isIdFormatValid('hdr', '')).toBe(false);
        });
        it('verify hdr invalid id false', function() {
            expect(idUtil.isIdFormatValid('hdr', '10110V004877')).toBe(false);
        });
        it('verify hdr(secondary) invalid id false', function() {
            expect(idUtil.isIdFormatValid('hdr', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify hdr(secondary) valid id true', function() {
            expect(idUtil.isIdFormatValid('hdr', 'HDR;8', configReqRes)).toBe(true);
        });
        it('verify hdr(vistaHdr) - Secondary HDR ID when it should be VistaHdr ID.', function() {
            expect(idUtil.isIdFormatValid('hdr', 'HDR;8', configPubSub)).toBe(false);
        });
        it('verify hdr(vistaHdr) - VistaDirect - should not be a VistaHdr ID.', function() {
            expect(idUtil.isIdFormatValid('hdr', 'SITE;8', configPubSub)).toBe(false);
        });
        it('verify hdr(vistaHdr) - VistaDirect - should be valid HDR ID', function() {
            expect(idUtil.isIdFormatValid('hdr', '8211;8', configPubSub)).toBe(true);
        });


        it('verify dod undefined id false', function() {
            expect(idUtil.isIdFormatValid('dod')).toBe(false);
        });

        it('verify dod null id false', function() {
            expect(idUtil.isIdFormatValid('dod', null)).toBe(false);
        });
        it('verify dod empty id false', function() {
            expect(idUtil.isIdFormatValid('dod', '')).toBe(false);
        });
        it('verify dod invalid id false', function() {
            expect(idUtil.isIdFormatValid('dod', '10110V004877')).toBe(false);
        });
        it('verify dod invalid id false', function() {
            expect(idUtil.isIdFormatValid('dod', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify dod valid id true', function() {
            expect(idUtil.isIdFormatValid('dod', 'DOD;8')).toBe(false);
        });
        it('verify dod valid id true', function() {
            expect(idUtil.isIdFormatValid('dod', 'DOD;8', configReqRes)).toBe(true);
        });


        it('verify das undefined id false', function() {
            expect(idUtil.isIdFormatValid('das')).toBe(false);
        });

        it('verify das null id false', function() {
            expect(idUtil.isIdFormatValid('das', null)).toBe(false);
        });
        it('verify das empty id false', function() {
            expect(idUtil.isIdFormatValid('das', '')).toBe(false);
        });
        it('verify das invalid id false', function() {
            expect(idUtil.isIdFormatValid('das', '10110V004877')).toBe(false);
        });
        it('verify das invalid id false', function() {
            expect(idUtil.isIdFormatValid('das', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify das valid id true', function() {
            expect(idUtil.isIdFormatValid('das', 'DAS;8')).toBe(false);
        });
        it('verify das valid id true', function() {
            expect(idUtil.isIdFormatValid('das', 'DAS;8', configReqRes)).toBe(true);
        });


        it('verify vler undefined id false', function() {
            expect(idUtil.isIdFormatValid('vler')).toBe(false);
        });

        it('verify vler null id false', function() {
            expect(idUtil.isIdFormatValid('vler', null)).toBe(false);
        });
        it('verify vler empty id false', function() {
            expect(idUtil.isIdFormatValid('vler', '')).toBe(false);
        });
        it('verify vler invalid id false', function() {
            expect(idUtil.isIdFormatValid('vler', '10110V004877')).toBe(false);
        });
        it('verify vler invalid id false', function() {
            expect(idUtil.isIdFormatValid('vler', '10110V004877', configReqRes)).toBe(false);
        });
        it('verify vler valid id true', function() {
            expect(idUtil.isIdFormatValid('vler', 'VLER;8')).toBe(false);
        });
        it('verify vler valid id true', function() {
            expect(idUtil.isIdFormatValid('vler', 'VLER;8', configReqRes)).toBe(true);
        });

        it('verify edipi undefined id false', function() {
            expect(idUtil.isIdFormatValid('edipi')).toBe(false);
        });

        it('verify edipi null id false', function() {
            expect(idUtil.isIdFormatValid('edipi', null)).toBe(false);
        });
        it('verify edipi empty id false', function() {
            expect(idUtil.isIdFormatValid('edipi', '')).toBe(false);
        });
        it('verify edipi invalid id false', function() {
            expect(idUtil.isIdFormatValid('edipi', '11')).toBe(false);
        });
        it('verify edipi invalid id false', function() {
            expect(idUtil.isIdFormatValid('dod', '11', configReqRes)).toBe(false);
        });
        it('verify dod valid id true', function() {
            expect(idUtil.isIdFormatValid('edipi', '0000000003')).toBe(false);
        });
        it('verify dod valid id true', function() {
            expect(idUtil.isIdFormatValid('edipi', '0000000003', configReqRes)).toBe(true);
        });

        it('verify empty types', function() {
            expect(idUtil.isIdFormatValid([], '10110V004877')).toBe(false);
        });

        it('verify empty types', function() {
            expect(idUtil.isIdFormatValid([], '10110V004877', configReqRes)).toBe(false);
        });

        it('verify invalid type', function() {
            expect(idUtil.isIdFormatValid(['xyz'], '10110V004877')).toBe(false);
        });

        it('verify invalid type', function() {
            expect(idUtil.isIdFormatValid(['xyz'], '10110V004877'), configReqRes).toBe(false);
        });

        it('verify icn undefined id false', function() {
            expect(idUtil.isIdFormatValid(['icn'])).toBe(false);
        });

        it('verify icn null id false', function() {
            expect(idUtil.isIdFormatValid(['icn'], null)).toBe(false);
        });

        it('verify icn null id false', function() {
            expect(idUtil.isIdFormatValid(['icn'], null, configReqRes)).toBe(false);
        });

        it('verify icn empty id false', function() {
            expect(idUtil.isIdFormatValid(['icn'], '')).toBe(false);
        });

        it('verify icn empty id false', function() {
            expect(idUtil.isIdFormatValid(['icn'], '', configReqRes)).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['xyz'], 'SITE;3')).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['xyz'], 'SITE;3', configReqRes)).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn'], 'SITE;3')).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn'], 'SITE;3', configReqRes)).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn', 'pid'], '10110V004877')).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn', 'pid'], '10110V004877', configReqRes)).toBe(true);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn', 'pid'], 'SITE;3')).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['icn', 'pid'], 'SITE;3', configReqRes)).toBe(true);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['xyz', 'icn', 'pid'], '10110V004877')).toBe(false);
        });

        it('verify icn valid id true', function() {
            expect(idUtil.isIdFormatValid(['xyz', 'icn', 'pid'], '10110V004877', configReqRes)).toBe(true);
        });
    });


    describe('isIcn()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isIcn()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isIcn(null)).toBe(false);
        });

        it('verify non-match from zero-length string', function() {
            expect(idUtil.isIcn('')).toBe(false);
        });

        it('verify non-match from non alpha-numeric character', function() {
            expect(idUtil.isIcn('5e5a;4d')).toBe(false);
        });

        it('verify match', function() {
            expect(idUtil.isIcn('10110V004877')).toBe(true);
        });
    });

    describe('isEdipi()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isEdipi()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isEdipi(null)).toBe(false);
        });

        it('verify non-match from zero-length string', function() {
            expect(idUtil.isEdipi('')).toBe(false);
        });

        it('verify non-match from alpha character', function() {
            expect(idUtil.isEdipi('000000000A')).toBe(false);
        });

        it('verify match', function() {
            expect(idUtil.isEdipi('0000000003')).toBe(true);
        });
    });

    describe('isPid()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isPid()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isPid(null)).toBe(false);
        });

        it('verify non-match from bad pattern', function() {
            expect(idUtil.isPid('5e5a;4d')).toBe(false);
        });

        it('verify non-match from punctuation', function() {
            expect(idUtil.isPid('SITE:3')).toBe(false);
        });

        it('verify match, uppercase site', function() {
            expect(idUtil.isPid('SITE;3')).toBe(true);
        });

        it('verify match, lowercase site', function() {
            expect(idUtil.isPid('9e7a;3')).toBe(true);
        });

        it('verify match, mixedcase site', function() {
            expect(idUtil.isPid('9e7A;3')).toBe(true);
        });
    });

    describe('isVistaDirect()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isVistaDirect()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isVistaDirect(null)).toBe(false);
        });

        it('verify match, but missing config', function() {
            expect(idUtil.isVistaDirect('SITE;3')).toBe(false);
        });

        it('verify match, uppercase site', function() {
            expect(idUtil.isVistaDirect('SITE;3', configReqRes)).toBe(true);
        });

        it('verify match, site not configured as Direct connected.', function() {
            expect(idUtil.isVistaDirect('CF2A;3', configReqRes)).toBe(false);
        });
    });

    describe('isDod()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isDod()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isDod(null)).toBe(false);
        });

        it('verify non-match from bad pattern', function() {
            expect(idUtil.isDod('5e5a;4d')).toBe(false);
        });

        it('verify non-match from punctuation', function() {
            expect(idUtil.isDod('DOD:3')).toBe(false);
        });

        it('verify no match, lowercase site', function() {
            expect(idUtil.isDod('dod;3')).toBe(false);
        });

        it('verify match, uppercase site', function() {
            expect(idUtil.isDod('DOD;3')).toBe(true);
        });
    });

    describe('isHdrPubSubMode()', function() {
        it('verify not pub/sub mode', function() {
            expect(idUtil.isHdrPubSubMode(configReqRes)).toBe(false);
        });

        it('verify is pub/sub mode', function() {
            expect(idUtil.isHdrPubSubMode(configPubSub)).toBe(true);
        });

        it('verify is pub/sub mode check mixed case setting', function() {
            var localConfig;
            try {
                localConfig = JSON.parse(JSON.stringify(configPubSub));
            }
            catch (e) {
            }
            expect(_.isObject(localConfig)).toBe(true);
            localConfig.hdr.operationMode = 'PuB/sUb';
            expect(idUtil.isHdrPubSubMode(localConfig)).toBe(true);
        });
    });

    describe('isSecondaryHdr()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isSecondaryHdr()).toBe(false);
        });

        it('verify non-match null - no config', function() {
            expect(idUtil.isSecondaryHdr(null)).toBe(false);
        });

        it('verify non-match null - with config', function() {
            expect(idUtil.isSecondaryHdr(null, configReqRes)).toBe(false);
        });

        it('verify non-match from bad pattern - no config', function() {
            expect(idUtil.isSecondaryHdr('5e5a;4d')).toBe(false);
        });

        it('verify non-match from bad pattern - with config', function() {
            expect(idUtil.isSecondaryHdr('5e5a;4d', configReqRes)).toBe(false);
        });

        it('verify non-match from using VistaHdr pid - but configured as secondary - no config', function() {
            expect(idUtil.isSecondaryHdr('CF2A;11')).toBe(false);
        });

        it('verify non-match f from using VistaHdr pid - but configured as secondary - with config', function() {
            expect(idUtil.isSecondaryHdr('CF2A;11', configReqRes)).toBe(false);
        });

        it('verify non-match from punctuation - no config', function() {
            expect(idUtil.isSecondaryHdr('HDR:3')).toBe(false);
        });

        it('verify non-match from punctuation - with config', function() {
            expect(idUtil.isSecondaryHdr('HDR:3', configReqRes)).toBe(false);
        });

        it('verify no match, lowercase site - no config', function() {
            expect(idUtil.isSecondaryHdr('hdr;3')).toBe(false);
        });

        it('verify no match, lowercase site - with config', function() {
            expect(idUtil.isSecondaryHdr('hdr;3')).toBe(false);
        });

        it('verify no match, uppercase site - no config', function() {
            expect(idUtil.isSecondaryHdr('HDR;3')).toBe(false);
        });

        it('verify match, uppercase site - with config', function() {
            expect(idUtil.isSecondaryHdr('HDR;3', configReqRes)).toBe(true);
        });
    });

    describe('isVistaHdr()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isVistaHdr()).toBe(false);
        });

        it('verify non-match null - no config', function() {
            expect(idUtil.isVistaHdr(null)).toBe(false);
        });

        it('verify non-match null - with config', function() {
            expect(idUtil.isVistaHdr(null, configPubSub)).toBe(false);
        });

        it('verify non-match from bad pattern - no config', function() {
            expect(idUtil.isVistaHdr('5e5a;4d')).toBe(false);
        });

        it('verify non-match from bad pattern - with config', function() {
            expect(idUtil.isVistaHdr('5e5a;4d', configPubSub)).toBe(false);
        });

        it('verify non-match from using SecondaryHdr pid - but configured as secondary - no config', function() {
            expect(idUtil.isVistaHdr('HDR;11')).toBe(false);
        });

        it('verify non-match f from using SecondaryHdr pid - but configured as secondary - with config', function() {
            expect(idUtil.isVistaHdr('HDR;11', configPubSub)).toBe(false);
        });

        it('verify non-match from punctuation - no config', function() {
            expect(idUtil.isVistaHdr('3A8B:3')).toBe(false);
        });

        it('verify non-match from punctuation - with config', function() {
            expect(idUtil.isVistaHdr('3A8B:3', configPubSub)).toBe(false);
        });

        it('verify no match, valid site - no config', function() {
            expect(idUtil.isVistaHdr('3A8B;3')).toBe(false);
        });

        it('verify match, valid site - with config', function() {
            expect(idUtil.isVistaHdr('3A8B;3', configPubSub)).toBe(true);
        });
    });

    describe('isHdr()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isHdr()).toBe(false);
        });

        it('verify non-match null - no config', function() {
            expect(idUtil.isHdr(null)).toBe(false);
        });

        it('verify non-match null - with req/res config', function() {
            expect(idUtil.isHdr(null, configReqRes)).toBe(false);
        });

        it('verify non-match null - with pub/sub config', function() {
            expect(idUtil.isHdr(null, configPubSub)).toBe(false);
        });

        it('verify non match - VistaHdr pid but configured as Req/Res', function() {
            expect(idUtil.isHdr('SITE;3', configReqRes)).toBe(false);
        });

        it('verify match - VistaHdr pid configured as Pub/Sub', function() {
            expect(idUtil.isHdr('3A8B;3', configPubSub)).toBe(true);
        });

        it('verify match - SecodaryHdr pid configured as Req/Res', function() {
            expect(idUtil.isHdr('HDR;3', configReqRes)).toBe(true);
        });
    });

    describe('isDas()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isDas()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isDas(null)).toBe(false);
        });

        it('verify non-match from bad pattern', function() {
            expect(idUtil.isDas('5e5a;4d')).toBe(false);
        });

        it('verify non-match from punctuation', function() {
            expect(idUtil.isDas('DAS:3')).toBe(false);
        });

        it('verify no match, lowercase site', function() {
            expect(idUtil.isDas('das;3')).toBe(false);
        });

        it('verify match, uppercase site', function() {
            expect(idUtil.isDas('DAS;3')).toBe(true);
        });
    });

    describe('isVler()', function() {
        it('verify non-match undefined', function() {
            expect(idUtil.isVler()).toBe(false);
        });

        it('verify non-match null', function() {
            expect(idUtil.isVler(null)).toBe(false);
        });

        it('verify non-match from bad pattern', function() {
            expect(idUtil.isVler('5e5a;4d')).toBe(false);
        });

        it('verify non-match from punctuation', function() {
            expect(idUtil.isVler('VLER:3')).toBe(false);
        });

        it('verify no match, lowercase site', function() {
            expect(idUtil.isVler('vler;3')).toBe(false);
        });

        it('verify match, uppercase site', function() {
            expect(idUtil.isVler('VLER;3')).toBe(true);
        });
    });

    describe('isSecondarySite()', function() {
        it('verify DOD is secondary site - no config', function() {
            expect(idUtil.isSecondarySite('DOD;111')).toBe(true);
        });

        it('verify DOD is secondary site - with config', function() {
            expect(idUtil.isSecondarySite('DOD;111', configReqRes)).toBe(true);
        });

        it('verify DAS is secondary site - no config', function() {
            expect(idUtil.isSecondarySite('DAS;111')).toBe(true);
        });

        it('verify DAS is secondary site - with config', function() {
            expect(idUtil.isSecondarySite('DAS;111', configReqRes)).toBe(true);
        });

        it('verify VLER is secondary site - no config', function() {
            expect(idUtil.isSecondarySite('VLER;111')).toBe(true);
        });

        it('verify VLER is secondary site - with config', function() {
            expect(idUtil.isSecondarySite('VLER;111', configReqRes)).toBe(true);
        });

        it('verify SITE is not secondary site - no config', function() {
            expect(idUtil.isSecondarySite('SITE;111')).toBe(false);
        });

        it('verify SITE is not secondary site - with config', function() {
            expect(idUtil.isSecondarySite('SITE;111', configReqRes)).toBe(false);
        });

        it('verify HDR (VistaHdr pid) is secondary site - no config', function() {
            expect(idUtil.isSecondarySite('3A8B;111')).toBe(false);
        });

        it('verify HDR (VistaHdr pid) is secondary site - config as req/res', function() {
            expect(idUtil.isSecondarySite('3A8B;111', configReqRes)).toBe(false);
        });

        it('verify HDR (SecondaryHdr pid) is secondary site - config as req/res', function() {
            expect(idUtil.isSecondarySite('HDR;111', configReqRes)).toBe(true);
        });

        it('verify HDR (SecodaryHdr) is secondary site - no config', function() {
            expect(idUtil.isSecondarySite('HDR;111')).toBe(false);
        });

        it('verify HDR (SecondaryHdr) is secondary site - config as pub/sub', function() {
            expect(idUtil.isSecondarySite('HDR;111', configPubSub)).toBe(false);
        });

        it('verify HDR (VistaHdr) is secondary site - config as pub/sub should be no', function() {
            expect(idUtil.isSecondarySite('3A8B;111', configPubSub)).toBe(false);
        });
    });

    describe('extractPiecesFromPid()', function() {
        it('verify extract from undefined, null, and empty', function() {
            var pieces = {
                site: null,
                dfn: null
            };
            expect(idUtil.extractPiecesFromPid()).toEqual(pieces);
            expect(idUtil.extractPiecesFromPid(null)).toEqual(pieces);
            expect(idUtil.extractPiecesFromPid('')).toEqual(pieces);
        });

        it('verify extract from pid', function() {
            var pid = 'SITE;8';
            var pieces = {
                site: 'SITE',
                dfn: '8'
            };
            expect(idUtil.extractPiecesFromPid(pid)).toEqual(pieces);
        });

        it('verify extract from pid with no delimiter', function() {
            var pid = '8';
            var pieces = {
                site: null,
                dfn: '8'
            };
            expect(idUtil.extractPiecesFromPid(pid)).toEqual(pieces);
        });

        it('verify extract from pid with only site piece', function() {
            var pid = 'SITE;';
            var pieces = {
                site: 'SITE',
                dfn: null
            };
            expect(idUtil.extractPiecesFromPid(pid)).toEqual(pieces);
        });

        it('verify extract from pid with only dfn piece', function() {
            var pid = ';8';
            var pieces = {
                site: null,
                dfn: '8'
            };
            expect(idUtil.extractPiecesFromPid(pid)).toEqual(pieces);
        });

        it('verify extract from pid with too many delimiters', function() {
            var pid = 'SITE;8;3';
            var pieces = {
                site: 'SITE',
                dfn: '8'
            };
            expect(idUtil.extractPiecesFromPid(pid)).toEqual(pieces);
        });
    });

    describe('extractSiteFromPid()', function() {
        it('verify extract from undefined, null, and empty', function() {
            var site = null;
            expect(idUtil.extractSiteFromPid()).toEqual(site);
            expect(idUtil.extractSiteFromPid(null)).toEqual(site);
            expect(idUtil.extractSiteFromPid('')).toEqual(site);
        });

        it('verify extract from pid', function() {
            var pid = 'SITE;8';
            var site = 'SITE';
            expect(idUtil.extractSiteFromPid(pid)).toEqual(site);
        });
    });

    describe('extractDfnFromPid()', function() {
        it('verify extract from undefined, null, and empty', function() {
            var dfn = null;
            expect(idUtil.extractDfnFromPid()).toEqual(dfn);
            expect(idUtil.extractDfnFromPid(null)).toEqual(dfn);
            expect(idUtil.extractDfnFromPid('')).toEqual(dfn);
        });

        it('verify extract from pid', function() {
            var pid = 'SITE;8';
            var dfn = '8';
            expect(idUtil.extractDfnFromPid(pid)).toEqual(dfn);
        });
    });

    describe('extractIcnFromPid()', function() {
        it('verify extract from undefined, null, and empty', function() {
            var icn = null;
            expect(idUtil.extractIcnFromPid()).toEqual(icn);
            expect(idUtil.extractIcnFromPid(null)).toEqual(icn);
            expect(idUtil.extractIcnFromPid(null, configReqRes)).toEqual(icn);
            expect(idUtil.extractIcnFromPid('')).toEqual(icn);
            expect(idUtil.extractIcnFromPid('', configReqRes)).toEqual(icn);
        });

        it('verify extract from vler pid', function() {
            var pid = 'VLER;8V1';
            var icn = '8V1';
            expect(idUtil.extractIcnFromPid(pid)).toEqual(icn);
            expect(idUtil.extractIcnFromPid(pid, configReqRes)).toEqual(icn);
        });

        it('verify extract from das pid', function() {
            var pid = 'DAS;8V1';
            var icn = '8V1';
            expect(idUtil.extractIcnFromPid(pid)).toEqual(icn);
            expect(idUtil.extractIcnFromPid(pid, configReqRes)).toEqual(icn);
        });

        it('verify extract from secondary HDR pid', function() {
            var pid = 'HDR;8V1';
            var icn = '8V1';
            expect(idUtil.extractIcnFromPid(pid)).toEqual(null);
            expect(idUtil.extractIcnFromPid(pid, configReqRes)).toEqual(icn);
            expect(idUtil.extractIcnFromPid(pid, configPubSub)).toEqual(null);
        });

        it('verify extract from Vista HDR pid - all should fail', function() {
            var pid = 'CF2A;8V1';
            expect(idUtil.extractIcnFromPid(pid)).toEqual(null);
            expect(idUtil.extractIcnFromPid(pid, configPubSub)).toEqual(null);
            expect(idUtil.extractIcnFromPid(pid, configReqRes)).toEqual(null);
        });

    });

    describe('extractPidFromJob()', function() {
        it('verify extract pid from job - happy path', function() {
            var pid = 'SITE;3';
            var patientId = {
                type: 'pid',
                value: pid
            };
            var jobType = 'vista-SITE-subscribe-request';
            var job = jobUtil.create(jobType, patientId, null, null, null, 'jpid', false);
            expect(idUtil.extractPidFromJob(job)).toEqual(pid);
        });

        it('verify extract pid from job - identifier had an ICN and not a pid', function() {
            var icn = '10000V10000';
            var patientId = {
                type: 'icn',
                value: icn
            };
            var jobType = 'vista-SITE-subscribe-request';
            var job = jobUtil.create(jobType, patientId, null, null, null, 'jpid', false);
            expect(idUtil.extractPidFromJob(job)).toEqual('');
        });

        it('verify extract pid from job - Job did not contain an identifier', function() {
            var jobType = 'vista-SITE-subscribe-request';
            var job = jobUtil.create(jobType, null, null, null, null, 'jpid', false);
            // console.log("Job looks like: %j", job);
            expect(idUtil.extractPidFromJob(job)).toEqual('');
        });
    });

    describe('isSecondarySitePid()', function() {
        it('verify no patientIdentifier - no config', function() {
            expect(idUtil.isSecondarySitePid()).toBe(false);
        });

        it('verify null patientIdentifier - no config', function() {
            expect(idUtil.isSecondarySitePid(null)).toBe(false);
        });

        it('verify null patientIdentifier - with config', function() {
            expect(idUtil.isSecondarySitePid(null, configReqRes)).toBe(false);
        });

        it('verify {} patientIdentifier - no config', function() {
            expect(idUtil.isSecondarySitePid({})).toBe(false);
        });

        it('verify {} patientIdentifier - with config', function() {
            expect(idUtil.isSecondarySitePid({}, configReqRes)).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - no config', function() {
            expect(idUtil.isSecondarySitePid({ type: 'icn', value: '1V1'})).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - with config', function() {
            expect(idUtil.isSecondarySitePid({ type: 'icn', value: '1V1'}, configReqRes)).toBe(false);
        });

        it('verify patientIdentifier with correct type - no config for non HDR - should be valid', function() {
            expect(idUtil.isSecondarySitePid({ type: 'pid', value: 'VLER;1V1'})).toBe(true);
        });

        it('verify patientIdentifier with correct type - with config for HDR - should be valid', function() {
            expect(idUtil.isSecondarySitePid({ type: 'pid', value: 'HDR;11'}, configReqRes)).toBe(true);
        });
    });

    describe('isVistaHdrSitePid()', function() {
        it('verify no patientIdentifier - no config', function() {
            expect(idUtil.isVistaHdrSitePid()).toBe(false);
        });

        it('verify null patientIdentifier - no config', function() {
            expect(idUtil.isVistaHdrSitePid(null)).toBe(false);
        });

        it('verify null patientIdentifier - with config', function() {
            expect(idUtil.isVistaHdrSitePid(null, configPubSub)).toBe(false);
        });

        it('verify {} patientIdentifier - no config', function() {
            expect(idUtil.isVistaHdrSitePid({})).toBe(false);
        });

        it('verify {} patientIdentifier - with config', function() {
            expect(idUtil.isVistaHdrSitePid({}, configPubSub)).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - no config', function() {
            expect(idUtil.isVistaHdrSitePid({ type: 'icn', value: '1V1'})).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - with config', function() {
            expect(idUtil.isVistaHdrSitePid({ type: 'icn', value: '1V1'}, configPubSub)).toBe(false);
        });

        it('verify patientIdentifier with correct type - config for non secondary HDR - should be valid', function() {
            expect(idUtil.isVistaHdrSitePid({ type: 'pid', value: 'CF2A;11'}, configPubSub)).toBe(true);
        });
    });

    describe('isVistaDirectSitePid()', function() {
        it('verify no patientIdentifier - no config', function() {
            expect(idUtil.isVistaDirectSitePid()).toBe(false);
        });

        it('verify null patientIdentifier - no config', function() {
            expect(idUtil.isVistaDirectSitePid(null)).toBe(false);
        });

        it('verify null patientIdentifier - with config', function() {
            expect(idUtil.isVistaDirectSitePid(null, configPubSub)).toBe(false);
        });

        it('verify {} patientIdentifier - no config', function() {
            expect(idUtil.isVistaDirectSitePid({})).toBe(false);
        });

        it('verify {} patientIdentifier - with config', function() {
            expect(idUtil.isVistaDirectSitePid({}, configPubSub)).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - no config', function() {
            expect(idUtil.isVistaDirectSitePid({ type: 'icn', value: '1V1'})).toBe(false);
        });

        it('verify patientIdentifier with incorrect type - with config', function() {
            expect(idUtil.isVistaDirectSitePid({ type: 'icn', value: '1V1'}, configPubSub)).toBe(false);
        });

        it('verify patientIdentifier with correct type - with config for VistaHDR site - should be false', function() {
            expect(idUtil.isVistaDirectSitePid({ type: 'pid', value: 'CF2A;11'}, configPubSub)).toBe(false);
        });

        it('verify patientIdentifier with correct type - with config for VistaHDR site - should be true', function() {
            expect(idUtil.isVistaDirectSitePid({ type: 'pid', value: 'SITE;11'}, configPubSub)).toBe(true);
        });

    });

    describe('isVistaHdrSite()', function() {
        it('verify no siteId - no config', function() {
            expect(idUtil.isVistaHdrSite()).toBe(false);
        });

        it('verify null siteId - no config', function() {
            expect(idUtil.isVistaHdrSite(null)).toBe(false);
        });

        it('verify null siteId - with config', function() {
            expect(idUtil.isVistaHdrSite(null, configPubSub)).toBe(false);
        });

        it('verify "" siteId - no config', function() {
            expect(idUtil.isVistaHdrSite('')).toBe(false);
        });

        it('verify "" siteId - with config', function() {
            expect(idUtil.isVistaHdrSite('', configPubSub)).toBe(false);
        });

        it('verify right siteId - no config', function() {
            expect(idUtil.isVistaHdrSite('84F0')).toBe(false);
        });

        it('verify right siteId - wrong config', function() {
            expect(idUtil.isVistaHdrSite('84F0', configReqRes)).toBe(false);
        });

        it('verify incorrect site id - with right config', function() {
            expect(idUtil.isVistaHdrSite('SITE', configPubSub)).toBe(false);
        });

        it('verify right site id with right config - should be valid', function() {
            expect(idUtil.isVistaHdrSite('84F0', configPubSub)).toBe(true);
        });
    });
});