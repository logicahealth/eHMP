define([
    'test/stubs',
    'jasminejquery',
    'require'
], function(Stubs, jasminejquery, require) {
    'use strict';

    describe('Testing parse functionality for vitals model', function() {
        var VitalsModel;

        beforeEach(function(done) {
            if (_.isUndefined(VitalsModel)) {
                require(['app/resources/fetch/vitals/model'], function(model) {
                    VitalsModel = model;
                    return done();
                });
            } else {
                return done();
            }
        });

        it('Should parse response correctly with no metric conversion based on JSON', function() {
            var response = {
                displayName: 'BP',
                facilityCode: '998',
                high: '210/110',
                low: '100/60',
                observed: '201612141345',
                pid: 'SITE;1234',
                result: '120/75',
                resulted: '201612150810',
                typeName: 'BLOOD PRESSURE',
                units: 'mm[Hg]',
                qualifiers: [{
                    name: 'R ARM'
                }, {
                    name: 'CHAIR'
                }]
            };

            var parsedJson = VitalsModel.prototype.parse(response);
            expect(parsedJson.observedFormatted).toEqual('12/14/2016 - 13:45');
            expect(parsedJson.displayName).toEqual('BP');
            expect(parsedJson.typeName).toEqual('Blood Pressure');
            expect(parsedJson.resultUnits).toEqual('120/75 mm[Hg]');
            expect(parsedJson.resultUnitsMetricResultUnits).toEqual('120/75 mm[Hg]');
            expect(parsedJson.resultedFormatted).toEqual('12/15/2016 - 08:10');
            expect(parsedJson.qualifierNames).toEqual('R ARM,CHAIR');
            expect(parsedJson.vitalColumns).toEqual(true);
            expect(parsedJson.observationType).toEqual('vitals');
            expect(parsedJson.applet_id).toEqual('vitals');
        });

        it('Should parse response correctly with metric conversion based on JSON', function() {
            var response = {
                displayName: 'WT',
                facilityCode: '998',
                observed: '201511130956',
                pid: 'SITE;1234',
                result: '200',
                resulted: '201512100934',
                typeName: 'WEIGHT',
                units: 'lb'
            };

            var parsedJson = VitalsModel.prototype.parse(response);
            expect(parsedJson.observedFormatted).toEqual('11/13/2015 - 09:56');
            expect(parsedJson.displayName).toEqual('WT');
            expect(parsedJson.typeName).toEqual('Weight');
            expect(parsedJson.resultUnits).toEqual('200 lb');
            expect(parsedJson.metricResult).toEqual(91);
            expect(parsedJson.metricUnits).toEqual('kg');
            expect(parsedJson.resultUnitsMetricResultUnits).toEqual('200 lb / 91 kg');
            expect(parsedJson.resultedFormatted).toEqual('12/10/2015 - 09:34');
            expect(parsedJson.qualifierNames).toEqual('');
            expect(parsedJson.vitalColumns).toEqual(true);
            expect(parsedJson.observationType).toEqual('vitals');
            expect(parsedJson.applet_id).toEqual('vitals');
        });
    });
});