/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
require.config({
    paths: {
        main: 'app/applets/orders/test/unit'
    }
});

define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'app/applets/orders/util',
    'app/applets/orders/test/unit/specHelper'
], function($, Backbone, Marionette, jasminejquery, util, Helper) {
    "use strict";

    var response = {},
        pendingStyle = 'label label-warning',
        completeStyle = 'label label-success',
        expiredStyle = 'label label-danger',
        discontinuedStyle = 'label label-info',
        activeStyle = 'label label-success',
        defaultStyle = 'label label-default';

    var labSummary1 = 'PROTIME BLOOD   PLASMA SP LB #2156',
        labSummary2 = 'HEMOGLOBIN A1C BLOOD   LC LB #12889',
        labSummary3 = 'TRIGLYCERIDE SERUM WC LB #5507',
        labSummary4 = 'Default BLOOD   PLASMA IC 2156',
        labArray1 = ['SEND PATIENT', 'BLOOD', 'PLASMA'],
        labArray2 = ['LAB COLLECT', 'BLOOD', ''],
        labArray3 = ['WARD COLLECT', '', 'SERUM'];
    var labArray4 = ['Not Found', 'Not Found', 'Not Found'];

    describe('Determine order state, given order details', function() {
        it('Should correctly identify a new, unsigned lab order', function() {
            var model = Helper.Mocks.getNewOrder();
            expect(util.isDiscontinued(model)).not.toBeTruthy();
            expect(util.isUnsigned(model)).toBeTruthy();
            expect(util.isPending(model)).not.toBeTruthy();
            expect(util.isUnreleased(model)).toBeTruthy();

            expect(util.isNewOrder(model)).toBeTruthy();
            expect(util.isSignedOrder(model)).not.toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).not.toBeTruthy();
        });

        it('Should correctly identify a signed, pending lab order', function() {
            var model = Helper.Mocks.getSignedOrder();
            expect(util.isDiscontinued(model)).not.toBeTruthy();
            expect(util.isUnsigned(model)).not.toBeTruthy();
            expect(util.isPending(model)).toBeTruthy();
            expect(util.isUnreleased(model)).not.toBeTruthy();

            expect(util.isNewOrder(model)).not.toBeTruthy();
            expect(util.isSignedOrder(model)).toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).not.toBeTruthy();
        });

        it('Should correctly identify a discontinued pending lab order', function() {
            var model = Helper.Mocks.getDiscontinuedUnsignedOrder();
            expect(util.isDiscontinued(model)).toBeTruthy();
            expect(util.isUnsigned(model)).toBeTruthy();
            expect(util.isPending(model)).toBeFalsy();
            expect(util.isUnreleased(model)).not.toBeTruthy();

            expect(util.isNewOrder(model)).not.toBeTruthy();
            expect(util.isSignedOrder(model)).not.toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).toBeTruthy();
        });

        it('Should correctly identify a discontinued lab order', function() {
            var model = Helper.Mocks.getDiscontinuedOrder();
            expect(util.isDiscontinued(model)).toBeTruthy();
            expect(util.isUnsigned(model)).not.toBeTruthy();
            expect(util.isPending(model)).not.toBeTruthy();
            expect(util.isUnreleased(model)).not.toBeTruthy();

            expect(util.isNewOrder(model)).not.toBeTruthy();
            expect(util.isSignedOrder(model)).not.toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).not.toBeTruthy();
        });

        it('Should correctly identify a cancelled lab order', function() {
            var model = Helper.Mocks.getCanceledOrder();
            expect(util.isDiscontinued(model)).not.toBeTruthy();
            expect(util.isUnsigned(model)).not.toBeTruthy();
            expect(util.isPending(model)).not.toBeTruthy();
            expect(util.isUnreleased(model)).not.toBeTruthy();

            expect(util.isNewOrder(model)).not.toBeTruthy();
            expect(util.isSignedOrder(model)).not.toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).not.toBeTruthy();
        });

        it('Should correctly identify a completed lab order', function() {
            var model = Helper.Mocks.getCompletedOrder();
            expect(util.isDiscontinued(model)).not.toBeTruthy();
            expect(util.isUnsigned(model)).not.toBeTruthy();
            expect(util.isPending(model)).not.toBeTruthy();
            expect(util.isUnreleased(model)).not.toBeTruthy();

            expect(util.isNewOrder(model)).not.toBeTruthy();
            expect(util.isSignedOrder(model)).not.toBeTruthy();
            expect(util.isDiscontinuedUnsignedOrder(model)).not.toBeTruthy();
        });
    });

    // ********************************** Button State Logic **********************************
    // * New Order (UNRELEASED): +Disc, +Sign
    // * Signed Order (PENDING): +Disc, -Sign
    // * Discontinued, Unsigned Order (DISCONTINUED): -Disc, +Sign
    // * All other states: -Disc, -Sign
    // ****************************************************************************************
    describe('Determine order details control info, given order details', function() {

        beforeEach(function() {
            spyOn(util, 'getGenericOrderState').and.returnValue(true);
        });

        it('Should correctly determine the control info for a new, unsigned lab order', function() {
            var model = Helper.Mocks.getNewOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('');
            expect(util.getSignBtnStatus(model)).toEqual('');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('');
            expect(model.get('getSignBtnStatus')).toEqual('');
            expect(model.get('discontinueBtnLabel')).toEqual('Cancel Order');
        });

        it('Should correctly determine the control info for a signed, pending lab order', function() {
            var model = Helper.Mocks.getSignedOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('');
            expect(util.getSignBtnStatus(model)).toEqual('disabled');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('');
            expect(model.get('getSignBtnStatus')).toEqual('disabled');
            expect(model.get('discontinueBtnLabel')).toEqual('Discontinue Order');
        });

        it('Should correctly determine the control info for a discontinued, pending lab order', function() {
            var model = Helper.Mocks.getDiscontinuedUnsignedOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('disabled');
            expect(util.getSignBtnStatus(model)).toEqual('');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('disabled');
            expect(model.get('getSignBtnStatus')).toEqual('');
            expect(model.get('discontinueBtnLabel')).toEqual('Discontinue Order');
        });

        it('Should correctly determine the control info for a discontinued lab order', function() {
            var model = Helper.Mocks.getDiscontinuedOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('disabled');
            expect(util.getSignBtnStatus(model)).toEqual('disabled');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('disabled');
            expect(model.get('getSignBtnStatus')).toEqual('disabled');
            expect(model.get('discontinueBtnLabel')).toEqual('Discontinue Order');
        });

        it('Should correctly determine the control info for a canceled lab order', function() {
            var model = Helper.Mocks.getCanceledOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('disabled');
            expect(util.getSignBtnStatus(model)).toEqual('disabled');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('disabled');
            expect(model.get('getSignBtnStatus')).toEqual('disabled');
            expect(model.get('discontinueBtnLabel')).toEqual('Cancel Order');
        });

        it('Should correctly determine the control info for a completed lab order', function() {
            var model = Helper.Mocks.getCompletedOrder();
            expect(util.getDiscontinueBtnStatus(model)).toEqual('disabled');
            expect(util.getSignBtnStatus(model)).toEqual('disabled');
            expect(model.get('getDiscontinueBtnStatus')).toEqual('disabled');
            expect(model.get('getSignBtnStatus')).toEqual('disabled');
            expect(model.get('discontinueBtnLabel')).toEqual('Cancel Order');
        });
    });
});
