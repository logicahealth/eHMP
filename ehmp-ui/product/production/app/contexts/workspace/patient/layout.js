define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/contexts/workspace/patient/template'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    LayoutTemplate
) {
    "use strict";

    var LeftNavigationItemCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'patient-left',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('contextNavigationItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var RightNavigationItemCollectionView = LeftNavigationItemCollectionView.extend({
        itemGroupName: 'patient-right',
        className: 'flex-display flex-align-center flex-justify-content-end'
    });

    var ContextSidebarCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'patient-information',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('trayContainer', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var TrayCollectionView = Backbone.Marionette.CollectionView.extend({
        trayGroupName: 'writeback',
        className: 'list-inline tray-menu hidden-overflow',
        tagName: 'ul',
        getChildView: function(item) {
            var ButtonView = Backbone.Marionette.ItemView.extend({
                tagName: 'span',
                template: Handlebars.compile('<span class="tray-close-icon"><i class="fa fa-chevron-circle-left fa-rotate-90 font-size-18 color-pure-white"></i></span> {{buttonLabel}}')
            });
            var trayViewOptions = _.defaults(item.get('view').prototype.options, {
                preventFocusoutClose: true,
                eventChannelName: item.get('key')
            });
            trayViewOptions = _.defaults({
                viewport: '.main-tray-viewport',
                buttonClass: 'btn-primary',
                buttonView: ButtonView
            }, trayViewOptions);
            return item.get('view').extend({
                options: trayViewOptions,
                tagName: 'li',
                initialize: function(){
                    this.listenTo(this,'tray.hidden tray.shown', function() {
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
            var buttonHeight = childView.$('> button').outerWidth(true) + 26;
            childView.$('> button').outerWidth(buttonHeight);
            childView.$el.height(buttonHeight);
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
        patientModelEvents: {
            'change:pid': 'render'
        },
        initialize: function(){
            Marionette.bindEntityEvents(this, ADK.PatientRecordService.getCurrentPatient(), this.patientModelEvents);
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        className: "container-fluid percent-height-100",
        template: LayoutTemplate,
        ui: {
            LeftNavigationBarContainer: '.context-navigation-bar.left',
            RightNavigationBarContainer: '.context-navigation-bar.right',
            ContextSidebarContainer: '.context-sidebar--left',
            PatientWritebackTrayContainer: '.tray-container'
        },
        regions: {
            ContentLeftRegion: 'aside',
            LeftNavigationRegion: '@ui.LeftNavigationBarContainer',
            RightNavigationRegion: '@ui.RightNavigationBarContainer',
            ContextSidebarRegion: '@ui.ContextSidebarContainer',
            PatientWritebackTrayRegion: '@ui.PatientWritebackTrayContainer',
            content_region: '#content-region'
        },
        initialize: function(options) {
            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
            this.leftNavigationItemsCollectionView = new LeftNavigationItemCollectionView({
                collection: this.registeredComponentsCollection
            });
            this.rightNavigationItemsCollectionView = new RightNavigationItemCollectionView({
                collection: this.registeredComponentsCollection
            });
            this.contextSidebarCollectionView = new ContextSidebarCollectionView({
                collection: this.registeredComponentsCollection
            });
        },

        onBeforeShow: function() {
            this.showChildView('LeftNavigationRegion', this.leftNavigationItemsCollectionView);
            this.showChildView('RightNavigationRegion', this.rightNavigationItemsCollectionView);
            this.showChildView('ContextSidebarRegion', this.contextSidebarCollectionView);
            this.showChildView('PatientWritebackTrayRegion', new TrayCollectionView({
                collection: this.registeredComponentsCollection
            }));
            this.previousHeight = 0;
            this.model = new Backbone.Model({
                workspaceLoadedState: 0
            });
            this.listenTo(this.model, 'change:workspaceLoadedState', function(model, value) {
                if (value >= 2) {
                    ADK.utils.resize.destroyMob('captureLeftPatientNavigationBarChange');
                    ADK.utils.resize.destroyMob('captureRightPatientNavigationBarChange');
                }
            });
            this.createMutationObserver();

            this.listenToOnce(ADK.Messaging, 'loaded.ehmp.workspace', function() {
                this.incrementWorkspaceLoadedState();
            });
            this.listenToOnce(ADK.Messaging, 'loaded.ehmp.applets', function() {
                this.incrementWorkspaceLoadedState();
            });
        },
        createMutationObserver: function() {
            var options = {
                target: this.$('.context-navigation-bar.right')[0],
                args: {
                    attributes: false,
                    childList: true,
                    characterData: false,
                    subtree: true
                },
                mobCb: _.bind(function(mutes) {
                    var height = this.$('.context-navigaton-bar-wrapper').outerHeight(true);
                    if (height > this.previousHeight) {
                        this.previousHeight = height;
                        ADK.utils.resize.windowResize();
                    }
                }, this)
            };
            ADK.utils.resize.deployMob(_.extend({
                name: 'captureLeftPatientNavigationBarChange'
            }, options));
            ADK.utils.resize.deployMob(_.extend({
                name: 'captureRightPatientNavigationBarChange'
            }, options));

        },
        incrementWorkspaceLoadedState: function() {
            this.model.set('workspaceLoadedState', this.model.get('workspaceLoadedState') + 1);
        },
        onBeforeDestroy: function() {
            ADK.utils.resize.destroyMob('captureLeftPatientNavigationBarChange');
            ADK.utils.resize.destroyMob('captureRightPatientNavigationBarChange');
            ADK.utils.resize.containerResize();
        }
    });

    return LayoutView;
});