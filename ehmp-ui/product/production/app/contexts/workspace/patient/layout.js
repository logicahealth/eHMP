define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/contexts/workspace/patient/template',
    'app/contexts/workspace/patient_selection/behavior'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    LayoutTemplate,
    PatientSelectionBehavior
) {
    'use strict';

    var LeftHeaderItemCollectionView = Backbone.Marionette.CollectionView.extend({
        className: "flex-display flex-align-center flex-justify-content-start percent-height-100",
        itemGroupName: 'patient-left',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('contextHeaderItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: _.noop // Turning off the rendering of children on a sort of the collection
    });

    var RightHeaderItemCollectionView = LeftHeaderItemCollectionView.extend({
        itemGroupName: 'patient-right',
        className: 'flex-display flex-align-center flex-justify-content-end percent-height-100'
    });

    var ContextSidebarCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'patient-information',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('trayContainer', this.itemGroupName) && child.shouldShow();
        },
        resortView: _.noop // Turning off the rendering of children on a sort of the collection
    });

    var TrayCollectionView = Backbone.Marionette.CollectionView.extend({
        trayGroupName: 'writeback',
        className: 'tray-menu hidden-overflow',
        tagName: 'ul',
        getChildView: function(item) {
            var ButtonView = Backbone.Marionette.ItemView.extend({
                tagName: 'span',
                template: Handlebars.compile('<span class="tray-close-icon"><i class="fa fa-chevron-circle-left fa-rotate-90 font-size-18 color-pure-white"></i></span> {{buttonLabel}}')
            });
            var trayViewOptions = _.defaults(item.get('view').prototype.options, {
                preventFocusoutClose: true
            });
            trayViewOptions = _.defaults({
                viewport: '.main-tray-viewport',
                buttonClass: 'btn-primary',
                buttonView: ButtonView
            }, trayViewOptions);
            return item.get('view').extend({
                options: trayViewOptions,
                tagName: 'li',
                initialize: function() {
                    this.listenTo(this, 'tray.hidden tray.shown', function() {
                        ADK.utils.resize.trayToggleResize();
                    });
                }
            });
        },
        filter: function(child) {
            return child.isOfGroup('tray', this.trayGroupName) && child.shouldShow();
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
        onChildviewAttach: function(childView) {
            this.updateButtonHeight(childView);
        },
        updateButtonHeight: function(childView, clearButtonHeight) {
            if (_.isEqual(clearButtonHeight, true)) {
                childView.$('> button').outerWidth('auto');
            }
            var buttonHeight = childView.$('> button').outerWidth(true) + 26;
            childView.$('> button').outerWidth(buttonHeight);
            childView.$el.height(buttonHeight);
        },
        onAdjustButtonHeight: function() {
            this.children.each(_.partial(this.updateButtonHeight, _, true));
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
        onRender: function(){
            ADK.utils.resize.trayToggleResize();
        },
        patientModelEvents: {
            'change:pid': function() {
                this.listenToOnce(ADK.Messaging, 'loaded.ehmp.workspace', this.render);
            }
        },
        initialize: function() {
            Marionette.bindEntityEvents(this, ADK.PatientRecordService.getCurrentPatient(), this.patientModelEvents);
        },
        resortView: _.noop // Turning off the rendering of children on a sort of the collection
    });

    var ContextLayoutModel = Backbone.Model.extend({
        defaults: {
            mode: null,
            workspaceLoadedState: 0
        }
    });

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            SkipLinks: {
                items: [{
                    label: 'Main Content - Patient Record',
                    element: function() {
                        return this.$('#content-region');
                    },
                    rank: 0
                }, {
                    label: 'Patient Information',
                    element: function() {
                        return this.ui.ContextSidebarContainer;
                    },
                    rank: 5
                }, {
                    label: 'Patient Writeback Trays',
                    element: function() {
                        return this.ui.PatientWritebackTrayContainer;
                    },
                    rank: 10
                }]
            },
            PatientSelectionBehavior: {
                behaviorClass: PatientSelectionBehavior
            }
        },
        className: 'container-fluid percent-height-100',
        template: LayoutTemplate,
        ui: {
            PatientRecordContainer: '.patient-record-container',
            LeftHeaderBarContainer: '.patient-record-container .context-header-bar.left',
            RightHeaderBarContainer: '.patient-record-container .context-header-bar.right',
            ContextSidebarContainer: '.patient-record-container .context-sidebar--left',
            PatientWritebackTrayContainer: '.patient-record-container .tray-container'
        },
        regions: {
            ContentLeftRegion: 'aside',
            LeftHeaderRegion: '@ui.LeftHeaderBarContainer',
            RightHeaderRegion: '@ui.RightHeaderBarContainer',
            ContextSidebarRegion: '@ui.ContextSidebarContainer',
            PatientWritebackTrayRegion: '@ui.PatientWritebackTrayContainer',
            content_region: '#content-region'
        },
        initialize: function(options) {
            this.model = new ContextLayoutModel();
            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
            this.leftHeaderItemsCollectionView = new LeftHeaderItemCollectionView({
                collection: this.registeredComponentsCollection
            });
            this.rightHeaderItemsCollectionView = new RightHeaderItemCollectionView({
                collection: this.registeredComponentsCollection
            });
            this.contextSidebarCollectionView = new ContextSidebarCollectionView({
                collection: this.registeredComponentsCollection
            });
        },
        modelEvents: {
            'change:mode': 'updateLayout',
            'change:workspaceLoadedState': 'onChangeOfWorkspaceLoadedState'
        },
        updateLayout: function(model, value) {
            this.triggerMethod('toggle:patient:selection', _.isEqual(value, 'patient-selection'));
            this.PatientWritebackTrayRegion.currentView.triggerMethod('adjust:button:height');
            this.triggerMethod('toggle:skip:link', 'Main Content - Patient Record', !_.isEqual(value, 'patient-selection'));
            this.triggerMethod('toggle:skip:link', 'Patient Information', !_.isEqual(value, 'patient-selection'));
            this.triggerMethod('toggle:skip:link', 'Patient Writeback Trays', !_.isEqual(value, 'patient-selection'));
        },
        onBeforeShow: function() {
            this.showChildView('LeftHeaderRegion', this.leftHeaderItemsCollectionView);
            this.showChildView('RightHeaderRegion', this.rightHeaderItemsCollectionView);
            this.showChildView('ContextSidebarRegion', this.contextSidebarCollectionView);
            this.showChildView('PatientWritebackTrayRegion', new TrayCollectionView({
                collection: this.registeredComponentsCollection
            }));

            this.previousHeight = 0;
            this.createMutationObserver();

            this.listenToOnce(ADK.Messaging, 'loaded.ehmp.workspace', function() {
                this.incrementWorkspaceLoadedState();
            });
            this.listenToOnce(ADK.Messaging, 'loaded.ehmp.applets', function() {
                this.incrementWorkspaceLoadedState();
            });
        },
        onChangeOfWorkspaceLoadedState: function(model, value) {
            if (value >= 2) {
                ADK.utils.resize.destroyMob('captureLeftPatientHeaderBarChange');
                ADK.utils.resize.destroyMob('captureRightPatientHeaderBarChange');
            }
        },
        createMutationObserver: function() {
            var options = {
                target: this.$('.context-header-bar.right')[0],
                args: {
                    attributes: false,
                    childList: true,
                    characterData: false,
                    subtree: true
                },
                mobCb: _.bind(function(mutes) {
                    var height = this.$('.context-header-bar-wrapper').outerHeight(true);
                    if (height > this.previousHeight) {
                        this.previousHeight = height;
                        ADK.utils.resize.windowResize();
                    }
                }, this)
            };
            ADK.utils.resize.deployMob(_.extend({
                name: 'captureLeftPatientHeaderBarChange'
            }, options));
            ADK.utils.resize.deployMob(_.extend({
                name: 'captureRightPatientHeaderBarChange'
            }, options));

        },
        incrementWorkspaceLoadedState: function() {
            this.model.set('workspaceLoadedState', this.model.get('workspaceLoadedState') + 1);
        },
        onBeforeDestroy: function() {
            ADK.utils.resize.destroyMob('captureLeftPatientHeaderBarChange');
            ADK.utils.resize.destroyMob('captureRightPatientHeaderBarChange');
            ADK.utils.resize.containerResize();
        },
        onContextLayoutUpdate: function(options) {
            this.model.set(_.extend({ mode: null }, options));
        }
    });

    return LayoutView;
});
