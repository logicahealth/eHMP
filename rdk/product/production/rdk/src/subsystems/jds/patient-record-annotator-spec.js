'use strict';

var _ = require('lodash');
var patientrecordUtil = require('./patient-record-annotator');
var vitalData = require('./patient-record-annotator-spec-data');
var vlerData = require('./patient-record-annotator-vler-spec-data');
var moment = require('moment');

describe('Patient Record Util ', function() {
    it('Test addCalculatedBMI()', function() {
        var jdsData = vitalData.inputValue;
        expect(jdsData.data.items.length).to.equal(381);
        var appendedBMIData = patientrecordUtil.addCalculatedBMI(jdsData);
        expect(appendedBMIData.data.items.length).to.equal(408);
        expect(appendedBMIData.data.totalItems).to.equal(408);
        expect(appendedBMIData.data.currentItemCount).to.equal(408);

        var lastBMI = _.last(appendedBMIData.data.items);
        expect(lastBMI.facilityCode).not.to.be.undefined();
        expect(lastBMI.facilityName).not.to.be.undefined();
        expect(lastBMI.observed).not.to.be.undefined();
        expect(lastBMI.result).not.to.be.undefined();
        expect(lastBMI.facilityMoniker).not.to.be.undefined();
    });

    it('Test calculateBMI()', function() {
        var bmi = patientrecordUtil._calculateBmi('70', 'in', '174', 'lb');
        expect(bmi).to.equal('25.0');
        bmi = patientrecordUtil._calculateBmi('170', 'cm', '50', 'kg');
        expect(bmi).to.equal('17.3');
    });

    it('Test decompressFullHtml()', function(done) {
        this.timeout(3000);

        var jdsData = vlerData.inputValue;
        expect(jdsData.data.items.length).be.equal(11);

        patientrecordUtil.decompressFullHtml(jdsData, function(err, result) {
            expect(err).be.null();

            expect(result.data.items.length).be.equal(11);
            _.each(result.data.items, function(item) {
                if (item.compressed) {
                    expect(item.fullHtml).to.match('<head>');
                }
            });

            done();
        });
    });
});

describe('patient-record-annotator.getBodyMassStatusCode', function() {
    var jds;

    beforeEach(function() {
        jds = {};
    });

    it('receives both weight and height', function() {
        var data = [
            {typeName: 'HEIGHT'},
            {typeName: 'WEight'}
        ];
        _.set(jds, 'data.items', data);
        var status = patientrecordUtil.getBodyMassStatusCode(jds);
        expect(status).to.be(patientrecordUtil.BMI_DATA_PRESENT);
    });

    it('does not receive weight or height', function() {
        var data = [
            {typeName: 'apples'},
            {typeName: 'banana'}
        ];
        _.set(jds, 'data.items', data);
        var status = patientrecordUtil.getBodyMassStatusCode(jds);
        expect(status).to.be(patientrecordUtil.BMI_NOT_REQUIRED);
    });

    it('receives weight but not height', function() {
        var data = [
            {typeName: 'apples'},
            {typeName: 'WEIGHT'}
        ];
        _.set(jds, 'data.items', data);
        var status = patientrecordUtil.getBodyMassStatusCode(jds);
        expect(status).to.be(patientrecordUtil.BMI_MISSING_HEIGHT);
    });

    it('receives height but not weight', function() {
        var data = [
            {typeName: 'apples'},
            {typeName: 'HEIGHT'}
        ];
        _.set(jds, 'data.items', data);
        var status = patientrecordUtil.getBodyMassStatusCode(jds);
        expect(status).to.be(patientrecordUtil.BMI_MISSING_WEIGHT);
    });

});

