define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars
) {
    'use strict';

     var PatientContextLinkView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile([
             '{{#if shouldShow}}',
             '{{#if isActive}}<p {{else}}<a href="#" title="Press enter to navigate to the patient centric workspaces for {{toTitleCase fullName}}." {{/if}}id="current-patient-nav-header-tab" class="context-navigation-link{{#if isActive}} active{{/if}}">',
             '<span class="nav-ccow {{ccowBg}}"><span class="fa-stack"><i class="fa fa-stack-2x"></i><i class="fa fa-user font-size-15 fa-stack-1x fa-inverse {{ccowIconBg}}"></i></span> Current Patient: <b>{{toTitleCase fullName}}</b></span>',
             '<span class="{{ccowClass}} {{vaultAvailable}} font-size-18 left-padding-xs" data-toggle="tooltip" data-html="true" title="{{ccowTooltip}}" data-placement="auto top" data-trigger="hover focus" data-container="body">',
             '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>',
             '<span class="path7"></span><span class="path8"></span></span><span class="sr-only">{{ccowSrOnlyMessage}}</span>',
             '{{#if isActive}}</p>{{else}}</a>{{/if}}',
             '{{else}}',
             '<p class="context-navigation-link">',
             '<span class="nav-ccow {{ccowFakeBgNeeded}} {{ccowBg}}"><i class="fa fa-user font-size-15"></i> Current Patient: None </span>',
             '<span class="{{ccowClass}} {{vaultAvailable}} font-size-18 left-padding-xs" ',
             'data-toggle="tooltip" data-html="true" title="{{ccowTooltip}}" data-placement="auto top" data-trigger="hover focus" data-container="body">',
             '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span>',
             '<span class="path5"></span><span class="path6"></span><span class="path7"></span><span class="path8"></span></span><span class="sr-only">{{ccowSrOnlyMessage}}</span></p>',
             '{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            var self = this;
            return {
                'shouldShow': function() {
                    return !_.isUndefined(this.fullName);
                },
                'isActive': function() {
                    return self.templateHelperModel.get('isActive');
                },
                'ccowConnected' : function () {
                    return (ADK.CCOWService.getCcowStatus() === 'Connected');
                },
                'ccowFakeBgNeeded': function () {
                    if (this.ccowConnected()) {
                        return "";
                    } else {
                        return "";
                    }
                },
                'ccowBg': function () {
                    if (this.ccowConnected()) {
                        return "";
                    } else {
                        return "active background-color-red color-pure-white";
                    }
                },
                'vaultAvailable' : function () {
                    if (ADK.CCOWService.vaultStatus) {
                        return "";
                    } else {
                        return "vault-unavailable";
                    }
                },
                'ccowTooltip': function () {
                    if (ADK.CCOWService.vaultStatus) {
                        if (this.ccowConnected()) {
                            return "Clinical link on";
                        } else {
                            return "Clinical link broken";
                        }
                    } else {
                        return "Clinical link unavailable";
                    }
                },
                'ccowSrOnlyMessage': function () {
                    if (this.ccowConnected()) {
                        return "This patient is connected to clincal link";
                    } else {
                        return "This patient is disconnected from clinical link";
                    }
                },
                'ccowClass': function () {
                    if (this.ccowConnected()) {
                        return "icon-ccow-connected";
                    } else {
                        return "icon-ccow-disconnected";
                    }
                },
                'ccowIconBg': function () {
                    if (this.ccowConnected()) {
                        return "color-primary";
                    } else {
                        return "color-pure-white";
                    }
                }
            };
        },
        events: {
            'click #current-patient-nav-header-tab': 'navigateToPatientDefault',
            'click span.icon-ccow-connected': function (e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Disconnected');
            },
            'click span.icon-ccow-disconnected': function (e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Connected');
            },
        },
        modelEvents: {
            'change:fullName': 'render'
        },
        initialize: function() {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            var currentNavigationPathModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.templateHelperModel = new Backbone.Model({
                isActive: _.isEqual(currentNavigationPathModel.get('context'), 'patient') && !_.isEqual(currentNavigationPathModel.get('workspace'), 'patient-search-screen') ? true : false
            });
            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change', function(model) {
                this.templateHelperModel.set({
                    isActive: _.isEqual(model.get('context'), 'patient') && !_.isEqual(model.get('workspace'), 'patient-search-screen') ? true : false
                });
            });
            this.listenTo(this.templateHelperModel, 'change:shouldShow change:isActive', this.render);
            if ("ActiveXObject" in window) {
                ADK.Messaging.on('ccow:updateHeaderStatus', this.render);
            }
        },
        navigateToPatientDefault: function(e) {
            e.preventDefault();
            if (ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('context') !== 'patient' || ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === 'patient-search-screen') {
                var patientDefaultWorkspace = ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
                ADK.PatientRecordService.setCurrentPatient(ADK.PatientRecordService.getCurrentPatient(), {workspaceId: patientDefaultWorkspace});
            }
            e.stopPropagation();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "left",
        key: "patientContextLink",
        view: PatientContextLinkView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return PatientContextLinkView;
});