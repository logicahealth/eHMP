define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/lab_results_grid/details/labDetailsTemplate',
    'hbs!app/applets/lab_results_grid/details/panelDetailsTemplate',
    'hbs!app/applets/lab_results_grid/details/panelDetailsTableTemplate',
    'app/applets/lab_results_grid/details/itemViewForPanelExtendedRow'
], function (Backbone, Marionette, _, labDetailsTemplate, panelDetailsTemplate, panelDetailsTableTemplate, singleLabResultView) {
    'use strict';

    var PanelTableView = Backbone.Marionette.CompositeView.extend({
        template: panelDetailsTableTemplate,
        childView: singleLabResultView,
        childViewContainer: 'tbody',
        initialize: function (options) {
            this.childViewOptions = {
                isFullscreen: options.isFullscreen
            };
        }
    });

    return Backbone.Marionette.LayoutView.extend({
        regions: function (options) {
            if (options.model.get('type') === 'panel') {
                return {
                    labsListRegion: '.lab-results-table-container'
                };
            }
        },
        initialize: function (options) {
            var isFullscreen = this.model.get('isFullscreen') || false;
            this.isPanel = this.model.get('type') === 'panel';
            if (this.isPanel) {
                this.panelTableView = new PanelTableView({
                    collection: this.model.get('labs'),
                    gridCollection: options.collection,
                    isFullscreen: isFullscreen
                });
            }
        },
        getTemplate: function () {
            if (this.isPanel) {
                return panelDetailsTemplate;
            }
            return labDetailsTemplate;
        },
        onRender: function () {
            if (this.isPanel) {
                this.labsListRegion.show(this.panelTableView);
            }
        }
    });
});