describe('Patient Record Annotator', function() {

    var DATE_FORMAT = 'YYYYMMDDHHmmssSSS';
    var jdsItem;
    var expectedDate;
    var today;

    beforeEach(function() {
        expectedDate = '20170308122145123';
        today = moment('20150730091559123', DATE_FORMAT);
        jdsItem = {};
    });

    describe('findStartDateString', function() {

        it('uses last filled value to find start date', function() {
            jdsItem.lastFilled = expectedDate;
            jdsItem.fills = [];
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

        it('handles an invalid last filled value', function() {
            jdsItem.lastFilled = '';
            _.set(jdsItem, 'fills[0].dispenseDate', expectedDate);
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

        it('checks for the second to last fill if last filled is in the future', function() {
            jdsItem.lastFilled = moment(today.format(DATE_FORMAT)).add(1, 'day').format(DATE_FORMAT);
            jdsItem.fills = ['ignore me', {dispenseDate: expectedDate}, 'ignore me'];
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

        it('uses dispense date is last filled is not available', function() {
            _.set(jdsItem, 'fills[0].dispenseDate', expectedDate);
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

        it('uses last admin if last filled and dispense date are not available', function() {
            jdsItem.lastAdmin = expectedDate;
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

        it('falls back to overall stop if not other date is available', function() {
            jdsItem.overallStart = expectedDate;
            var startDate = patientrecordUtil._findStartDateString(jdsItem, today);
            expect(startDate).to.be(expectedDate);
        });

    });

    describe('setTimeSinceItem', function() {

        // Just checking part of functionality not valid jdsItem
        it('converts overallStart to a string', function() {
            jdsItem.overallStart = 42;
            jdsItem.overallStop = expectedDate;
            patientrecordUtil._setTimeSinceItem(today, jdsItem);
            expect(jdsItem.overallStart).to.equal('42');
        });

        // Just checking part of functionality not valid jdsItem
        it('converts stopped to a string', function() {
            jdsItem.stopped = 42;
            jdsItem.overallStop = expectedDate;
            patientrecordUtil._setTimeSinceItem(today, jdsItem);
            expect(jdsItem.stopped).to.equal('42');
        });

        // Just checking part of functionality not valid jdsItem
        it('creates fills array if not exists', function() {
            jdsItem.overallStop = expectedDate;
            patientrecordUtil._setTimeSinceItem(today, jdsItem);
            expect(jdsItem.fills).to.eql([]);
        });

        it('sets start date to overall stop if stop is between start and today', function() {
            var todayStr = today.format(DATE_FORMAT);
            jdsItem.overallStart = moment(todayStr).subtract(2, 'years').format(DATE_FORMAT);
            jdsItem.overallStop = moment(todayStr).subtract(1, 'years').format(DATE_FORMAT);
            patientrecordUtil._setTimeSinceItem(today, jdsItem);
            expect(jdsItem.lastAction).to.equal(jdsItem.overallStop);
            expect(jdsItem.expirationDate).to.equal(jdsItem.overallStop);
        });

        it('uses ordered value if startDate is before order date', function() {
            jdsItem.overallStop = expectedDate;
            var todayStr = today.format(DATE_FORMAT);

            jdsItem.overallStart = moment(todayStr).subtract(2, 'years').format(DATE_FORMAT);

            var ordered = moment(todayStr).subtract(1, 'years').format(DATE_FORMAT);
            _.set(jdsItem, 'orders[0].ordered', ordered);

            patientrecordUtil._setTimeSinceItem(today, jdsItem);

            expect(jdsItem.lastAction).to.equal(moment(ordered).add(1, 'second').format(DATE_FORMAT));
            expect(jdsItem.expirationDate).to.equal(expectedDate);
        });

        it('uses ordered value if startDate is after today', function() {
            jdsItem.overallStop = expectedDate;
            var todayStr = today.format(DATE_FORMAT);

            jdsItem.overallStart = moment(todayStr).add(2, 'years').format(DATE_FORMAT);

            var ordered = moment(todayStr).subtract(1, 'years').format(DATE_FORMAT);
            _.set(jdsItem, 'orders[0].ordered', ordered);

            patientrecordUtil._setTimeSinceItem(today, jdsItem);

            expect(jdsItem.lastAction).to.equal(moment(ordered).add(1, 'second').format(DATE_FORMAT));
            expect(jdsItem.expirationDate).to.equal(expectedDate);
        });

    });

    describe('setTimeSince', function() {
        it('does not alter item if data.items does not exist', function() {
            var result = patientrecordUtil.setTimeSince({a: 1});
            expect(result).to.eql({a: 1});
        });
    });

});

