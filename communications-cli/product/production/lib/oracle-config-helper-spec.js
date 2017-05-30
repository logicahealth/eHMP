#!/usr/bin/env node

'use strict';
var configHelper = require('./oracle-config-helper.js');
describe('it returns a connection object', function() {
    it('should return an require error', function() {
        configHelper.getOracleConfig('test.json', 'oracledb.communicationsDatabase', function(err, result) {
            expect(err).to.include('Problem getting config: Error: Cannot find module ');
        });
    });
});
