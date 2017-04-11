define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/patient_selection/tray/views/trayLayout',
    'app/applets/patient_selection/views/baseSearchView',
    'app/applets/patient_selection/views/myCPRSList/view',
    'app/applets/patient_selection/views/mySite/view',
    'app/applets/patient_selection/views/recentPatients/view',
    'app/applets/patient_selection/views/clinics/view',
    'app/applets/patient_selection/views/wards/view',
    'app/applets/patient_selection/views/nationwide/view'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    TrayLayoutView,
    BaseSearchView,
    MyCPRSListSearchView,
    MySiteSearchView,
    RecentPatientsSearchView,
    ClinicsSearchView,
    WardssSearchView,
    NationwideSearchView
) {
    "use strict";

    var TrayListView = Backbone.Marionette.CompositeView.extend({
        trayGroupName: 'patientSelection',
        tagName: 'section',
        className: 'patient-search-tray-list',
        template: Handlebars.compile(
            '<h5 class="all-margin-sm all-padding-xs bottom-border-grey-light text-center color-primary-dark transform-text-uppercase font-size-14">Patient Selection</h5>' +
            '<ul class="tray-list--arrow-right"></ul>'
        ),
        regions: {
            cwadDetails: '#cwad-details'
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            this.collection = new Backbone.Collection([{
                key: 'myCprsList',
                searchType: 'my cprs list',
                view: MyCPRSListSearchView,
                helpMapping: 'patient_search_myCPRSList'
            }, {
                key: 'mySite',
                searchType: 'my site',
                view: MySiteSearchView,
                helpMapping: 'patient_search_mySite'
            }, {
                key: 'recentPatients',
                searchType: 'recent patients',
                view: RecentPatientsSearchView,
                helpMapping: 'patient_search_recentPatients'
            }, {
                key: 'clinics',
                searchType: 'clinics',
                view: ClinicsSearchView,
                helpMapping: 'patient_search_clinics'
            }, {
                key: 'wards',
                searchType: 'wards',
                view: WardssSearchView,
                helpMapping: 'patient_search_wards'
            }, {
                key: 'nationwide',
                searchType: 'nationwide',
                view: NationwideSearchView,
                helpMapping: 'patient_search_nationwide'
            }]);
            ADK.Messaging.getChannel('patient-selection').reply('tray-keys', this.getKeys, this);
        },
        onBeforeDestroy: function(){
            ADK.Messaging.getChannel('patient-selection').stopReplying('tray-keys', this.getKeys);
        },
        childViewContainer: 'ul.tray-list--arrow-right',
        childView: ADK.UI.Tray.extend({
            _eventPrefix: 'patientSearchTray',
            tagName: 'li'
        }),
        childViewOptions: function(model, index) {
            return {
                tray: TrayLayoutView.extend({
                    model: model
                }),
                position: 'left',
                buttonView: Backbone.Marionette.ItemView.extend({
                    tagName: 'span',
                    template: Handlebars.compile(model.get('searchType') + ' <span class="fa-stack"><i class="fa fa-chevron-circle-right font-size-16"></i></span>')
                }),
                buttonClass: 'btn-xs',
                viewport: '.main-tray-viewport',
                preventFocusoutClose: true,
                containerHeightDifference: 20,
                widthScale: 1,
                eventChannelName: 'patient-selection-'+ model.get('key')
            };
        },
        onAddChild: function(childView) {
            var model = childView.model,
                eventString = "tray:" + this.trayGroupName + ":";
            if (_.isString(model.get('key'))) {
                eventString = eventString + model.get('key') + ":trayView";
                ADK.Messaging.reply(eventString, function() {
                    return childView;
                });
            }
        },
        onBeforeRemoveChild: function(childView) {
            var model = childView.model,
                eventString = "tray:" + this.trayGroupName + ":";
            if (_.isString(model.get('key'))) {
                eventString = eventString + model.get('key') + ":trayView";
                ADK.Messaging.stopReplying(eventString, function() {
                    return childView;
                });
            }
        },
        getKeys: function(){
            return this.collection.pluck('key');
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "trayContainer",
        group: "staff-sidebar",
        key: "patient-search-tray-list",
        view: TrayListView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });
    return TrayListView;
});