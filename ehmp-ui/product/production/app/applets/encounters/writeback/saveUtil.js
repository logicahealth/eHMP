define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    'use strict';

    var ENCOUNTER_FORM_ERROR_MSG = '<h3>There was an error submitting the form.  Your changes cannot be saved at this time.</h3>';
    var ENCOUNTER_FORM_ERROR_TITLE = 'Error';
    var ENCOUNTER_FORM_ERROR_ICON = 'icon-circle-exclamation';
    var ENCOUNTER_FORM_ERROR_NO_WRITEBACK_RESPONSE = 'No response was received from the writeback server. Contact your System Administrator for assistance.';
    var callbacks = {
        error: function(model, resp) {
            console.log('The following error occurred when attempting to save a new visit: ' + JSON.stringify(resp));
        },
        success: function(model, resp) {}
    };
    var SaveVisitModel = Backbone.Model.extend({
        url: '',
        defaults: {
            'isInpatient': '',
            'locationUid': '',
            'encounterDateTime': '',
            'primaryProviderIEN': '',
            'isPrimaryProvider': '',
            'isHistoricalVisit': ''
        }
    });
    var getSaveVisitModel = function(visitModel) {
        var save = new SaveVisitModel();
        save.set('pid', visitModel.patientPID);
        save.set('isInpatient', visitModel.isInpatient);
        save.set('locationUid', visitModel.locationUid);
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
    var saveVisit = function(visitModel, workflow) {
        var saveVisitModel = getSaveVisitModel(visitModel);
        saveVisitModel.save(null, {
            success: function() {
                var saveAlertView = new ADK.UI.Notification({
                    title: 'Encounter Submitted',
                    icon: 'fa-check',
                    message: 'Encounter successfully submitted with no errors.',
                    type: 'success'
                });
                var closeEncounter = function(workflow) {
                    ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:context:alert', saveAlertView);
                    workflow.close();
                    // Preload the encounter workflow
                    ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:load', true);
                };
                var TrayView = ADK.Messaging.request("tray:writeback:encounters:trayView");
                TrayView.$el.trigger('tray.hide');
                closeEncounter(workflow);
            },
            error: function(model, error) {
                error.responseText = !_.isEmpty(error.responseText) ? error.responseText : ENCOUNTER_FORM_ERROR_NO_WRITEBACK_RESPONSE;
                var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile([
                        ENCOUNTER_FORM_ERROR_MSG + '<div><strong>Error:</strong> ' + error.status + ' - ' + error.statusText + '<br><strong>Error Response: </strong>' + error.responseText + '</div>'
                    ].join('\n'))
                });
                var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile(['{{ui-button "OK" classes="btn-primary alert-continue btn-sm"}}']),
                    events: {
                        'click button': function() {
                            ADK.UI.Alert.hide();
                            workflow.close();
                            var TrayView = ADK.Messaging.request("tray:writeback:encounters:trayView");
                            TrayView.$el.trigger('tray.hide');
                        }
                    }
                });
                var alertView = new ADK.UI.Alert({
                    title: ENCOUNTER_FORM_ERROR_TITLE,
                    icon: ENCOUNTER_FORM_ERROR_ICON,
                    messageView: SimpleAlertItemView,
                    footerView: SimpleAlertFooterItemView
                });
                alertView.show();
            }
        });
    };
    var util = {
        save: function(visitModel, workflow) {
            saveVisit(visitModel, workflow);
        }
    };
    return util;
});