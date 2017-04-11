define([
    'backbone',
    'marionette',
    'jasminejquery',
    'app/resources/fetch/immunizations/model'
], function(Backbone, Marionette, jasminejquery, ImmunizationsModel) {
    'use strict';

    describe('Unit tests for immunizations model', function() {
        it('Should parse model response properties correctly', function() {
            var response = {
                kind: 'Immunization',
                administeredDateTime: '20140113',
                codes: [{
                    code: '115',
                    display: 'Mock Immunization Name',
                    system: 'urn:oid:2.16.840.1.113883.12.292'
                }]
            };

            var modifiedResponse = ImmunizationsModel.prototype.parse(response);
            var expectDate =  ADK.utils.formatDate(response.administeredDateTime).replace(/00\//g,"");
            expect(modifiedResponse.administeredFormatted).toEqual(expectDate);
            expect(modifiedResponse.standardizedName).toEqual('Mock Immunization Name');
        });
    });
});