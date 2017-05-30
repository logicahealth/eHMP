define([
    'jquery',
    'underscore',
    'handlebars',
    'main/ui_components/form/component'
], function(
    $,
    _,
    Handlebars,
    Form
) {
    "use strict";

    var FilterFormView = Form.extend({
        fields: [],
        events: {
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid({
                        silent: true
                    })) {
                    this.onFilter();
                }
            },
            'keydown .applet-filter-title input': function(event) {
                var ENTER_KEY = 13;
                if (event.keyCode === ENTER_KEY) {
                    event.stopPropagation();
                    event.preventDefault();
                    $(event.target).trigger('change');
                }
            }
        },
        modelEvents: {
            'change': function(model) {
                if (_.isEmpty(model.get(model.get('searchInputID'))) && !this.getOption('multipleFilters')) {
                    this.getOption('collection').trigger('filter-entered', '');
                }
            }
        },
        onInitialize: function(options) {
            this.listenTo(_.get(options, 'collection'), 'remove reset', function() {
                this.$('.searchbar-control input').focus();
            });
        },
        onFilter: function() {
            this.getOption('collection').trigger('filter-entered', this.model.get(this.model.get('searchInputID')));
            if (this.getOption('multipleFilters')) {
                this.model.unset(this.model.get('searchInputID'));
                this.$('.searchbar-control input').focus();
            }
        },
        toggleFilterTitleField: function(shouldHide) {
            this.$('.input-control').trigger('control:hidden', shouldHide);
            if (shouldHide) {
                this.model.set(this.model.get('filterTitleInputID'), '');
            }
        }
    });

    return FilterFormView;
});
