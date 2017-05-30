/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

define([
    'require',
    'test/stubs',
    'jasminejquery',
    'underscore',
    'backbone',
    'app/resources/fetch/document/model'
], function(require, Stubs, jasminejquery, _, Backbone, Model) {
    'use strict';


    describe('Setup Documents', function documents() {
        var response = [];
        var DomainModel = _.get(window, ADK.ResourceService.DomainModel);
        var addFacilityMoniker = _.get(window, 'ADK.Enrichment.addFacilityMoniker');

        if (!DomainModel) {
            // This needs to exist before require a well
            _.set(window, 'ADK.ResourceService.DomainModel', Backbone.Model);
        }

        beforeEach(function() {
            _.set(window, 'ADK.ResourceService.DomainModel', Backbone.Model);
            _.set(window, 'ADK.Enrichment.addFacilityMoniker', function(response) {
                response.facilityMoniker = 'PAN';
                return response;
            });
        });

        afterEach(function() {
            _.set(window, 'ADK.ResourceService.DomainModel', DomainModel);
            _.set(window, 'ADK.Enrichment.addFacilityMoniker', addFacilityMoniker);
        });

        describe('Testing documents parser', function documents() {
            beforeEach(function() {
                response = {
                    'author': 'PROVIDER,EIGHT',
                    'authorDisplayName': 'Provider,Eight',
                    'authorUid': 'urn:va:user:C877:991',
                    'clinicians': [{
                        'displayName': 'Provider,Eight',
                        'name': 'PROVIDER,EIGHT',
                        'role': 'AU',
                        'summary': "DocumentClinician{uid='urn:va:user:C877:991'}",
                        'uid': 'urn:va:user:C877:991'
                    }, {
                        'displayName': 'Provider,Eight',
                        'name': 'PROVIDER,EIGHT',
                        'role': 'S',
                        'signature': 'EIGHT PROVIDER MD',
                        'signedDateTime': '20150813221510',
                        'summary': "DocumentClinician{uid='urn:va:user:C877:991'}",
                        'uid': 'urn:va:user:C877:991'
                    }, {
                        'displayName': 'Provider,Eight',
                        'name': 'PROVIDER,EIGHT',
                        'role': 'ES',
                        'summary': "DocumentClinician{uid='urn:va:user:C877:991'}",
                        'uid': 'urn:va:user:C877:991'
                    }, {
                        'displayName': 'P8',
                        'name': 'P8',
                        'role': 'E',
                        'summary': "DocumentClinician{uid='urn:va:user:C877:991'}",
                        'uid': 'urn:va:user:C877:991'
                    }],
                    'documentClass': 'PROGRESS NOTES',
                    'documentDefUid': 'urn:va:doc-def:C877:621',
                    'documentTypeCode': 'PN',
                    'documentTypeName': 'Progress Note',
                    'encounterName': 'CARDIOLOGY Aug 13, 2015',
                    'encounterUid': 'urn:va:visit:C877:8:11626',
                    'entered': '20150813221404',
                    'facilityCode': '998',
                    'facilityName': 'ABILENE (CAA)',
                    'isInterdisciplinary': 'false',
                    'kind': 'Progress Note',
                    'lastUpdateTime': '20150813221510',
                    'localId': '11598',
                    'localTitle': 'CARDIOLOGY ATTENDING OUTPATIENT',
                    'nationalTitle': {
                        'name': 'CARDIOLOGY ATTENDING OUTPATIENT NOTE',
                        'vuid': 'urn:va:vuid:4693507'
                    },
                    'pid': 'C877;8',
                    'referenceDateTime': '20150813221300',
                    'signedDateTime': '20150813221510',
                    'signer': 'PROVIDER,EIGHT',
                    'signerDisplayName': 'Provider,Eight',
                    'signerUid': 'urn:va:user:C877:991',
                    'stampTime': '20150813221510',
                    'status': 'COMPLETED',
                    'statusDisplayName': 'Completed',
                    'summary': 'CARDIOLOGY ATTENDING OUTPATIENT',
                    'uid': 'urn:va:document:C877:8:11598',
                    'asuPermissions': ['VIEW', 'MAKE ADDENDUM'],
                    'thumbnails': ['http://IP             /vix/viewer/thumbnails'],
                    'viewerUrl': 'http://IP             /vix/viewer?ContextId=RPT%5ECPRS%5E8%5E%5E11598%5E%5EABILENE%20(CAA)%5E%5E%5E%5E%5E%5E0&SiteNumber=998&PatientICN=10110V004877&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%253d&VixRootUrl=http://IP             ',
                    'detailsUrl': 'http://IP             /vix/viewer/studydetails?ContextId=RPT%5ECPRS%5E8%5E%5E11598%5E%5EABILENE%20(CAA)%5E%5E%5E%5E%5E%5E0&SiteNumber=998&PatientICN=10110V004877&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%253d&VixRootUrl=http://IP             ',
                    'contextId': 'RPT^CPRS^8^^11598^^ABILENE (CAA)^^^^^^0',
                    'hasImages': true,
                    'imageCount': 2
                };
            });

            it('correctly parses the response', function() {
                var result = Model.prototype.parse(response);

                expect(result.thumbnailCollection.length).toBe(1);
                var thumbnail = result.thumbnailCollection.pop().toJSON();
                expect(thumbnail.thumbnailUrl).toBe(response.thumbnails[0]);
                expect(thumbnail.imageCount).toBe(response.imageCount);
                expect(thumbnail.viewerUrl).toBe(response.viewerUrl);
                expect(result.displayTitle).toBe(response.localTitle.toLowerCase());
            });
        });
    });
});