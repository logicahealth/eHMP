define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/short_cuts/views/dropdownView'
], function(Backbone, Marionette, _, DropdownView) {
    "use strict";

    var applet = {
        id: 'short_cuts',
        viewTypes: [{
            type: 'summary',
            view: DropdownView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };
    return applet;
});