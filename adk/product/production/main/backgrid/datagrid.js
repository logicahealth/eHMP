define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'backgrid',
    'main/backgrid/dataGridView',
    'main/backgrid/extensions/dataGridRow',
    "main/backgrid/extensions/headerCell",
    'main/backgrid/extensions/groupBy/groupByBody',
    'main/backgrid/extensions/groupBy/groupByHeader',
    'main/adk_utils/crsUtil',
    'main/backgrid/customFilter',
    'api/PatientRecordService',
    'api/Messaging',
    'backgrid-moment-cell',
    'main/backgrid/extensions/defaultOverrides',
    'backgrid.filter',
    'backgrid.paginator'
], function(Backbone, Marionette, $, _, Backgrid, dataGridView, DataGridRow, HeaderCell, GroupByBody, GroupByHeader, CrsUtil, customFilter, PatientRecordService, Messaging) {
    'use strict';
    var DataGrid = {};

    function findSortValue(model, sortKey) {
        if (model.get(sortKey)) {
            return model.get(sortKey).toLowerCase();
        } else {
            return '';
        }
    }

    Backgrid.EmptyRow.prototype = _.extend(Backgrid.EmptyRow.prototype, {
        render: function() {
            this.$el.empty();
            this.$el.attr("aria-live", "assertive");
            var td = document.createElement("td");
            td.setAttribute("colspan", this.columns.length);
            var span = document.createElement("span");
            span.innerHTML = _.result(this, "emptyText");
            span.className = "color-grey-darkest";
            td.appendChild(span);
            this.el.className = "empty percent-height-100 background-color-grey-lightest";
            this.el.appendChild(td);

            return this;
        }
    });

    DataGrid.returnView = function() {
        var GridLayoutView = dataGridView.extend({
            DataGridRow: DataGridRow,
            behaviors: function() {
                return {
                    Injectable: {
                        className: 'quickmenu-header',
                        tagName: 'th',
                        component: 'quickmenu',
                        containerSelector: function() {
                            return this.$('table thead tr');
                        },
                        attributes: {
                            'scope': 'col',
                            'aria-label': 'More Options'
                        }
                    }
                };
            },
            initialize: function(options) {
                this.appletConfig = options.appletConfig;
                var columns = this.getOption('columns');

                var groupableOptions = {};
                _.each(columns, function(column, index) {
                    column.editable = false;
                    column.headerCell = HeaderCell;
                    column.sortType = column.sortType || 'toggle';
                    if (options.groupable && column.groupable) {
                        column.headerCell = GroupByHeader;
                        column.sortable = true;
                        column.sortType = "cycle";
                    }
                    column.appletId = options.appletConfig.id;
                    if (column.cell === undefined) {
                        column.cell = 'string';
                    }
                    if (column.sortValue === undefined) {
                        column.sortValue = findSortValue;
                    }
                });

                if (_.has(options.collection, 'comparator')) {
                    options.collection._originalComparator = options.collection.comparator;
                }

                var DefaultBodySort = {
                    sort: function(column, direction) {
                        var collection = this.collection;
                        if (_.isNull(direction) && _.has(collection, '_originalComparator') && !_.isNull(collection._originalComparator)) {
                            var comparator = collection._originalComparator;
                            collection.comparator = comparator;
                            if (Backbone.PageableCollection && collection instanceof Backbone.PageableCollection) {
                                collection.setSorting(null && column.get("name"), null, {
                                    sortValue: column.sortValue()
                                });
                                if (collection.fullCollection) {
                                    collection.fullCollection.comparator = comparator;
                                    collection.fullCollection.sort();
                                } else {
                                    collection.fetch({
                                        reset: true,
                                        success: function() {
                                            collection.trigger("backgrid:sorted", column, direction, collection);
                                            column.set("direction", direction);
                                        }
                                    });
                                }
                            } else {
                                collection.sort();
                            }
                            collection.trigger("backgrid:sorted", column, direction, collection);
                            column.set("direction", direction);
                            return this;
                        } else {
                            return _.bind(Backgrid.Body.prototype.sort, this)(column, direction);
                        }
                    }
                };

                var body = options.groupable ? GroupByBody : options.body ? _.has(options.body, 'sort') ? options.body : options.body.extend(DefaultBodySort) : Backgrid.Body.extend(DefaultBodySort);

                if (!options.groupable) {
                    body = body.extend({
                        render: function() {
                            var filter = this.filter || options.filter;
                            this.$el.empty();
                            var fragment = document.createDocumentFragment();
                            for (var i = 0; i < this.rows.length; i++) {
                                var row = this.rows[i];
                                if (_.isFunction(filter)) {
                                    if (!filter(row.model)) continue;
                                }
                                if (_.isObject(filter)) {
                                    if (!_.filter(row.model, filter)) continue;
                                }
                                fragment.appendChild(row.render().el);
                            }
                            this.el.appendChild(fragment);
                            this.delegateEvents();
                            return this;
                        }
                    });
                }

                var row;

                if (this.isComponentEnabled('quickMenu')) {
                    this.listenTo(ADK.Messaging.getChannel('datagrid'), 'show:toolbar', function(e) {
                        this.activeToolbarContainer = e.activeToolbarContainer;
                    });
                    this.listenTo(ADK.Messaging.getChannel('toolbar'), 'close:toolbar', function(e) {
                        if (this.activeToolbarContainer) {
                            this.activeToolbarContainer.closeToolbar();
                        }
                    });
                    this.listenTo(ADK.Messaging.getChannel('datagrid'), 'close:toolbar', function(e) {
                        ADK.Messaging.getChannel('toolbar').trigger('close:toolbar');
                    });

                    //setup toolbar
                    var DataGridRow = this.DataGridRow;
                    if (!DataGridRow) throw ('DataGridRow must be defined');
                    var prototypeBehaviors = _.get(DataGridRow, 'prototype.behaviors');
                    var behaviors = {
                        'QuickMenu': {}
                    };
                    if (this.isComponentEnabled('actions')) {
                        behaviors.Actions = {};
                    }
                    if (this.isComponentEnabled('notifications')) {
                        behaviors.Notifications = {};
                    }
                    if (this.isComponentEnabled('quickLooks')) {
                        behaviors.QuickLooks = {};
                    }
                    if (prototypeBehaviors) _.extend(behaviors, prototypeBehaviors);
                    var onClickRow = this.options.onClickRow;
                    if (!onClickRow) {
                        this.options.onClickRow = function(model, event, self) {
                            var currentPatient = PatientRecordService.getCurrentPatient();
                            var channelObject = {
                                model: model,
                                collection: self.collection || model.collection,
                                uid: model.get("uid")
                            };

                            Messaging.getChannel(model.get('applet_id')).trigger('detailView', channelObject);
                        };
                    }
                    row = DataGridRow.extend({
                        showLinksButton: options.showLinksButton,
                        tileOptions: this.getOption('tileOptions'),
                        behaviors: behaviors
                    });
                } else if (options.appletConfig.simpleGrid && !_.isUndefined(options.appletConfig.simpleGrid) && !_.isNull(options.appletConfig.simpleGrid)) {
                    row = this.DataGridRow.extend({
                        simpleGrid: options.appletConfig.simpleGrid
                    });
                } else {
                    row = this.DataGridRow;
                }

                this.gridOptions = {
                    id: 'data-grid-' + (options.appletConfig.instanceId || options.appletConfig.id),
                    className: 'backgrid table table-hover',
                    row: row,
                    body: body,
                    columns: columns,
                    collection: options.collection,
                    emptyText: options.emptyText,
                    groupableOptions: groupableOptions
                };
            },
            onRender: function() {
                var tileOptions = this.getOption('tileOptions');
                var isQuickMenuEnabled = _.get(tileOptions, 'quickMenu.enabled', false);
                this.gridOptions.isQuickMenuEnabled = isQuickMenuEnabled;
                this.gridView = new Backgrid.Grid(this.gridOptions);
                this.dataGrid.show(this.gridView);

                var gridTitle = this.options.appletConfig.gridTitle;
                if (!_.isUndefined(gridTitle)) {
                    this.$el.find('thead').before('<caption class="sr-only">' + gridTitle + '</caption>');
                } else {
                    this.$el.find('thead').before('<caption class="sr-only">' + this.options.appletConfig.title + '</caption>');
                }
                this.$el.find('table').attr("role", "grid");
                this.$el.find('table thead tr').attr("role", "row");
                this.$el.find('table tbody').addClass("auto-overflow-y");
            },
            isComponentEnabled: function(component) {
                var tileOptions = this.getOption('tileOptions');
                return _.result(_.get(tileOptions, component), 'enabled', false);
            },
            events: {
                'click tr.selectable': 'onClickRow',
                'keydown tr.selectable': 'onEnterRow',
                'keydown th': 'onEnterHeader',
                'dropdown.show': function(e) {
                    this.$('tbody').one('scroll.dropdown.' + this.cid, _.bind(function(event) {
                        this.$('.applet-dropdown.open').trigger('dropdown.hide');
                    }, this));
                },
                'dropdown.hide': function(e) {
                    this.$('tbody').off('scroll.dropdown.' + this.cid);
                },
                'toolbar.show': function(event) {
                    var toolbarOptions = this.getOption('tileOptions') || {};
                    var buttons = _.result(toolbarOptions, 'buttons');
                    if (_.includes(buttons, CrsUtil.getCrsToolBarButtonName())) {
                        CrsUtil.removeStyle(this);
                    }
                }
            },
            onDestroy: function() {
                try {
                    if (this.loadingView && !this.loadingView.isDestroyed) {
                        this.loadingView.destroy();
                        this.loadingView = null;
                    }
                } catch (e) {
                    console.error('Error destroying loadingView in applet:', this.appletConfig.id, e);
                }

                try {
                    if (this.gridView) {
                        if (this.gridView.supportsDestroyLifecycle) {
                            this.gridView.destroy();
                        } else if (!this.gridView.isDestroyed && _.isFunction(this.gridView.remove)) {
                            this.gridView.remove();
                        }
                        delete this.gridView;
                    }
                } catch (e) {
                    console.error('Error destroying gridView in applet:', this.appletConfig.id, e);
                }
                $('#mainModal').off('hidden.bs.modal.' + this.cid);
            },
            onEnterRow: function(event) {
                if (!event.isDefaultPrevented() && (event.which == 13 || event.which == 32)) {
                    $(event.target).click();
                }
            },
            onEnterHeader: function(event) {
                if (event.which == 13 || event.which == 32) {
                    $(event.target).find('a').click();
                }
            },
            onClickRow: function(event, model) {
                if (_.isUndefined(model)) {
                    this.refocusRow = this.$(event.target).closest("tr");
                    model = this.refocusRow.data('model');
                }
                if (this.options.onClickRow) {
                    this.options.onClickRow(model, event, this);
                } else if (this.options.DetailsView) {
                    this.expandRow(model, event);
                }
                //required for 508 compliance with JAWS in IE
                $('#mainModal').one('hidden.bs.modal.' + this.cid, _.bind(function() {
                    this.refocusRow.focus();
                }, this));
            },
            expandRow: function(model, event) {
                var collection = this.options.collection;
                var DetailsView = this.options.DetailsView;
                var row = this.$(event.currentTarget).closest('tr');
                //Remove any bootstrap modal attributes on row
                row.removeAttr('data-toggle');
                row.removeAttr('data-target');
                //remove all special characters from the id
                var id = row.attr('data-row-instanceid');
                id = id.replace(/[^\w\s]/gi, '');
                var detailsId = 'details-' + id;
                var detailsSelector = '#details-' + id;
                var accordionButton = row.find('.btn-accordion');
                if(accordionButton.length === 0) {
                    console.error('508 Error: Must mark the panel control button with the correct expanded or collapsed state, but cannot find any button with class .btn-accordion.');
                }
                if (this.$(detailsSelector).length === 0) {
                    accordionButton.attr('aria-expanded', 'true');
                    var colspan = row.children().length;
                    var td = $('<td/>').addClass('renderable').attr('colspan', colspan).attr('id', detailsId).addClass('expanded-row');
                    var tr = $('<tr/>');
                    td.appendTo(tr);
                    tr.insertAfter(row);
                    var region = {};
                    region[detailsId] = detailsSelector;
                    this.addRegions(region);

                    var detailsView = new DetailsView({
                        model: model,
                        collection: collection
                    });
                    this[detailsId].show(detailsView);
                    //add info button in expanded rows
                    if (collection.length > 0 && !_.isUndefined(this.options.tblRowSelector)) {
                        _.each(this.$(detailsSelector).find('tbody tr'), function(el) {
                            this.$(el).attr({
                                'data-infobutton': this.$(el).find('td:nth-child(2)').text(),
                            });
                        }, this);
                    }
                } else if (this.$(detailsSelector).hasClass('hide')) {
                    this.$(detailsSelector).removeClass('hide');
                    accordionButton.attr('aria-expanded', 'true');
                } else {
                    this.$(detailsSelector).addClass('hide');
                    accordionButton.attr('aria-expanded', 'false');
                }
            }
        });
        GridLayoutView.DataGridRow = GridLayoutView.prototype.DataGridRow;
        return GridLayoutView;
    };

    DataGrid.create = function(options) {
        var Temp = this.returnView();
        return new Temp(options);
    };

    return DataGrid;
});