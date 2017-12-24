define([
    "require",
    "backbone",
    "underscore",
    "app/applets/vista_health_summaries/modal/modalView",
], function(require, Backbone, _, ModalView) {
    'use strict';

    var appletUiHelpers = {
        getDetailView: function(model, dataCollection, triggerElement) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            model.set({
                'fullName': currentPatient.get('fullName'),
                'birthDate': currentPatient.get('birthDate'),
                'genderName': currentPatient.get('genderName'),
                'ssn': currentPatient.get('ssn')
            });

            var detailView = new ModalView({
                model: model
            });

            var modalOptions = {
                'title': model.get('facilityMoniker') + ' - ' + model.get('hsReport'),
                'size': 'large',
                triggerElement: triggerElement,
                nextPreviousCollection: dataCollection
            };

            var modal = new ADK.UI.Modal({
                view: detailView,
                options: modalOptions,
                callbackFunction: appletUiHelpers.getDetailView
            });
            modal.show();
        }
    };

    return appletUiHelpers;

});