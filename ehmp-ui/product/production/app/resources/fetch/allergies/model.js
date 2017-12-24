define([], function() {
    'use strict';

    var RESOURCE = 'patient-record-allergy';
    var UMLS_HL7_OID = 'urn:oid:2.16.840.1.113883.6.86';

    var Allergy = ADK.Resources.Model.extend({
        resource: RESOURCE,
        vpr: 'allergies',
        idAttribute: 'uid',
        childParse: false,
        parse: function(resp) {
            if (resp.observations) {
                resp = ADK.utils.extract(resp, resp.observations[0], {
                    acuityName: 'severity',
                    observed: 'date'
                });
                resp = this.getAcuityName(resp);

                if (resp.observed && resp.observed.length === 4) {
                    resp.observedDate = resp.observed;
                } else if (resp.observed && resp.observed.length === 6) {
                    resp.observedDate = ADK.utils.formatDate(resp.observed + '01', 'MMM YYYY');
                } else if (resp.observed && resp.observed.length === 8) {
                    if (resp.observed.substring(resp.observed.length - 4, resp.observed.length) === '0000') {
                        resp.observedDate = resp.observed.substring(0, 4);
                    } else if (resp.observed.substring(resp.observed.length - 2, resp.observed.length) === '00') {
                        resp.observedDate = resp.observed.substring(4, 6) + '/' + resp.observed.substring(0, 4);
                    } else {
                        resp.observedDate = ADK.utils.formatDate(resp.observed, "MM/DD/YYYY");
                    }
                } else {
                    resp.observedDate = ADK.utils.formatDate(resp.observed, "MM/DD/YYYY - HH:mm");
                }
            }

            resp = this.getDrugClasses(resp);
            resp = this.getStandardizedName(resp);
            resp = this.getCommentBubble(resp);
            resp = this.getReactions(resp);
            return resp;
        },
        getAcuityName: function(response) {
            response.acuityName = this.toTitleCase(response.acuityName);
            if (response.acuityName === 'Mild') {
                response.mild = true;
            } else if (response.acuityName === 'Moderate') {
                response.moderate = true;
            } else if (response.acuityName === 'Severe') {
                response.severe = true;
            }
            return response;
        },
        getStandardizedName: function(response) {
            response.standardizedName = '';
            if (response.codes) {
                response.codes.forEach(function(code) {
                    if (code.system.indexOf(UMLS_HL7_OID) !== -1) {
                        response.standardizedName = code.display;
                    }
                });
            }
            return response;
        },
        getDrugClasses: function(response) {
            var names = '';
            if (response.drugClasses) {
                response.drugClasses.forEach(function(drugClass) {
                    if (names !== '') {
                        names += ', ';
                    }
                    names += drugClass.name;
                });
            }
            response.drugClassesNames = names;
            return response;
        },
        getCommentBubble: function(response) {
            if (!_.isEmpty(response.comments)) {
                response.commentBubble = _.any(response.comments, function(commentObj) {
                    return (commentObj.comment && commentObj.comment.trim().length > 0);
                });
            }

            return response;
        },
        getReactions: function(response) {
            var result = '';
            if (response.reactions) {
                response.reactions.forEach(function(reac) {
                    if (result !== '')
                        result += '; ';
                    result += reac.name;
                });
            }
            response.reaction = result;
            return response;
        },
        toTitleCase: function(str) {
            if (!str) {
                return '';
            } else {
                return str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        },
        defaults: {
            'applet_id': 'allergy_grid',
            'codes': null,
            'comments': null,
            'drugClasses': null,
            'entered': '',
            'facilityCode': '',
            'facilityName': '',
            'historical': false,
            'kind': '',
            'lastUpdateTime': '',
            'localId': '',
            'mechanism': '',
            'originatorName': '',
            'pid': '',
            'products': null,
            'reactions': null,
            'reference': '',
            'stampTime': '',
            'summary': '',
            'typeName': '',
            'uid': '',
            'verified': '',
            'verifierName': ''
        }
    });

    return Allergy;
});