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

    var CCOWStatusView = Backbone.Marionette.ItemView.extend({
        className: 'left-padding-md',
        behaviors: {
            FlexContainer: {
                direction: 'row',
                alignItems: 'center',
                container: '#ccowStatusBtn'
            }
        },
        template: Handlebars.compile([
            '{{#if vaultConnected}}<button type="button" {{else}}<div {{/if}}' +
            'id="ccowStatusBtn" class="{{#if vaultConnected}}btn btn-icon{{else}}color-primary-light{{/if}} ccow-status {{vaultAvailable}} all-padding-no" data-connected="{{ccowConnected}}">',
            '<div class="{{ccowClass}} font-size-15 left-padding-xs pixel-width-24 pixel-height-19 {{#unless ccowConnected}}right-margin-xs active background-color-red{{/unless}}">',
            '{{#if ccowConnected}}',
            '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>',
            '<span class="path7"></span><span class="path8"></span>',
            '{{else}}',
            '<span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span>',
            '<span class="path5"></span><span class="path6"></span><span class="path7"></span><span class="path8"></span>',
            '{{/if}}',
            '</div>',
            '{{ccowMessage}}',
            '<div class="sr-only">. {{ccowSrOnlyMessage}}</div>',
            '{{#if vaultConnected}}</button{{else}}</div>{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            return {
                'ccowConnected': _.isEqual(ADK.CCOWService.getCcowStatus(), 'Connected'),
                'vaultConnected': !!ADK.SessionStorage.getModel('ccow').get('vaultConnected'),
                'ccowBg': function() {
                    return this.ccowConnected ? "" : "active";
                },
                'vaultAvailable': function() {
                    return this.vaultConnected ? "" : "vault-unavailable";
                },
                'ccowMessage': function() {
                    return this.vaultConnected ?
                        (this.ccowConnected ? "Clinical link on" : "Clinical link broken") :
                        "Clinical link unavailable";
                },
                'ccowSrOnlyMessage': function() {
                    return this.ccowConnected ? "Clinical link on. Click to break Clinical link" : "This patient is disconnected from clinical link";
                },
                'ccowClass': function() {
                    return this.ccowConnected ? "icon-ccow-connected" : "icon-ccow-disconnected";
                }
            };
        },
        events: {
            'click button[data-connected="true"]': function(e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Disconnected');
            },
            'click button[data-connected="false"]': function(e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Connected');
            },
        },
        initialize: function() {
            if ("ActiveXObject" in window) {
                this.listenTo(ADK.Messaging, 'ccow:statusUpdated', this.render);
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationFooterItem",
        group: "left",
        key: "ccowStatus",
        view: CCOWStatusView,
        orderIndex: 10,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return CCOWStatusView;
});
