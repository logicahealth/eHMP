define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/patient_information/modelUtil',
    'app/applets/patient_information/provider/views/detailTray',
    'hbs!app/applets/patient_information/provider/templates/main'
], function(
    Backbone,
    Marionette,
    _,
    moment,
    modelUtil,
    DetailTray,
    ProviderInfoTemplate
) {
    'use strict';

    var ProviderInfoView = Backbone.Marionette.LayoutView.extend({
        tagName: 'section',
        className: 'patient-provider',
        template: ProviderInfoTemplate,
        templateHelpers: function() {
            var self = this;
            return {
                isInpatient: function(){
                    return self.model.isInpatient();
                },
                hasMhInfo: function() {
                    var mhInfo = this.teamInfo && this.teamInfo.mhCoordinator;
                    return mhInfo && ((mhInfo.mhTeam && mhInfo.mhTeam.toLowerCase() !== 'unassigned') ||
                        (mhInfo.name && mhInfo.name !== 'unassigned'));
                }
            };
        },
        regions: {
            'DetailRegion': '#patient-header-provider-details'
        },
        modelEvents: {
            "change": "render"
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
        },
        onRender: function(){
            this.DetailRegion.show(new DetailTray());
        },
        events: {
            'click .toggle-details': function(e){
                e.preventDefault();
                this.$('.sidebar > button').click();
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "trayContainer",
        group: "patient-information",
        key: "patient-provider-info",
        view: ProviderInfoView,
        orderIndex: 3,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return ProviderInfoView;
});