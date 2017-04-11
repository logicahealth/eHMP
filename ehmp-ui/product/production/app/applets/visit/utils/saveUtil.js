define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    'use strict';

    var callbacks = {
        error: function(model, resp) {
            console.log('The following error occurred when attempting to save a new visit: ' + JSON.stringify(resp));
        },
        success: function(model, resp) {}
    };

    var SaveVisitModel = Backbone.Model.extend({
        url: '',
        defaults: {
            'patientDFN': '',
            'isInpatient': '',
            'locationIEN': '',
            'encounterDateTime': '',
            'primaryProviderIEN': '',
            'isPrimaryProvider': '',
            'isHistoricalVisit': ''
        }
    });

    var getSaveVisitModel = function(visitModel) {
        var save = new SaveVisitModel();
        save.set('patientDFN', visitModel.patientDFN);
        save.set('isInpatient', visitModel.isInpatient);
        save.set('locationIEN', visitModel.locationIEN);
        save.set('encounterDateTime', visitModel.encounterDateTime);
        save.set('patientPID', visitModel.patientPID);
        save.set('isHistoricalVisit', visitModel.isHistoricalVisit);
        save.set('serviceCategory', visitModel.serviceCategory);
        if (visitModel.providers) {
            save.set('providers', visitModel.providers);
        }
        if (visitModel.visitTypeData) {
            save.set('visitTypeData', visitModel.visitTypeData);
        }
        if (visitModel.procedureData) {
            save.set('procedureData', visitModel.procedureData);
        }
        if (visitModel.providers) {
            save.set('providers', visitModel.providers);
        }
        if (visitModel.diagnoses) {
            save.set('diagnoses', visitModel.diagnoses);
        }
        if (visitModel.serviceConnected) {
            save.set('serviceConnected', visitModel.serviceConnected);
        }
        if (visitModel.agentOrange) {
            save.set('agentOrange', visitModel.agentOrange);
        }
        if (visitModel.ionizingRadiation) {
            save.set('ionizingRadiation', visitModel.ionizingRadiation);
        }
        if (visitModel.southwestAsiaConditions) {
            save.set('southwestAsiaConditions', visitModel.southwestAsiaConditions);
        }
        if (visitModel.militarySexualTrauma) {
            save.set('militarySexualTrauma', visitModel.militarySexualTrauma);
        }
        if (visitModel.headAndNeckCancer) {
            save.set('headAndNeckCancer', visitModel.headAndNeckCancer);
        }
        if (visitModel.combatVeteran) {
            save.set('combatVeteran', visitModel.combatVeteran);
        }
        if (visitModel.shipboardHazardAndDefense) {
            save.set('shipboardHazardAndDefense', visitModel.shipboardHazardAndDefense);
        }

        var pid;

        if (visitModel.patientICN) {
            pid = visitModel.patientICN;
        } else if (visitModel.patientPID) {
            pid = visitModel.patientPID;
        }

        var url = ADK.ResourceService.buildUrl('encounters-add', {
            _ack: (!_.isUndefined(ADK.PatientRecordService.getCurrentPatient().get('acknowledged'))) ? ADK.PatientRecordService.getCurrentPatient().get('acknowledged') : ''
        });
        url = ADK.ResourceService.replaceURLRouteParams(url, {
            pid: pid
        });
        save.url = url;

        return save;
    };

    var saveVisit = function(visitModel) {
        var saveVisitModel = getSaveVisitModel(visitModel);
        saveVisitModel.save(null, callbacks);
    };

    var util = {
        save: function(visitModel) {
            saveVisit(visitModel);
        }
    };

    return util;
});