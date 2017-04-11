'use strict';

var _ = require('lodash');
var fetch = require('./roles-for-team-fetch-list.js').fetch;
var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var dummyConfig = 'dummyConfig';

var params = { pcmmDbConfig: 'dummyVal' };

var pcmmData = [{ PCM_STD_TEAM_ROLE_ID: '46n2', NAME: 'Maynard'},
                { PCM_STD_TEAM_ROLE_ID: '57bb3', NAME: 'Freud'}];

describe('roles fetch list', function(){

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
            expect(_.get(result[0], "roleID")).to.be("46n2");
            expect(_.get(result[0], "name")).to.be("Maynard");

            expect(_.get(result[1], "roleID")).to.be("57bb3");
            expect(_.get(result[1], "name")).to.be("Freud");
        }, params);
    });
});
