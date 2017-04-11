define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/narrative_lab_results_grid/details/labDetailsTemplate",
    "hbs!app/applets/narrative_lab_results_grid/details/panelDetailsTemplate",
    "hbs!app/applets/narrative_lab_results_grid/details/panelDetailsTableTemplate",
    "app/applets/narrative_lab_results_grid/details/itemViewForPanelExtendedRow"
], function(Backbone, Marionette, _, labDetailsTemplate, panelDetailsTemplate, panelDetailsTableTemplate, singleLabResultView) {
    'use strict';

    var PanelTableView = Backbone.Marionette.CompositeView.extend({
        template: panelDetailsTableTemplate,
        childView: singleLabResultView,
        childViewContainer: "tbody",
        initialize: function(options) {
            this.childViewOptions = {
                isFullscreen: options.isFullscreen
            };
            // This is where I will need to send out the collection to the modal view
            // console.log('Collection: ', this.collection);
        }
    });

    return Backbone.Marionette.LayoutView.extend({

        initialize: function(options) {
            this.currentModel = options.model;
            this.currentModel.collection = this.currentModel.get('labs');
            var isFullscreen = options.model.get('isFullscreen') || false;

            if (this.currentModel.attributes.type === 'panel') {
                this.panelTableView = new PanelTableView({
                    collection: this.currentModel.attributes.labs,
                    gridCollection: options.collection,
                    isFullscreen: isFullscreen
                });
            }
        },
        getTemplate: function() {
            if (this.currentModel.attributes.type === 'panel') {
                return panelDetailsTemplate;
            } else {
                return labDetailsTemplate;
            }
        },
        regions: function(options) {
            if (options.model.attributes.type === 'panel') {
                return {
                    labsListRegion: "#narrative-lab-results-table-container"
                };
            } else {

            }
        },
        onRender: function() {
            if (this.currentModel.attributes.type === 'panel') {
                this.labsListRegion.show(this.panelTableView);
            }
        }
    });
});