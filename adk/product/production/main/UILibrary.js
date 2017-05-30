define([
    'underscore',
    'main/ui_components/components',
    'main/ui_views/views',
    'main/ui_applet_views/appletViews'
], function(_, Components, Views, AppletViews) {
    'use strict';

    var UI_LIBRARY = _.extend({}, Components, Views, AppletViews);

    return UI_LIBRARY;
});
