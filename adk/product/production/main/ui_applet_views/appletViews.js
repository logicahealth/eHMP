define([
    'main/components/applets/baseDisplayApplet/view',
    'main/components/views/appletViews/eventsGistView/view',
    'main/components/views/appletViews/gridView/view',
    'main/components/views/appletViews/interventionsGistView/view',
    'main/components/views/appletViews/observationsGistView/view',
    'main/components/views/appletViews/pillsGistView/view',
    'main/ui_applet_views/serverPaging/view'
], function(
    BaseDisplayApplet,
    EventsGistApplet,
    GridApplet,
    InterventionsGistApplet,
    ObservationsGistApplet,
    PillsGistApplet,
    ServerPagingApplet
) {

    'use strict';

    var UI_Applet_Views = {
        BaseDisplayApplet: BaseDisplayApplet,
        EventsGistApplet: EventsGistApplet,
        GridApplet: GridApplet,
        InterventionsGistApplet: InterventionsGistApplet,
        ObservationsGistApplet: ObservationsGistApplet,
        PillsGistApplet: PillsGistApplet,
        ServerPagingApplet: ServerPagingApplet
    };

    return UI_Applet_Views;
});
