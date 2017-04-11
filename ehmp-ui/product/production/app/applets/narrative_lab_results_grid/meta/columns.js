define([
    "backbone",
    "marionette",
    'underscore',
    'handlebars',
], function(Backbone, Marionette, _, Handlebars) {
    "use strict";

    return {
        //Data Grid Columns
        dateCol: function(){
            return {
                name: "observed",
                label: "Date",
                template: Handlebars.compile('{{formatDate observed "MM/DD/YYYY - HH:mm"}}'),
                cell: "handlebars",
                hoverTip: 'narrativelab_date'
            };
        },
        facilityCol: function(){
            return {
                name: "facilityMoniker",
                label: "Facility",
                template: Handlebars.compile('{{facilityMoniker}}'),
                cell: "handlebars",
                hoverTip: 'narrativelab_facility'
            };
        },
        descriptionCol: function(){
            return {
                name: "description",
                label: "Description",
                template: Handlebars.compile('{{description}}'),
                cell: "handlebars",
                hoverTip: 'narrativelab_description'
            };
        },
        authorCol: function(){
            return {
                name: "author",
                label: "Author/Verifier",
                template: Handlebars.compile('None'),
                cell: "handlebars",
                hoverTip: 'narrativelab_author'
            };
        },
        typeCol: function(){
            return {
                name: "typeName",
                label: "Type",
                template: Handlebars.compile('{{typeName}}'),
                cell: "handlebars",
                hoverTip: 'narrativelab_type'
            };
        }
    };
});