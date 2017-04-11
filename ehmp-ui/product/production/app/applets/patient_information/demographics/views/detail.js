define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/patient_information/modelUtil",
    "hbs!app/applets/patient_information/demographics/templates/emergencyContactTemplate",
    "hbs!app/applets/patient_information/demographics/templates/nokContactTemplate",
    "hbs!app/applets/patient_information/demographics/templates/patientEmailTemplate",
    "hbs!app/applets/patient_information/demographics/templates/patientPhoneTemplate",
    "hbs!app/applets/patient_information/demographics/templates/detailLayout",
    "hbs!app/applets/patient_information/demographics/templates/patientAddressInfoTemplate",
    "hbs!app/applets/patient_information/demographics/templates/vaBenefitsTemplate",
    "hbs!app/applets/patient_information/demographics/templates/serviceHistoryTemplate"
], function(
    Backbone,
    Marionette,
    _,
    modelUtil,
    EmContactTemplate,
    NokContactTemplate,
    PatientEmailTemplate,
    PatientPhoneTemplate,
    PatientHeaderDetailTemplate,
    PatientAddressTemplate,
    VABenefitsTemplate,
    ServiceHistoryTemplate
) {
    "use strict";

    var GroupView = Backbone.Marionette.ItemView.extend({
        className: 'demographic-group',
        tagName: 'div',
        templateHelpers: function(value) {
            return {
                insurance: function() {
                    var ins = this.insurance;
                    if (ins && ins.length) {
                        ins.sort(function(a, b) {
                            var c = a.effectiveDate ? a.effectiveDate : 0;
                            var d = b.effectiveDate ? b.effectiveDate : 0;
                            return d - c;
                        });
                        return ins[0];
                    }
                    return null;
                },
                items: function() {
                    return this.externalSitesData.toJSON();
                },
                currentVista: this.options.currentVistaName || ''
            };
        },
        behaviors: {
            Tooltip: {}
        }
    });

    var patientHeaderDetailView = Backbone.Marionette.LayoutView.extend({
        template: PatientHeaderDetailTemplate,
        className: 'container-fluid panel panel-default flex-display flex-direction-column inherit-height',
        regions: {
            ptPhoneRegion: '#pt-header-pt-phone',
            ptAddressRegion: '#pt-header-pt-address',
            ptEmailRegion: '#pt-header-email',
            ptEmContactRegion: '#pt-header-em-contact',
            ptNokContactRegion: '#pt-header-nok-contact',
            colThreeRegion: '#pt-header-em-ins',
            colFourRegion: '#pt-header-em-misc'
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
        },
        onRender: function() {
            this.currentVistaName = modelUtil.getFacilityName(this.model, ADK.SessionStorage.get.sessionModel('patient-domain').get('sites'));
            this.siteDiffs = modelUtil.getSiteDiffs(this.model);

            var ptPhoneView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.siteDiffs.get('groupOne'),
                template: PatientPhoneTemplate,
            });

            this.ptPhoneRegion.show(ptPhoneView);

            var ptAddressView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.siteDiffs.get('groupTwo'),
                template: PatientAddressTemplate,
                attributes: {
                    'id': 'pt-demo-address-group',
                    'data-demo-group': 'groupTwo'
                },
            });
            this.ptAddressRegion.show(ptAddressView);

            var ptEmailView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.siteDiffs.get('groupThree'),
                template: PatientEmailTemplate,
            });
            this.ptEmailRegion.show(ptEmailView);

            var emContactView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.siteDiffs.get('groupFour'),
                template: EmContactTemplate,
            });
            this.ptEmContactRegion.show(emContactView);

            var nokContactView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.siteDiffs.get('groupFive'),
                template: NokContactTemplate,
            });
            this.ptNokContactRegion.show(nokContactView);

            var colThreeView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.model,
                template: VABenefitsTemplate
            });
            this.colThreeRegion.show(colThreeView);

            var colFourView = new GroupView({
                currentVistaName: this.currentVistaName,
                model: this.model,
                template: ServiceHistoryTemplate
            });
            this.colFourRegion.show(colFourView);
        }
    });
    return patientHeaderDetailView;

});