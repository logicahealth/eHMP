/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'moment', 'app/applets/problems/writeback/writebackUtils'],
    function (Backbone, Jasmine, moment, WritebackUtil) {

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
            'name': 'shipboard-hazard'
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

        describe('Writeback utility for handling treatment factors', function(){
            it('Test various treatment factors', function(){
                var saveProblemObject = WritebackUtil.buildTreatmentFactorsObject(getModel());
                expect(saveProblemObject.headOrNeckCancer).toEqual('0');
                expect(saveProblemObject.radiation).toEqual('1');
                expect(saveProblemObject.MST).toEqual('1');
                expect(saveProblemObject.agentOrange).toEqual('1');
                expect(saveProblemObject.persianGulfVet).toEqual('1');
                expect(saveProblemObject.shipboard).toEqual('1');
            });
        });

        describe('Writeback utility for saving the clinic/service field', function(){
            it('Should save as a clinic type', function(){
                var saveModel = new Backbone.Model();
                var formModel = new Backbone.Model({clinicOrService: 'clinic', clinic: '32', _labelsForSelectedValues: new Backbone.Model({clinic: 'GENERAL MEDICINE'})});
                WritebackUtil.saveClinicOrService(formModel, saveModel);
                expect(saveModel.get('clinic')).toEqual('32^GENERAL MEDICINE');
                expect(saveModel.get('service')).toBeUndefined();
            });

            it('Should save as a service type', function(){
                var saveModel = new Backbone.Model();
                var formModel = new Backbone.Model({clinicOrService: 'service', clinic: '32', _labelsForSelectedValues: new Backbone.Model({clinic: 'GENERAL MEDICINE'})});
                WritebackUtil.saveClinicOrService(formModel, saveModel);
                expect(saveModel.get('service')).toEqual('32^GENERAL MEDICINE');
                expect(saveModel.get('clinic')).toBeUndefined();
            });
        });

        describe('Writeback utility for building the edit problems model', function(){
            it('Should build the edit model correctly', function(){
                var editProblemModel = new Backbone.Model();
                var formModel = new Backbone.Model({
                    problemIEN: '23',
                    'onset-date': '02/20/2016',
                    problemText: 'editable problem',
                    snomedCode: '123456',
                    statusRadioValue: 'A^ACTIVE',
                    immediacyRadioValue: 'A^ACUTE',
                    resProvider: '99;PROVIDER ONE',
                    clinic: '11',
                    noTreatmentFactors: 'true',
                    clinicOrService: 'clinic',
                    _labelsForSelectedValues: new Backbone.Model({clinic: 'GENERAL MEDICINE'}),
                    annotations: new Backbone.Collection()
                });

                WritebackUtil.buildEditProblemsModel(formModel, getUser(), editProblemModel);
                expect(editProblemModel.get('problemIEN')).toEqual('23');
                expect(editProblemModel.get('dateLastModified')).toEqual(moment().format('YYYYMMDD'));
                expect(editProblemModel.get('dateOfOnset')).toEqual('20160220');
                expect(editProblemModel.get('problemText')).toEqual('editable problem');
                expect(editProblemModel.get('problemName')).toEqual('editable problem');
                expect(editProblemModel.get('snomedCode')).toEqual('123456');
                expect(editProblemModel.get('status')).toEqual('A^ACTIVE');
                expect(editProblemModel.get('acuity')).toEqual('A^ACUTE');
                expect(editProblemModel.get('responsibleProviderIEN')).toEqual('99');
                expect(editProblemModel.get('responsibleProvider')).toEqual('PROVIDER ONE');
                expect(editProblemModel.get('clinic')).toEqual('11^GENERAL MEDICINE');
                expect(editProblemModel.get('userIEN')).toEqual('1234');
                expect(editProblemModel.get('originalComments')).toEqual([]);
                expect(editProblemModel.get('incomingComments')).toEqual([]);
            });

            it('Should build the model correctly with comments', function(){
                var editProblemModel = new Backbone.Model();
                var formModel = new Backbone.Model({
                    problemIEN: '33',
                    'onset-date': '02/2012',
                    noTreatmentFactors: 'true',
                    'originalComments': new Backbone.Collection([{noteCounter: 1, commentString: 'comment 1', author: {duz: {'9E7A': '1234'}}}]),
                    'annotations': new Backbone.Collection([{noteCounter: 1, commentString: 'comment', author: {duz: {'9E7A': '1234'}}}, {commentString: 'comment 2', author: {duz: {'9E7A': '1234'}}}])
                });
                WritebackUtil.buildEditProblemsModel(formModel, getUser(), editProblemModel);
                expect(editProblemModel.get('problemIEN')).toEqual('33');
                expect(editProblemModel.get('dateOfOnset')).toEqual('20120200');
                expect(editProblemModel.get('originalComments')).toEqual(['comment 1']);
                expect(editProblemModel.get('incomingComments')).toEqual(['comment', 'comment 2']);
            });
        });

        describe('Writeback utility for building comments', function(){
            it('Should return empty array for no comments', function(){
                expect(WritebackUtil.buildIncomingComments(new Backbone.Collection(), new Backbone.Collection())).toEqual([]);
            });

            it('Should add new comments correctly', function(){
                var newCommentCollection = new Backbone.Collection([{
                    commentString: 'testing 123',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    commentString: 'testing 345',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);
                var incomingComments = WritebackUtil.buildIncomingComments(new Backbone.Collection(), newCommentCollection);
                expect(incomingComments.length).toEqual(2);
                expect(incomingComments[0]).toEqual('testing 123');
                expect(incomingComments[1]).toEqual('testing 345');
            });

            it('Should delete comments correctly', function(){
                var originalCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var newCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var incomingComments = WritebackUtil.buildIncomingComments(originalCommentCollection, newCommentCollection, getUser());
                expect(incomingComments.length).toEqual(2);
                expect(incomingComments[0]).toEqual('testing');
                expect(incomingComments[1]).toEqual('');
            });

            it('Should handle changing comment strings', function(){
                var originalCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var newCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'new comment',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    noteCounter: 2,
                    commentString: 'new comment 2',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var incomingComments = WritebackUtil.buildIncomingComments(originalCommentCollection, newCommentCollection, getUser());
                expect(incomingComments.length).toEqual(2);
                expect(incomingComments[0]).toEqual('new comment');
                expect(incomingComments[1]).toEqual('new comment 2');
            });

            it('Should handle a variation of adds, deletes and edits', function(){
                var originalCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    noteCounter: 3,
                    commentString: 'delete me',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    noteCounter: 4,
                    commentString: 'rename me',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var newCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    noteCounter: 4,
                    commentString: 'some new name',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    commentString: 'new additional comment',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    commentString: 'another new comment',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var incomingComments = WritebackUtil.buildIncomingComments(originalCommentCollection, newCommentCollection, getUser());
                expect(incomingComments.length).toEqual(6);
                expect(incomingComments[0]).toEqual('testing');
                expect(incomingComments[1]).toEqual('testing 2');
                expect(incomingComments[2]).toEqual('');
                expect(incomingComments[3]).toEqual('some new name');
                expect(incomingComments[4]).toEqual('new additional comment');
                expect(incomingComments[5]).toEqual('another new comment');
            });

            it('Should handle filtering out of other user comments', function(){
                var originalCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '4321'
                        }
                    }
                },{
                    noteCounter: 3,
                    commentString: 'test comment from another user',
                    author: {
                        duz: {
                            'C877': '1234'
                        }
                    }
                }]);

                var newCommentCollection = new Backbone.Collection([{
                    noteCounter: 1,
                    commentString: 'testing changes',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },
                {
                    noteCounter: 2,
                    commentString: 'testing 2',
                    author: {
                        duz: {
                            '9E7A': '4321'
                        }
                    }
                },{
                    noteCounter: 3,
                    commentString: 'test comment from another user',
                    author: {
                        duz: {
                            'C877': '1234'
                        }
                    }
                },{
                    commentString: 'new additional comment',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                },{
                    commentString: 'another new comment',
                    author: {
                        duz: {
                            '9E7A': '1234'
                        }
                    }
                }]);

                var incomingComments = WritebackUtil.buildIncomingComments(originalCommentCollection, newCommentCollection, getUser());
                expect(incomingComments.length).toEqual(5);
                expect(incomingComments[0]).toEqual('testing changes');
                expect(incomingComments[1]).toEqual('testing 2');
                expect(incomingComments[2]).toEqual('test comment from another user');
            });
        });

        describe('Writeback utility for checking comment authors against the logged in user', function(){
            it('Should fail when site is false', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(new Backbone.Model(), new Backbone.Model())).toEqual(false);
            });

            it('Should fail when duz is undefined', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(new Backbone.Model({site: '9E7A'}), new Backbone.Model())).toEqual(false);
            });

            it('Should fail when no author on the comment', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(getUser(), new Backbone.Model())).toEqual(false);
            });

            it('Should fail when no duz on the comment for the logged in user site', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(getUser(), new Backbone.Model({author: {duz: {'C877': '1234'}}}))).toEqual(false);
            });

            it('Should fail when no user IDs do not match', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(getUser(), new Backbone.Model({author: {duz: {'9E7A': '4321'}}}))).toEqual(false);
            });

            it('Should pass when sites and user IDs match', function(){
                expect(WritebackUtil.isCommentByLoggedInUser(getUser(), new Backbone.Model({author: {duz: {'9E7A': '1234'}}}))).toEqual(true);
            });
        });
});