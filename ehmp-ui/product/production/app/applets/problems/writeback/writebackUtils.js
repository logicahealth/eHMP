define([
    "backbone"
], function(Backbone) {
    "use strict";

    var writebackUtils = {
        buildSaveProblemsModel: function(model, userSession, currentPatient, saveProblemModel){
            
            var dateLastModified = moment().format('YYYYMMDD');            
            var userId = userSession.get('duz')[userSession.get('site')] ? userSession.get('duz')[userSession.get('site')] : userSession.get('duz')[0];
            var dfn = currentPatient.get('pid').split(';')[1];
            var patientIEN = currentPatient.get('localId');
            var fullName = currentPatient.get('fullName');
            var problem = model.get('problemResults');

            var onsetDate = model.get('onset-date');
            if(onsetDate){
                saveProblemModel.set('dateOfOnset', writebackUtils.buildDateForVista(onsetDate));
            }

            if(problem instanceof Backbone.Model){
                if(problem.get('lexIen')){
                    saveProblemModel.set('problemNumber', problem.get('lexIen'));                
                }

                if(problem.get('conceptId')){
                    saveProblemModel.set('snomedCode', problem.get('conceptId'));
                }                
            }

            saveProblemModel.set({
                'problemName': model.get('problemText'),
                'problemText': model.get('problemText'),
                'patientIEN': patientIEN,   
                'patientName': fullName,             
                'dateLastModified': dateLastModified,
                'dateRecorded': dateLastModified,    
                'enteredBy': userSession.get('lastname') + ',' + userSession.get('firstname'),
                'enteredByIEN': userId,
                'status': model.get('statusRadioValue'),
                'acuity': model.get('immediacyRadioValue'),
                'responsibleProviderIEN': model.get('resProvider').split(';')[0],
                'responsibleProvider': model.get('resProvider').split(';')[1]
            });

            if(!_.isUndefined(model.get('clinic')) && !_.isUndefined(model.get('_labelsForSelectedValues')) && model.get('_labelsForSelectedValues') instanceof Backbone.Model){
                var clinicOrServiceValue = model.get('clinic') + '^' +  model.get('_labelsForSelectedValues').get('clinic');

                if(model.get('clinicOrService') === 'clinic'){
                    saveProblemModel.set('clinic', clinicOrServiceValue);
                } else {
                    saveProblemModel.set('service', clinicOrServiceValue);
                }
            }

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

                var shipboard = model.get('treatmentFactors').findWhere({name: 'shipboard'});
                if(shipboard){
                    tfObj.shipboard =  shipboard.get('value') ? '1' : '0';
                }

                var serviceConnected = model.get('treatmentFactors').findWhere({name: 'serviceConnected'});
                if(serviceConnected){
                    tfObj.serviceConnected =  serviceConnected.get('value') ? '1': '0';                    
                }
            }

            if(!_.isEmpty(tfObj)){
                saveProblemModel.set(tfObj);                
            }

            return saveProblemModel;
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
        }
    };

    return writebackUtils;
});