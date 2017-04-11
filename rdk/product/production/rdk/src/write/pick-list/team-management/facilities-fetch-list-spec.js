'use strict';

var _ = require('lodash');
var fetch = require('./facilities-fetch-list.js').fetch;
var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var dummyConfig = {
    vistaSites: {
        'AAAA': {
            name: 'name1',
            abbreviation: 'NMA'
        },
        'BBBB': {
            name: 'name2',
            abbreviation: 'NMB'
        },
        'CCCC': {
            name: 'name3',
            abbreviation: 'NMC'
        },
        'DDDD': {
            name: 'name4',
            abbreviation: 'NMD'
        },
        'EEEE': {
            name: 'name5',
            abbreviation: 'NME'
        }
    }
};

var pcmmFacilities = [{
    STATIONNUMBER: 'station1',
    VISTANAME: 'name1'
}, {
    STATIONNUMBER: 'station2',
    VISTANAME: 'name2'
}, {
    STATIONNUMBER: 'station3',
    VISTANAME: 'name3',
    STREETCITY: 'city3'
}, {
    STATIONNUMBER: 'station4',
    VISTANAME: 'name4',
    POSTALNAME: 'AB'
}, {
    STATIONNUMBER: 'station5',
    VISTANAME: 'name5',
    STREETCITY: 'city5',
    POSTALNAME: 'CD'
}];

describe('facilities fetch list', function() {
    beforeEach(function() {
        sinon.stub(pcmm, 'doQueryWithParams', function(dbConfig, query, queryParams, callback, maxRows){
            return callback(null, pcmmFacilities);
        });
    });

    afterEach(function() {
        pcmm.doQueryWithParams.restore();
    });

    it('returns expected JSON', function(done) {
        fetch(dummyLogger, dummyConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(result.length).to.be(5);

            expect(_.get(result[0], 'facilityID')).to.be('station1');
            expect(_.get(result[0], 'vistaName')).to.be('name1 (NMA)');

            expect(_.get(result[1], 'facilityID')).to.be('station2');
            expect(_.get(result[1], 'vistaName')).to.be('name2 (NMB)');

            expect(_.get(result[2], 'facilityID')).to.be('station3');
            expect(_.get(result[2], 'vistaName')).to.be('name3 (NMC) city3');

            expect(_.get(result[3], 'facilityID')).to.be('station4');
            expect(_.get(result[3], 'vistaName')).to.be('name4 (NMD) AB');

            expect(_.get(result[4], 'facilityID')).to.be('station5');
            expect(_.get(result[4], 'vistaName')).to.be('name5 (NME) city5, CD');

            done();
        }, {
            pcmmDbConfig: 'dummyVal',
            fullConfig: dummyConfig
        });
    });

    it('can filter results with a siteCode parameter', function(done) {
        fetch(dummyLogger, dummyConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(result.length).to.be(1);

            expect(_.get(result[0], 'facilityID')).to.be('station2');
            expect(_.get(result[0], 'vistaName')).to.be('name2 (NMB)');

            done();
        }, {
            pcmmDbConfig: 'dummyVal',
            fullConfig: dummyConfig,
            siteCode: 'BBBB'
        });
    });
});
