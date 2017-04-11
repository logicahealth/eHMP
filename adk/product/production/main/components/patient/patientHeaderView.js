define([
    "backbone",
    "marionette",
    "underscore",
    "api/Messaging",
    "api/ResourceService",
    "api/SessionStorage",
    "api/CCOWService",
    "hbs!main/components/patient/patientHeaderTemplate",
    "main/components/patient/cwad/view",
    "main/components/patient/detail/main/view",
    "main/components/patient/visitContext/view",
    "main/components/patient/providerDetails/view",
    "main/components/patient/smokingStatus/smokingStatusView"
], function(Backbone, Marionette, _, Messaging, ResourceService, SessionStorage, CCOWService, PatientHeaderTemplate, CWADView, PatientDetailView, VistContextView, ProviderInfoView, smokingStatusView) {
    "use strict";

    // Service category constants
    var INHOSPITAL_SC = 'I';
    var AMBULATORY_SC = 'A';
    var DAILY_SC = 'D';
    var ANCILLARY_PACKAGE_SC = 'X';
    var TELEHEALTH_SC = 'T';
    var HISTORICAL_SC = 'E';
    var INPATIENT = 'Inpatient';

    var TrayCollectionView = Backbone.Marionette.CollectionView.extend({
        trayGroupName: 'writeback',
        className: 'tray-list',
        getChildView: function(item) {
            var trayViewOptions = _.defaults(item.get('view').prototype.options, {
                preventFocusoutClose: true,
                eventChannelName: item.get('key')
            });
            trayViewOptions = _.defaults({
                //viewport: '#center-region'
                viewport: null
            }, trayViewOptions);
            return item.get('view').extend({
                options: trayViewOptions
            });
        },
        filter: function(child) {
            return child.isOfGroup('tray', this.trayGroupName) && child.shouldShow();
        },
        onAddChild: function(childView) {
            // work with the childView instance, here
            var model = childView.model,
                eventString = "tray:"+this.trayGroupName+":";
            if(_.isString(model.get('key'))){
                eventString = eventString + model.get('key') + ":trayView";
                Messaging.reply(eventString, function(){ return childView;});
            }
        },
        onBeforeRemoveChild: function(childView) {
            // work with the childView instance, here
            var model = childView.model,
                eventString = "tray:"+this.trayGroupName+":";
            if(_.isString(model.get('key'))){
                eventString = eventString + model.get('key') + ":trayView";
                Messaging.stopReplying(eventString, function(){ return childView;});
            }
        }
    });

    var PatientHeaderView = Backbone.Marionette.LayoutView.extend({
        template: PatientHeaderTemplate,
        regions: {
            trayContainerRegion: '.tray-container',
            cwadRegion: '#patientDemographic-cwad',
            patientDetailsRegion: '#patientDemographic-patientInfo',
            patientVisitRegion: '#patientDemographic-visitInfo',
            patientProviderInfoRegion: '#patientDemographic-providerInfo'
        },
        initialize: function() {
            var smokingStatusChannel = Messaging.getChannel('smokingstatus');
            smokingStatusChannel.comply('smokingstatus:change', smokingStatusView.handleStatusChange);
            smokingStatusChannel.comply('smokingstatus:updated', this.updateSmokingStatus, this);
            this.trayCollection = Messaging.request('get:components');
            // Add service category if there is a visit context
            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
            if (!_.isEmpty(visit) &&
                !_.isEmpty(visit.locationDisplayName)) {
                this.setServiceCategory(visit);
            }
        },
        onBeforeShow: function() {
            this.trayContainerRegion.show(new TrayCollectionView({
                collection: this.trayCollection
            }));
            this.cwadRegion.show(new CWADView({
                model: this.model
            }));
            this.patientDetailsRegion.show(new PatientDetailView({
                model: this.model
            }));
            this.patientVisitRegion.show(new VistContextView({
                model: this.model
            }));
            this.patientProviderInfoRegion.show(new ProviderInfoView({
                model: this.model
            }));
        },
        events: {
            'keydown [data-toggle="dropdown"]': 'showPatientInfoDropdown',
            'hidden.bs.dropdown .dropdown': function(e) {
                this.$('[data-toggle=popup]').popup('hide');
                $('.fa-caret-down', e.currentTarget).addClass('fa-caret-right').removeClass('fa-caret-down');
            },
            'shown.bs.dropdown .dropdown': function(e) {
                $('.fa-caret-right', e.currentTarget).removeClass('fa-caret-right').addClass('fa-caret-down');
                $('#patient-header-demographic-details').focus();
                this.$('[data-toggle=popup]').popup('hide');
            },
            'click #leaveContext': 'leaveContext',
            'click #joinContext': 'joinContext'
        },
        showPatientInfoDropdown: function(event) {
            if (event.which === 13 || event.which === 32) {
                $(event.currentTarget).trigger('click');
            }
        },
        updateSmokingStatus: function(status) {
            this.model.set('smokingStatus', status);
        },
        leaveContext: function() {
            CCOWService.suspendContext(function() {});
        },
        joinContext: function() {
            CCOWService.resumeContext();
        },
        setServiceCategory: function(visit) {
            var isInpatient = ADK.PatientRecordService.getCurrentPatient().get('patientStatusClass') === INPATIENT;
            var isAdmission = ADK.PatientRecordService.getCurrentPatient().get('roomBed');
            var locationDisplayName = (!_.isEmpty(visit.locationDisplayName)) ? visit.locationDisplayName.toUpperCase() : '';
            var serviceCategory = '';

            if (locationDisplayName.indexOf('TELE') > -1){
                serviceCategory = TELEHEALTH_SC;
            } else {
                if (!_.isEmpty(isAdmission)) {
                    serviceCategory = (isInpatient) ? DAILY_SC : ANCILLARY_PACKAGE_SC;
                } else {
                    serviceCategory = (isInpatient) ? INHOSPITAL_SC : AMBULATORY_SC;
                }
            }
            ADK.PatientRecordService.getCurrentPatient().get('visit').serviceCategory = serviceCategory;
        }
    });

    return PatientHeaderView;
});