define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/encounters/chartUtil'
], function($, Backbone, Marionette, jasminejquery, Stubs, ChartUtil) {
    'use strict';
    describe('The encounters chart utility', function() {
        it('should invoke the convertChartDate method with a valid UTC date', function() {
            expect(ChartUtil.convertChartDate(20161221100435154)).toEqual(Stubs.utilsGetUtcDate(20161221100435154, "YYYYMMDD")._d.valueOf());
        });

        it('should invoke the calculateDuration method ', function() {
            var calculateDurationModel = new Backbone.Model({
                "stay": {
                    "arrivalDateTime": "20140115123828",
                    "dischargeDateTime": "20140116123828"
                }
            });
            var calculateDurationCollection = new Backbone.Collection();
            calculateDurationCollection.push(calculateDurationModel);
            expect(ChartUtil.calculateDuration(calculateDurationCollection)[0][0]._d.valueOf()).toEqual(Stubs.utilsGetDate(20140115123828, "YYYYMMDDHHmmssSSS")._d.valueOf());
            expect(ChartUtil.calculateDuration(calculateDurationCollection)[0][1]._d.valueOf()).toEqual(Stubs.utilsGetDate(20140116123828, "YYYYMMDDHHmmssSSS")._d.valueOf());
        });

        it('should invoke the binning_normal_function method ', function() {
            expect(ChartUtil.binning_normal_function(1)).toEqual(2.995732273553991);
        });

        it('should invoke the selectStartStopPoint method ', function() {
            var ssspObject = ChartUtil.selectStartStopPoint(new Backbone.Model());
            expect(ssspObject.start).toEqual('20140530');
            expect(ssspObject.stop).toEqual('20170530');
        });
    });
});