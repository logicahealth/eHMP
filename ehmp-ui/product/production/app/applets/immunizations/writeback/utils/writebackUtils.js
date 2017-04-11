define([
    "backbone",
    "moment"
], function(Backbone, moment) {
    "use strict";
    var writebackUtils = {
        buildSaveImmunizationModel: function(model, currentPatient, saveImmunizationModel) {
            var visit = currentPatient.get('visit');
            if (visit) {
                if (visit.patientClassName && visit.patientClassName.toUpperCase() === 'INPATIENT') {
                    saveImmunizationModel.set('encounterInpatient', '1');
                } else {
                    saveImmunizationModel.set('encounterInpatient', '0');
                }
                if (visit.locationUid) {
                    saveImmunizationModel.set('encounterLocation', visit.locationUid);
                    saveImmunizationModel.set('location', visit.locationUid);
                }
                var visitDate;
                if (model.get('administeredHistorical') === 'administered') {
                    visitDate = visit.dateTime;
                    if (visitDate.length === 12) {
                        visitDate += '00';
                    }
                    if (visit.serviceCategory) {
                        saveImmunizationModel.set('encounterServiceCategory', visit.serviceCategory);
                    } else if (visit.categoryCode) {
                        var categoryCode = visit.categoryCode.slice(visit.categoryCode.lastIndexOf(':') + 1);
                        if (categoryCode.length > 1) {
                            categoryCode = categoryCode.substring(0, 1);
                        }
                        saveImmunizationModel.set('encounterServiceCategory', categoryCode);
                    }
                    if (!saveImmunizationModel.get('encounterServiceCategory')) {
                        saveImmunizationModel.set('encounterServiceCategory', 'O');
                    }
                } else {
                    var administrationDate = model.get('administrationDateHistorical');
                    if (administrationDate.length === 4) {
                        visitDate = administrationDate + '0000';
                    } else if (administrationDate.length === 7) {
                        var adminDateSplit = administrationDate.split('/');
                        visitDate = adminDateSplit[1] + adminDateSplit[0] + '00';
                    } else {
                        visitDate = moment(administrationDate, 'MM/DD/YYYY').format('YYYYMMDD');
                    }
                    saveImmunizationModel.set('encounterServiceCategory', 'E');
                }
                saveImmunizationModel.set('encounterDateTime', visitDate);
                saveImmunizationModel.set('eventDateTime', visitDate);
            }
            saveImmunizationModel.set('immunizationIEN', model.get('immunizationType'));
            saveImmunizationModel.set('series', model.get('series'));
            saveImmunizationModel.set('route', model.get('routeOfAdministration'));
            var dfn = currentPatient.get('pid').split(';')[1];
            saveImmunizationModel.set('encounterPatientDFN', dfn);
            if (model.get('dosage')) {
                saveImmunizationModel.set('dose', model.get('dosage') + ';mL;448');
            }
            saveImmunizationModel.set('cvxCode', model.get('cvxCode'));
            saveImmunizationModel.set('immunizationNarrative', model.get('immunizationNarrative'));
            saveImmunizationModel.set('adminSite', model.get('anatomicLocation'));
            var expirationDate;
            if (model.get('administeredHistorical') === 'administered') {
                saveImmunizationModel.set('informationSource', '00;1');
                saveImmunizationModel.set('lotNumber', model.get('lotNumberAdministered'));
                saveImmunizationModel.set('manufacturer', model.get('manufacturerAdministered'));
                var administeredBy = model.get('administeredBy').split(';');
                saveImmunizationModel.set('providerName', administeredBy[1]);
                saveImmunizationModel.set('encounterProviderIEN', administeredBy[0]);
                if (model.get('visDateOffered') && model.get('informationStatement')) {
                    var visDate = moment(model.get('visDateOffered'), 'MM/DD/YYYY').format('YYYYMMDD') + '000000';
                    var infoStatements = [];
                    model.get('informationStatement').each(function(infoStatement) {
                        if (infoStatement.get('value')) {
                            infoStatements.push(infoStatement.get('ien') + '/' + visDate);
                        }
                    });
                    saveImmunizationModel.set('VIS', infoStatements.join(';'));
                }
                expirationDate = model.get('expirationDateAdministered');
                var orderedByAdministered = model.get('orderedByAdministered');
                if (!_.isEmpty(orderedByAdministered) && orderedByAdministered.indexOf(';') > 0) {
                    saveImmunizationModel.set('orderingProviderIEN', orderedByAdministered.slice(0,orderedByAdministered.lastIndexOf(';')));
                }
            } else {
                saveImmunizationModel.set('informationSource', model.get('informationSource'));
                if (model.get('administeredBy') && model.get('administeredBy').indexOf(';') > 0) {
                    var administeredByHistorical = model.get('administeredBy').split(';');
                    saveImmunizationModel.set('providerName', administeredByHistorical[1]);
                    saveImmunizationModel.set('encounterProviderIEN', administeredByHistorical[0]);
                }

                saveImmunizationModel.set('outsideLocation', model.get('administeredLocation'));
            }

            if(!_.isUndefined(model.get('comments'))){
                saveImmunizationModel.set('comment', model.get('comments'));
            }
            if (expirationDate) {
                saveImmunizationModel.set('expirationDate', moment(expirationDate, 'MM/DD/YYYY').format('YYYYMMDD'));
            }
            saveImmunizationModel.set('authorUid', model.get('authorUid'));
            return saveImmunizationModel;
        },
        addImmunization: function(model, successCallback, errorCallback) {
            var saveImmunizationModel = new ADK.UIResources.Writeback.Immunizations.Model();
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var saveModel = this.buildSaveImmunizationModel(model, currentPatient, saveImmunizationModel);
            saveModel.save(null, {
                success: function() {
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback(error);
                }
            });
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'immunization-writeback-in-progress'
            });
        }
    };
    return writebackUtils;
});