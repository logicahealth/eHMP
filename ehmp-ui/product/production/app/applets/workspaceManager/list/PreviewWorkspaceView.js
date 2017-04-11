define([
    'underscore',
    'backbone',
    'marionette',
    'gridster',
    'hbs!app/applets/workspaceManager/list/previewWorkspaceTemplate',
], function(_, Backbone, Marionette, gridster, previewWorkspaceTemplate) {

    'use strict';

    var PreviewWorkspaceView = Backbone.Marionette.ItemView.extend({
        template: previewWorkspaceTemplate,
        initialize: function() {
            this.model = new Backbone.Model();
            this.model.set({
                'screenId': this.screenId,
                'screenTitle': this.screenTitle
            });
            var template = ADK.UserDefinedScreens.getGridsterTemplateForPreview(ADK.ADKApp[this.screenId]);
            if (this.screenId === 'documents-list')
                template = this.getTemplateForDocumentsList();
            this.model.set('gridsterTemplate', template);
        },
        getTemplateForDocumentsList: function() {
            //this is a special case for documents-list only
            return '<div id="gridsterPreview" class="gridster"><ul><li data-row="1" data-col="1" data-sizex="12" data-sizey="12" ><h4 class="applet-title">Documents</h4><p>expanded</p></li></ul></div>';

        },
        setContinerHeight: function() {
            this.$el.find('.workspaceManagerForms').height($(window).height() + 'px');
        },
        onRender: function() {
            var self = this;
            this.setContinerHeight();
            $(window).on("resize.previewworkspaceview",(function() {
                self.setContinerHeight();
                self.setGridsterBaseDimension();
            }));
        },
        onShow: function() {
            // first element to focus for 508
            // this.$el.find('.closePreview').focus();
            this.initGridster();
        },
        getHighestGridsterCol: function() {
            return Math.max(12, this.gridster.get_highest_occupied_cell().col);
        },
        getGridsterDimension: function() {
            var $container = this.$el.find('.gridsterContainer');
            var containerWidth = $container.width();
            var containerHeight = $container.height();
            var hightestCol = this.getHighestGridsterCol();
            var x = Math.floor(containerWidth / hightestCol) - 7.5;
            var y = (containerHeight) / 12 - 8;
            return [x, y];
        },
        setGridsterBaseDimension: function() {
            this.gridster.resize_widget_dimensions({
                widget_base_dimensions: this.getGridsterDimension()
            });
        },
        initGridster: function() {
            this.gridster = this.$el.find(".gridsterContainer ul").gridster({
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
            }).data('gridster');

            if (this.gridster) {
                var initialHeight = 260;
                var initialWidth = 568;
                var hightestCol = this.getHighestGridsterCol();
                var x = Math.floor(initialWidth / hightestCol) - 7.5;
                var y = (initialHeight) / 12 - 8;

                this.gridster.resize_widget_dimensions({
                    widget_base_dimensions: [x, y]
                });
            }
        },
        onBeforeDestroy: function() {
            $(window).off("resize.previewworkspaceview");
            if(this.gridster)
                this.gridster.destroy();
        }
    });

    return PreviewWorkspaceView;

});
