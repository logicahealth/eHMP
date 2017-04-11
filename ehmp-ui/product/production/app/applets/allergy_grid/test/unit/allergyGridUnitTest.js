/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, afterEach */

// Jasmine Unit Testing Suite
define(['jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'app/applets/allergy_grid/util'
], function($, Backbone, Marionette, jasminejquery, Util) {
    'use strict';

    describe("Test parse functions suite", function() {
        var response = null;

        beforeEach(function() {
            response = {
                facilityCode: "500",
                facilityName: "CAMP BEE",
                entered: "201312051608",
                kind: "Allergy/Adverse Reaction",
                originatorName: "LORD,BRIAN",
                mechanism: "ALLERGY",
                uid: "urn:va:allergy:C877:100022:967",
                summary: "PENICILLIN",
                pid: "C877;100022",
                localId: "967",
                historical: false,
                reference: "125;GMRD(120.82,",
                products: [{
                    name: "PENICILLIN",
                    vuid: "urn:va:vuid:",
                    summary: "AllergyProduct{uid='null'}"
                }],
                reactions: [{
                    name: "ANOREXIA",
                    vuid: "urn:va:vuid:4637051",
                    summary: "AllergyReaction{uid='null'}"
                }, {
                    name: "DRY MOUTH",
                    vuid: "urn:va:vuid:4538597",
                    summary: "AllergyReaction{uid='null'}"
                }],
                drugClasses: [{
                    code: "AM114",
                    name: "(INACTIVE) PENICILLINS",
                    summary: "AllergyDrugClass{uid='null'}"
                }],
                observations: [{
                    date: "20131219",
                    severity: "MODERATE",
                    summary: "AllergyObservation{uid='null'}"
                }],
                typeName: "DRUG"
            };
        });

        afterEach(function() {
            response = null;
        });

        it("Test setFacilityColor sets DOD color ", function() {
            response.facilityCode = 'DOD';
            response = Util.setFacilityColor(response);

            expect(response.facilityColor).toEqual('DOD');
        });

        it("Test setFacilityColor sets non-DOD color ", function() {
            response = Util.setFacilityColor(response);

            expect(response.facilityColor).toEqual('nonDOD');
        });
    });
});