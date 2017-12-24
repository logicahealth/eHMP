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
    'app/applets/patient_selection/views/nationwide/view',
    'app/applets/patient_selection/views/mySite/filter'
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
    NationwideSearchView,
    MySiteSearchFilterView
) {
    "use strict";

    var TrayListView = Backbone.Marionette.CompositeView.extend({
        trayGroupName: 'patientSelection',
        tagName: 'section',
        className: 'patient-search-tray-list',
        _eventPrefix: 'patientSearchTray',
        eventChannelName: 'patient-selection',
        template: Handlebars.compile(
            '<ul class="tray-list--arrow-right"></ul>'
        ),
        regions: {
            cwadDetails: '#cwad-details'
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            this.collection = new Backbone.Collection([{
                key: 'mySite',
                searchType: 'my site patient search results',
                view: MySiteSearchView,
                helpMapping: 'patient_search_mySite',
                toggleView: MySiteSearchFilterView.extend({
                    eventChannelName: this.getOption('eventChannelName'),
                    _eventPrefix: this.getOption('_eventPrefix'),
                })
            }, {
                key: 'currentPatient',
                altView: Backbone.Marionette.ItemView.extend({
                    tagName: 'li',
                    template: Handlebars.compile(
                        '<button type="button" class="btn btn-default btn-xs" ' +
                        'data-patient-in-context="{{#if fullName}}true{{else}}false{{/if}}" ' +
                        'title="{{#if fullName}}{{toTitleCase fullName}} ({{last5}}){{else}}None{{/if}}" ' +
                        'aria-label="Current Patient, {{#if fullName}}View the record of {{toTitleCase fullName}} ({{last5}}){{else}}No patient currently selected{{/if}}, {{index}} of {{collectionLength}}" ' +
                        'data-toggle="tooltip"' +
                        '>Current Patient</button>'
                    ),
                    modelEvents: {
                        'change:pid': 'render'
                    },
                    behaviors: {
                        Tooltip: {
                            trigger: 'hover focus'
                        }
                    },
                    templateHelpers: function() {
                        return {
                            index: this.getOption('index'),
                            collectionLength: this.getOption('collectionLength')
                        };
                    },
                    initialize: function() {
                        this.model = ADK.PatientRecordService.getCurrentPatient();
                    },
                    events: {
                        'click [data-patient-in-context="true"]': 'navigateToPatientDefault'
                    },
                    navigateToPatientDefault: function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if(_.isEqual(ADK.WorkspaceContextRepository.currentContextId, 'patient')){
                            ADK.Messaging.trigger(this.getOption('trayEventPrefix') +'.close');
                            return;
                        }
                        var patientDefaultWorkspace = ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
                        if (this.model.has('pid')) {
                            ADK.PatientRecordService.setCurrentPatient(this.model, {
                                workspaceId: patientDefaultWorkspace,
                                extraScreenDisplay: {
                                    dontReloadApplets: _.isEqual(ADK.WorkspaceContextRepository.currentContextId, 'patient')
                                },
                                confirmationOptions: {
                                    reconfirm: true
                                }
                            });
                        } else {
                            console.error("Current Patient is missing an identifier. Patient Model:", this.model.toJSON());
                        }
                    }

                })
            }, {
                key: 'myCprsList',
                searchType: 'my cprs list',
                view: MyCPRSListSearchView,
                helpMapping: 'patient_search_myCPRSList'
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
            ADK.Messaging.getChannel(this.getOption('eventChannelName')).reply('tray-keys', this.getKeys, this);
            this.listenTo(ADK.Messaging.getChannel(this.getOption('eventChannelName')), 'trigger-method-on-tray', this.onTriggerMethodOnTray);
        },
        onBeforeDestroy: function() {
            ADK.Messaging.getChannel(this.getOption('eventChannelName')).stopReplying('tray-keys', this.getKeys);
        },
        childViewContainer: 'ul.tray-list--arrow-right',
        getChildView: function(model, index) {
            if (model.has('altView')) {
                return model.get('altView');
            }
            return ADK.UI.Tray.extend({
                _eventPrefix: this.getOption('_eventPrefix'),
                tagName: 'li'
            });
        },
        childViewOptions: function(model, index) {
            if (model.has('altView')) return {
                index: (index + 1),
                collectionLength: this.collection.length,
                trayEventPrefix: this.getOption('_eventPrefix')
            };
            var toggleView = model.get('toggleView');
            if (toggleView) {
                toggleView = toggleView.extend({
                    index: (index + 1),
                    collectionLength: this.collection.length
                });
            }
            return {
                tray: TrayLayoutView.extend({
                    model: model,
                    _eventPrefix: this.getOption('_eventPrefix'),
                    eventChannelName: this.getOption('eventChannelName') + '-' + model.get('key')
                }),
                position: 'left',

                buttonView: Backbone.Marionette.ItemView.extend({
                    tagName: 'span',
                    template: Handlebars.compile(_.startCase(model.get('searchType')))
                }),
                buttonLabel: _.startCase(model.get('searchType')),
                buttonClass: 'btn-default btn-xs',
                ariaLabel: _.startCase(model.get('searchType')) + ', ' + (index + 1) + ' of ' + this.collection.length,
                viewport: this.getOption('viewport') || '.main-tray-viewport',
                preventFocusoutClose: true,
                widthScale: 1,
                eventChannelName: this.getOption('eventChannelName') + '-' + model.get('key'),
                toggleable: false,
                toggleView: toggleView
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
        getKeys: function() {
            return this.collection.pluck('key');
        },
        onTriggerMethodOnTray: function(options) {
            if (!options.key) return;
            var tray = this.children.findByModel(this.collection.find({ key: options.key }));
            if (tray && options.event) {
                tray.$el.trigger(options.event);
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "trayContainer",
        group: ["staff-sidebar", "patient-selection-sidebar"],
        key: "patient-search-tray-list",
        view: TrayListView,
        orderIndex: 5,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });
    return TrayListView;
});
