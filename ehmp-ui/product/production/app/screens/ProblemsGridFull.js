define([
    "backbone",
    "marionette",
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'problems-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'problems',
            title: 'Problems',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked:{
            filters: false
        },
        onStart: function(){
            this.setUpEvents();
        },
        setUpEvents: function(){
            //var problemsChannel = ADK.Messaging.getChannel('problems');
            //problemsChannel.comply('addProblem', AddView.handleShowView);
        },
        patientRequired: true,
        globalDatepicker: false
    };

    return screenConfig;
});
