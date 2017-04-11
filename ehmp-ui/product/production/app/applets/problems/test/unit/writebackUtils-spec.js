/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'app/applets/problems/writeback/writebackUtils'],
    function (Backbone, Jasmine, WritebackUtil) {

        function getUser(){
            var user = new Backbone.Model();
            user.set('site', '9E7A');
            user.set('duz', {'9E7A': '1234'});
            return user;
        }

        function getPatient(){
            
            var currentPatient = new Backbone.Model();
            currentPatient.set('pid', '9E7A;3');
            currentPatient.set('localId', '64');
            currentPatient.set('fullName', 'TEST,PATIENT');

            return currentPatient;
        }

		var user = {'duz': {'9E7A': '1234'}};
		var author = {'name': 'AUTHOR TEST', 'duz': user};

        var testAnnotations = [{
            'author': author,
            'commentString': 'TEST STRING 1',
            'timeStamp': '12/10/2015 2:48pm'
        },
        {
            'author': author,
            'commentString': 'TEST STRING 2',
            'timeStamp': '12/10/2015 2:48pm'
        }];

        var annotations = new Backbone.Collection(testAnnotations);

        var testTreatmentFactors = [{
            'value': true,
            'name': 'ionizing-radiation'
        },
        {
            'value': false,
            'name': 'head-neck-cancer'
        },
        {
            'value': true,
            'name': 'mst'
        },
        {
            'value': true,
            'name': 'sw-asia'
        },
        {
            'value': true,
            'name': 'agent-orange'
        },
        {
            'value': true,
            'name': 'shipboard'
        },
        {
            'value': true,
            'name': 'serviceConnected'
        }];

        var treatmentFactors = new Backbone.Collection(testTreatmentFactors);

        function getModel(){

			var model = new Backbone.Model();
			var labelModel = new Backbone.Model();
            var problemResult = new Backbone.Model({lexIen: '123456', conceptId: '45678', prefText: 'Test Problem'});
			
			model.set('clinic', '64');//
			model.set('immediacyRadioValue', '64');
			model.set('noTreatmentFactors', 'true');
			model.set('onset-date', '12/10/2015');
			model.set('resProvider', '10000000270;User,Panorama');
			model.set('statusRadioValue', 'A^ACTIVE');
			model.set('annotations', annotations);
			model.set('treatmentFactors', treatmentFactors);
            model.set('noTreatmentFactors', 'false');
            model.set('problemResults', problemResult);
            model.set('problemText', 'Test Problem');

			labelModel.set('clinic', 'TESTCLINIC');
			labelModel.set('resProvider', 'TEST,Panorama');
			model.set('_labelsForSelectedValues', labelModel);
			return model;
		}        

        describe('Writeback utility function for building the save problem model', function(){

            it('Test problem model properties', function(){

                var saveProblemModel = WritebackUtil.buildSaveProblemsModel(getModel(),  getUser(), getPatient(true, true, false, true), new Backbone.Model());

                expect(saveProblemModel.get('dateOfOnset')).toEqual('20151210');
                expect(saveProblemModel.get('responsibleProviderIEN')).toEqual('10000000270');
				expect(saveProblemModel.get('responsibleProvider')).toEqual('User,Panorama');			
				expect(saveProblemModel.get('enteredByIEN')).toEqual('1234');
				expect(saveProblemModel.get('service')).toEqual('64^TESTCLINIC');				
				expect(saveProblemModel.get('comments')[0]).toEqual('TEST STRING 1');		
				expect(saveProblemModel.get('comments')[1]).toEqual('TEST STRING 2');	
				expect(saveProblemModel.get('headOrNeckCancer')).toEqual('0');	
				expect(saveProblemModel.get('radiation')).toEqual('1');
                expect(saveProblemModel.get('MST')).toEqual('1');
                expect(saveProblemModel.get('agentOrange')).toEqual('1');
                expect(saveProblemModel.get('persianGulfVet')).toEqual('1');
                expect(saveProblemModel.get('shipboard')).toEqual('1');
                expect(saveProblemModel.get('serviceConnected')).toEqual('1');
                expect(saveProblemModel.get('problemNumber')).toEqual('123456');
                expect(saveProblemModel.get('problemName')).toEqual('Test Problem');
                expect(saveProblemModel.get('problemText')).toEqual('Test Problem');
                expect(saveProblemModel.get('snomedCode')).toEqual('45678');
			});
        });

        describe('Writeback utility function for building vista dates', function(){
            it('Test passing in undefined date', function(){
                expect(WritebackUtil.buildDateForVista()).toBeUndefined();
            });

            it('Test date in format YYYY', function(){
                expect(WritebackUtil.buildDateForVista('2016')).toEqual('20160000');
            });

            it('Test date in format MM/YYYY', function(){
                expect(WritebackUtil.buildDateForVista('01/2016')).toEqual('20160100');
            });

            it('Test date in formation MM/DD/YYYY', function(){
                expect(WritebackUtil.buildDateForVista('01/02/2016')).toEqual('20160102');
            });
        });
});