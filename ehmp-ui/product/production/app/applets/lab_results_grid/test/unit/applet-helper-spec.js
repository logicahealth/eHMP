/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */


define([
    'underscore',
    'backbone',
    'marionette',
    'jasminejquery',
    'moment',
    'app/applets/lab_results_grid/appletHelpers'
], function(_, Backbone, Marionette, jasminejquery, Moment, AppletHelper) {
    'use strict';

    describe('Numeric Lab Results Applet Helper', function() {

        describe('getDateForChart', function () {
            var YEAR = '1999';
            var MONTH = '12';
            var DAY = '17';
            var HOUR = '06';
            var MIN = '59';

            var MONTH_STR = 'Dec';
            var TIME_STR = HOUR + ':' + MIN;

            var expected = [MONTH_STR, DAY, YEAR, TIME_STR].join(' ');

            it('receives a valid date string to the min', function() {
                var input = YEAR + MONTH + DAY + HOUR + MIN;
                var output = AppletHelper.getDateForChart(input);

                expect(output).toBe(expected);
            });

            it('receives a valid date string to the millisecond', function () {
                var SECOND = '43';
                var MILLI = '512';

                var input = YEAR + MONTH + DAY + HOUR + MIN + SECOND + MILLI;
                var output = AppletHelper.getDateForChart(input);

                expect(output).toBe(expected);

            });
        });

        describe('updateChart', function () {
            it('receives a valid collection and chart object', function() {
                var data = {
                    observed: '201701011230',
                    resultNumber: 42
                };
                var collection = new Backbone.Collection([data]);
                var chart = {
                    xAxis: [{
                        setCategories: function(categories) {
                            chart._categories = categories;
                        }
                    }],
                    series: [{
                        setData: function(data) {
                            chart._data = data;
                        }
                    }]
                };

                var expectedCategories = [AppletHelper.getDateForChart(data.observed)];


                AppletHelper.updateChart(chart, collection);
                var categories = _.get(chart, '_categories');
                var chartData = _.get(chart, '_data');

                expect(categories).toEqual(expectedCategories);
                expect(chartData).toEqual([42]);
            });
        });

        describe('setTimeSince', function () {
            var INPUT_FORMAT = 'YYYYMMDDHHmmssSSS';

            it('receives a date exactly 5 years before now', function() {
                var today = new Moment();
                var past = today.subtract(5, 'years');

                var input = past.format(INPUT_FORMAT);
                var expected = '5y';
                var output = AppletHelper.setTimeSince(input);

                expect(output).toBe(expected);
            });

            it('receives a date exactly 1 year before now', function() {
                var today = new Moment();
                var past = today.subtract(1, 'year');

                var input = past.format(INPUT_FORMAT);
                var expected = '12m';
                var output = AppletHelper.setTimeSince(input);

                expect(output).toBe(expected);
            });

            it('receives a date exactly 1 week before now', function() {
                var today = new Moment();
                var past = today.subtract(1, 'week');

                var input = past.format(INPUT_FORMAT);
                var expected = '7d';
                var output = AppletHelper.setTimeSince(input);

                expect(output).toBe(expected);
            });

            it('receives a date exactly 1 day before now', function() {
                var today = new Moment();
                var past = today.subtract(1, 'day');

                var input = past.format(INPUT_FORMAT);
                var expected = '24h';
                var output = AppletHelper.setTimeSince(input);

                expect(output).toBe(expected);
            });

        });

        describe('getNumericTime', function () {

            function getNumericTime(input, expected) {
                var output = AppletHelper.getNumericTime(input);
                expect(output).toBe(expected);
            }

            it('handles all valid inputs', function() {
                getNumericTime();
                getNumericTime('1y', '1 year');
                getNumericTime('2y', '2 years');
                getNumericTime('1m', '1 month');
                getNumericTime('2m', '2 months');
                getNumericTime('1M', '1 month');
                getNumericTime('2M', '2 months');
                getNumericTime('1d', '1 day');
                getNumericTime('2d', '2 days');
                getNumericTime('1h', '1 hour');
                getNumericTime('2h', '2 hours');
            });

            it('ignores non valid inputs', function() {
                getNumericTime('failure', 'failure');
                getNumericTime('ends in m', 'ends in m');
            });
        });

        describe('parseLabResponse', function () {
            it('parses the response correctly', function() {
                var response = {
                    low: 'low',
                    high: 'high',
                    interpretationCode: 'abc:HH',
                    categoryCode: 'EM',
                    categoryName: 'TEST'
                };
                var expected = {
                    referenceRange: 'low-high',
                    interpretationCode: 'H*',
                    flagTooltip: 'Critical High',
                    result: 'View Report',
                    typeName: 'TEST',
                    pathology: true
                };
                var output = AppletHelper.parseLabResponse(response);

                expect(output.referenceRange).toBe(expected.referenceRange);
                expect(output.interpretationCode).toBe(expected.interpretationCode);
                expect(output.flagTooltip).toBe(expected.flagTooltip);
                expect(output.result).toBe(expected.result);
                expect(output.typeName).toBe(expected.typeName);
                expect(output.pathology).toBe(expected.pathology);
            });
        });

        describe('getModalTitle', function () {

            it('receives a valid model with both typeName and specimen', function() {
                var model = new Backbone.Model({
                    typeName: 'type',
                    specimen: 'specimen'
                });
                var expected = 'type - specimen';
                var output = AppletHelper.getModalTitle(model);

                expect(output).toBe(expected);
            });

            it('receives a valid model with typeName', function() {
                var model = new Backbone.Model({
                    typeName: 'type'
                });
                var expected = 'type';
                var output = AppletHelper.getModalTitle(model);

                expect(output).toBe(expected);
            });

            it('receives a valid model with specimen', function() {
                var model = new Backbone.Model({
                    specimen: 'specimen'
                });
                var expected = 'specimen';
                var output = AppletHelper.getModalTitle(model);

                expect(output).toBe(expected);
            });

            it('receives a valid model with neither typeName or specimen', function() {
                var model = new Backbone.Model();
                var expected = 'Missing Title Information';
                var output = AppletHelper.getModalTitle(model);

                expect(output).toBe(expected);
            });
        });

        describe('getObservedFormatted', function () {
            var YEAR = '1999';
            var MONTH = '12';
            var DAY = '17';
            var HOUR = '06';
            var MIN = '59';
            var SECONDS = '31';
            var MILLISECONDS = '100';


            it('receives a valid date string', function() {
                var input  = YEAR + MONTH + DAY + HOUR + MIN + SECONDS + MILLISECONDS;
                var date = MONTH + '/' + DAY + '/' + YEAR;
                var time = HOUR + ':' + MIN;
                var expected = date + ' - ' + time;
                var output = AppletHelper.getObservedFormatted(input);
                expect(output).toBe(expected);
            });

            it('returns an empty string when no param is passed', function(){
                var output = AppletHelper.getObservedFormatted();
                expect(output).toBe('');
            });
        });

        describe('_isInViewReport', function () {
            it('returns true for all report codes', function() {
                var validCodes = ['EM', 'MI', 'SP', 'CY', 'AP'];
                _.each(validCodes, function(code) {
                    var output = AppletHelper._isInViewReport('abc:' + code);
                    expect(output).toBe(true);
                });
            });

            it('returns false for non report codes', function() {
                var input = 'abc:NO';
                var output = AppletHelper._isInViewReport(input);
                expect(output).toBe(false);
            });
        });

        describe('_getFlagClassAndText', function () {
            it('handles a critical high interpretationCode correctly', function() {
                var hh = 'abc:HH';
                var hStar = 'abc:H*';
                var expectedCode = 'H*';
                var expectedFlag = 'Critical High';
                var expectedLabel = 'applet-badges label-critical';

                var hhOutput = AppletHelper._getFlagClassAndText(hh);
                var hStarOutput = AppletHelper._getFlagClassAndText(hStar);

                expect(hhOutput.interpretationCode).toBe(expectedCode);
                expect(hhOutput.flagTooltip).toBe(expectedFlag);
                expect(hhOutput.labelClass).toBe(expectedLabel);

                expect(hStarOutput.interpretationCode).toBe(expectedCode);
                expect(hStarOutput.flagTooltip).toBe(expectedFlag);
                expect(hStarOutput.labelClass).toBe(expectedLabel);
            });

            it('handles a high interpretationCode correctly', function() {
                var high = 'abc:H';
                var expectedCode = 'H';
                var expectedFlag = 'Abnormal High';
                var expectedLabel = 'label-warning';

                var highOutput = AppletHelper._getFlagClassAndText(high);

                expect(highOutput.interpretationCode).toBe(expectedCode);
                expect(highOutput.flagTooltip).toBe(expectedFlag);
                expect(highOutput.labelClass).toBe(expectedLabel);
            });

            it('handles a critical low interpretationCode correctly', function() {
                var ll = 'abc:LL';
                var lStar = 'abc:L*';
                var expectedCode = 'L*';
                var expectedFlag = 'Critical Low';
                var expectedLabel = 'applet-badges label-critical';

                var llOutput = AppletHelper._getFlagClassAndText(ll);
                var lStarOutput = AppletHelper._getFlagClassAndText(lStar);

                expect(llOutput.interpretationCode).toBe(expectedCode);
                expect(llOutput.flagTooltip).toBe(expectedFlag);
                expect(llOutput.labelClass).toBe(expectedLabel);

                expect(lStarOutput.interpretationCode).toBe(expectedCode);
                expect(lStarOutput.flagTooltip).toBe(expectedFlag);
                expect(lStarOutput.labelClass).toBe(expectedLabel);
            });

            it('handles a low interpretationCode correctly', function() {
                var low = 'abc:L';
                var expectedCode = 'L';
                var expectedFlag = 'Abnormal Low';
                var expectedLabel = 'label-warning';

                var output = AppletHelper._getFlagClassAndText(low);

                expect(output.interpretationCode).toBe(expectedCode);
                expect(output.flagTooltip).toBe(expectedFlag);
                expect(output.labelClass).toBe(expectedLabel);
            });

            it('handles a normal range interpretationCode correctly', function() {
                var normal = 'abc:A';
                var expectedCode = 'A';
                var expectedFlag = '';
                var expectedLabel = 'applet-badges label-critical';

                var output = AppletHelper._getFlagClassAndText(normal);

                expect(output.interpretationCode).toBe(expectedCode);
                expect(output.flagTooltip).toBe(expectedFlag);
                expect(output.labelClass).toBe(expectedLabel);
            });
        });

        describe('preparePanelForRender', function () {
            it('correctly sets codes in valid model', function() {
                var model = new Backbone.Model({
                    labs: new Backbone.Collection([{interpretationCode: 'abc:H*'}])
                });
                var expectedCode = 'H*';
                var expectedTooltip = 'Critical High';
                var expectedLabel = 'applet-badges label-critical';
                var output = AppletHelper.preparePanelForRender(model);

                expect(output.interpretationCode).toBe(expectedCode);
                expect(output.flagTooltip).toBe(expectedTooltip);
                expect(output.labelClass).toBe(expectedLabel);
            });
        });

        describe('prepareNonPanelForRender', function () {
            it('handles interpretation code and in view report correctly', function() {
                var interpretationCode = 'abc:HH';
                var categoryCode = 'EM';
                var categoryName = 'Test';

                var expectedCode = 'H*';
                var expectedFlag = 'Critical High';
                var expectedLabel = 'applet-badges label-critical';
                var expectedResult = 'View Report';

                var output  = AppletHelper.prepareNonPanelForRender(new Backbone.Model({
                    interpretationCode :interpretationCode,
                    categoryCode: categoryCode,
                    categoryName: categoryName
                }));

                expect(output.interpretationCode).toBe(expectedCode);
                expect(output.flagTooltip).toBe(expectedFlag);
                expect(output.labelClass).toBe(expectedLabel);
                expect(output.result).toBe(expectedResult);
                expect(output.typeName).toBe(categoryName);
                expect(output.pathology).toBe(true);
            });
        });
    });
});
