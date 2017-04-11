/* global ADK */

define([
    'backbone',
    'marionette',
    'underscore',
    'moment'
], function(Backbone, Marionette, _, moment) {
    "use strict";

    var ProblemsModel = Backbone.Model.extend({
        parse: function(response) {
            var crsUtil = ADK.utils.crsUtil;

            response = this.getFacilityMoniker(response);
            response = this.getStandardizedDescription(response);
            response = this.getServiceConnected(response);
            response = this.getAcuityName(response);
            response = this.getFacilityColor(response);
            response = this.getOnsetFormatted(response);
            response = this.getUpdatedFormatted(response);
            response = this.getCommentBubble(response);
            response = this.getICDName(response);
            response = this.getTimeSince(response);
            response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.PROBLEM;
            response.facNameTruncated = response.facilityName.substring(0, 3);

            return response;
        },
        defaults: {
            "acuityCode": "",
            "acuityName": "",
            "agentOrangeExposure": "",
            "applet_id": "problems",
            "codes": [{
                "code": "",
                "display": "",
                "system": ""
            }],
            "entered": "",
            "enteredBy": "",
            "facilityCode": "",
            "facilityName": "",
            "icdCode": "",
            "icdGroup": "",
            "icdName": "",
            "kind": "Problem",
            "lastUpdateTime": "",
            "lexiconCode": 0,
            "localId": "",
            "locationDisplayName": "",
            "locationName": "",
            "locationUid": "",
            "onset": "",
            "persianGulfExposure": "",
            "pid": "",
            "problemText": "",
            "providerDisplayName": "",
            "providerName": "",
            "providerUid": "",
            "radiationExposure": "",
            "recordedBy": "",
            "recordedOn": "",
            "removed": false,
            "serviceConnected": false,
            "stampTime": "",
            "statusCode": "",
            "statusDisplayName": "",
            "statusName": "",
            "summary": "",
            "uid": "",
            "unverified": false,
            "updated": ""
        },
        getFacilityMoniker: function(response) {
            var facilityMonikers = ADK.Messaging.request('facilityMonikers');
            var moniker = facilityMonikers.findWhere({
                facilityCode: response.facilityCode
            });
            if (!_.isUndefined(moniker)) {
                response.facilityMoniker = moniker.get('facilityMoniker') || '';
            }
            return response;
        },
        getStandardizedDescription: function(response) {
            if (response.codes) {
                response.codes.forEach(function(code) {
                    if (code.system.indexOf('http://snomed.info/sct') !== -1) {
                        response.standardizedDescription = code.display;
                        response.snomedCode = code.code;
                    }
                });
            }
            return response;
        },
        getStatusName: function(statusName) {
            return statusName ? this._toTitleCase(statusName) : '';
        },
        getServiceConnected: function(response) {
            if (response.serviceConnected === true) {
                response.serviceConnectedDisp = 'Yes';
            } else if (response.serviceConnected !== undefined) {
                response.serviceConnectedDisp = 'No';
            } else {
                response.serviceConnectedDisp = '';
            }
            return response;
        },
        getProblemText: function(problemText) {
            if (problemText) {
                var icd10Index = problemText.indexOf('(ICD-10');
                if (icd10Index > 0) {
                    problemText = problemText.substring(0, icd10Index).trim();
                }
                var icd9Index = problemText.indexOf('(ICD-9');
                if (icd9Index > 0) {
                    problemText = problemText.substring(0, icd9Index).trim();
                }
                var sctIndex = problemText.indexOf('(SCT');
                if (sctIndex > 0) {
                    problemText = problemText.substring(0, sctIndex).trim();
                }
                var tfMatch = /\(.*(AO|IR|HNC|MST|SHD|EC)\)/.exec(problemText);
                if (tfMatch) {
                    problemText = problemText.substring(0, tfMatch.index).trim();
                }
            } else {
                problemText = '';
            }
            return problemText;
        },
        getICDCode: function(icdCode) {
            if (icdCode) {
                icdCode = icdCode.replace('urn:icd:', '');
            } else {
                icdCode = '';
            }
            return icdCode;
        },
        getAcuityName: function(response) {
            if (response.acuityName) {
                response.acuityName = this._toTitleCase(response.acuityName);
                if (response.acuityName === 'Chronic') {
                    response.chronic = true;
                } else if (response.acuityName === 'Moderate') {
                    response.moderate = true;
                }
            } else {
                response.acuityName = 'Unknown';
            }
            return response;
        },
        getFacilityColor: function(response) {

            if (response.facilityCode && response.facilityCode === 'DOD') {
                response.facilityColor = 'DOD';
            } else {
                response.facilityColor = 'nonDOD';
            }
            return response;
        },
        getOnsetFormatted: function(response) {
            if (!_.isUndefined(response.onset)) {
                var onset = response.onset.replace(/0000$/, "").replace(/00$/, "");

                if (onset.length === 4) { //
                    response.onsetFormatted = ADK.utils.formatDate(onset, 'YYYY');
                } else if (onset.length === 6) {
                    response.onsetFormatted = ADK.utils.formatDate(onset, 'MM/YYYY');
                } else {
                    response.onsetFormatted = ADK.utils.formatDate(onset);
                }
            } else {
                response.onset = "";
            }
            return response;
        },
        getUpdatedFormatted: function(response) {
            if (response.updated) {
                response.updatedFormatted = ADK.utils.formatDate(response.updated);
            }
            return response;
        },
        getCommentBubble: function(response) {

            if (response.comments && response.comments.length > 0) {
                response.commentBubble = true;
            }
            return response;
        },
        getICDName: function(response) {
            if (!response.icdName) {
                response.icdName = response.problemText;
            }
            return response;
        },
        getTimeSince: function(response) {
            var startDate;
            if (response.encounters) {
                var sort = this._sortDate;
                response.encounters.sort(function(a, b) {
                    return sort(a, b);
                });
                startDate = response.encounters[0].dateTime;
            } else {
                startDate = response.entered || response.updated;
            }

            var st = ADK.utils.getTimeSince(startDate);
            response.timeSince = st.timeSince;
            response.timeSinceText = st.timeSinceDescription;
            response.timeSinceDateString = startDate;
            response.timeSinceDate = moment(startDate, "YYYYMMDD");

            return response;
        },
        _sortDate: function(a, b) {
            var c = new Date(a.dateTime);
            var d = new Date(b.dateTime);
            return (c - d) * -1;
        },
        _toTitleCase: function(str) {
            if (!str) {
                return '';
            } else {
                return str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        }
    });
    return ProblemsModel;
});