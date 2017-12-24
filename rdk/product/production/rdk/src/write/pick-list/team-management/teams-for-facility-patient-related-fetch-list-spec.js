'use strict';

var _ = require('lodash');
var fetch = require('./teams-for-facility-patient-related-fetch-list.js').fetch;
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
        }
    }
};

var params = {
    pcmmDbConfig: 'dummyVal',
    fullConfig: dummyConfig
};

var pcmmData = [{ TEAM_ID: '42', TEAM_NAME: 'Towel', STATIONNUMBER: '1'},
                { TEAM_ID: '777z', TEAM_NAME: 'My Team Name', STATIONNUMBER: '1'}];

describe('teams-for-facility-patient-related fetch list', function(){

    beforeEach(function(){
        sinon.stub(pcmm, 'doExecuteProcWithParams', function(dummyConfig, query, queryParams, callback, params){
            return callback(null, pcmmData);
        });
    });

    afterEach(function(){
        pcmm.doExecuteProcWithParams.restore();
    });

    it('returns expected JSON', function() {
        fetch(dummyLogger, dummyConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(_.get(result[0], 'teamID')).to.be('42');
            expect(_.get(result[0], 'teamName')).to.be('Towel - ABB');

            expect(_.get(result[1], 'teamID')).to.be('777z');
            expect(_.get(result[1], 'teamName')).to.be('My Team Name - ABB');
        }, params);
    });
});
