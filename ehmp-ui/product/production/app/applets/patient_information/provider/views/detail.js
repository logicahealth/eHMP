define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/patient_information/modelUtil',
    'hbs!app/applets/patient_information/provider/templates/detail'
], function(
    Backbone,
    Marionette,
    _,
    moment,
    modelUtil,
    DetailTemplate
) {
    'use strict';

    var ProviderInfoView = Backbone.Marionette.LayoutView.extend({
        className: "container-fluid panel panel-default flex-display flex-direction-column inherit-height",
        template: DetailTemplate,
        templateHelpers: function() {
            var self = this;
            return {
                isInpatient: function(){
                    return self.model.isInpatient();
                },
                currentVista: this.currentVistaName || '',
                items: function(){
                    return this.externalSitesData.toJSON();
                }
            };
        },
        modelEvents: {
            "change:teamInfo": "render"
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            this.providerModel = new Backbone.Model();
            this.currentVistaName = modelUtil.getFacilityName(this.model, ADK.SessionStorage.get.sessionModel('patient-domain').get('sites'));
        },
        onBeforeRender: function(){
            this.configureData();
        },
        configureData: function(){
            var domainModel = ADK.SessionStorage.get.sessionModel('patient-domain');
            var domainData = domainModel.get('data');
            var siteNames = domainModel.get('sites');
            var currentFacility = modelUtil.getFacilityName(this.model, siteNames);
            var exs = [];
            var exObj;
            _.each(new Backbone.Collection(modelUtil.getVistaData(domainData, siteNames, currentFacility)).models, function(item) {
                if(item.has('teamInfo')){
                    exObj = item.get('teamInfo');
                    exObj.facilityName = item.get('facilityName');
                    exs.push(exObj);
                }
            });
            this.providerModel.clear({silent: true});
            this.providerModel.set(modelUtil.updateDiffsTwoLevelsDeep(this.model.get('teamInfo'), exs));
        },
        onDestroy: function() {
            this.providerModel.destroy();
        },
        serializeModel: function(model) {
            return _.defaults(this.providerModel.toJSON(), model.toJSON());
        },
        behaviors: {
            Tooltip: {}
        }
    });

    return ProviderInfoView;
});