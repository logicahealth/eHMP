define([
    'underscore',
    'backbone',
    'marionette',
    'api/WorkspaceContextRepository',
    'api/Messaging',
    'main/components/applicationHeader/view',
    'main/components/applicationFooter/footerView'
], function(
    _,
    Backbone,
    Marionette,
    WorkspaceContextRepository,
    Messaging,
    ApplicationHeader,
    ApplicationFooter
) {
    "use strict";

    var ComponentLoader = {
        headerAndFooter: function(contextId) {
            var currentContextModel = WorkspaceContextRepository.getContext(contextId);
            var loadBoolean = currentContextModel.get('userRequired');
            this.header(loadBoolean);
            this.footer(loadBoolean);

        },
        header: function(loadBoolean) {
            var topRegion = Messaging.request('get:adkApp:region', 'topRegion');
            if (loadBoolean) {
                if (topRegion.hasView() && !_.isUndefined(topRegion.currentView.header_region) && (!topRegion.currentView.header_region.hasView() || !(topRegion.currentView.header_region.currentView instanceof ApplicationHeader))) {
                    topRegion.currentView.header_region.show(new ApplicationHeader());
                }
            } else {
                topRegion.empty();
            }
        },
        footer: function(loadBoolean) {
            var bottomRegion = Messaging.request('get:adkApp:region', 'bottomRegion');
            if (loadBoolean) {
                if (!bottomRegion.hasView() || !bottomRegion.currentView instanceof ApplicationFooter) {
                    bottomRegion.show(new ApplicationFooter());
                }
            } else {
                bottomRegion.empty();
            }
        }
    };

    ComponentLoader.load = function(marionetteApp, TopRegionView, currentScreenConfig, patient, contextId) {
        this.headerAndFooter(contextId);
    };

    function loadComponent(region, View) {
        if (region.currentView === undefined || !(region.currentView instanceof View)) {
            region.show(new View());
        }
    }

    return ComponentLoader;
});