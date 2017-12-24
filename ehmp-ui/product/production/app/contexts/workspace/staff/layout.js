define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/contexts/workspace/staff/template'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    LayoutTemplate
) {
    "use strict";

    var ContextSidebarCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'staff-sidebar',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('trayContainer', this.itemGroupName) && child.shouldShow();
        },
        resortView: _.noop // Turning off the rendering of children on a sort of the collection
    });

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            SkipLinks: {
                items: [{
                    label: 'Main Content',
                    element: function() {
                        return this.$('#content-region');
                    },
                    rank: 0
                }, {
                    label: 'Patient Selection',
                    element: function() {
                        return this.ui.ContextSidebarContainer;
                    },
                    rank: 5
                }]
            }
        },
        events: {
            'patientSearchTray.shown': function(){
                this.triggerMethod('toggle:skip:link', 'Main Content', false);
            },
            'patientSearchTray.hidden': function(){
                this.triggerMethod('toggle:skip:link', 'Main Content', true);
            }
        },
        className: "container-fluid percent-height-100",
        template: LayoutTemplate,
        ui: {
            ContextSidebarContainer: '.context-sidebar--left'
        },
        regions: {
            ContentLeftRegion: 'aside',
            ContextSidebarRegion: '@ui.ContextSidebarContainer',
            content_region: '#content-region'
        },
        initialize: function(options) {
            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
        },
        onBeforeShow: function() {
            this.showChildView('ContextSidebarRegion', new ContextSidebarCollectionView({
                collection: this.registeredComponentsCollection
            }));
        },
        onBeforeDestroy: function() {
            ADK.utils.resize.containerResize();
        }
    });

    return LayoutView;
});
