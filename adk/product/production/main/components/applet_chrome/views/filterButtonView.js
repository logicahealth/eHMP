define('main/components/applet_chrome/views/filterButtonView', [
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'hbs!main/components/applet_chrome/templates/filterButtonTemplate',
    "api/SessionStorage",
    'api/Messaging',
    'main/api/WorkspaceFilters'
], function(Backbone, Marionette, $, _, filterButtonTemplate, SessionStorage, Messaging, WorkspaceFilters) {
    'use strict';

    var FilterButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: filterButtonTemplate,
        ui: {
            '$tooltip': '[tooltip-data-key], [data-toggle=tooltip]'
        },
        attributes: function() {
            return {
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        },
        onShow: function() {
            var appletInstanceId = this.model.get('instanceId');
            WorkspaceFilters.onAppletFilterCollectionChanged(appletInstanceId, this.setVisibilityIfFilters, this);

            var filterArea = this.$('#grid-filter-' + appletInstanceId);
            if (filterArea.hasClass('in')) {
                this.model.set('buttonMsg', 'Filter. Expanded.');
            } else {
                this.model.set('buttonMsg', 'Filter. Collapsed.');
            }
        },
        setVisibilityIfFilters: function(args) {
            if (_.get(args, 'anyFilters', null)) {
                this.toggleFilterButtonEvent({}, _.get(args, 'applet.showFilters', true));
            }
        },
        events: {
            'click button': 'toggleFilterButtonEvent'
        },
        modelEvents: {
            'change:buttonMsg': 'render'
        },
        toggleFilterButtonEvent: function(e, makeVisible) {
            var filterView = this.getOption('filterView');
            if (!filterView) {
                return;
            }
            var appletInstanceId = this.model.get('instanceId');
            var filterButton = this.$el;
            var filterCollapseContainer = $('#grid-filter-' + appletInstanceId);
            if (_.isEmpty(filterCollapseContainer)) {
                filterCollapseContainer = filterView.$('.collapse').first();
                if (_.isEmpty(filterCollapseContainer)) {
                    filterCollapseContainer = filterView.$el.closest('.collapse');
                }
            }
            var $textFilter = filterView.$('input[type="search"][name="filterText"]');

            this.ui.$tooltip.tooltip('destroy');

            if ((_.isBoolean(makeVisible) && !makeVisible) || (filterCollapseContainer.hasClass('in') && !_.isBoolean(makeVisible))) {
                // we chagnged the call from hide.bs.collapse to hidden.bs.collapse to trigger it when it was fully hidden instead of when the hide action started

                if ($textFilter.length > 0) {
                    filterCollapseContainer.one('hidden.bs.collapse', function() {
                        // clear search text field upon collaping filter view
                        var filterText = SessionStorage.getAppletStorageModel(appletInstanceId, 'filterText');
                        if (_.isString(filterText) && filterText.trim().length > 0) {
                            var queryInputSelector = 'input[type="search"][name="filterText"]';
                            $textFilter.change().keydown();
                        }
                    });
                }

                if (appletInstanceId === "newsfeed-gdt") {
                    this.$el.closest('[data-instanceid="newsfeed-gdt"]').find('table.backgrid').removeClass('filter-expanded');
                }

                var filterName = ADK.SessionStorage.getAppletStorageModel(appletInstanceId, 'filterName', true) || '';
                this.model.set({ 'buttonMsg': 'Filter. Collapsed.', 'filterName': filterName });
                filterCollapseContainer.collapse('hide');
                this.$('button').focus();
            } else {
                // we chagnged the call from show.bs.collapse to shown.bs.collapse to trigger it when it was fully shown instead of when the show action started
                if ($textFilter.length > 0) {
                    filterCollapseContainer.one('shown.bs.collapse', function() {
                        $textFilter.focus();
                    });
                }

                if (appletInstanceId === "newsfeed-gdt") {
                    this.$el.closest('[data-instanceid="newsfeed-gdt"]').find('table.backgrid').addClass('filter-expanded');
                }

                this.model.set('buttonMsg', 'Filter. Expanded.');
                filterCollapseContainer.collapse('show');
            }
        }
    });
    return FilterButtonView;
});
