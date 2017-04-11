/*jslint node: true, nomen: true, unparam: true */
/*global jquerys, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'app/applets/immunizations/writeback/utils/writebackUtils'],
    function (Backbone, Jasmine, WritebackUtil) {

        function getPatient(isInpatient, hasLocationUid, hasCategoryCode, isNewVisit){
            var currentPatient = new Backbone.Model();
            currentPatient.set('pid', '9E7A;3');
            var visit = {};

            if(isInpatient){
                visit.patientClassName = 'INPATIENT';
            }

            if(hasLocationUid){
                visit.locationUid = 'uid:location:9E7A:27';
            }

            if(hasCategoryCode){
                visit.categoryCode = 'uid:category:9E7A:27:AB';
            }

            if(isNewVisit){
                visit.existingVisit = false;
                visit.dateTime = '20151031';
            }else {
                visit.existingVisit = true;
                visit.dateTime = '20151101';
            }

            currentPatient.set('visit', visit);

            return currentPatient;
        }

        describe('Writeback utility function for building the immunization model', function(){
            it('Test visit model properties - first case', function(){
                var model = new Backbone.Model({administeredHistorical: 'administered', administeredBy: '99;TEST PROVIDER'});
                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(model, getPatient(true, true, true, true), new Backbone.Model());
                expect(immunizationModel.get('encounterPatientDFN')).toEqual('3');
                expect(immunizationModel.get('encounterInpatient')).toEqual('1');
                expect(immunizationModel.get('encounterLocation')).toEqual('uid:location:9E7A:27');
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('A');
                expect(immunizationModel.get('encounterDateTime')).toEqual('20151031');
                expect(immunizationModel.get('eventDateTime')).toEqual('20151031');
            });
         
            it('Test visit model properties - second case', function(){
                var model = new Backbone.Model({administeredHistorical: 'administered', administeredBy: '99;TEST PROVIDER'});
                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(model, getPatient(false, false, true, false), new Backbone.Model());
                expect(immunizationModel.get('encounterPatientDFN')).toEqual('3');
                expect(immunizationModel.get('encounterInpatient')).toEqual('0');
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('A');
                expect(immunizationModel.get('encounterDateTime')).toEqual('20151101');
                expect(immunizationModel.get('eventDateTime')).toEqual('20151101');
            });

            it('Test visit model properties - year fuzzy date', function(){
                var model = new Backbone.Model({administeredHistorical: 'historical', administrationDateHistorical: '2015'});
                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(model, getPatient(false, false, true, false), new Backbone.Model());
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('E');
                expect(immunizationModel.get('encounterDateTime')).toEqual('20150000');
                expect(immunizationModel.get('eventDateTime')).toEqual('20150000');
            });

            it('Test visit model properties - year and month fuzzy date', function(){
                var model = new Backbone.Model({administeredHistorical: 'historical', administrationDateHistorical: '08/2015'});
                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(model, getPatient(false, false, true, false), new Backbone.Model());
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('E');
                expect(immunizationModel.get('encounterDateTime')).toEqual('20150800');
                expect(immunizationModel.get('eventDateTime')).toEqual('20150800');
            });

            it('Test administered immunization model properties', function(){
                var formModel = new Backbone.Model();
                formModel.set('administeredHistorical', 'administered');
                formModel.set('administrationDateHistorical', '10/18/2015');
                formModel.set('immunizationType', '21');
                formModel.set('series', 'B');
                formModel.set('orderedByAdministered', 'uid:provider:9E7A:1234');
                formModel.set('routeOfAdministration', 'TEST ROUTE;1');
                formModel.set('dosage', '33');
                formModel.set('cvxCode', '789654');
                formModel.set('immunizationNarrative', 'HEP A-HEP B');
                formModel.set('anatomicLocation', 'TEST LOCATION;3');
                formModel.set('comments', 'Test comments');
                formModel.set('lotNumberAdministered', 'EHMP00001;8');
                formModel.set('manufacturerAdministered', 'ABBOTT LABORATORIES');
                formModel.set('administeredBy', '99;TEST PROVIDER');
                formModel.set('visDateOffered', '10/31/2015');
                formModel.set('informationStatement', new Backbone.Collection([{ien: '1', value: true}, {ien:'2', value: false}]));
                formModel.set('expirationDateAdministered', '12/31/2017');

                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(formModel, getPatient(true, true, false, true), new Backbone.Model());

                expect(immunizationModel.get('immunizationIEN')).toEqual('21');
                expect(immunizationModel.get('series')).toEqual('B');
                expect(immunizationModel.get('orderingProviderIEN')).toEqual('1234');
                expect(immunizationModel.get('route')).toEqual('TEST ROUTE;1');
                expect(immunizationModel.get('dose')).toEqual('33;mL;448');
                expect(immunizationModel.get('cvxCode')).toEqual('789654');
                expect(immunizationModel.get('immunizationNarrative')).toEqual('HEP A-HEP B');
                expect(immunizationModel.get('adminSite')).toEqual('TEST LOCATION;3');
                expect(immunizationModel.get('comment')).toEqual('Test comments');
                expect(immunizationModel.get('informationSource')).toEqual('00;1');
                expect(immunizationModel.get('lotNumber')).toEqual('EHMP00001;8');
                expect(immunizationModel.get('manufacturer')).toEqual('ABBOTT LABORATORIES');
                expect(immunizationModel.get('encounterProviderIEN')).toEqual('99');
                expect(immunizationModel.get('providerName')).toEqual('TEST PROVIDER');
                expect(immunizationModel.get('VIS')).toEqual('1/20151031000000');
                expect(immunizationModel.get('expirationDate')).toEqual('20171231');
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('O');
            });

            it('Test historical immunization model properties', function(){
                var formModel = new Backbone.Model();
                formModel.set('administeredHistorical', 'historical');
                formModel.set('immunizationType', '21');
                formModel.set('series', 'B');
                formModel.set('routeOfAdministration', 'TEST ROUTE;1');
                formModel.set('dosage', '33');
                formModel.set('cvxCode', '789654');
                formModel.set('immunizationNarrative', 'HEP A-HEP B');
                formModel.set('anatomicLocation', 'TEST LOCATION;3');
                formModel.set('comments', 'Test comments');
                formModel.set('lotNumberHistorical', 'EHMP00001');
                formModel.set('manufacturerHistorical', 'ABBOTT LABORATORIES');
                formModel.set('visDateOffered', '10/31/2015');
                formModel.set('expirationDateHistorical', '12/31/2017');
                formModel.set('informationSource', 'From patient recall;3');
                formModel.set('administeredLocation', 'Walgreens');
                formModel.set('administrationDateHistorical', '10/18/2015');
                formModel.set('orderedByHistorical', 'Walgreens Pharmacist');

                var immunizationModel = WritebackUtil.buildSaveImmunizationModel(formModel, getPatient(true, true, false, true), new Backbone.Model());

                expect(immunizationModel.get('immunizationIEN')).toEqual('21');
                expect(immunizationModel.get('series')).toEqual('B');
                expect(immunizationModel.get('route')).toEqual('TEST ROUTE;1');
                expect(immunizationModel.get('dose')).toEqual('33;mL;448');
                expect(immunizationModel.get('cvxCode')).toEqual('789654');
                expect(immunizationModel.get('immunizationNarrative')).toEqual('HEP A-HEP B');
                expect(immunizationModel.get('adminSite')).toEqual('TEST LOCATION;3');
                expect(immunizationModel.get('comment')).toEqual('Test comments - Lot Number: EHMP00001, Manufacturer: ABBOTT LABORATORIES, Expiration Date: 12/31/2017, Ordering Provider: Walgreens Pharmacist');
                expect(immunizationModel.get('informationSource')).toEqual('From patient recall;3');
                expect(immunizationModel.get('encounterServiceCategory')).toEqual('E');
                expect(immunizationModel.get('encounterDateTime')).toEqual('20151018');
            });
        });
});