'use strict';

var _ = require('lodash');
var fetch = require('./teams-for-user-fetch-list.js').fetch;
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
            division: [{
                id: '1',
                name: 'ABB'
            }],
            abbreviation: 'ABB'
        },
        'BBBB': {
            division: [{
                id: '2',
                name: 'BBCCDDDD'
            }],
            abbreviation: 'CDD'
        }
    }
};

var params = {
    pcmmDbConfig: 'dummyVal',
    fullConfig: dummyConfig
};

var pcmmData = [{ TEAM_ID: 'The A team', TEAM_NAME: 'Baracus', STATIONNUMBER: '1'},
                { TEAM_ID: 'Jurassic Team', TEAM_NAME: 'Cretaceous', STATIONNUMBER: '2'}];

describe('teams for user fetch list', function(){

    beforeEach(function(){
        sinon.stub(pcmm, 'doQueryWithParams', function(dummyConfig, query, queryParams, callback, params){
            return callback(null, pcmmData);
        });
    });

    afterEach(function(){
        pcmm.doQueryWithParams.restore();
    });

    it('returns expected JSON', function() {
        fetch(dummyLogger, dummyConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(_.get(result[0], 'teamID')).to.be('The A team');
            expect(_.get(result[0], 'teamName')).to.be('Baracus - ABB');

            expect(_.get(result[1], 'teamID')).to.be('Jurassic Team');
            expect(_.get(result[1], 'teamName')).to.be('Cretaceous - CDD');
        }, params);
    });
});
