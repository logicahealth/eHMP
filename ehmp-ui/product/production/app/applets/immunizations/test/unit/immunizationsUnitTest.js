/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, afterEach */

// Jasmine Unit Testing Suite
define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'app/applets/immunizations/util',
    'app/resources/fetch/immunizations/utils'
], function($, Backbone, Marionette, jasminejquery, Util, ResourcePoolUtils) {
    'use strict';

    describe('Test parse functions suite', function() {
        var response = null;

        beforeEach(function() {
            response = {
                uid: 'urn:va:immunization:DOD:0000000013:1000001116',
                summary: 'Anthrax',
                pid: '9E7A;71',
                contraindicated: false,
                reactionName: 'NONE',
                reactionCode: 'urn:va:reaction:9E7A:8:0',
                facilityCode: 'DOD',
                facilityName: 'DOD',
                name: 'Anthrax',
                administeredDateTime: '20121115',
                seriesName: '1',
                performer: {
                    summary: 'Clinician{uid="null"}'
                },
                kind: 'Immunization',
                codes: [{
                    code: '24',
                    system: 'urn:oid:2.16.840.1.113883.12.292',
                    display: 'anthrax vaccine'
                }]
            };
        });

        afterEach(function() {
            response = null;
        });

        it('Test createContraindicated is false', function() {
            response.contraindicatedDisplay = Util.createContraindicated(_.get(response, 'contraindicated', ''));

            expect(response.contraindicatedDisplay).toEqual('No');
        });

        it('Test createContraindicated is true', function() {
            response.contraindicated = true;
            response.contraindicatedDisplay = Util.createContraindicated(_.get(response, 'contraindicated', ''));

            expect(response.contraindicatedDisplay).toEqual('Yes');
        });

        it('Test createFacilityColor sets DOD color ', function() {
            response.facilityCode = 'DOD';
            response.facilityColor = Util.createFacilityColor(_.get(response, 'facilityCode', ''));

            expect(response.facilityColor).toEqual('DOD');
        });

        it('Test createFacilityColor sets non-DOD color ', function() {
            response.facilityCode = 'nonDoD';
            response.facilityColor = Util.createFacilityColor(_.get(response, 'facilityCode', ''));

            expect(response.facilityColor).toEqual('nonDOD');
        });

        it('Test createStandardizedName ', function() {
            response.standardizedName = ResourcePoolUtils.createStandardizedName(_.get(response, 'codes', ''));

            expect(response.standardizedName).toBe('anthrax vaccine');
        });

        it('Test createStandardizedName when null ', function() {
            response.codes = null;
            delete response.codes;
            response.standardizedName = ResourcePoolUtils.createStandardizedName(_.get(response, 'codes', ''));

            expect(response.standardizedName).toBe('');
        });

        it('Test createStandardizedName when system is incorrect ', function() {
            response.codes = [{
                code: '24',
                system: 'somethingElse',
                display: 'anthrax vaccine'
            }];
            response.standardizedName = ResourcePoolUtils.createStandardizedName(_.get(response, 'codes', ''));

            expect(response.standardizedName).toBe('');
        });

        it('Test hasCommentBubble when there is a comment', function() {
            response.comment = 'This is a test comment';
            response.commentBubble = Util.hasCommentBubble(_.get(response, 'comment'));

            expect(response.commentBubble).toBeDefined();
        });
    });
});