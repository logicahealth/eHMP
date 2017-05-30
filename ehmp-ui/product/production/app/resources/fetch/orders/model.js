/* global ADK */

define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var OrdersModel = Backbone.Model.extend({
        parse: function(response) {
            if (response.entered) {
                response.enteredFormatted = ADK.utils.formatDate(response.entered);
            }
            if (!response.displayGroup) {
                response.displayGroup = this._getDisplayGroupFromDoDService(response.service);
            }

            ADK.Enrichment.addFacilityMoniker(response);
            return response;
        },
        defaults: {
            "clinicians": [],
            "content": "",
            "displayGroup": "",
            "entered": "",
            "facilityCode": "",
            "facilityName": "",
            "kind": "Consult",
            "lastUpdateTime": "",
            "localId": "",
            "locationName": "",
            "locationUid": "",
            "name": "",
            "oiCode": "",
            "oiName": "",
            "oiPackageRef": "",
            "pid": "",
            "providerDisplayName": "",
            "providerName": "",
            "providerUid": "",
            "results": [],
            "service": "",
            "stampTime": "",
            "start": "",
            "statusCode": "",
            "statusName": "",
            "statusVuid": "",
            "stop": "",
            "summary": "",
            "uid": "",
            "provider": "",
            "shortSummary": "",
            "longSummary": false,
            "isFlagged": ""
        },
        // Determined by the VxSync jMeadows order transform code. This captures the mapping between DoD record order
        // service code and VistA display group. If the order type filter starts malfunctioning, Check here.
        // Not all order entries have a 'displayGroup' attribute; for those entries, we attempt to map
        // back to an appropriate display group using the entry 'service' attribute, which should contain the
        // displayed group name as shown in the order group dropdown menu.
        _getDisplayGroupFromDoDService: function(service) {
            var ORDER_DOD_SERVICE_TO_DISPLAY_GROUP_MAP = {
                PSJ: 'I RX',
                PSO: 'O RX',
                PSH: 'NV RX',
                PSIV: 'IV RX',
                PSG: 'I RX',
                GMRA: 'ALG',
                GMRC: 'CSLT',
                RA: 'XRAY',
                FH: 'DIET',
                LR: 'LAB',
                OR: 'NURS',
                ZZRV: 'V/M'
            };
            return service && ORDER_DOD_SERVICE_TO_DISPLAY_GROUP_MAP[service] || '';
        }
    });
    return OrdersModel;
});