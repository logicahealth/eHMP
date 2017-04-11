'use strict';
var _ = require('lodash');
var sensitivityUtils = require('./sensitivity-utils');
var sensitiveDataValue = sensitivityUtils._sensitiveDataValue;
var sensitivityUtilsSpecData = require('./sensitivity-utils-spec-data');
var defaultRPCPatient = sensitivityUtilsSpecData.defaultRPCPatient;

describe('Sensitivity Utils', function() {
    var patient;
    beforeEach(function() {
        patient = _.clone(defaultRPCPatient);
    });
    afterEach(function() {});
    describe('hideSensitiveFields', function() {
        it('hides sensitive data fields', function() {
            var result = sensitivityUtils.hideSensitiveFields(patient, undefined);
            _.each(sensitivityUtils._sensitiveDataFields, function(field) {
                expect(result[field]).to.be(sensitiveDataValue);
            });
        });
    });
    describe('removeSensitiveFields', function() {
        it('removes blacklisted data fields', function() {
            var result = sensitivityUtils.removeSensitiveFields(patient, undefined);
            _.each(sensitivityUtils._blacklistDataFields, function(field) {
                expect(result).not.to.have.ownProperty(field);
            });
        });
    });
});
