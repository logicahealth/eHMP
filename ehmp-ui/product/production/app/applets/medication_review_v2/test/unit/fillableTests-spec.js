/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

//NOTE: these test cases have an extra hour of padding to prevent test failures at very specific breakpoints when the relevant time period spans a change in daylight savings time.

'use strict';

// Jasmine Unit Testing Suite
define(["jquery",
        "backbone",
        "marionette",
        "app/applets/medication_review_v2/appletHelper",
        "moment",
        "jasminejquery"
    ],
    function($, Backbone, Marionette, AppletHelper, moment) {

        var todayDayLightSetting = moment().isDST();
        var lastFilledDayLightSetting;

        describe("Fillable test suite - active medications", function() {
            var testData = {
                daysSupply: 0,
                lastFilled: 20000101,
                fillsRemaining: 0,
                fillableStatus: 'Fillable for',
                expirationDate: moment().add(1095, 'days'),
                stopped: ''
            };
            // it("Confirm 59m fillable time displays as minutes, not hours", function() {
            //     testData.daysSupply = 0;
            //     testData.lastFilled = 20150718;
            //     testData.fillsRemaining = 1;
            //     testData.fillableStatus = 'Active';
            //     var result = AppletHelper.getFillableData(testData);
            //     expect(result.description).toBe('This medication is Active and fillable for 59m.');
            // });
            // it("Confirm 1h fillable time displays as hours, not minutes", function() {
            //     testData.daysSupply = 0;
            //     testData.lastFilled = 20150718;
            //     testData.fillsRemaining = 1;
            //     testData.fillableStatus = 'Active';
            //     var result = AppletHelper.getFillableData(testData);
            //     expect(result.description).toBe('This medication is Active and fillable for 1h.');
            // });
            // it("Confirm 47h fillable time displays as hours, not days", function() {
            //     testData.daysSupply = 0;
            //     testData.lastFilled = 20150718;
            //     testData.fillsRemaining = 1;
            //     testData.fillableStatus = 'Active';
            //     var result = AppletHelper.getFillableData(testData);
            //     expect(result.description).toBe('This medication is Active and fillable for 47h.');
            // });
            it("Confirm 2d fillable time displays as days, not hours", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(28, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(28, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(28, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(28, 'days');
                }
                testData.fillsRemaining = 1;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                console.log(JSON.stringify(result));
                expect(result.description).toBe('This medication is Active and fillable for 2d. ');
            });
            it("Confirm 60d fillable time displays as days, not months", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(30, 'days');
                }
                testData.fillsRemaining = 3;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 60d. ');
            });
            it("Confirm 61d fillable time displays as months, not days", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(29, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(29, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(29, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(29, 'days');
                }
                testData.fillsRemaining = 3;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 2m. ');
            });
            it("Confirm 730 days displays as months, not years", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(20, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(20, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(20, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(20, 'days');
                }
                testData.fillsRemaining = 25;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 23m. ');
            });
            it("Confirm 731 days displays as years, not months", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(19, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(19, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(19, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(19, 'days');
                }
                testData.fillsRemaining = 25;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 2y. ');
            });
            it("If expiration date is sooner than normal last fillable date, show fillable until expiration date (case 1)", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(19, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(19, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(19, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(19, 'days');
                }
                testData.fillsRemaining = 25;
                testData.fillableStatus = 'Fillable for';
                testData.expirationDate = moment().add(740, 'hours');
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 30d. ');
            });
            it("If expiration date is sooner than normal last fillable date, show fillable until expiration date (case 2)", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(19, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(19, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(19, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(19, 'days');
                }
                testData.fillsRemaining = 25;
                testData.fillableStatus = 'Fillable for';
                testData.expirationDate = moment().add(130, 'days');
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 4m. ');
            });
        });
        describe("Fillable test suite - non-active statuses", function() {
            var testData = {
                daysSupply: 0,
                lastFilled: 20000101,
                fillsRemaining: 0,
                fillableStatus: 'Fillable for',
                stopped: ''
            };
            it("Confirm active with no refills", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(10, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(10, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(10, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(10, 'days');
                }
                testData.fillsRemaining = 0;
                testData.fillableStatus = '0 Refills';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is active with no refills remaining. ');
            });
            // it("Confirm discontinued", function() {
            //     testData.daysSupply = 30;
            //     testData.lastFilled = moment().subtract(10, 'days');
            //     testData.fillsRemaining = 1;
            //     testData.fillableStatus = 'Discontinued';
            //     var result = AppletHelper.getFillableData(testData);
            //     expect(result.description).toBe('This medication was discontinued 1y ago. ');
            // });
            it("Confirm pending", function() {
                testData.daysSupply = 30;
                lastFilledDayLightSetting = moment().subtract(10, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(10, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(10, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(10, 'days');
                }
                console.log("Last filled: " + testData.lastFilled);
                testData.fillsRemaining = 1;
                testData.fillableStatus = 'Pending';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Pending. ');
            });
            // it("Confirm expired", function() {
            //     testData.daysSupply = 30;
            //     testData.lastFilled = moment().subtract(10, 'days');
            //     testData.fillsRemaining = 1;
            //     testData.fillableStatus = 'Expired';
            //     var result = AppletHelper.getFillableData(testData);
            //     expect(result.description).toBe('This medication was expired 1y ago. ');
            // });
        });
        describe("Fillable test suite - examples from F338 functional requirements", function() {
            var testData = {
                daysSupply: 0,
                lastFilled: 20000101,
                fillsRemaining: 0,
                fillableStatus: 'Fillable for',
                stopped: ''
            };
            it("Confirm fillable for 5m", function() {
                testData.daysSupply = 90;
                lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(30, 'days');
                }
                testData.fillsRemaining = 2;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 4m. ');
            });
            it("Confirm fillable for 2m", function() {
                testData.daysSupply = 90;
                lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
                if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                    testData.lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
                } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                    testData.lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
                } else {
                    testData.lastFilled = moment().subtract(30, 'days');
                }
                testData.fillsRemaining = 1;
                testData.fillableStatus = 'Fillable for';
                var result = AppletHelper.getFillableData(testData);
                expect(result.description).toBe('This medication is Active and fillable for 60d. ');
            });
        });
    });