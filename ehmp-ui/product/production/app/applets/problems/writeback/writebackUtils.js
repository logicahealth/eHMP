define([
    "backbone",
    "moment"
], function(Backbone, moment) {
    "use strict";

    var writebackUtils = {
        buildSaveProblemsModel: function(model, userSession, currentPatient, saveProblemModel){
            
            var dateLastModified = moment().format('YYYYMMDD');            
            var userId = userSession.get('duz')[userSession.get('site')] ? userSession.get('duz')[userSession.get('site')] : userSession.get('duz')[0];
            var dfn = currentPatient.get('pid').split(';')[1];
            var patientIEN = currentPatient.get('localId');
            var fullName = currentPatient.get('fullName');
            var problem = model.get('problemResults');
            var recordingProviderIEN, recordingProvider, dateRecorded;

            var visit = currentPatient.get('visit');

            if(!_.isUndefined(visit) && !_.isUndefined(visit.selectedProvider)){
                recordingProvider = visit.selectedProvider.name;
                recordingProviderIEN = visit.selectedProvider.code;
                dateRecorded = visit.dateTime;
            }

            var onsetDate = model.get('onset-date');
            if(onsetDate){
                saveProblemModel.set('dateOfOnset', writebackUtils.buildDateForVista(onsetDate));
            }

            if(!model.get('isFreeTextProblem') && (problem instanceof Backbone.Model)){
                if(problem.get('lexIen')){
                    saveProblemModel.set('problemNumber', problem.get('lexIen'));                
                }                

                if(problem.get('conceptId')){
                    saveProblemModel.set('snomedCode', problem.get('conceptId'));
                }                

                if(problem.get('codeIen')){
                    saveProblemModel.set('lexiconCode', problem.get('codeIen'));                
                }   

                if(problem.get('code')){
                    saveProblemModel.set('code', problem.get('code'));                
                }                             
            }else{
                saveProblemModel.set({
                    'code': '',
                    'lexiconCode': ''
                });     
            }

            saveProblemModel.set({
                'problemName': model.get('problemText'),
                'problemText': model.get('problemText'),
                'patientIEN': patientIEN,   
                'patientName': fullName,             
                'dateLastModified': dateLastModified,
                'dateRecorded': dateRecorded,
                'enteredBy': userSession.get('lastname') + ',' + userSession.get('firstname'),
                'enteredByIEN': userId,
                'status': model.get('statusRadioValue'),
                'acuity': model.get('immediacyRadioValue'),
                'responsibleProviderIEN': model.get('resProvider').split(';')[0],
                'responsibleProvider': model.get('resProvider').split(';')[1],
                'recordingProvider': recordingProvider,
                'recordingProviderIEN': recordingProviderIEN
            });

            this.saveClinicOrService(model, saveProblemModel);

            if(model.get('isFreeTextProblem') && model.get('freeTxtTxtArea')){
                saveProblemModel.set('newTermText', model.get('freeTxtTxtArea'));                
            }

            var comments = [];
            model.get('annotations').each( function( comment ){ 
                comments.push(comment.get('commentString'));
            });

            if(comments.length > 0){
                saveProblemModel.set('comments', comments);
            }

            var tfObj = this.buildTreatmentFactorsObject(model);
            if(!_.isEmpty(tfObj)){
                saveProblemModel.set(tfObj);
            }

            return saveProblemModel;
        },
        saveClinicOrService: function(formModel, saveModel){
            if(!_.isUndefined(formModel.get('clinic')) && !_.isNull(formModel.get('clinic')) && !_.isUndefined(formModel.get('_labelsForSelectedValues')) && formModel.get('_labelsForSelectedValues') instanceof Backbone.Model){
                var clinicOrServiceValue = formModel.get('clinic') + '^' +  formModel.get('_labelsForSelectedValues').get('clinic');

                if(formModel.get('clinicOrService') === 'clinic'){
                    saveModel.set('clinic', clinicOrServiceValue);
                } else {
                    saveModel.set('service', clinicOrServiceValue);
                }
            }
        },
        buildTreatmentFactorsObject: function(model){
            var tfObj = {};
            if(model.get('noTreatmentFactors') !== 'true'){

                var headOrNeckCancer = model.get('treatmentFactors').findWhere({name: 'head-neck-cancer'});
                if(headOrNeckCancer){
                    tfObj.headOrNeckCancer = headOrNeckCancer.get('value') ? '1' : '0';
                }

                var ionizingRadiation = model.get('treatmentFactors').findWhere({name: 'ionizing-radiation'});
                if(ionizingRadiation){
                    tfObj.radiation = ionizingRadiation.get('value') ? '1' : '0';
                }

                var agentOrange = model.get('treatmentFactors').findWhere({name: 'agent-orange'});
                if(agentOrange){
                    tfObj.agentOrange =  agentOrange.get('value') ? '1' : '0';
                }

                var swAsia = model.get('treatmentFactors').findWhere({name: 'sw-asia'});
                if(swAsia){
                    tfObj.persianGulfVet =  swAsia.get('value') ? '1' : '0';                    
                }

                var mst = model.get('treatmentFactors').findWhere({name: 'mst'});
                if(mst){
                    tfObj.MST =  mst.get('value') ? '1' : '0';                    
                }

                var shipboard = model.get('treatmentFactors').findWhere({name: 'shipboard-hazard'});
                if(shipboard){
                    tfObj.shipboard =  shipboard.get('value') ? '1' : '0';
                }

                var serviceConnected = model.get('treatmentFactors').findWhere({name: 'serviceConnected'});
                if(serviceConnected){
                    tfObj.serviceConnected =  serviceConnected.get('value') ? '1': '0';                    
                }
            }

            return tfObj;
        },
        buildEditProblemsModel: function(model, userSession, editProblemModel){
            var editObject = {};
            editObject.problemIEN = model.get('problemIEN');
            editObject.dateLastModified = moment().format('YYYYMMDD');

            var onsetDate = model.get('onset-date');
            if(_.isString(onsetDate)){
                editObject.dateOfOnset = writebackUtils.buildDateForVista(onsetDate);
            }

            editObject.problemText = model.get('problemText');
            editObject.problemName = model.get('problemText');

            if(!_.isUndefined(model.get('snomedCode'))){
                editObject.snomedCode = model.get('snomedCode');
            }

            if (!_.isUndefined(model.get('lexiconCode'))) {
                editObject.lexiconCode = model.get('lexiconCode');
            } else {
                editObject.lexiconCode = '';
            }

            if (_.isArray(model.get('codes'))) {
                editObject.code = model.get('codes')[0].code;
            } else {
                editObject.code = '';
            }

            editObject.status = model.get('statusRadioValue');
            editObject.acuity = model.get('immediacyRadioValue');

            if(!_.isUndefined(model.get('resProvider'))){
                editObject.responsibleProviderIEN = model.get('resProvider').split(';')[0];
                editObject.responsibleProvider = model.get('resProvider').split(';')[1];
            }

            this.saveClinicOrService(model, editProblemModel);

            var tfObj = this.buildTreatmentFactorsObject(model);
            if(!_.isEmpty(tfObj)){
                editProblemModel.set(tfObj);
            }

            var userIEN = userSession.get('duz')[userSession.get('site')] ? userSession.get('duz')[userSession.get('site')] : userSession.get('duz')[0];
            editObject.userIEN = userIEN;

            var originalCommentsArray = [];
            var originalComments = model.get('originalComments');
            if(!_.isUndefined(originalComments)){
                originalComments.each(function(originalComment){
                    if(writebackUtils.isCommentByLoggedInUser(userSession, originalComment)){
                        originalCommentsArray.push(originalComment.get('commentString'));
                    }
                });
            }

            editObject.originalComments = originalCommentsArray;
            editObject.incomingComments = this.buildIncomingComments(model.get('originalComments'), model.get('annotations'), userSession);

            editProblemModel.set(editObject);
        },
        addProblem: function(model, successCallback, errorCallback){
            var saveProblemModel = new ADK.UIResources.Writeback.Problems.Model();
            var currentPatient = saveProblemModel.patient;
            var userSession = saveProblemModel.user;

            this.buildSaveProblemsModel(model, userSession, currentPatient, saveProblemModel);
            saveProblemModel.save(null, {
                success:function() {
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback(error);
                }
            });
        },
        editProblem: function(model, successCallback, errorCallback){
            var editProblemModel = new ADK.UIResources.Writeback.Problems.Model();
            var userSession = editProblemModel.user;

            this.buildEditProblemsModel(model, userSession, editProblemModel);
            editProblemModel.save(null, {
                success: function(){
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback(error);
                }
            });
        },
        buildIncomingComments: function(originalCommentCollection, newCommentCollection, userSession){
            var incomingCommentCollection = [];

            if(!_.isUndefined(originalCommentCollection) && originalCommentCollection.length > 0){
                originalCommentCollection.each(function(originalComment){
                    var noteCounter = originalComment.get('noteCounter');

                    var newComment = newCommentCollection.findWhere({'noteCounter': noteCounter});

                    if(writebackUtils.isCommentByLoggedInUser(userSession, originalComment)){
                        if(!_.isUndefined(newComment)){
                            incomingCommentCollection.push(newComment.get('commentString'));
                        } else {
                            // Signifies a deleted comment
                            incomingCommentCollection.push('');
                        }
                    }
                });
            }

            //Add new comments
            newCommentCollection.each(function(newComment){
                if(_.isUndefined(newComment.get('noteCounter'))){
                    incomingCommentCollection.push(newComment.get('commentString'));
                }
            });

            return incomingCommentCollection;
        },
        buildDateForVista: function(date){
            var dateTaken;

            if(_.isString(date)){
                var dateSplit = date.split('/');
                if(dateSplit.length === 1){
                    dateTaken = dateSplit[0] + '0000';
                } else if(dateSplit.length === 2){
                    dateTaken = dateSplit[1] + dateSplit[0] + '00';
                } else {
                    dateTaken = moment(date, 'MM/DD/YYYY').format('YYYYMMDD');
                }
            }

            return dateTaken;
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'problem-writeback-in-progress'
            });
        },
        isCommentByLoggedInUser: function(loggedInUser, comment){
            var isUserSame = false;
            var loggedInUserSite = loggedInUser.get('site');
            var loggedInUserDuz = loggedInUser.get('duz');

            if(!_.isUndefined(loggedInUserSite) && !_.isUndefined(loggedInUser.get('duz'))){
                var userIen = loggedInUserDuz[loggedInUserSite];

                if(!_.isUndefined(comment.get('author')) && !_.isUndefined(comment.get('author').duz[loggedInUserSite]) && userIen === comment.get('author').duz[loggedInUserSite]){
                    isUserSame = true;
                }
            }

            return isUserSame;
        }
    };

    return writebackUtils;
});