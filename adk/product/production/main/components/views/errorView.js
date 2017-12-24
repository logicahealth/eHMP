define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/components/views/errorTemplate",
    "api/ErrorMessaging",
    'api/Messaging'
], function(Backbone, Marionette, _, ErrorTemplate, ErrorMessaging, Messaging) {
    'use strict';


    var ErrorView = Backbone.Marionette.ItemView.extend({
        behaviors: {
            ErrorComponents: {}
        },
        className: 'container-fluid',
        template: ErrorTemplate,
        headingLevel: 6,
        initialize: function(options) {
            console.log("----------- ERROR -----------");
            console.log("Error Object: ");
            console.log(JSON.stringify(this.model.attributes));
            console.log("Response Text: " + this.model.get('responseText'));
            console.log("Response Status Text: " + this.model.get('statusText'));
            console.log("Response Status: " + this.model.get('status'));
            console.log("----------- END ERROR -----------");
            if (!_.isString(this.model.get('message'))) {
                this.model.set('message', ErrorMessaging.getMessage(this.model.get('status')));
            }
            var headingLevel = _.parseInt(this.getOption('headingLevel'));
            headingLevel = _.inRange(headingLevel, 7) ? headingLevel : this.headingLevel;
            this.model.set('headingLevel', headingLevel);
        }
    });

    var Error = {
        create: function(options) {
            var errorView = new ErrorView(options);
            return errorView;
        },
        view: ErrorView
    };
    return Error;
});
