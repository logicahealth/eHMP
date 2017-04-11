define([
    "backbone",
    "marionette",
    "underscore",
    "main/ADK"
], function(Backbone, Marionette, _, ADK) {
    "use strict";

    var Util = {};
    //Parsing function for calling orders resource
    Util.parseOrderResponse = function(response, displayGroup) {
        if (response.entered) {
            response.enteredFormatted = ADK.utils.formatDate(response.entered);
        }
        //DE448 - Fix the Stop and Start dates for order display
        if (response.stop) {
            response.stop = Util.parseForOrderStopStartDate(response.stop);
            response.stopHasTime = response.stop.length > 8;
        }
        if (response.start) {
            response.start = Util.parseForOrderStopStartDate(response.start);
            response.startHasTime = response.start.length > 8;
        }
        if (!response.displayGroup) {
            response.displayGroup = displayGroup;
        }

        ADK.Enrichment.addFacilityMoniker(response);

        return response;
    };


    Util.getFieldFromUid = function(uid, field) {
        var uidFields = ['siteCode', 'orderId'];
        var OPERATIONAL_DATA_UID_LENGTH = 5;
        var PATIENT_DATA_UID_LENGTH = 6;
        var uidLength = uid.split(':').length;

        if (_.includes(uidFields, field) && _.isString(uid) && (uidLength == OPERATIONAL_DATA_UID_LENGTH || uidLength == PATIENT_DATA_UID_LENGTH)) {
            switch (field) {
                case 'siteCode':
                    return uid.split(':')[3];
                case 'orderId':
                    return _.last(uid.split(':')) + ';1';
            }
        }
        return '';
    };

    // The state of the "discontinue/cancel" and "sign" controls are based on the corresponding order state.
    Util.isDiscontinued = function(model) {
        var detailSummary = (model.get('detailSummary') || '').toUpperCase();
        return (detailSummary.indexOf('REASON FOR DC') >= 0);
    };
    Util.isUnsigned = function(model) {
        var detailSummary = (model.get('detailSummary') || '').toUpperCase();
        return (detailSummary.indexOf('NOT SIGNED') >= 0);
    };
    Util.isSigned = function(model) {
        return !Util.isUnsigned(model);
    };
    Util.isPending = function(model) {
        var status = (model.get('statusName') || model.get('vistaStatus') || '').toUpperCase();
        return (status === 'PENDING');
    };
    Util.isUnreleased = function(model) {
        var status = (model.get('statusName') || model.get('vistaStatus') || '').toUpperCase();
        return (status === 'UNRELEASED');
    };

    // ********************************** Button State Logic **********************************
    // * New Order (UNRELEASED): +Disc, +Sign
    // * Signed Order (PENDING): +Disc, -Sign
    // * Discontinued, Unsigned Order (DISCONTINUED, Unsigned): -Disc, +Sign
    // * All other states: -Disc, -Sign
    // ****************************************************************************************
    Util.isNewOrder = function(model) {
        return (this.isUnreleased(model) && this.isUnsigned(model) && (_.isEmpty(model.get('clinicians'))));
    };
    Util.isSignedOrder = function(model) {
        return (this.isPending(model) && this.isSigned(model) && !this.isDiscontinued(model));
    };
    Util.isDiscontinuedUnsignedOrder = function(model) {
        return (this.isDiscontinued(model) && this.isUnsigned(model));
    };
    Util.getGenericOrderState = function(model, action) {
        var hasPermissions = (ADK.UserService.hasPermissions(action));
        var isWritebackOrderType = (model.get('kind') === 'Laboratory');
        return (hasPermissions && isWritebackOrderType);
    };

    //Disable buttons for discontinue/cancel/sign due to writeback limitation for orders created from remote site
    Util.isRemoteSiteMatch = function(model) {
        return (this.getFieldFromUid(model.get('uid'), 'siteCode') === ADK.UserService.getUserSession().get('site'));
    };

    Util.getDiscontinueBtnStatus = function(model) {

        //An order can be canceled/discontinued if it's new (cancel) or signed (discontinue)
        var basicState = this.getGenericOrderState(model, 'discontinue-lab-order');
        var orderState = (this.isNewOrder(model) || this.isSignedOrder(model));

        //The button label should be "Discontinue" if the order is signed or discontinued, otherwise it should be "Cancel".
        var label = ((this.isSignedOrder(model) || this.isDiscontinued(model)) ? 'Discontinue Order' : 'Cancel Order');

        var response = ((basicState && orderState && this.isRemoteSiteMatch(model)) ? '' : 'disabled');
        model.set({
            getDiscontinueBtnStatus: response,
            discontinueBtnLabel: label
        }, {silent: true});
        return response;
    };

    Util.getSignBtnStatus = function(model) {

        //An order can be signed if it's new or discontinued-and-unsigned
        var basicState = this.getGenericOrderState(model, 'sign-lab-order');
        var orderState = (this.isNewOrder(model) || this.isDiscontinuedUnsignedOrder(model));

        var response = ((basicState && orderState && this.isRemoteSiteMatch(model)) ? '' : 'disabled');
        model.set({
            getSignBtnStatus: response
        }, {silent: true});
        return response;
    };

    //Purpose of this Util is for the Stop and Start date for orders. If they show 00:00 on a given
    // date then we need to move them to 23:59 of the previous day. We are only changing this string
    // for the date/time that is being used for display. This is for DE448.
    Util.parseForOrderStopStartDate = function(dataStr) {

        var myDate = dataStr;
        var pattern = new RegExp(/^\d{8}0000/);
        if (pattern.test(dataStr)) {  //Check for 0000 in the time
             //This date/time is at 00:00 so we need to move the date to the previous day and
             //subtract 1 minute to go from 00:00 to 23:59 on the previous day
             var month;
             var day;
             var tmpDateStr = myDate.substr(0,4) + '-' + myDate.substr(4,2) + '-' + myDate.substr(6,2);
             var tmpDate = new Date(tmpDateStr);
             tmpDate.setDate(tmpDate.getDate() - 1); // Got back one day so we are on the previous day
             var tmpMonth = tmpDate.getUTCMonth() + 1; //UTC Months are 0 to 11 so need to add 1
             if (tmpMonth < 10) {
                month = '0' + tmpMonth.toString();  //Needs to be 2 digit month
             }
             else {
                month = tmpMonth.toString();
             }
             var tmpDay = tmpDate.getUTCDate();
             if (tmpDay < 10) {
                day  = '0' + tmpDay.toString();  // Needs to be 2 digit day
             }
             else {
                day  = tmpDay.toString();
             }
             myDate =  tmpDate.getUTCFullYear().toString() + month + day + "2359";  //Previous Day at 23:59 pm
        }
        return myDate;
    };

    // Determined by the VxSync jMeadows order transform code. This captures the mapping between DoD record order
    // service code and VistA display group. If the order type filter starts malfunctioning, Check here.
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

    Util.getDisplayGroupFromDoDService = function(service) {
        return service && ORDER_DOD_SERVICE_TO_DISPLAY_GROUP_MAP[service];
    };

    return Util;
});
