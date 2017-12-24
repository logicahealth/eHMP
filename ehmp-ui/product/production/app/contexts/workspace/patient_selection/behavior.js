define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars
) {
    'use strict';

    var PatientSelectionSidebarCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'patient-selection-sidebar',
        getChildView: function(item) {
            return item.get('view');
        },
        childViewOptions: function() {
            return {
                viewport: '.patient-selection-tray-viewport',
                eventChannelName: 'patient-selection-' + this.cid,
                _eventPrefix: 'patientSelectionTray'
            };
        },
        filter: function(child) {
            return child.isOfGroup('trayContainer', this.itemGroupName) && child.shouldShow();
        },
        resortView: _.noop, // Turning off the rendering of children on a sort of the collection,
        onBeforeShow: function() {
            this.channel = ADK.Messaging.getChannel('patient-selection-' + this.cid);
            this._trayKeys = _.map(this.channel.request('tray-keys'), function(key) {
                return 'patient-selection-' + this.cid + '-' + key;
            }, this);
        },
        onShow: function() {
            this.showInitalTray();
            this.startListening();
        },
        startListening: function() {
            this.listenForTrayClose();
            this.listenForTrayOpen();
        },
        showInitalTray: function() {
            this.channel.trigger('trigger-method-on-tray', {
                key: 'recentPatients',
                event: 'patientSelectionTray.show'
            });
        },
        listenForTrayClose: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSelectionTray.hide patientSelectionTray.closed', function() {
                        this.turnOffListeners();
                        ADK.Navigation.navigate(ADK.WorkspaceContextRepository.currentWorkspaceId, {
                            extraScreenDisplay: {
                                dontReloadApplets: true
                            }
                        });
                    });
                }
            }, this);
        },
        listenForTrayShown: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSelectionTray.shown', function() {
                        this.turnOffListeners();
                        this.listenForTrayClose();
                        this.listenForTrayOpen();
                    });
                }
            }, this);
        },
        listenForTrayOpen: function() {
            _.each(this._trayKeys, function(key) {
                if (_.isString(key)) {
                    this.listenTo(ADK.Messaging.getChannel(key), 'patientSelectionTray.show', function() {
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

    var PatientSelectionLayoutView = Backbone.Marionette.LayoutView.extend({
        className: 'row flex-display percent-height-100 patient-selection-container',
        template: Handlebars.compile(
            '<aside aria-label="Patient Selection Sidebar" class="context-sidebar--left flex-width-none background-color-primary"></aside>' +
            '<div class="flex-width-1 hidden-overflow percent-height-100 patient-selection-tray-viewport"></div>'),
        ui: {
            PatientSelectionSidebarContainer: '.context-sidebar--left'
        },
        regions: {
            PatientSelectionSidebarRegion: '@ui.PatientSelectionSidebarContainer',
        },
        initialize: function() {
            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
        },
        onTogglePatientSelection: function(shouldShow) {
            if (shouldShow) {
                if (!this.PatientSelectionSidebarRegion.hasView()) {
                    this.showChildView('PatientSelectionSidebarRegion', new PatientSelectionSidebarCollectionView({
                        collection: this.registeredComponentsCollection
                    }));
                } else {
                    this.PatientSelectionSidebarRegion.currentView.showInitalTray();
                    this.PatientSelectionSidebarRegion.currentView.startListening();
                }
            } else if (this.PatientSelectionSidebarRegion.hasView()){
                this.PatientSelectionSidebarRegion.currentView.turnOffListeners();
                ADK.utils.resize.windowResize();
            }
        }

    });

    var PatientSelectionBehavior = Backbone.Marionette.Behavior.extend({
        initialize: function() {
            this.patientSelectionView = new PatientSelectionLayoutView();
            this.regionManager = new Backbone.Marionette.RegionManager();
        },
        onTogglePatientSelection: function(shouldShow) {
            if (shouldShow) {
                this.$el.addClass('hidden');
                this.$el.after('<div class="container-fluid percent-height-100 patient-selection-container-wrapper"></div>');
                var region = this.regionManager.addRegion('patientSelection', {
                    el: '.patient-selection-container-wrapper'
                });
                region.show(this.patientSelectionView);
            } else if (!!this.regionManager.get('patientSelection')) {
                this.regionManager.get('patientSelection').empty({ preventDestroy: true });
                this.regionManager.removeRegion('patientSelection');
                this.removeWrapper();
                this.$el.removeClass('hidden');
            }
            this.patientSelectionView.triggerMethod('toggle:patient:selection', shouldShow);
        }, onBeforeDestroy: function(){
            this.patientSelectionView.destroy();
            this.regionManager.destroy();
            this.removeWrapper();
        },
        removeWrapper: function(){
            this.$el.siblings('.patient-selection-container-wrapper').remove();
        }
    });

    return PatientSelectionBehavior;
});
