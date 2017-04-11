define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/accessibility/components'
], function(Backbone, PuppetForm, Handlebars, Accessibility) {
    'use strict';
    var LEFT_ARROW_KEY = 37,
        UP_ARROW_KEY = 38,
        RIGHT_ARROW_KEY = 39,
        DOWN_ARROW_KEY = 40,
        ENTER_KEY = 13,
        SPACE_BAR = 32;
    var SelectedRowItemView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="table-cell{{#each itemColumn.columnClasses}} {{this}}{{/each}}">{{label}}</div>' +
            '{{#each additionalColumns}}' +
            '<div class="table-cell msbs-additional-column-{{clean-for-id columnTitle}}{{#each columnClasses}} {{this}}{{/each}}" data-rowValue="{{../id}}"></div>' +
            '{{/each}}' +
            '{{#if enablePopovers}}' +
            '<div class="table-cell pixel-width-57 text-right details-popover-region">' +
            '</div>' +
            '{{/if}}' +
            '<div class="table-cell pixel-width-57 text-right">' +
            '<button type="button" class="btn btn-link add-remove-btn all-padding-no checked-{{value}}" title="Press enter to remove {{label}}.">Remove</button>' +
            '</div>'
        ].join("\n")),
        templateHelpers: function() {
            var self = this;
            return {
                enablePopovers: function() {
                    return _.isObject(self.field.get('detailsPopoverOptions'));
                }
            };
        },
        className: 'table-row',
        triggers: {
            'click .add-remove-btn': 'child:item:removed'
        },
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.additionalColumns = options.additionalColumns;
            this.itemColumn = options.itemColumn;
            this.field = options.field;
            this.enablePopovers = false;
            if (!_.isUndefined(this.field.get('detailsPopoverOptions'))) {
                this.enablePopovers = true;
                this.addRegion('DetailsPopoverRegion', '.details-popover-region');
            }
            _.each(this.additionalColumns, function(column) {
                column.columnTitle = column.columnTitle || "";
                var id = column.columnTitle.replace(/[^A-Z0-9]+/ig, "-");
                this.addRegion(id + 'Region', '.' + 'msbs-additional-column-' + id);

                var Control = PuppetForm.resolveNameToClass(column.control, 'Control').extend({
                    getSelectedLabelFromDOM: null
                });
                this['_' + id + 'View'] = new Control({
                    field: new PuppetForm.Field(_.defaults({
                        prependToDomId: this.model.get(this.attributeMapping.id) + '-'
                    }, column), this),
                    model: this.model
                });
            }, this);
        },
        onAttach: function() {
            this.buildPopover();
        },
        buildPopover: function() {
            if (this.enablePopovers) {
                var self = this;
                var popoverTitle = 'Details for ' + this.model.get(this.attributeMapping.label);
                var popoverContainer = this.$el.closest('.modal-body, form');
                var detailsPopoverOptions = this.field.get('detailsPopoverOptions') || {};
                var detailsPopoverField = new PuppetForm.Field(_.defaults(_.defaults({
                    title: popoverTitle,
                    options: {
                        placement: 'auto top',
                        trigger: 'manual',
                        container: popoverContainer,
                        viewport: popoverContainer
                    }
                }, detailsPopoverOptions), {
                    control: 'popover',
                    label: popoverTitle,
                    srOnlyLabel: true,
                    name: 'detailsPopoverValue',
                    icon: 'fa-file-text-o',
                    size: 'xs',
                    items: [],
                    title: popoverTitle,
                    extraClasses: ['btn-link'],
                    options: {
                        placement: 'auto top',
                        trigger: 'manual',
                        container: popoverContainer,
                        viewport: popoverContainer
                    }
                }));
                this.showChildView('DetailsPopoverRegion', new PuppetForm.PopoverControl({
                    field: detailsPopoverField,
                    model: this.model
                }));
                var popoverButton = this.$el.find('.popover-control').find('button');
                popoverButton.popover().on('click', function() {
                    self.triggerMethod('details:popover:clicked', $(this));
                });
            }
        },
        onRender: function() {
            _.each(this.additionalColumns, function(column) {
                column.columnTitle = column.columnTitle || "";
                var id = column.columnTitle.replace(/[^A-Z0-9]+/ig, "-");
                this.showChildView(id + 'Region', this['_' + id + 'View']);
            }, this);
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    value: attributes[this.attributeMapping.value],
                    id: attributes[this.attributeMapping.id],
                    label: attributes[this.attributeMapping.label],
                    additionalColumns: this.additionalColumns,
                    itemColumn: this.itemColumn
                };
            return data;
        }
    });

    var SelectedCompositeView = Backbone.Marionette.CompositeView.extend({
        ui: {
            "TableBody": ".body",
            "FilterInput": ".filter"
        },
        className: "faux-table",
        template: Handlebars.compile([
            '<div class="header table-row right-padding-md top-padding-xs bottom-padding-xs">',
            '<div class="table-cell{{#each itemColumn.columnClasses}} {{this}}{{/each}}">{{#if itemColumn.columnTitle}}{{add-required-indicator itemColumn.columnTitle required}}{{else}}Selected {{add-required-indicator label required}}{{/if}}</div>',
            '{{#each additionalColumns}}' +
            '<div class="table-cell{{#each columnClasses}} {{this}}{{/each}}">{{add-required-indicator columnTitle required}}</div>' +
            '{{/each}}',
            '<div class="table-cell pixel-width-57 text-center"></div>',
            '</div>',
            '<div class="body scrolling-content"></div>'
        ].join("\n")),
        emptyView: Backbone.Marionette.ItemView.extend({
            className: 'table-row all-border-no',
            template: Handlebars.compile([
                '<div class="table-cell{{#each itemColumn.columnClasses}} {{this}}{{/each}}">No {{label}} selected.</div>',
                '{{#each additionalColumns}}' +
                '<div class="table-cell"></div>',
                '{{/each}}',
                '<div class="table-cell pixel-width-57 text-right"></div>'
            ].join("\n"))
        }),
        emptyViewOptions: function() {
            return {
                model: this.model
            };
        },
        childViewContainer: "@ui.TableBody",
        childView: SelectedRowItemView,
        childViewOptions: function(model, index) {
            return {
                attributeMapping: this.attributeMapping,
                additionalColumns: this.model.get('additionalColumns') || [],
                itemColumn: this.model.get('itemColumn') || {},
                field: this.getOption('field')
            };
        },
        childEvents: {
            'details:popover:clicked': function(child, clickedPopover) {
                this.getOption('parent').onTogglePopover(child);
                this.ui.TableBody.one('scroll', function() {
                    clickedPopover.trigger('control:popover:hidden', true);
                });
            },
            'child:item:removed': function(view, options) {
                if (this.enablePopovers) {
                    view.$el.find('.popover-control').find('button').trigger('control:popover:hidden', true);
                }
                var focusedItem = [],
                    viewIndex = view._index;
                options.model.set(this.attributeMapping.value, false);
                if (this.collection.length > viewIndex) {
                    focusedItem = this.children.findByModel(this.collection.at(viewIndex)).$('input,textarea,select,button').filter(':visible:not(:disabled):first').focus();
                } else if (this.collection.length > 0) {
                    focusedItem = this.children.findByModel(this.collection.at(viewIndex - 1)).$('input,textarea,select,button').filter(':visible:not(:disabled):first').focus();
                }

                if (focusedItem.length === 0) {
                    //No focusable elements.
                    this._parent._parent._regions.AvailableModifiersRegion.currentView.$('input.filter').focus();
                }
            }
        },
        modelEvents: {
            'change:required': 'render'
        },
        filter: function(child, index, collection) {
            return child.get(this.attributeMapping.value);
        },
        onBeforeDestroy: function() {
            this.ui.TableBody.off('scroll');
        },
        initialize: function(options) {
            this.model = options.field;
            this.attributeMapping = options.attributeMapping;

            this._orginialCollection = options._orginialCollection;

            this.resetItems();
            //IMPORTANT: when Backbone is upgraded use "update" event instead of "add remove"
            this.listenTo(this._orginialCollection, 'add remove', this.resetItems);
            this.listenTo(this._orginialCollection, 'change:' + this.attributeMapping.value, function(model) {
                if (model.changed[this.attributeMapping.value]) {
                    this.collection.add(model);
                } else {
                    this.collection.remove(model);
                }
            }, this);
        },
        resetItems: function() {
            this.collection.set(this._orginialCollection.filter(function(model) {
                return model.get(this.attributeMapping.value);
            }, this));
        }
    });
    var AvailableRowItemView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(['<div class="table-cell{{#if value}} color-primary-lighter{{/if}}">{{label}}</div>' +
            '{{#if enablePopovers}}' +
            '<div class="table-cell pixel-width-57 text-right details-popover-region">' +
            '</div>' +
            '{{/if}}' +
            '<div class="table-cell pixel-width-57 text-right">' +
            '<button tabindex="-1" type="button" class="btn btn-link add-remove-btn all-padding-no checked-{{value}}{{#if value}} color-primary-lighter{{/if}}" title="Press enter to {{#if value}}remove{{else}}add{{/if}} {{label}}.">{{#if value}}Remove{{else}}Add{{/if}}</button>' +
            '</div>'
        ].join("\n")),
        className: 'table-row',
        events: {
            "click .add-remove-btn": "onChange"
        },
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.listenTo(this.model, 'change:' + this.attributeMapping.value, this.onChangeModel);
            this.field = options.field;
            this.enablePopovers = false;
            if (!_.isUndefined(this.field.get('detailsPopoverOptions'))) {
                this.enablePopovers = true;
                this.addRegion("DetailsPopoverRegion", ".details-popover-region");
            }
        },
        getValueFromDOM: function(e) {
            var booleanValue = ($(e.currentTarget).hasClass("checked-true") ? false : true);
            return booleanValue;
        },
        onChangeModel: function() {
            if (this.enablePopovers) {
                this.$el.find('.popover-control').find('button').trigger('control:popover:hidden', true);
                this.render();
                this.buildPopover();
            } else {
                this.render();
            }
        },
        onAttach: function() {
            this.buildPopover();
        },
        buildPopover: function() {
            if (this.enablePopovers) {
                var self = this;
                var popoverTitle = 'Details for ' + this.model.get(this.attributeMapping.label) + ' ';
                var extraClasses = ['btn-link'];
                if (this.model.get(this.attributeMapping.value) === true) {
                    extraClasses = ['btn-link', 'color-primary-lighter'];
                }
                var popoverContainer = this.$el.closest('.modal-body, form');
                var detailsPopoverOptions = this.field.get('detailsPopoverOptions') || {};
                var detailsPopoverField = new PuppetForm.Field(_.defaults(_.defaults({
                    extraClasses: extraClasses,
                    title: popoverTitle,
                    options: {
                        placement: 'auto top',
                        trigger: 'manual',
                        container: popoverContainer,
                        viewport: popoverContainer
                    }
                }, detailsPopoverOptions), {
                    control: 'popover',
                    label: popoverTitle,
                    srOnlyLabel: true,
                    name: 'detailsPopoverValue',
                    icon: 'fa-file-text-o',
                    size: 'xs',
                    items: [],
                    title: popoverTitle,
                    extraClasses: extraClasses,
                    options: {
                        placement: 'auto top',
                        trigger: 'manual',
                        container: popoverContainer,
                        viewport: popoverContainer
                    }
                }));
                this.showChildView('DetailsPopoverRegion', new PuppetForm.PopoverControl({
                    field: detailsPopoverField,
                    model: this.model
                }));
                var popoverButton = this.$el.find('.popover-control').find('button');
                popoverButton.attr('tabindex', '-1');
                popoverButton.popover().on('click', function() {
                    self.triggerMethod('details:popover:clicked', $(this));
                });
            }
        },
        hidePopovers: function() {
            if (this.enablePopovers) {
                this.$el.find('.popover-control').find('button').trigger('control:popover:hidden', true);
            }
        },
        onChange: function(e) {
            this.hidePopovers();
            var value = this.getValueFromDOM(e);
            this.model.set(this.attributeMapping.value, value);
            this.buildPopover();
        },
        templateHelpers: function() {
            var self = this;
            return {
                enablePopovers: function() {
                    return _.isObject(self.field.get('detailsPopoverOptions'));
                }
            };
        },
        serializeModel: function(model) {
            var self = this;
            var attributes = model.toJSON(),
                data = {
                    value: attributes[this.attributeMapping.value],
                    label: attributes[this.attributeMapping.label],
                    itemIndex: this.itemIndex
                };
            return data;
        }
    });
    var AvailableCompositeView = Backbone.Marionette.CompositeView.extend({
        ui: {
            "TableBody": ".body:first",
            "FilterInput": ".filter"
        },
        className: "faux-table",
        attributes: {
            'role': 'application'
        },
        template: Handlebars.compile([
            '<div class="header table-row right-padding-md top-padding-xs bottom-padding-xs">',
            '<div class="table-cell">{{#if itemColumn.columnTitle}}{{itemColumn.columnTitle}}{{else}}Available {{label}}{{/if}}</div>', '<div class="table-cell pixel-width-57 text-center"></div>',
            '</div>',
            '<div class="container-fluid">',
            '<div class="msbs-input row all-padding-xs">',
            '<div class="control input-control form-group bottom-margin-no">',
            '<label for="available-{{clean-for-id label}}-modifiers-filter-results" class="sr-only">Available {{label}} Filter</label>',
            '<input id="available-{{clean-for-id label}}-modifiers-filter-results" type="text" class="form-control input-sm filter" name="available-{{clean-for-id label}}-filter" title="Enter text to filter the {{#if itemColumn.columnTitle}}{{itemColumn.columnTitle}}{{else}}Available {{label}}{{/if}}. Use the up and down arrow keys to cycle through the list of {{#if itemColumn.columnTitle}}{{itemColumn.columnTitle}}{{else}}available {{label}}{{/if}}." placeholder="Filter {{label}}"/>',
            '<span class="loading hidden"><i class="fa fa-spinner fa-spin"></i></span>',
            '</div>',
            '</div>',
            '</div>',
            '<div class="body scrolling-content"></div>'
        ].join("\n")),
        childEvents: {
            'details:popover:clicked': function(child, clickedPopover) {
                this.parentTogglePopover(child, clickedPopover);
            }
        },
        parentTogglePopover: function(child, clickedPopover) {
            this.getOption('parent').onTogglePopover(child);
            this.ui.TableBody.one('scroll', function() {
                clickedPopover.trigger('control:popover:hidden', true);
            });
        },
        childViewContainer: "@ui.TableBody",
        childView: AvailableRowItemView,
        childViewOptions: function(model, index) {
            return {
                attributeMapping: this.attributeMapping,
                field: this.getOption('field')
            };
        },
        emptyView: Backbone.Marionette.ItemView.extend({
            className: 'table-row all-border-no',
            template: Handlebars.compile([
                '<div class="table-cell">No {{label}} found.</div>',
                '<div class="table-cell pixel-width-57 text-right"></div>'
            ].join("\n"))
        }),
        emptyViewOptions: function() {
            return {
                model: this.model
            };
        },
        onBeforeDestroy: function() {
            this.ui.TableBody.off('scroll');
        },
        hidePopovers: function() {
            if (this.enablePopovers) {
                this.$el.find('.popover-control').find('button').trigger('control:popover:hidden', true);
            }
        },
        onKeydownEvent: function(event, triggeredFromPopover) {
            var isAltOrCtrl = (event.altKey || event.ctrlKey);
            var accessPopoverContent = (triggeredFromPopover && event.keyCode === SPACE_BAR);
            if (event.type === 'keydown') {
                if (event.keyCode === UP_ARROW_KEY) {
                    event.preventDefault();
                    if (this.enablePopovers) {
                        if (triggeredFromPopover && !isAltOrCtrl) {
                            this.ui.FilterInput.focus();
                        }
                        this.useRightKeyForFilterNavigation = false;
                    }
                    if (this._currentRowId > 0) {
                        this._currentRowId--;
                        this.selectRow(this._currentRowId);
                        this.hidePopovers();
                    }
                } else if (event.keyCode === DOWN_ARROW_KEY) {
                    event.preventDefault();
                    if (this.enablePopovers) {
                        if (triggeredFromPopover && !isAltOrCtrl) {
                            this.ui.FilterInput.focus();
                        }
                        this.useRightKeyForFilterNavigation = false;
                    }
                    if (this._currentRowId < (this.collection.length - 1)) {
                        this._currentRowId++;
                        this.selectRow(this._currentRowId);
                        this.hidePopovers();
                    }
                } else if (event.keyCode === RIGHT_ARROW_KEY) {
                    if (this.enablePopovers && this._currentRowId != -1 && !this.useRightKeyForFilterNavigation) {
                        event.preventDefault();
                        if (triggeredFromPopover && !isAltOrCtrl) {
                            this.ui.FilterInput.focus();
                        }
                        this.toggleDetailsPopoverOnSelectedRow();
                    }
                } else if (event.keyCode === LEFT_ARROW_KEY) {
                    if (this.enablePopovers) {
                        if (triggeredFromPopover && !isAltOrCtrl) {
                            this.ui.FilterInput.focus();
                        }
                        this.hidePopovers();
                        this.useRightKeyForFilterNavigation = true;
                    }
                } else if (event.keyCode === ENTER_KEY) {
                    if (triggeredFromPopover && !isAltOrCtrl) {
                        this.ui.FilterInput.focus();
                    }
                    event.preventDefault();
                    if (this._currentRowId != -1) {
                        var modelToChange = this.collection.at(this._currentRowId);
                        modelToChange.set(this.attributeMapping.value, !modelToChange.get(this.attributeMapping.value));
                        var actionVerb = modelToChange.get(this.attributeMapping.value) ? ' added to the ' : ' removed from the ',
                            itemColumnTitle = this.model.get('itemColumn') || {};
                        itemColumnTitle = itemColumnTitle.columnTitle || 'selected ' + this.model.get('label');
                        Accessibility.Notification.new({
                            'type': 'Assertive',
                            'message': modelToChange.get(this.attributeMapping.label) + ' has been' + actionVerb + itemColumnTitle + ' list.'
                        });
                    }
                } else {
                    if (accessPopoverContent) {
                        if (this._currentRowId != -1) {
                            var targetViewModel = this.collection.at(this._currentRowId);
                            var targetView = this.children.findByModel(targetViewModel);
                            var popoverButton = targetView.$el.find('.popover-control').find('button');
                            if (popoverButton.hasClass('popover-shown')) {
                                event.preventDefault();
                                var popoverContentFirstFormControl = this.$el.closest('.modal-body, form').find('#' + popoverButton.attr('aria-describedby') + ' .form-group .form-control').first();
                                if (popoverContentFirstFormControl.length > 0) {
                                    popoverContentFirstFormControl.focus();
                                }
                            } else {
                                this.ui.FilterInput.focus();
                                this.hidePopovers();
                                this.onFilterInput(event);
                            }
                        }
                    } else if (!isAltOrCtrl) {
                        if (triggeredFromPopover) {
                            this.ui.FilterInput.focus();
                        }
                        this.hidePopovers();
                        this.onFilterInput(event);
                    }
                }
            }
        },
        events: {
            'keydown .popover-control button': function(event) {
                if (this.enablePopovers) {
                    this.onKeydownEvent(event, true);
                }
            },
            'keydown @ui.FilterInput': function(event) {
                this.onKeydownEvent(event, false);
            },
            'input @ui.FilterInput': function(event) {
                if (this.enablePopovers) {
                    if (this.useRightKeyForFilterNavigation === true) {
                        this.onFilterInput(event);
                    }
                } else {
                    this.onFilterInput(event);
                }
            },
            'focusout @ui.FilterInput': function(event) {
                this._currentRowId = -1;
                this.$('.active').removeClass('active');
            }
        },
        onFilterInput: function(event) {
            this.$('.loading').removeClass("hidden");
            clearTimeout(this._inputEvent);
            this._inputEvent = setTimeout(_.bind(function() {
                this._currentRowId = -1;
                this.selectRow();
                this.filterCollectionEvent(event);
            }, this), 250);
        },
        scrollElementIntoView: function(element) {
            var centerIfNeeded = true;

            var parent = element.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
                parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
                overTop = element.offsetTop - parent.offsetTop < parent.scrollTop,
                overBottom = (element.offsetTop - parent.offsetTop + element.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
                overLeft = element.offsetLeft - parent.offsetLeft < parent.scrollLeft,
                overRight = (element.offsetLeft - parent.offsetLeft + element.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
                alignWithTop = overTop && !overBottom;

            if ((overTop || overBottom) && centerIfNeeded) {
                parent.scrollTop = element.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + element.clientHeight / 2;
            }

            if ((overLeft || overRight) && centerIfNeeded) {
                parent.scrollLeft = element.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + element.clientWidth / 2;
            }

            if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
                element.scrollIntoView(alignWithTop);
            }
        },
        selectRow: function(indexToSelect) {
            this.$('.active').removeClass('active');
            if (_.isNumber(indexToSelect)) {
                var modelToChange = this.collection.at(indexToSelect);
                this.scrollElementIntoView(this.children.findByModel(modelToChange).$el.addClass('active')[0]);
                var actionVerb = modelToChange.get(this.attributeMapping.value) ? ' remove from the ' : ' add to the ',
                    itemColumnTitle = this.model.get('itemColumn') || {};
                itemColumnTitle = itemColumnTitle.columnTitle || 'selected ' + this.model.get('label');
                Accessibility.Notification.new({
                    'type': 'Assertive',
                    'message': this.collection.at(indexToSelect).get(this.attributeMapping.label) + '. Press enter to' + actionVerb + itemColumnTitle + ' list or press right arrow to view more details.'
                });
            }
        },
        toggleDetailsPopoverOnSelectedRow: function(event) {
            if (this._currentRowId != -1) {
                var modelToChange = this.collection.at(this._currentRowId);
                var activeRowView = this.children.findByModel(modelToChange);
                var popoverButton = activeRowView.$el.find('.popover-control').find('button');
                if (!_.isUndefined(popoverButton)) {
                    var currentActiveRowID = this._currentRowId;
                    this.parentTogglePopover(activeRowView, popoverButton);
                    this._currentRowId = currentActiveRowID;
                    this.selectRow(this._currentRowId);
                }
            }
        },
        filterCollectionEvent: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.find('.popover-control').find('button').trigger('control:popover:hidden', true);
            var filterString = e.target.value.toLowerCase();
            var itemColumnTitle = this.model.get('itemColumn') || {};
            itemColumnTitle = itemColumnTitle.columnTitle || 'available ' + this.model.get('label');
            if (filterString.length > 0) {
                var label = this.attributeMapping.label;
                if (this._lastInputString.length > filterString.length || (this._lastInputString.indexOf(filterString) < 0)) {
                    //Deleting Characters
                    this.collection.set(this._orginialCollection.filter(function(model) {
                        return model.get(label).toLowerCase().indexOf(filterString) > -1;
                    }, this), this).sort();
                } else {
                    //Adding Characters
                    this.collection.set(this.collection.filter(function(model) {
                        return model.get(label).toLowerCase().indexOf(filterString) > -1;
                    }, this), this);
                }
                Accessibility.Notification.new({
                    'type': 'Assertive',
                    'message': "'" + filterString + "' has been used to filter the " + itemColumnTitle + ". There are now " + this.collection.length + " " + itemColumnTitle + " in the list."
                });
            } else {
                this.resetItems();
                Accessibility.Notification.new({
                    'type': 'Assertive',
                    'message': "The filter has been removed from the " + itemColumnTitle + " list. There are now " + this.collection.length + " " + itemColumnTitle + " in the list."
                });
            }
            this._lastInputString = filterString;
            this.$('.loading').addClass("hidden");
        },
        initialize: function(options) {
            this.model = options.field;
            this.enablePopovers = false;
            if (!_.isUndefined(this.model.get('detailsPopoverOptions'))) {
                this.enablePopovers = true;
            }
            this.attributeMapping = options.attributeMapping;
            this._orginialCollection = options._orginialCollection;
            this._inputEvent = null;
            this._lastInputString = "";
            this._currentRowId = -1;
            //IMPORTANT: when Backbone is upgraded use "update" event instead of "add remove"
            this.listenTo(this._orginialCollection, 'add remove', this.resetItems);
        },
        resetItems: function() {
            this.collection.set(this._orginialCollection.models).sort();
        }
    });

    var TotalCountView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<div class='pull-right'><span>Total Selected: {{totalSelected}}</span>{{#if required}}<input class='total-selected-input' type='number' min='1' value={{totalSelected}} tabIndex='-1' oninvalid='setCustomValidity(\"{{errorMessage}}\")'>{{/if}}"),
        modelEvents: {
            'change': 'render'
        },
        initialize: function() {
            this.listenTo(this.model.get('field'), 'change:required', this.render);
        },
        serializeModel: function(model, moreOptions) {
            var field = model.get('field') || new Backbone.Model();
            return {
                'totalSelected': model.get('totalSelected'),
                'required': field.get('required'),
                'errorMessage': model.get('errorMessage')
            };
        }
    });

    var MultiselectSideBySidePrototype = {
        ui: {
            'AvailableModifiersRegion': '.available-region',
            'SelectedModifiersRegion': '.selected-region',
            'TotalSelectedRegion': '.total-selected-region'
        },
        regions: {
            'AvailableModifiersRegion': '@ui.AvailableModifiersRegion',
            'SelectedModifiersRegion': '@ui.SelectedModifiersRegion',
            'TotalSelectedRegion': '@ui.TotalSelectedRegion'
        },
        className: "row control form-group",
        attributeMappingDefaults: {
            id: 'id',
            label: 'label',
            value: 'value'
        },
        template: Handlebars.compile([
            '<div class="available-region{{#if availableSize}} col-md-{{availableSize}}{{else}} col-md-6{{/if}}"></div>',
            '<div class="selected-region{{#if selectedSize}} col-md-{{selectedSize}}{{else}} col-md-6{{/if}}"></div>',
            '<div class="col-xs-12 total-selected-region"></div>'
        ].join("\n")),
        initialize: function(options) {
            this.initOptions(options);
            this.setAttributeMapping();
            this.setExtraClasses();
            this.initCollection('collection');
            this.selectedCountName = this.field.get('selectedCountName') || null;

            // Set any undefined/nonBoolean values to false
            _.each(this.collection.reject(function(model) {
                if (_.isBoolean(model.get(this.attributeMapping.value))) {
                    return true;
                }
                return false;
            }, this), function(model) {
                model.set(this.attributeMapping.value, false);
            }, this);

            if (this.model.errorModel instanceof Backbone.Model) {
                this.listenTo(this.model.errorModel, "change:" + this.getComponentInstanceName(), this.updateInvalid);
            }
            this._utilityModel = new Backbone.Model({
                errorMessage: 'This field is required. Please select one or more items.',
                field: this.field
            });
            this.listenTo(this.collection, 'change reset', function() {
                this.clearErrorModelValue(this.getComponentInstanceName());
                this.updateCount();
                this.model.trigger('change', this.model);
            }, this);
            this.updateCount();

            // _.each(options.field.get('additionalColumns'), function(item) {
            //     this.stopListening(this.collection, 'change:' + item.name);
            // }, this);

            this.model.set(this.getComponentInstanceName(), this.collection);
        },
        events: _.defaults({
            //Events to be Triggered By User
            "control:required": function(event, booleanValue) {
                this.setBooleanFieldOption("required", booleanValue, event);
            },
            "control:hidden": function(event, booleanValue) {
                this.hideControl(event, booleanValue);
                if (booleanValue === true) {
                    var shownPopovers = this.$('.popover-control').find('.popover-shown');
                    shownPopovers.trigger('control:popover:hidden', true);
                }
            }
        }, PuppetForm.DefaultRadioControl.prototype.events),
        onShow: function() {
            this.showChildView('AvailableModifiersRegion', new AvailableCompositeView({
                field: this.field,
                _orginialCollection: this.collection,
                collection: new Backbone.Collection(this.collection.models),
                attributeMapping: this.attributeMapping,
                parent: this
            }));
            this.showChildView('SelectedModifiersRegion', new SelectedCompositeView({
                field: this.field,
                _orginialCollection: this.collection,
                collection: new Backbone.Collection(),
                attributeMapping: this.attributeMapping,
                parent: this
            }));
            this.showChildView('TotalSelectedRegion', new TotalCountView({
                model: this._utilityModel
            }));
        },
        onTogglePopover: function(childView) {
            var clickedPopover = childView.$('.popover-control > button');
            var otherPopovers = this.$('.popover-control').find('.popover-shown').not(clickedPopover);
            otherPopovers.trigger('control:popover:hidden', true);
            var hideClickedPopover = clickedPopover.hasClass('popover-shown');
            clickedPopover.popover('toggle');
        },
        serializeModel: function(model, moreOptions) {
            var field = this.field.toJSON(),
                selectedSize = null,
                availableSize = null;
            if (_.isNumber(field.selectedSize) && (0 < field.selectedSize < 13)) {
                selectedSize = field.selectedSize;
                availableSize = 12 - selectedSize;
            }
            return _.defaults({
                selectedSize: selectedSize,
                availableSize: availableSize
            }, field);
        },
        updateCount: function() {
            var passedAttributes = {};
            passedAttributes[this.attributeMapping.value] = true;
            var count = this.collection.where(passedAttributes).length;
            if (this.selectedCountName) {
                this.model.set(this.selectedCountName, count);
            }
            this._utilityModel.set('totalSelected', count);
        },
        clearInvalidAdditionalFields: function() {
            this.$('.' + PuppetForm.errorClassName).removeClass(PuppetForm.errorClassName)
                .find("." + PuppetForm.helpClassName + ".error").remove();
            return this;
        },
        updateInvalid: function() {
            var errorModel = this.model.errorModel;
            if (!(errorModel instanceof Backbone.Model)) return this;

            this.clearInvalid();
            this.clearInvalidAdditionalFields();

            var attrArr = this.field.get('name').split('.'),
                name = attrArr.shift(),
                path = attrArr.join('.'),
                error = errorModel.get(name);

            if (_.isString(error)) {
                // Gerneral Error message for entire control
                this.$el.addClass(PuppetForm.errorClassName);
                this.$el.append('<div class="col-md-12 ' + PuppetForm.helpClassName + ' error"><span>' + (_.isArray(error) ? error.join(", ") : error) + '</span></div>');
            } else if (_.isArray(error)) {
                // Specific error message for an additionalColumn field
                _.each(error, function(errorObject) {
                    if (!_.isUndefined(errorObject.id) && !_.isUndefined(errorObject.name)) {
                        var controlWithError = this.ui.SelectedModifiersRegion.find('.table-cell[data-rowvalue="' + errorObject.id + '"] .control.' + errorObject.name).addClass(PuppetForm.errorClassName);
                        if (!_.isUndefined(errorObject.message)) {
                            $(controlWithError).append('<span class="' + PuppetForm.helpClassName + ' error">' + (_.isArray(errorObject.message) ? error.join(", ") : errorObject.message) + '</span>');
                        }
                    }
                }, this);
            } else {
                return;
            }

            return this;
        }
    };

    var MultiselectSideBySide = PuppetForm.MultiselectSideBySideControl = Backbone.Marionette.LayoutView.extend(
        _.defaults(MultiselectSideBySidePrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );
    return MultiselectSideBySide;
});