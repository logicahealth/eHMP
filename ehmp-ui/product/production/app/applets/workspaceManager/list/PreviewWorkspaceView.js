define([
    'underscore',
    'backbone',
    'marionette',
    'gridster',
    'hbs!app/applets/workspaceManager/list/previewWorkspaceTemplate'
], function(_, Backbone, Marionette, gridster, previewWorkspaceTemplate) {
    'use strict';
    
    var INITIAL_HEIGHT = 260; //corresponds to height of gridster ul in modal body
    var X = 25; // using X as the best desired max width for applets before horizontal scroll rules apply
    var Y = (INITIAL_HEIGHT) / 12 - 8;
    var INITIAL_WIDGET_BASE_DEMENSIONS = [X,Y];
    
    var PreviewWorkspaceView = Backbone.Marionette.LayoutView.extend({

        template: previewWorkspaceTemplate,

        regions: {
            gridster: '.gridsterContainer'
        },

        onBeforeShow: function() {
            this.gridsterView = new ADK.Views.GridsterView({
                screenId: this.screenId,
                gridsterOptions: {
                    namespace: '#gridsterPreview',
                    widget_selector: "li",
                    widget_base_dimensions: [1, 1],
                    widget_margins: [4, 4],
                    helper: 'clone',
                    avoid_overlapped_widgets: true,
                    autogrow_cols: true,
                    min_cols: 100,
                    resize: {
                        enabled: false
                    },
                    draggable: {
                        ignore_dragging: function() {
                            return true;
                        }
                    }
                }
            });

            return this.getRegion('gridster').show(this.gridsterView);
        },

        onShow: function() {
            this.gridsterView.gridsterModel.set('widget_base_dimensions', INITIAL_WIDGET_BASE_DEMENSIONS);
        }
    });

    return PreviewWorkspaceView;
});