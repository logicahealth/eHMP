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
    'backgrid-moment-cell',
    'main/backgrid/extensions/defaultOverrides',
    'backgrid.filter',
    'backgrid.paginator'
], function(Backbone, Marionette, $, _, Backgrid, dataGridView, DataGridRow, HeaderCell, GroupByBody, GroupByHeader, CrsUtil) {
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
            this.$el.attr("aria-live","assertive");
            var td = document.createElement("td");
            td.setAttribute("colspan", this.columns.length);
            var span = document.createElement("span");
            span.innerHTML = _.result(this, "emptyText");
            td.appendChild(span);

            this.el.className = "empty";
            this.el.appendChild(td);

            return this;
        }
    });

    DataGrid.returnView = function(options) {
        var GridLayoutView = dataGridView.extend({
            initialize: function() {
                this.options = options;
                this.appletConfig = options.appletConfig;
                var groupableOptions = {};
                _.each(options.columns, function(column) {
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

                var body = options.groupable ? GroupByBody : options.body || undefined;

                var row;

                if (options.toolbarOptions) {
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
                    row = DataGridRow.extend({
                        showLinksButton: options.showLinksButton,
                        toolbarOptions: options.toolbarOptions,
                        behaviors: {
                            FloatingToolbar: {
                                buttonTypes: options.toolbarOptions.buttonTypes || ['infobutton', 'detailsviewbutton'],
                                DialogContainer: '.toolbar-container',
                                disableNonLocal: options.toolbarOptions.disableNonLocal || false,
                            }
                        }
                    });
                } else if (options.appletConfig.simpleGrid && !_.isUndefined(options.appletConfig.simpleGrid) && !_.isNull(options.appletConfig.simpleGrid)) {
                    row = DataGridRow.extend({
                        simpleGrid: options.appletConfig.simpleGrid
                    });
                } else {
                    row = DataGridRow;
                }

                this.gridOptions = {
                    id: 'data-grid-' + (options.appletConfig.instanceId || options.appletConfig.id),
                    className: 'backgrid table table-hover',
                    row: row,
                    body: body,
                    columns: options.columns,
                    collection: options.collection,
                    emptyText: options.emptyText,
                    groupableOptions: groupableOptions
                };
            },
            onBeforeShow: function() {
                this.gridView = new Backgrid.Grid(this.gridOptions);
                this.dataGrid.show(this.gridView);

                var gridTitle = options.appletConfig.gridTitle;
                if (!_.isUndefined(gridTitle)) {
                    this.$el.find('thead').before('<caption class="sr-only">' + gridTitle + '</caption>');
                } else {
                    this.$el.find('thead').before('<caption class="sr-only">' + options.appletConfig.title + '</caption>');
                }
                this.$el.find('table').attr("role", "grid");
                this.$el.find('table thead tr').attr("role", "row");
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
                    var toolbarOptions = _.get(this, 'options.toolbarOptions');
                    var buttonTypes = _.result(toolbarOptions, 'buttonTypes');
                    if (_.includes(buttonTypes, CrsUtil.getCrsToolBarButtonName())) {
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
                $('#mainModal').off('hidden.bs.modal.'+this.cid);
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
            onClickRow: function(event) {
                if (this.options.toolbarOptions) {
                    return;
                }
                var row = this.$(event.target).closest("tr");
                var model = row.data('model');
                if (this.options.onClickRow) {
                    this.options.onClickRow(model, event, this);
                } else if (this.options.DetailsView) {
                    this.expandRow(model, event);
                }
                //required for 508 compliance with JAWS in IE
                $('#mainModal').one('hidden.bs.modal.'+this.cid, _.bind(function () {
                  row.focus();
                },this));
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
                if (this.$(detailsSelector).length === 0) {
                    row.attr({ 'aria-expanded': 'true', 'title': 'Press enter to collapse accordion' }).focus();
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
                            }).find('td:first-child').prepend("<span class='sr-only toolbar-instructions'>Press enter to open the toolbar menu.</span>");
                        }, this);
                    }
                } else if (this.$(detailsSelector).hasClass('hide')) {
                    this.$(detailsSelector).removeClass('hide');
                    row.attr({ 'aria-expanded': 'true', 'title': 'Press enter to collapse accordion' }).focus();
                } else {
                    this.$(detailsSelector).addClass('hide');
                    row.attr({ 'aria-expanded': 'false', 'title': 'Press enter to expand accordion' });
                }
            }
        });
        return GridLayoutView;
    };

    DataGrid.create = function(options) {
        var Temp = this.returnView(options);
        return new Temp();
    };

    return DataGrid;
});
