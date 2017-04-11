define([
    'backbone',
    'backgrid',
    "main/backgrid/extensions/groupBy/groupByHelper",
    "hbs!main/backgrid/extensions/groupBy/groupByCellTemplate"
], function (Backbone, Backgrid, GroupByHelper, groupByCellTemplate) {
    "use strict";

    var DATE_FORMAT = "YYYYMMDDHHmmSSsss";
    var DATE_LENGTH =  DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');

    var GroupedByRow = Backgrid.Row.extend({
        events: {
            //the rows are already using the data-toggle/data-target attributes for the modal views.
            'click': 'toggleRows',
            'keydown': 'onEnter'
        },
        className: "group-by-header",
        toggleRows: function (event) {
            event.preventDefault();
        },
        onEnter: function (event) {
            if (event.which === 13 || event.which === 32) {
                event.preventDefault();
                this.$(event.target).find('td.group-by-header').click();
            }
        }
    });

    var GroupedByCell = Backgrid.Cell.extend({
        events: {
            'click': 'toggleRowItems',
            'keydown': 'keydown'
        },
        className: "group-by-header selectable fa fa-caret-down",
        render: function () {
            this.$el.html(groupByCellTemplate(this.model.toJSON()));
            this.el.setAttribute('colspan', this.model.get("spanSize"));
            return this;
        },
        toggleRowItems: function () {
            var button = this.$('button');
            var el = this.$el;
            var badge = el.find('.group-by-count-badge');
            var ariaValue = button.attr('aria-expanded');

            el.toggleClass('fa-caret-right').toggleClass('fa-caret-down');
            if (ariaValue ==='true') { 
                badge.removeClass('hidden');
                button.attr({
                    'aria-expanded' : 'false',
                    'title' : 'Press enter to expand ' + this.model.get('title') + ' accordion.'
                }).find('.sr-only').attr('aria-hidden', 'false');
            } else { 
                badge.addClass('hidden');
                button.attr({
                    'aria-expanded' : 'true',
                    'title' : 'Press enter to collapse ' + this.model.get('title') + ' accordion.'
                }).find('.sr-only').attr('aria-hidden', 'true');
            }
            button.blur().focus(); //Doing this so that JAWS Screen Reader will properly read the aria and title attributes
        },
        keydown: function(event) {
            if (event.which === 13 || event.which === 32) {
                this.$(event.target).closest('td.group-by-header').click();
            }
        }
    });

    var GroupByBody = Backgrid.Body.extend({
        initialize: function (options) {
            //find the primaryColumn
            this.options = options;
            this.primaryColumn = _.find(this.options.columns.models, function (column) {
                return column.get("groupableOptions") && column.get("groupableOptions").primary;
            });
            //set up the initial column to group by (the primary one)
            if (this.primaryColumn && this.primaryColumn.get('groupableOptions')) {
                this.groupByFunction = this.primaryColumn.get('groupableOptions').groupByFunction;
                this.groupByRowFormatter = this.primaryColumn.get('groupableOptions').groupByRowFormatter;
            }

            //if the groupBy and formatter functions are null, use defaults
            if(!this.groupByFunction) {
                this.groupByFunction = function(item) {
                    return item.model.get(primaryColumn.name);
                };
            }
            if (!this.groupByRowFormatter) {
                this.groupByRowFormatter = function (group) {
                    return group;
                };
            }
            this._super = Backgrid.Body.prototype;
            this._super.initialize.apply(this, arguments);
            this.listenTo(this.collection, "backgrid:groupBy", this.sortForGroupBy);
            this.sortForGroupBy(this.primaryColumn);
        },
        render: function () {
            this.$el.empty();
            var fragment = document.createDocumentFragment();

            //should this be done here?
            if (this.collection !== undefined && !GroupByHelper.isEmptyCollection(this.collection)) {
                this.groupedRows = GroupByHelper.aggregateBy(this.rows, this.groupByFunction);
            } else {
                this.groupedRows = undefined;
            }

            if (this.groupedRows === undefined) {
                for (var i = 0; i < this.rows.length; i++) {
                    var row = this.rows[i];
                    fragment.appendChild(row.render().el);
                }

            }
            else { //have grouped rows
                _.each(this.groupedRows, function (item) {
                    var key = item[0];
                    var group = item[1];
                    //insert groupedBy row here
                    var title = this.groupByRowFormatter(key);
                    var groupedByRow = new GroupedByRow({
                        columns: {name: 'title', hidden: true, editable: false, cell: GroupedByCell},
                        model: new Backbone.Model({
                            id: key,
                            title: title,
                            count: group.length,
                            spanSize: this.columns.length,
                            cell: 'string'
                        })
                    });
                    fragment.appendChild(groupedByRow.render().el);
                    _.each(group, function (row) {
                        fragment.appendChild(row.render().el);
                    });

                }, this);
            }
            this.el.appendChild(fragment);
            this.delegateEvents();
            return this;
        },

        // This is called from an `add` event and only behaves differently than the default implementation
        // when isClientInfinite is set to true in Backbone.pageable
        insertRow: function (model, collection, options) {
            if (this.collection.isClientInfinite && (this.hasOwnProperty('groupByFunction') && this.groupByFunction instanceof Function)) {
                // This part of the code is copied directly from the backgrid library.

                if (this.rows[0] instanceof Backgrid.EmptyRow) this.rows.pop().remove();

                // insertRow() is called directly
                if (!(collection instanceof Backbone.Collection) && !options) {
                    this.collection.add(model, (options = collection));
                    return;
                }

                var row = new this.row({
                    columns: this.columns,
                    model: model
                });

                // This part is where we will deal with groupable collections
                return this._groupInsertRow(row, model, collection);
            }
            this._super.insertRow.call(this, model, collection, options);
        },

        /** @private */
        _groupInsertRow: function (row, model, collection) {
            // Makes sure that groups are maintained during the insert

            var group = this.groupByFunction(row);
            var groupedRows = this.groupedRows;
            var groupIndex = groupedRows.length - 1;

            if (this.groupRow === undefined) {
                // This only looks up once on the first render while the dom is still small
                // afterwards the first find it will keep a copy of the last element in memory
                this.groupRow = this.$el.find('tr.group-by-header').last().find('span').last();
            }

            if (group === groupedRows[groupIndex][0]) {
                // No new header is needed
                groupedRows[groupIndex][1].push(model);
            } else {
                // Need to create a new header
                var title = this.groupByRowFormatter(group);
                var groupedByRow = new GroupedByRow({
                    columns: {name: 'title', hidden: true, editable: false, cell: GroupedByCell},
                    model: new Backbone.Model({
                        id: group,
                        title: title,
                        count: 0, // Will be updated bellow
                        spanSize: this.columns.length,
                        cell: 'string'
                    })
                });
                groupedRows.push([group, [model]]);
                var $groupEl = groupedByRow.render().el;
                this.groupRow = $($groupEl).find('span').last();
                this.el.appendChild($groupEl);
            }

            // Update group count
            var count = this.groupRow.text();
            count = parseInt(count);
            this.groupRow.text(count + 1);

            // Find the row that matches the model
            var index = collection.indexOf(model);
            this.rows.splice(index, 0, row);
            var $rowEl = row.render().el;
            this.el.appendChild($rowEl);
            return this;
        },

        /**
         * Sort the collection in a way to prepare it for the grouping by functionality in the render method.
         *
         * @param col
         * @param direction
         */
        sortForGroupBy: function (col, direction) {
            var order = this.convertDirection(direction), comparator, column;

            if (order) {
                column = col;
            }
            else { //use the default Primary grouping and sort order, this is based off of the primary column
                column = this.primaryColumn;
                order = 1;
            }

            //need to sort first by the groupBy category and then by the innerSort
            //comparator = this.makeComparator(column.get("name"), column.get('groupableOptions').innerSort, order);
            comparator = this.makeComparator(column, order);
            var refDateComparator = function (model) {
                // I Think I must have hit the auto refactor on this file.
                // This is the only thing I changed 02/09/16
                var timeCompare = model.get('referenceDateTime');
                if (timeCompare.length !== DATE_LENGTH) {
                    timeCompare = String(timeCompare + ZERO_FILL).substr(0, DATE_LENGTH);
                }
                return -timeCompare * order;
            };
            this.groupByFunction = (column.get('groupableOptions') && column.get('groupableOptions').groupByFunction) || function (item) {
                    return item.model.get(column.get('name'));
                };
            this.groupByRowFormatter = column.get('groupableOptions') && column.get('groupableOptions').groupByRowFormatter || function (group) {
                    return group;
                };

            if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
                if (this.collection.fullCollection) {
                    //use the updated Comparator
                    if (column.get('groupableOptions').groupByDate) {
                        this.collection.fullCollection.comparator = refDateComparator;
                    } else {
                        this.collection.fullCollection.comparator = column.get('groupableOptions').comparator || comparator;
                    }

                    this.collection.fullCollection.sort();

                }
                else {
                    //does a server side sort??? Not sure this is implemented in the RDK.
                    //not sure how to add the sorts in
                    this.collection.fetch({reset: true});
                }
            }
            else {

                if (column.get('groupableOptions').groupByDate) {
                    this.collection.comparator = refDateComparator;
                } else if (_.isUndefined(direction) || _.isNull(direction)){
                    this.collection.comparator = column.get('groupableOptions').comparator || comparator;
                }else{
                    this.collection.comparator = comparator;
                }
                //calling the sort function here will automatically trigger a Body.refresh call, which will call the render method which does the grouping.
                this.collection.sort();
            }

            //reset the direction on the *col* not column (impacts case where direction/order is null. directional arrow on clicked on column (col) won't
            //get removed
            col.set("direction", direction);
            return this;

        },
        /** convert the direction parameter oto a -1 or 1 (ascending or descending)
         *
         */
        convertDirection: function (direction) {
            var order;
            if (direction === "ascending") order = -1;
            else if (direction === "descending") order = 1;
            else order = null;

            return order;
        },
        makeComparator: function (column, order) {
            var modelExtractor = this.modelExtractor;

            //the primary sort needs to be based off of the groupByColumn, it can't be based off of the column  name
            //For example, if we're grouping by year & month, with an inner sort, if we compare by the column, there won't
            //be any tie, which means the inner sort can't do its thing.
            var secondarySort = column.get('groupableOptions').innerSort;

            // custom innersort comparator
            var secondarySortValue = column.get('groupableOptions').innerSortValue || function (left, right) {
                    if (left === right) return 0;
                    else if (left > right) return -1;
                    return 1;
                };

            //either the name of the column, or the group by function;
            return function (left, right) {
                // extract the values from the models
                var l, r, t;

                if (column.get('groupableOptions') && column.get('groupableOptions').groupByFunction) {
                    //the groupByFunction is expected to work on a an object which contains a model (Backgrid.Rows to be exacty)
                    // , not an model.
                    l = column.get('groupableOptions').groupByFunction({model: left});
                    r = column.get('groupableOptions').groupByFunction({model: right});
                }

                l = l || modelExtractor(left, column.get('name'));
                r = r || modelExtractor(right, column.get('name'));


                // if descending order, swap left and right
                if (order === 1) t = l, l = r, r = t;
                // compare as usual
                if (l === r) {
                    if (secondarySort) {
                        var innerL = modelExtractor(left, secondarySort), innerR = modelExtractor(right, secondarySort);
                        return secondarySortValue(innerL, innerR);
                    } else return 0;
                }
                else if (l < r) return -1;
                return 1;
            };


        },
        modelExtractor: function (model, key) {
            if (model.get(key)) {
                return model.get(key).toLowerCase();
            }
            else {
                return '';
            }
        }

    });
    return GroupByBody;

});
