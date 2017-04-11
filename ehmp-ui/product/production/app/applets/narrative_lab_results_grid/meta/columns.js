define([
    "backbone",
    "marionette",
    'underscore',
    "hbs!app/applets/narrative_lab_results_grid/list/dateTemplate",
    "hbs!app/applets/narrative_lab_results_grid/list/siteTemplate",
    "hbs!app/applets/narrative_lab_results_grid/list/descriptionTemplate",
    "hbs!app/applets/narrative_lab_results_grid/list/authorTemplate",
    "hbs!app/applets/narrative_lab_results_grid/list/typeTemplate"
], function(Backbone, Marionette, _, dateTemplate, siteTemplate, descriptionTemplate, authorTemplate, typeTemplate) {
    "use strict";

    return {
        //Data Grid Columns
        dateCol: function(){
            return {
                name: "observed",
                label: "Date",
                template: dateTemplate,
                cell: "handlebars",
                hoverTip: 'labresults_date'
            };
        },
        facilityCol: function(){
            return {
                name: "facilityMoniker",
                label: "Facility",
                template: siteTemplate,
                cell: "handlebars",
                hoverTip: 'labresults_facility'
            };
        },
        descriptionCol: function(){
            return {
                name: "description",
                label: "Description",
                template: descriptionTemplate,
                cell: "handlebars",
                hoverTip: 'labresults_description'
            };
        },
        authorCol: function(){
            return {
                name: "author",
                label: "Author or Verifier",
                template: authorTemplate,
                cell: "handlebars",
                hoverTip: 'labresults_author'
            };
        },
        typeCol: function(){
            return {
                name: "type",
                label: "Type",
                template: typeTemplate,
                cell: "handlebars",
                hoverTip: 'labresults_type'
            };
        }
    };
});