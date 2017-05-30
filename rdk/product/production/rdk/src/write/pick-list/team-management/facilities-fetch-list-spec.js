'use strict';

var _ = require('lodash');
var fetch = require('./facilities-fetch-list.js').fetch;
var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');

var dummyLogger = sinon.stub(require('bunyan').createLogger({
    name: 'facilities-fetch-list',
    level: 'trace'
}));

// var dummyLogger = require('bunyan').createLogger({
//     name: 'facilities-fetch-list',
//     level: 'trace'
// });

var dummyConfig = {
    vistaSites: {
        'AAAA': {
            division: [{
                'id': '100',
                'name': 'name1'
            }]
        },
        'BBBB': {
            division: [{
                'id': '200',
                'name': 'name2'
            }, {
                'id': '250',
                'name': 'name22'
            }]
        },
        'CCCC': {
            division: [{
                'id': '300',
                'name': 'name3'
            }]
        },
        'DDDD': {
            division: [{
                'id': '400',
                'name': 'name4'
            }]
        },
        'EEEE': {
            division: [{
                'id': '500',
                'name': 'name5'
            }]
        }
    }
};

var pcmmFacilities = [{
    STATIONNUMBER: '100',
    VISTANAME: 'name1'
}, {
    STATIONNUMBER: '200',
    VISTANAME: 'name2'
}, {
    STATIONNUMBER: '250',
    VISTANAME: 'name22'
}, {
    STATIONNUMBER: '300',
    VISTANAME: 'name3',
    STREETCITY: 'city3'
}, {
    STATIONNUMBER: '400',
    VISTANAME: 'name4',
    POSTALNAME: 'AB'
}, {
    STATIONNUMBER: '500',
    VISTANAME: 'name5',
    STREETCITY: 'city5',
    POSTALNAME: 'CD'
}];

describe('facilities fetch list', function() {
    beforeEach(function() {
        sinon.stub(pcmm, 'doQueryWithParams', function(dbConfig, query, queryParams, callback, maxRows) {
            return callback(null, pcmmFacilities);
        });
    });

    afterEach(function() {
        pcmm.doQueryWithParams.restore();
    });

    it('returns expected JSON', function(done) {
        fetch(dummyLogger, dummyConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(result.length).to.be(6);

            expect(_.get(result[0], 'facilityID')).to.be('100');
            expect(_.get(result[0], 'vistaName')).to.be('name1');

            expect(_.get(result[1], 'facilityID')).to.be('200');
            expect(_.get(result[1], 'vistaName')).to.be('name2');

            expect(_.get(result[2], 'facilityID')).to.be('250');
            expect(_.get(result[2], 'vistaName')).to.be('name22');

            expect(_.get(result[3], 'facilityID')).to.be('300');
            expect(_.get(result[3], 'vistaName')).to.be('name3, city3');

            expect(_.get(result[4], 'facilityID')).to.be('400');
            expect(_.get(result[4], 'vistaName')).to.be('name4, AB');

            expect(_.get(result[5], 'facilityID')).to.be('500');
            expect(_.get(result[5], 'vistaName')).to.be('name5, city5, CD');

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

            expect(_.get(result[0], 'facilityID')).to.be('200');
            expect(_.get(result[0], 'vistaName')).to.be('name2');

            done();
        }, {
            pcmmDbConfig: 'dummyVal',
            fullConfig: dummyConfig,
            division: '200'
        });
    });
});
