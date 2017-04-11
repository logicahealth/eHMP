define([
    "backbone",
    "marionette",
    "app/applets/patient_search/views/mySite/all/mySiteAllSearchInputView",
    "app/applets/patient_search/views/global/globalSearchInputView",
    "app/applets/patient_search/views/recentPatients/recentPatientsBlankInputView"
], function(Backbone, Marionette, MySiteAllSearchInputView, GlobalSearchInputView, RecentPatientsBlankInputView) {
    "use strict";

    // constants
    var MY_SITE = 'mySite';
    var NATIONWIDE = 'global';
    var RECENT_PATIENTS = 'recentPatients';
    var NO_TAB = 'none';
    var BLANK = '';

    var GlobalSearchInputModel = Backbone.Model.extend({
        defaults: {
            'name.last': BLANK,
            'name.first': BLANK,
            'date.birth': BLANK,
            'ssn': BLANK,
            'isGlobalSearchErrorMessageDisplayed': false
        }
    });

    var MySiteAllSearchInputModel = Backbone.Model.extend({
        defaults: {
            'searchString': BLANK
        }
    });

    var InputView = Backbone.Marionette.LayoutView.extend({
        template: _.template("<div id='input-view-region'></div>"),
        regions: {
            inputViewRegion: "#input-view-region"
        },
        initialize: function(options) {
            this.mySiteModel = new MySiteAllSearchInputModel();
            this.nationwideModel = new GlobalSearchInputModel();

            this.currentInputView = new MySiteAllSearchInputView();
            this.currentInputView.model = this.mySiteModel;
        },
        onRender: function() {
            this.inputViewRegion.show(this.currentInputView);
        },
        changeView: function(activeSelection) {
            switch (activeSelection) {
                case MY_SITE:
                    this.createInputView(new MySiteAllSearchInputView(), this.mySiteModel);
                    this.render();
                    break;
                case RECENT_PATIENTS:
                    this.createInputView(new RecentPatientsBlankInputView(), this.mySiteModel);
                    this.render();
                    break;
                case NATIONWIDE:
                    this.createInputView(new GlobalSearchInputView(), this.nationwideModel);
                    this.render();
                    break; //not necessary
            }
            /*
            if (activeSelection==MY_SITE||activeSelection==NATIONWIDE){
                if (activeSelection == MY_SITE) {
                    this.createInputView(new MySiteAllSearchInputView(), this.mySiteModel);
                } else if (activeSelection == NATIONWIDE) {
                    this.createInputView(new GlobalSearchInputView(), this.nationwideModel);
                }
                this.render();
            }*/
        },
        resetModels: function() {
            if (this.mySiteModel) {
                this.mySiteModel.clear({
                    silent: true
                });
            }
            if (this.nationwideModel) {
                this.nationwideModel.clear({
                    silent: true
                });
            }
        },
        createInputView: function(view, model) {
            this.currentInputView = view;
            this.currentInputView.model = model;
        }
    });

    return InputView;
});