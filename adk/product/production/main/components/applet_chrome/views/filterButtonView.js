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
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        },
        onShow: function() {
            var appletInstanceId = this.model.get('instanceId');
            WorkspaceFilters.onAppletFilterCollectionChanged(appletInstanceId, this.setVisibilityIfFilters, this);
            var filterName = ADK.SessionStorage.getAppletStorageModel(appletInstanceId, 'filterName', true) || '';

            this.model.set('filterName', filterName);
            var filterArea = this.$('#grid-filter-' + appletInstanceId);
            if (filterArea.hasClass('in')) {
                this.model.set('buttonMsg', 'Press enter to collapse filter.');
            } else {
                this.model.set('buttonMsg', 'Press enter to expand filter.');
            }
        },
        setVisibilityIfFilters: function(args) {
            var appletFilterTitle = this.$('.applet-filter-title');
            this.setVisible(appletFilterTitle, args.anyFilters);
        },
        setVisible: function(element, makeVisible) {
            if (makeVisible) {
                element.removeClass('hidden');

                var appletInstanceId = this.model.get('instanceId'),
                    filterName = ADK.SessionStorage.getAppletStorageModel(appletInstanceId, 'filterName', true) || 'filtered';
                this.model.set('filterName', filterName);
                this.setTitle(element, filterName);

            } else {
                element.addClass('hidden');
                element.text('');
                this.model.set('filterName', '');
            }
        },
        setTitle: function(element, title) {
            element.text(title);
        },
        events: {
            'click button': 'toggleFilterButtonEvent'
        },
        modelEvents: {
            'change:buttonMsg': 'render'
        },
        toggleFilterButtonEvent: function() {
            this.ui.$tooltip.tooltip('destroy');
            var appletInstanceId = this.model.get('instanceId');
            var filterArea = $('#grid-filter-' + appletInstanceId);
            var filterButton = this.$el;

            if (filterArea.hasClass('in')) {
                // we chagnged the call from hide.bs.collapse to hidden.bs.collapse to trigger it when it was fully hidden instead of when the hide action started
                filterArea.one('hidden.bs.collapse', function() {

                    // clear search text field upon collaping filter view
                    var filterText = SessionStorage.getAppletStorageModel(appletInstanceId, 'filterText');
                    if (filterText !== undefined && filterText !== null && filterText.trim().length > 0) {
                        var queryInputSelector = 'input[name=\'q-' + appletInstanceId + '\']';
                        $(queryInputSelector).change().keydown();
                    }
                });

                if (appletInstanceId === "newsfeed-gdt"){
                    this.$el.closest('[data-instanceid="newsfeed-gdt"]').find('table.backgrid').removeClass('filter-expanded');
                }

                var filterName = ADK.SessionStorage.getAppletStorageModel(appletInstanceId, 'filterName', true) || '';
                this.model.set({'buttonMsg': 'Press enter to expand filter.', 'filterName': filterName});
                filterArea.collapse('hide');
                this.$('button').focus();
            } else {
                // we chagnged the call from show.bs.collapse to shown.bs.collapse to trigger it when it was fully shown instead of when the show action started
                filterArea.one('shown.bs.collapse', function() {
                    filterArea.find('input[type=search]').focus();
                });

                if (appletInstanceId === "newsfeed-gdt"){
                    this.$el.closest('[data-instanceid="newsfeed-gdt"]').find('table.backgrid').addClass('filter-expanded');
                }

                this.model.set('buttonMsg', 'Press enter to collapse filter.');
                filterArea.collapse('show');
            }
            filterArea.collapse('toggle');
        }
    });
    return FilterButtonView;
});
