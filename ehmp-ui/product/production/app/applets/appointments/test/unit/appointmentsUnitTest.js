/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, afterEach */

define(['jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'testUtil',
    'app/applets/appointments/util'
], function($, Backbone, Marionette, jasminejquery, testUtil, Util) {
    'use strict';

    describe('Utilities functions suite', function() {
        var response = null;

        beforeEach(function(done) {
            response = initializeResponse();
            done();
        });

        afterEach(function(done) {
            response = null;
            done();
        });

        it('Test getFacilityColor sets DOD color ', function() {
            response.facilityCode = 'DOD';
            response = Util.getFacilityColor(response);

            expect(response.facilityColor).toEqual('DOD');
        });

        it('Test getFacilityColor sets non-DOD color ', function() {
            response.facilityCode = 'nonDoD';
            response = Util.getFacilityColor(response);

            expect(response.facilityColor).toEqual('nonDOD');
        });

        it('Test typeName sets Other', function() {
            response.typeDisplayName = 'Event (Historical)';
            response = Util.getFormattedDisplayTypeName(response);

            expect(response.formattedTypeName).toEqual('Other');
        });

        it('Test getFormattedDescription using kind', function() {
            response = Util.getFormattedDescription(response);

            expect(response.formattedDescription).toEqual('Visit');
        });

        it('Test getFormattedDescription using description', function() {
            response.kind = null;
            response.description = 'Visit';
            response = Util.getFormattedDescription(response);

            expect(response.formattedDescription).toEqual('Visit');
        });

        it('Test getFormattedStatus', function() {
            response.appointmentStatus = 'kept';
            response = Util.getFormattedStatus(response);

            expect(response.status).toEqual('Kept');
        });
    });

    function initializeResponse() {
        return {
            'current': false,
            'facilityCode': '500',
            'facilityName': 'CAMP MASTER',
            'patientClassName': 'Ambulatory',
            'dateTime': '200612080730',
            'service': 'SURGERY',
            'stopCodeName': 'SURGICAL PROCEDURE UNIT',
            'locationUid': 'urn:va:location:9E7A:424',
            'locationName': 'OR4',
            'shortLocationName': 'OR4',
            'locationDisplayName': 'Or4',
            'locationOos': false,
            'kind': 'Visit',
            'uid': 'urn:va:visit:9E7A:3:5552',
            'summary': 'SURGICAL PROCEDURE UNIT',
            'pid': '9E7A;3',
            'localId': '5552',
            'typeName': 'OR4 VISIT',
            'typeDisplayName': 'Or4 Visit',
            'patientClassCode': 'urn:va:patient-class:AMB',
            'categoryCode': 'urn:va:encounter-category:OV',
            'categoryName': 'Outpatient Visit',
            'stopCodeUid': 'urn:va:stop-code:435',
            'encounterType': 'P'
        };
    }
});