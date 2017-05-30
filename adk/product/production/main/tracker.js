define([
    'api/Messaging',
    'api/UserService',
    'api/ResourceService'
], function(Messaging, UserService, ResourceService) {
    "use strict";

    var Tracker = {
        listenForChangeOnUserTracking: function() {
            UserService.getUserSession().once('change:status', function(model, value) {
                if (_.isEqual(value, "loggedout")) {
                    Messaging.once('user:sessionEnd', _.bind(Tracker.listenForChangeOnUserTracking, Tracker));
                } else {
                    Tracker.startTracking();
                }
            });
        },
        saveTrackerInformation: function(screenName) {
            var AnalyticModel = Backbone.Model.extend({
                url: ResourceService.buildUrl("tracker")
            });
            var model = new AnalyticModel(Tracker.gatherInformation());
            if (_.isEqual(UserService.getUserSession().get('status'), "loggedin") && !_.isUndefined(UserService.getUserSession().get('status'))) {
                model.save();
            } else {
                Backbone.history.urls = [];
                Backbone.history.url_times = [];
            }
        },
        gatherInformation: function(screenName) {
            var obj = {};
            obj.screenName = screenName;
            _.extend(obj, _.pick(location, ['hash', 'hostname']));
            obj.url = document.URL;
            _.extend(obj, _.pick(navigator, ['appCodeName', 'appName', 'appVersion', 'platform']));
            _.extend(obj, UserService.getUserSession().pick(['facility', 'duz', 'site', 'title']));
            //_.extend(obj, ResourceService.patientRecordService.getCurrentPatient().pick(['pid', 'icn']));
            if (!_.isArray(Backbone.history.urls)) {
                Backbone.history.urls = [];
            }
            if (!_.isArray(Backbone.history.url_times)) {
                Backbone.history.url_times = [];
            }

            Backbone.history.urls.push(Backbone.history.fragment);
            Backbone.history.url_times.push(new Date().getTime());
            obj.history = _.takeRight(Backbone.history.urls, 3);
            obj.historyTimes = _.takeRight(Backbone.history.url_times, 3);
            obj.ehmp_app_version = Messaging.request("appManifest").get("overall_version");
            return obj;
        },
        startTracking: function() {
            Messaging.getChannel('tracking').on("screen:change", this.saveTrackerInformation);
            Messaging.once('user:sessionEnd', _.bind(this.stopTracking, this)); //user:beginSessionEnd
        },
        stopTracking: function() {
            Messaging.getChannel('tracking').off("screen:change", this.saveTrackerInformation);
            this.listenForChangeOnUserTracking();
        },
        start: function() {
            if (_.isEqual(UserService.getUserSession().get('uatracker'), "false") || _.isUndefined(UserService.getUserSession().get('uatracker'))) { // || _.isEqual(UserService.getUserSession().get('status'), "loggedout")) {
                this.listenForChangeOnUserTracking();
            } else {
                this.startTracking();
            }
        }
    };
    return Tracker;
});
