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


    var CurrentPatientLabelView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile('<div class="current-patient-label--divider"></div><p class="current-patient-label arrow-right-after background-color-pure-white color-primary right-padding-xs">Current Patient: </p>'),
    });

    var PatientContextLinkView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile([
            '{{#if shouldShow}}',
            '{{#if isActive}}<p {{else}}<a href="#" title="Navigate to the patient centric workspaces for {{toTitleCase fullName}}." {{/if}}id="current-patient-nav-header-tab" class="context-navigation-link inline-block-display{{#if isActive}} active{{else}}  right-padding-no{{/if}}">',
            '<span class="nav-ccow {{ccowBg}}"><strong>{{toTitleCase fullName}}</strong> ({{last5}})</span>',
            '{{#unless isActive}}</a>{{/unless}}',
            '<button type="button" id="ccowHeaderBarBtn" class="btn btn-icon inline-block-display {{ccowClass}} {{vaultAvailable}} {{ccowIconBg}} font-size-15" data-toggle="tooltip" data-html="true" title="{{ccowTooltip}}" data-placement="auto top" data-container="body">',
            '<span class="sr-only">{{ccowSrOnlyMessage}}</span>',
            '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>',
            '<span class="path7"></span><span class="path8"></span></button>',
            '{{#if isActive}}</p>{{/if}}',
            '{{else}}',
            '<p id="current-patient-nav-header-tab" class="context-navigation-link inline-block-display right-padding-no">',
            '<span class="nav-ccow {{ccowFakeBgNeeded}} {{ccowBg}}">None </span>',
            '<button type="button" id="ccowHeaderBarBtn" class="btn btn-icon {{ccowClass}} {{vaultAvailable}} {{ccowIconBg}} font-size-15" ',
            'data-toggle="tooltip" data-html="true" title="{{ccowTooltip}}" data-placement="auto top" data-container="body">',
            '<span class="sr-only">{{ccowSrOnlyMessage}}</span>',
            '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span>',
            '<span class="path5"></span><span class="path6"></span><span class="path7"></span><span class="path8"></span></button></p>',
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
                'ccowConnected': function() {
                    return (ADK.CCOWService.getCcowStatus() === 'Connected');
                },
                'ccowFakeBgNeeded': function() {
                    if (this.ccowConnected()) {
                        return "";
                    } else {
                        return "";
                    }
                },
                'ccowBg': function() {
                    if (this.ccowConnected()) {
                        return "";
                    } else {
                        return "active";
                    }
                },
                'ccowIconBg': function() {
                    if (this.ccowConnected()) {
                        return "background-color-pure-white";
                    } else {
                        return "active background-color-red";
                    }
                },
                'vaultAvailable': function() {
                    var vaultConnected = ADK.SessionStorage.getModel('ccow').get('vaultConnected');
                    if (vaultConnected) {
                        return "";
                    } else {
                        return "vault-unavailable";
                    }
                },
                'ccowTooltip': function() {
                    var vaultConnected = ADK.SessionStorage.getModel('ccow').get('vaultConnected');
                    if (vaultConnected) {
                        if (this.ccowConnected()) {
                            return "Clinical link on";
                        } else {
                            return "Clinical link broken";
                        }
                    } else {
                        return "Clinical link unavailable";
                    }
                },
                'ccowSrOnlyMessage': function() {
                    if (this.ccowConnected()) {
                        return "Clinical link on. Click to break Clinical link";
                    } else {
                        return "This patient is disconnected from clinical link";
                    }
                },
                'ccowClass': function() {
                    if (this.ccowConnected()) {
                        return "icon-ccow-connected";
                    } else {
                        return "icon-ccow-disconnected";
                    }
                }
            };
        },
        events: {
            'click a#current-patient-nav-header-tab': 'navigateToPatientDefault',
            'click button.icon-ccow-connected': function(e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Disconnected');
            },
            'click button.icon-ccow-disconnected': function(e) {
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
                this.listenTo(ADK.Messaging, 'ccow:updateHeaderStatus',  _.bind(function(){
                    this.$('#ccowHeaderBarBtn').tooltip('hide');
                    this.render();
                }, this));
            }
        },
        navigateToPatientDefault: function(e) {
            e.preventDefault();
            if (ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('context') !== 'patient' || ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === 'patient-search-screen') {
                var patientDefaultWorkspace = ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
                var currentpatient = ADK.PatientRecordService.getCurrentPatient();
                if (currentpatient.has('pid')) {
                    ADK.PatientRecordService.setCurrentPatient(currentpatient, {
                        confirmationOptions: {
                            reconfirm: true
                        },
                        workspaceId: patientDefaultWorkspace
                    });
                } else {
                    console.error("Current Patient is missing an identifier. Patient Model:", currentpatient.toJSON());
                }
            }
            e.stopPropagation();
        },
        onRender: function() {
            this.$('#ccowHeaderBarBtn').tooltip();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "left",
        key: "currentPatientLabel",
        view: CurrentPatientLabelView,
        orderIndex: 10,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "left",
        key: "patientContextLink",
        view: PatientContextLinkView,
        orderIndex: 15,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return PatientContextLinkView;
});