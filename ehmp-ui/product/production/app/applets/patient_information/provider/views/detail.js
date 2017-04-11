define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/patient_information/modelUtil',
    'hbs!app/applets/patient_information/provider/templates/detail'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    moment,
    modelUtil,
    DetailTemplate
) {
    'use strict';

    var HeaderView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<div data-flex-width="1" class="header-title-container">',
            '<h4 class="panel-title">Provider Information</h4>',
            '</div>',
            '<div class="header-help-button-container top-padding-xs"></div>'
        ].join('\n')),
        behaviors: {
            FlexContainer: {
                direction: 'row'
            },
            HelpLink: {
                container: '.header-help-button-container',
                mapping: 'provider_information_tray',
                buttonOptions: {
                    colorClass: 'bgc-primary-dark'
                }
            }
        },
        className: 'left-padding-sm right-padding-sm'
    });

    var ProviderInfoView = Backbone.Marionette.LayoutView.extend({
        regions: {
            HeaderRegion: '.header-content-container'
        },
        className: "container-fluid panel panel-default",
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
        onBeforeShow: function() {
            this.showChildView('HeaderRegion', new HeaderView());
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
            Tooltip: {},
            FlexContainer: {
                direction: 'column'
            }
        }
    });

    return ProviderInfoView;
});