define('main/backgrid/filterTagView', [
    'backbone',
    'marionette',
    'underscore',
    'api/ResourceService',
    'main/api/WorkspaceFilters'
], function(Backbone, Marionette, _, ResourceService, WorkspaceFilters) {
    'use strict';

    var UserDefinedFilter = Backbone.Model.extend({
        defaults: {
            name: '',
            workspaceId: '',
            instanceId: '',
            status: ''
        }
    });
    var filterTagView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        className: 'udaf-tag',
        events: {
            'click button.clear-udaf-tag': 'clear'
        },

        clear: function(e) {
            e.preventDefault();
            // Execute remove all filters if this is the only filter.
            if (this.model.collection.length === 1) {
                this.$el.parent().parent().find('.remove-all').click();
                return;
            }
            //when deleting a filter, the onUserDefinedFilterRemove event will be triggered in the Filter view.
            var workspaceId, instanceId, filter;
            filter = this.model.get('name');
            workspaceId = this.model.get('workspaceId');
            instanceId = this.model.get('instanceId');
            this.model.collection.remove(this.model);
            this.remove();

            var fullScreen = this.options.fullScreen;
            if (fullScreen) {
                WorkspaceFilters.deleteFilterFromSession(workspaceId, instanceId, filter);
            } else {
                WorkspaceFilters.deleteFilterFromJDS(workspaceId, instanceId, filter);
            }
        },

        initialize: function(options) {
            var filter = this.model.get('name');
            var workspaceId, instanceId;
            if (options.onUserWorkspace) {
                this.template = _.template('<button type="button" class="clear-udaf-tag btn btn-info btn-sm btn-label bottom-margin-sm right-margin-xs" title="Press enter to remove ' + filter + '.">' + filter +
                    '<i class="fa fa-times-circle left-margin-xs color-white"></i></button>', null, {
                        variable: null
                    });
            } else {
                this.template = _.template('<span class="label label-info font-size-12 inline-block-display bottom-margin-xs right-margin-xs">' + filter +
                    '</span>', null, {
                        variable: null
                    });
            }
            workspaceId = this.model.get('workspaceId');
            instanceId = this.model.get('instanceId');

            if (this.model.get('status') === 'new') {
                var fullScreen = options.fullScreen;
                if (fullScreen) {
                    WorkspaceFilters.saveFilterToSession(workspaceId, instanceId, filter);
                } else {
                    WorkspaceFilters.saveFilterToJDS(workspaceId, instanceId, filter);
                }
            }
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        }

    });

    return filterTagView;
});
