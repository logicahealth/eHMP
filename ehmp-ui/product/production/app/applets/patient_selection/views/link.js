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

    var PatientSelectionLinkView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'patient-selection-link-style',
        template: Handlebars.compile([
            '{{#if isDisabled}}<p {{else if isHighlighted}}<p {{else}}<a href="#" data-patient-selection-visable="{{isPatientSelectionVisable}}"',
            ' {{#if isPatientSelectionVisable}}title="View recent patients"{{else}}title="View patient selection to choose another patient"{{/if}}',
            ' {{/if}}id="patientSearchButton" class="context-navigation-link{{#if isHighlighted}} active background-color-primary color-pure-white{{/if}}">',
            '<i class="fa fa-address-book font-size-15" aria-hidden="true"></i> Patients',
            '{{#if isDisabled}}</p>{{else if isHighlighted}}</p>{{else}}</a>{{/if}}'
        ].join('\n')),
        events: {
            'click [data-patient-selection-visable="false"]': 'navigateToPatientSelection',
            'click [data-patient-selection-visable="true"]': 'showRecentPatients'
        },
        modelEvents: {
            'change:shouldShow change:isDisabled change:isHighlighted change:isPatientSelectionVisable': 'render',
            'change:isPatientSelectionVisable': 'updateTrayListeners'
        },
        initialize: function() {
            this.currentWorkspaceAndContext = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.model = new Backbone.Model({
                isHighlighted: false,
                isDisabled: false,
                isPatientSelectionVisable: this.isPatientSelectionVisable()
            });
            this.listenTo(this.currentWorkspaceAndContext, 'change', function(model) {
                this.model.set({
                    isDisabled: false,
                    isHighlighted: false,
                    isPatientSelectionVisable: this.isPatientSelectionVisable()
                });
            });
        },
        navigateToPatientSelection: function(e) {
            e.preventDefault();
            ADK.Navigation.navigate(ADK.WorkspaceContextRepository.currentWorkspaceId, {
                extraScreenDisplay: {
                    dontReloadApplets: true
                },
                mode: 'patient-selection'
            });
            this.model.set({ isDisabled: true, isHighlighted: true });
            this.listenToOnce(ADK.Messaging, 'load.ehmp.workspace', function() {
                var shouldHaveFocus = this.model.get('isHighlighted') && !this.model.get('isPatientSelectionVisable');
                this.model.set({
                    isHighlighted: false,
                    isDisabled: false,
                    isPatientSelectionVisable: this.isPatientSelectionVisable()
                });
                if(shouldHaveFocus) this.$('a').focus();
            });
        },
        showRecentPatients: function(e) {
            e.preventDefault();
            ADK.Messaging.getChannel('patient-selection').trigger('trigger-method-on-tray', {
                key: 'recentPatients',
                event: 'patientSearchTray.show'
            });
        },
        isPatientSelectionVisable: function() {
            return _.isEqual(this.currentWorkspaceAndContext.get('context'), 'staff');
        },
        onRender: function() {
            if (this.model.get('isHighlighted')) {
                this.$el.removeClass('divider-left');
            } else {
                this.$el.addClass('divider-left');
            }
        },
        onBeforeShow: function() {
            this.channel = ADK.Messaging.getChannel('patient-selection');
            this._trayKeys = _.map(this.channel.request('tray-keys'), function(key) {
                return 'patient-selection-' + key;
            }, this);
            this.updateTrayListeners();
        },
        updateTrayListeners: function() {
            if (this.model.get('isPatientSelectionVisable')) {
                this.turnOffListeners();
                this.startListening();
            } else {
                this.turnOffListeners();
            }
        },
        startListening: function() {
            this.listenForTrayClose();
            this.listenForTrayOpen();
        },
        showInitalTray: function() {
            this.channel.trigger('trigger-method-on-tray', {
                key: 'recentPatients',
                event: 'patientSearchTray.show'
            });
        },
        listenForTrayClose: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSearchTray.hide', function() {
                        this.turnOffListeners();
                        this.model.set({ isHighlighted: false });
                        this.startListening();
                    });
                }
            }, this);
        },
        listenForTrayShown: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSearchTray.shown', function() {
                        this.turnOffListeners();
                        this.model.set({ isHighlighted: true });
                        this.startListening();
                    });
                }
            }, this);
        },
        listenForTrayOpen: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSearchTray.show', function() {
                        this.turnOffListeners();
                        this.listenForTrayShown();
                    });
                }
            }, this);
        },
        turnOffListeners: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.stopListening(ADK.Messaging.getChannel(key));
                }
            }, this);
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "left",
        key: "patientSelectionLink",
        view: PatientSelectionLinkView,
        orderIndex: 1,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return PatientSelectionLinkView;
});
