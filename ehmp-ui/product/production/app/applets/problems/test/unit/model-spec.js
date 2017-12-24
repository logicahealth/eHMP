define([
    'test/stubs',
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'app/resources/fetch/problems/model'
], function(Stubs, $, Backbone, Marionette, jasminejquery, ProblemsModel) {
    'use strict';

    describe('Tests for problems model parse', function() {
        it('Should return model properties correctly based on the problemJSON', function() {
            spyOn(ADK.Messaging, 'request').and.callFake(function(channel) {
                if (channel === 'facilityMonikers') {
                    return new Backbone.Collection({
                        facilityCode: "500",
                        facilityMoniker: "TST1",
                        facilityName: "Camp Master"
                    });
                } else if (channel === 'get:current:workspace') {
                    return 'consult_test_page';
                }
            });
            var crsUtil = ADK.utils.crsUtil;
            var problemJSON = {
                "acuityCode": "urn:va:prob-acuity:c",
                "acuityName": "chronic",
                "agentOrangeExposure": "NO",
                "codes": [{
                    "code": "250.00",
                    "display": "DIABETES MELLI W/O COMP TYP II",
                    "system": "urn:oid:2.16.840.1.113883.6.42"
                }],
                "encounters": [{
                    "dateTime": 20140325095600,
                    "facilityCode": 500,
                    "facilityName": "CAMP MASTER",
                    "stopCodeName": "PRIMARY CARE/MEDICINE",
                    "stopCodeUid": "urn:va:stop-code:323",
                    "visitUid": "urn:va:visit:SITE:8:10063"
                }],
                "entered": "20000508",
                "enteredBy": "RADTECH,TWENTYFOUR",
                "facilityCode": "500",
                "facilityName": "CAMP MASTER",
                "icdCode": "urn:icd:250.00",
                "icdGroup": "250",
                "icdName": "DIABETES MELLI W/O COMP TYP II",
                "kind": "Problem",
                "lastUpdateTime": "20040331092229",
                "lexiconCode": 8718,
                "localId": "185",
                "locationDisplayName": "Primary Care",
                "locationName": "PRIMARY CARE",
                "locationUid": "urn:va:location:SITE:32",
                "onset": "20000221",
                "persianGulfExposure": "NO",
                "pid": "SITE;8",
                "problemText": "Diabetes Mellitus Type II or unspecified (ICD-9-CM 250.00)",
                "providerDisplayName": "Vehu,Ten",
                "providerName": "VEHU,TEN",
                "providerUid": "urn:va:user:SITE:20012",
                "radiationExposure": "NO",
                "recordedBy": "RADTECH,TWENTYFOUR",
                "recordedOn": "20000508",
                "removed": false,
                "serviceConnected": false,
                "stampTime": "20040331092229",
                "statusCode": "urn:sct:55561003",
                "statusDisplayName": "Active",
                "statusName": "ACTIVE",
                "summary": "Diabetes Mellitus Type II or unspecified (ICD-9-CM 250.00)",
                "uid": "urn:va:problem:SITE:8:185",
                "unverified": false,
                "updated": "20040331"
            };

            var parsedJson = ProblemsModel.prototype.parse(problemJSON);
            expect(parsedJson.standardizedDescription).toEqual(undefined);
            expect(parsedJson.serviceConnectedDisp).toEqual('No');
            expect(parsedJson.chronic).toEqual(true);
            expect(parsedJson.moderate).toEqual(undefined);
            expect(parsedJson.facilityColor).toEqual('nonDOD');
            expect(parsedJson.commentBubble).toEqual(undefined);
            expect(parsedJson.icdName).toEqual('DIABETES MELLI W/O COMP TYP II');
            expect(parsedJson.timeSince).toEqual(20140325095600);
            expect(parsedJson.timeSinceText).toEqual('finalResultText');
            expect(parsedJson.timeSinceDateString).toEqual(20140325095600);
            expect(parsedJson[crsUtil.crsAttributes.CRSDOMAIN]).toEqual(crsUtil.domain.PROBLEM);
            expect(parsedJson.facNameTruncated).toEqual('CAM');
        });
    });
});