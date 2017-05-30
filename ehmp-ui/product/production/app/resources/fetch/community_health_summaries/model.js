define([], function () {
    'use strict';

    var RESOURCE = 'patient-record-vlerdocument';

    var CommunityHealthSummary = ADK.Resources.Model.extend({
        resource: RESOURCE,
        idAttribute: 'uid',
        parse: function (resp) {
            resp.ccdDateTime = this.getCcdDateTime(resp);
            resp.authorDisplayName = this.getAuthorDisplayName(resp);
            resp = this.setKind(resp);
            return resp;
        },
        getCcdDateTime: function (ccdObject) {
            var ccdDateTime;
            if (ccdObject.creationTime) {
                ccdDateTime = ccdObject.creationTime;
            } else if (ccdObject.dateTime) {
                ccdDateTime = ccdObject.dateTime;
            }
            return ccdDateTime;
        },
        getAuthorDisplayName: function (ccdObject) {
            return _.get(ccdObject, 'authorList[0].institution', 'N/A');
        },
        setKind: function (ccdObject) {
            if (!ccdObject.documentType) {
                ccdObject.documentType = ccdObject.kind;
            }

            ccdObject.kind = 'Community Health Summaries';
            return ccdObject;
        }
    });

    return CommunityHealthSummary;
});