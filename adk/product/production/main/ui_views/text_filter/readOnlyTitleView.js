define([
    'underscore',
    'handlebars'
], function(
    _,
    Handlebars
) {
    "use strict";

    var ReadOnlyFilterTitleView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '{{#if shouldShow}}' +
            '<div class="sub-header">' +
            '<i class="fa fa-filter"></i>' +
            '<span class="filter-title"> {{filterTitle}}</span>' +
            '<button type="button" class="btn btn-sm btn-icon" tooltip-data-key="Filter" data-target="#filter-container-{{instanceId}}" title="Press enter to edit applet filter name">' +
            '<i class="fa fa-pencil"></i>' +
            '</button>' +
            '</div>' +
            '{{/if}}'
        ),
        modelEvents: {
            'change:saveFilters': 'render',
            'change:filterTitle': 'render'
        },
        templateHelpers: function() {
            return {
                'shouldShow': function() {
                    return this.showFilterTitle && this.saveFilters && !_.isEmpty(this.filterTitle);
                }
            };
        }
    });

    return ReadOnlyFilterTitleView;
});
