/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'moment', 'testUtil', 'app/applets/vitals/writeback/writebackUtils'],
    function ($, Backbone, Marionette, Jasmine, moment, testUtil, WritebackUtil) {
        function getModel(date, time){
            var model = new Backbone.Model();
            model.set('dateTakenInput', date);
            model.set('time-taken', time);
            return model;
        }

        function getUser(){
            var user = new Backbone.Model();
            user.set('site', '9E7A');
            user.set('duz', {'9E7A': '1234'});
            return user;
        }

        function getCurrentPatient(){
            var patient = new Backbone.Model();
            patient.set('pid', '9E7A;1234');
            patient.set('visit', {locationUid: 'urn:va:location:9E7A:195'});
            return patient;
        }

        function getIENMap(){
            return {
                'BLOOD PRESSURE': '1',
                'TEMPERATURE': '2',
                'RESPIRATION': '3',
                'PULSE': '5',
                'HEIGHT': '8',
                'WEIGHT': '9',
                'CIRCUMFERENCE/GIRTH': '20',
                'PULSE OXIMETRY': '21',
                'PAIN': '22'
            };
        }

        describe('Test writeback utility buildSaveVitalsModel function', function() {
            it('should validate date/time given, location and user', function() {
                var saveVitalsModel = new Backbone.Model();
                var model = getModel('12/01/2013', '12:12');
                var vitalsModel = WritebackUtil.buildSaveVitalsModel(model, false, getIENMap(), getUser(), getCurrentPatient(), saveVitalsModel);
                expect(vitalsModel.get('dateTime')).toEqual('201312011212');
                expect(vitalsModel.get('dfn')).toEqual('1234');
                expect(vitalsModel.get('locationUid')).toEqual('urn:va:location:9E7A:195');
                expect(vitalsModel.get('enterdByIEN')).toEqual('1234');
                expect(vitalsModel.get('vitals').length).toEqual(0);
            });

            it('should validate patient pass', function(){
                var saveVitalsModel = new Backbone.Model();
                var model = getModel('12/01/2014');
                model.set('facility-name-pass-po', true);
                var vitalsModel = WritebackUtil.buildSaveVitalsModel(model, true, getIENMap(), getUser(), getCurrentPatient(), saveVitalsModel);
                expect(vitalsModel.get('vitals').length).toEqual(9);
                expect(vitalsModel.get('vitals')[0].fileIEN).toEqual('1');
                expect(vitalsModel.get('vitals')[0].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[1].fileIEN).toEqual('5');
                expect(vitalsModel.get('vitals')[1].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[2].fileIEN).toEqual('3');
                expect(vitalsModel.get('vitals')[2].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[3].fileIEN).toEqual('2');
                expect(vitalsModel.get('vitals')[3].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[4].fileIEN).toEqual('21');
                expect(vitalsModel.get('vitals')[4].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[5].fileIEN).toEqual('8');
                expect(vitalsModel.get('vitals')[5].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[6].fileIEN).toEqual('9');
                expect(vitalsModel.get('vitals')[6].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[7].fileIEN).toEqual('22');
                expect(vitalsModel.get('vitals')[7].reading).toEqual('Pass');
                expect(vitalsModel.get('vitals')[8].fileIEN).toEqual('20');
                expect(vitalsModel.get('vitals')[8].reading).toEqual('Pass');
            });

            it('should validate patient refusing on all vitals', function(){
                var saveVitalsModel = new Backbone.Model();
                var model = getModel('12/01/2014');
                model.set('bp-radio-po', 'Refused');
                model.set('pulse-radio-po', 'Refused');
                model.set('respiration-radio-po', 'Refused');
                model.set('temperature-radio-po', 'Refused');
                model.set('po-radio-po', 'Refused');
                model.set('height-radio-po', 'Refused');
                model.set('weight-radio-po', 'Refused');
                model.set('pain-radio-po', 'Refused');
                model.set('cg-radio-po', 'Refused');
                var vitalsModel = WritebackUtil.buildSaveVitalsModel(model, false, getIENMap(), getUser(), getCurrentPatient(), saveVitalsModel);
                expect(vitalsModel.get('vitals').length).toEqual(9);
                expect(vitalsModel.get('vitals')[0].fileIEN).toEqual('1');
                expect(vitalsModel.get('vitals')[0].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[1].fileIEN).toEqual('5');
                expect(vitalsModel.get('vitals')[1].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[2].fileIEN).toEqual('3');
                expect(vitalsModel.get('vitals')[2].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[3].fileIEN).toEqual('2');
                expect(vitalsModel.get('vitals')[3].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[4].fileIEN).toEqual('21');
                expect(vitalsModel.get('vitals')[4].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[5].fileIEN).toEqual('8');
                expect(vitalsModel.get('vitals')[5].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[6].fileIEN).toEqual('9');
                expect(vitalsModel.get('vitals')[6].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[7].fileIEN).toEqual('22');
                expect(vitalsModel.get('vitals')[7].reading).toEqual('Refused');
                expect(vitalsModel.get('vitals')[8].fileIEN).toEqual('20');
                expect(vitalsModel.get('vitals')[8].reading).toEqual('Refused');
            });

            it('should validate patient unavailable on all vitals', function(){
                var saveVitalsModel = new Backbone.Model();
                var model = getModel('12/01/2014');
                model.set('bp-radio-po', 'Unavailable');
                model.set('pulse-radio-po', 'Unavailable');
                model.set('respiration-radio-po', 'Unavailable');
                model.set('temperature-radio-po', 'Unavailable');
                model.set('po-radio-po', 'Unavailable');
                model.set('height-radio-po', 'Unavailable');
                model.set('weight-radio-po', 'Unavailable');
                model.set('pain-radio-po', 'Unavailable');
                model.set('cg-radio-po', 'Unavailable');
                var vitalsModel = WritebackUtil.buildSaveVitalsModel(model, false, getIENMap(), getUser(), getCurrentPatient(), saveVitalsModel);
                expect(vitalsModel.get('vitals').length).toEqual(9);
                expect(vitalsModel.get('vitals')[0].fileIEN).toEqual('1');
                expect(vitalsModel.get('vitals')[0].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[1].fileIEN).toEqual('5');
                expect(vitalsModel.get('vitals')[1].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[2].fileIEN).toEqual('3');
                expect(vitalsModel.get('vitals')[2].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[3].fileIEN).toEqual('2');
                expect(vitalsModel.get('vitals')[3].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[4].fileIEN).toEqual('21');
                expect(vitalsModel.get('vitals')[4].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[5].fileIEN).toEqual('8');
                expect(vitalsModel.get('vitals')[5].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[6].fileIEN).toEqual('9');
                expect(vitalsModel.get('vitals')[6].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[7].fileIEN).toEqual('22');
                expect(vitalsModel.get('vitals')[7].reading).toEqual('Unavailable');
                expect(vitalsModel.get('vitals')[8].fileIEN).toEqual('20');
                expect(vitalsModel.get('vitals')[8].reading).toEqual('Unavailable');
            });
        });

    describe('Test writeback utility buildVital', function(){
        it('Should test building individual vital with no units', function(){
            var model = getModel('07/01/2015');
            model.set('someInputValue', '30');
            model.set('qualifier1', '22');
            model.set('qualifier2', '33');
            model.set('qualifier3', '44');
            var vital = WritebackUtil.buildVital(model, 'someInputValue', getIENMap(), 'RESPIRATION', [], ['qualifier1', 'qualifier2', 'qualifier3'], 'radio', false);
            expect(vital.reading).toEqual('30');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers.length).toEqual(3);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should test building individual vital with units', function(){
            var model = getModel('07/01/2015');
            model.set('someInputValue', '30lb');
            var vital = WritebackUtil.buildVital(model, 'someInputValue', getIENMap(), 'RESPIRATION', ['lb', 'kg'], [], 'radio', false);
            expect(vital.reading).toEqual('30');
            expect(vital.unit).toEqual('lb');
            expect(vital.qualifiers.length).toEqual(0);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should test building individual vital with pass', function(){
            var model = getModel('07/01/2015');
            model.set('someInputValue', '30');
            model.set('facility-name-pass-po', true);
            var vital = WritebackUtil.buildVital(model, 'someInputValue', getIENMap(), 'RESPIRATION', [], [], 'radio', true);
            expect(vital.reading).toEqual('Pass');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers).toEqual(undefined);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should test building individual vital with refusal', function(){
            var model = getModel('07/01/2015');
            model.set('someInputValue', '30');
            model.set('radio', 'Refused');
            var vital = WritebackUtil.buildVital(model, 'someInputValue', getIENMap(), 'RESPIRATION', [], [], 'radio', false);
            expect(vital.reading).toEqual('Refused');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers).toEqual(undefined);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should test building individual vital being unavailable', function(){
            var model = getModel('07/01/2015');
            model.set('someInputValue', '30');
            model.set('radio', 'Unavailable');
            var vital = WritebackUtil.buildVital(model, 'someInputValue', getIENMap(), 'RESPIRATION', [], [], 'radio', false);
            expect(vital.reading).toEqual('Unavailable');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers).toEqual(undefined);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should test building individual vital with pulse oximetry special case', function(){
            var model = getModel('07/01/2015');
            model.set('O2InputValue', '99');
            model.set('suppO2InputValue', '31');
            var vital = WritebackUtil.buildVital(model, 'O2InputValue', getIENMap(), 'RESPIRATION', [], [], 'radio', false);
            expect(vital.reading).toEqual('99');
            expect(vital.flowRate).toEqual('31');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers.length).toEqual(0);
            expect(vital.fileIEN).toEqual('3');
        });

        it('Should write pain value as 99 when unable to respond is checked', function(){
            var model = getModel('07/16/2015');
            model.set('pain-checkbox-po', true);
            var vital = WritebackUtil.buildVital(model, 'pain-value-po', getIENMap(), 'PAIN', [], [], 'radio', false);
            expect(vital.reading).toEqual('99 - Unable to Respond');
            expect(vital.unit).toEqual(undefined);
            expect(vital.qualifiers.length).toEqual(0);
            expect(vital.fileIEN).toEqual('22');
        });
    });

    describe('Test writeback utility - buildEnteredInErrorVitalCollection', function(){
        it('Should not include BMI vitals', function(){
            var bmi = new Backbone.Model({typeName: 'BMI'});
            var vitals = [bmi];

            var resultCollection = WritebackUtil.buildEnteredInErrorVitalCollection(vitals, bmi, '9E7A');
            expect(resultCollection.models.length).toEqual(0);
        });

        it('Should not include vitals from a differnt site', function(){
            var wrongSiteVital = new Backbone.Model({typeName: 'BP', pid: 'C877:1234'});
            var vitals = [wrongSiteVital];

            var resultCollection = WritebackUtil.buildEnteredInErrorVitalCollection(vitals, wrongSiteVital, '9E7A');
            expect(resultCollection.models.length).toEqual(0);
        });

        it('Should include vitals from same site and check appropriate vital', function(){
            var vitalOne = new Backbone.Model({typeName: 'BP', localId: '1234', result: '120/80', units: 'hh[MG]', pid: '9E7A;x'});
            var vitalTwo = new Backbone.Model({typeName: 'Pulse', localId: '4321', result: '60', units: '\\min', pid: '9E7A;x'});
            var vitals = [vitalOne, vitalTwo];

            var resultCollection = WritebackUtil.buildEnteredInErrorVitalCollection(vitals, vitalTwo, '9E7A');
            expect(resultCollection.models.length).toEqual(2);
            expect(resultCollection.models[0].get('itemName')).toEqual('1234');
            expect(resultCollection.models[0].get('itemValue')).toEqual(false);
            expect(resultCollection.models[0].get('itemLabel')).toEqual('BP');
            expect(resultCollection.models[0].get('itemEIEValue')).toEqual('120/80 hh[MG]');
            expect(resultCollection.models[1].get('itemName')).toEqual('4321');
            expect(resultCollection.models[1].get('itemValue')).toEqual(true);
            expect(resultCollection.models[1].get('itemLabel')).toEqual('Pulse');
            expect(resultCollection.models[1].get('itemEIEValue')).toEqual('60 \\min');
        });
    });
});
