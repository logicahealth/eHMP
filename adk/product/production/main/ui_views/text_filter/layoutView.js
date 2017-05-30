define([
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/ui_views/text_filter/formView',
    'main/ui_views/text_filter/listView',
    'main/ui_views/text_filter/readOnlyTitleView',
    'main/ui_views/text_filter/collection'
], function(
    $,
    _,
    Handlebars,
    Messaging,
    FilterFormView,
    FilterListView,
    ReadOnlyFilterTitleView,
    FilterCollection
) {
    "use strict";

    // Shared model used by the layout view and the form view
    var FilterFormModel = Backbone.Model.extend({
        validate: function(attributes, options) {
            var errors = {};
            var inputID = attributes.searchInputID;
            if (_.isEmpty(attributes[inputID].replace(/\s+/g, ''))) {
                errors[inputID] = 'Empty String not allowed';
            }

            if (!_.get(options, 'silent', false)) {
                this.errorModel.set(errors);
            }

            if (!_.isEmpty(errors)) {
                return "Validation errors. Please fix.";
            }
        }
    });

    // Shared model used by the layout view and the read only title view
    var FilterLayoutViewModel = Backbone.Model.extend({
        defaults: {
            filterTitle: '',
            showFilterTitle: false,
            multipleFilters: false,
            saveFilters: false
        }
    });

    var FilterLayoutView = Backbone.Marionette.LayoutView.extend({
        Collection: FilterCollection,
        template: Handlebars.compile(
            '<div class="filter-title-container"></div>' +
            '<div id="filter-container-{{instanceId}}" class="filter-container collapse background-color-primary-lightest bottom-border-grey-light{{#if isOpen}} in{{/if}}">' +
            '<div class="filter-container-daterange"></div>' +
            '<div class="filter-container-text">' +
            '<div class="filter-container-text-form"></div>' +
            '<div class="filter-container-text-list"></div>' +
            '</div>' +
            '</div>'
        ),
        ui: {
            filterTitleContainer: '.filter-title-container',
            dateRangeFilterContainer: '.filter-container-daterange',
            textFilterFormContainer: '.filter-container-text-form',
            textFilterListContainer: '.filter-container-text-list'
        },
        regions: {
            filterTitleRegion: '@ui.filterTitleContainer',
            dateRangeFilterRegion: '@ui.dateRangeFilterContainer',
            textFilterFormRegion: '@ui.textFilterFormContainer',
            textFilterListRegion: '@ui.textFilterListContainer'
        },
        templateHelpers: function() {
            return {
                instanceId: this.getOption('instanceId'),
                // Used to determine if the filter container should be shown at first
                isOpen: !_.isEmpty(this._filterCollection.where({ shouldShow: true }))
            };
        },
        events: {
            'click .sub-header > button': function(e){
                e.stopPropagation();
                var lengthOfTitle = _.get(this.model.get('filterTitle'), 'length', 0);
                var input = this.$('.applet-filter-title input')[0];
                input.focus();
                input.setSelectionRange(lengthOfTitle, lengthOfTitle);
            }
        },
        _filterCollectionEvents: {
            'filter-entered': '_onEnterFilter',
            'update': function() {
                this.model.set('saveFilters', !this._filterCollection.isEmpty());
            }
        },
        modelEvents: {
            'change:saveFilters': function(model, value) {
                this.textFilterFormRegion.currentView.toggleFilterTitleField(!value);
            }
        },
        initialize: function(options) {
            this._filterCollection = this.getOption('collection');
            if(!(this._filterCollection instanceof FilterLayoutView.prototype.Collection)){
                console.error('TextFilter View must be instantiated with a "collection" that is an instance of "TextFilter.prototype.Collection"\nDisregarding the collection passed in through options and creating a new empty collection.');
                this._filterCollection = new FilterLayoutView.prototype.Collection();
            }
            this.bindEntityEvents(this._filterCollection, this._filterCollectionEvents);
            this.model = new FilterLayoutViewModel(_.extend({
                    saveFilters: !this._filterCollection.isEmpty()
                },
                _.pick(options, ['instanceId', 'showFilterTitle', 'multipleFilters', 'filterTitle'])));
        },
        onBeforeShow: function() {
            this.showChildView('filterTitleRegion', new ReadOnlyFilterTitleView(_.extend({
                model: this.model
            }, this.options)));
            var initalFormValues = {};
            var searchInputID = this.model.get('instanceId') + 'FilterSearchText';
            searchInputID = searchInputID.replace(/[^a-zA-Z 0-9]+/g,'');
            if (this.model.get('multipleFilters')) {
                this.showChildView('textFilterListRegion', new FilterListView(_.extend({
                    collection: this._filterCollection
                }, this.options)));
            } else {
                initalFormValues[searchInputID] = this._filterCollection.getCombinedFilterString() || '';
            }

            var filterTitleInputID = this.model.get('instanceId') + 'FilterTitle';
            filterTitleInputID = filterTitleInputID.replace(/[^a-zA-Z 0-9]+/g,'');
            initalFormValues[filterTitleInputID] = this.model.get('filterTitle');

            this._formModel = new FilterFormModel(_.extend({
                searchInputID: searchInputID,
                filterTitleInputID: filterTitleInputID
            }, initalFormValues));
            this.listenTo(this._formModel, 'change:' + filterTitleInputID, this._onChangeFilterTitle);
            this.showChildView('textFilterFormRegion', new FilterFormView(_.extend({
                model: this._formModel,
                fields: this._getFields(),
                multipleFilters: this.model.get('multipleFilters')
            }, this.options)));
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this._filterCollection, this._filterCollectionEvents);
        },
        _onChangeFilterTitle: function(model, value) {
            this.model.set('filterTitle', value);
            this.$el.trigger('applet:filter:title:updated', value);
            Messaging.trigger('gridster:saveAppletsConfig');
        },
        _onEnterFilter: function(newFilterText) {
            this._filterCollection.set({
                text: newFilterText,
                shouldShow: this.model.get('multipleFilters'),
                removable: true
            }, {
                remove: !this.model.get('multipleFilters')
            });
        },
        _getFields: function() {
            var itemsArray = [{
                control: 'searchbar',
                name: this._formModel.get('searchInputID'),
                placeholder: 'Add Filter and press Enter to apply',
                label: this.model.get('instanceId') + ' - Filter',
                srOnlyLabel: true,
                buttonOptions: {
                    type: 'submit',
                    title: 'Press enter to filter results.',
                    icon: 'fa-plus'
                },
                icon: 'fa-filter',
                type: 'search',
                extraClasses: ['flex-width-1', 'form-group-sm'],
                title: 'Enter filter text and press Enter to apply.'
            }];
            if (this.model.get('showFilterTitle')) {
                itemsArray.push({
                    control: 'container',
                    extraClasses: ['flex-width-1'],
                    items: [{
                        control: "input",
                        name: this._formModel.get('filterTitleInputID'),
                        label: "Filter Title",
                        title: "Enter an applet filter name, then press enter.",
                        srOnlyLabel: true,
                        placeholder: "Edit Applet Filter Name",
                        icon: 'fa-pencil',
                        extraClasses: ['pull-right', 'percent-width-100', 'left-padding-sm', 'applet-filter-title', 'form-group-sm'],
                        maxlength: 30,
                        hidden: !this.model.get('saveFilters')
                    }]
                });
            } else if (this.model.get('multipleFilters')) {
                itemsArray.push({
                    control: 'container',
                    extraClasses: ['flex-width-1'],
                    items: []
                });
            }
            if (!this.model.get('multipleFilters')) {
                _.set(itemsArray, '0.buttonOptions.hidden', true);
            }

            return [{
                control: 'container',
                extraClasses: ['table-filter-control', 'flex-display', 'flex-direction-row', 'all-padding-xs', 'bottom-padding-no'],
                items: itemsArray
            }];
        }
    });

    return FilterLayoutView;
});
