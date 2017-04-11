define([
    "underscore",
    "backbone",
    "marionette",
    "main/AppletBuilder",
    "main/components/patient/patientHeaderView",
    "main/components/navigation/navigationView",
    "main/components/nav/navView",
    "main/components/adk_nav/navView",
    "main/components/applet-tester-nav/navView",
    "main/components/blankNav/navView",
    "main/components/footer/footerView",
    "main/components/navSearch/navView",
    "main/components/applet_header/navView"
], function(_, Backbone, Marionette, AppletBuilder, PatientHeaderView, NavigationView,
    NavView, AdkNavView, TesterNavView, BlankNavView, FooterView, NavSearchView, AppletNavigationView) {
    "use strict";

    var ComponentLoader = {};

    ComponentLoader.load = function(marionetteApp, TopRegionView, CenterRegionView, currentScreenConfig, patient) {

        //Load Top Region
        var headerRegion = TopRegionView.header_region;
        switch (currentScreenConfig.appHeader) {
            case "nav":
                loadComponent(headerRegion, NavView);
                break;
            case "adkNav":
                loadComponent(headerRegion, AdkNavView);
                break;
            case "searchNav":
                loadComponent(headerRegion, NavSearchView);
                break;
            case "appletTesterNav":
                loadComponent(headerRegion, TesterNavView);
                break;
            case "blankNav":
                loadComponent(headerRegion, BlankNavView);
                break;
            case "none":
                headerRegion.empty();
                break;
            default:
                loadComponent(headerRegion, NavView);
        }
        var isNonPatientCentricView = (!_.isUndefined(currentScreenConfig.nonPatientCentricView) &&
            currentScreenConfig.nonPatientCentricView === true);

        if (currentScreenConfig.patientRequired === true || isNonPatientCentricView) {

            var patientDemographicRegion = TopRegionView.patientDemographic_region;
            if (!isNonPatientCentricView && (patientDemographicRegion.currentView === undefined || !(patientDemographicRegion.currentView instanceof PatientHeaderView))) {
                patientDemographicRegion.show(new PatientHeaderView({
                    model: patient
                }));
            }
            var navigationRegion = TopRegionView.navigation_region;
            var showGlobalDatepicker = (typeof currentScreenConfig.globalDatepicker === "undefined" ? true : currentScreenConfig.globalDatepicker);
            if (isNonPatientCentricView) {
                showGlobalDatepicker = false;
            }
            if (navigationRegion.currentView === undefined || !(navigationRegion.currentView instanceof AppletNavigationView)) {
                navigationRegion.show(new AppletNavigationView({
                    model: new Backbone.Model({
                        'currentScreen': currentScreenConfig,
                        'globalDatepicker': showGlobalDatepicker
                    })
                }));
            } else {
                navigationRegion.currentView.model.set({
                    'currentScreen': currentScreenConfig,
                    'globalDatepicker': showGlobalDatepicker
                });
            }
        }

        //Load Bottom Region
        var bottomRegion = marionetteApp.bottomRegion;
        var footerOptions = {
            'currentScreen': currentScreenConfig
        };
        switch (currentScreenConfig.appFooter) {
            case "footer":
                if (bottomRegion.currentView === undefined || !(bottomRegion.currentView instanceof FooterView)) {
                    bottomRegion.show(new FooterView(footerOptions));
                    break;
                }
                bottomRegion.currentView.model.set('currentScreen', currentScreenConfig);
                break;
            case "none":
                bottomRegion.empty();
                break;
            default:
                if (bottomRegion.currentView === undefined || !(bottomRegion.currentView instanceof FooterView)) {
                    bottomRegion.show(new FooterView(footerOptions));
                    break;
                }
                bottomRegion.currentView.model.set('currentScreen', currentScreenConfig);
        }
    };

    function loadComponent(region, View) {
        if (region.currentView === undefined || !(region.currentView instanceof View)) {
            region.show(new View());
        }
    }

    return ComponentLoader;
});
