define([
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'app/applets/immunizations/util',
    'app/resources/fetch/immunizations/utils',
    'app/applets/immunizations/modal/filterDateRangeView',
    'hbs!app/applets/immunizations/modal/modalTemplate'
], function($, Backbone, Marionette, _, Handlebars, moment, Util, ResourcePoolUtils, FilterDateRangeView, modalTemplate) {
    'use strict';
    var gridOptions = {},
        columns, TotalTestModel;

    columns = [{
        name: "administeredFormatted",
        label: "Date",
        cell: "string",
        sortable: false
    }, {
        name: "summary",
        cell: "string",
        label: "Summary",
        sortable: false
    }, {
        name: "reactionName",
        cell: "handlebars",
        label: "Reaction",
        template: Handlebars.compile('{{#if reactionName}}{{reactionName}}{{else}}NONE{{/if}}'),
        sortable: false
    }, {
        name: "seriesName",
        cell: "string",
        label: "Series",
        sortable: false
    }, {
        name: "contraindicatedDisplay",
        cell: "string",
        label: "Repeat Contraindicated",
        sortable: false
    }, {
        name: "facilityName",
        label: "Facility",
        cell: "string",
        sortable: false
    }];

    gridOptions.columns = columns;
    gridOptions.appletConfig = {
        name: 'immunizations_modal',
        id: 'immunizations-modalView',
        simpleGrid: true
    };

    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('years', 1).format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD")
        }
    });


    TotalTestModel = Backbone.Model.extend({
        defaults: {
            totalTests: 0
        }
    });

    var ModalView = Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        collectionEvents: {
            'fetch:success': function(collection) {
                this.updateMatchingModel(collection);

                if (this.showNavHeader) {
                    this.model.set('navHeader', true);
                }

                this.gridOptions.collection = collection;
                var length = _.get(collection, 'fullCollection.length', collection.length);

                this.totalTestModel.set({
                    totalTests: length
                });

                var DataGrid =  ADK.Views.DataGrid.returnView();
                DataGrid = DataGrid.extend({
                    DataGridRow: DataGrid.DataGridRow.extend({
                        serializeModel: function() {
                            var data = this.model.toJSON();
                            data.administeredFormatted = ResourcePoolUtils.formatAdministeredDateTime(_.get(data, 'administeredDateTime', ''));
                            data.contraindicatedDisplay = Util.createContraindicated(_.get(data, 'contraindicated', ''));
                            data.facilityColor = Util.createFacilityColor(_.get(data, 'facilityCode', ''));
                            data.standardizedName = ResourcePoolUtils.createStandardizedName(_.get(data, 'codes', ''));
                            data.observedFormatted = Util.formatDate(_.get(data, 'observed', ''));
                            data.observedTimeFormatted = Util.formatTime(_.get(data, 'observed', ''));
                            data.resultedFormatted = Util.formatDate(_.get(data, 'resulted', ''));
                            data.resultedTimeFormatted = Util.formatTime(_.get(data, 'resulted', ''));
                            data.numericDate = Util.formatNumericDate(_.get(data, 'administeredDateTime', ''));
                            return data;
                        }
                    })
                });
                this.dataGrid = new DataGrid(this.gridOptions);

                if (this.leftColumn !== undefined && this.leftColumn !== null) {
                    this.leftColumn.reset();
                    this.leftColumn.show(this.dataGrid);
                }

                var collectionsPageSize = _.get(collection, 'state.pageSize', null);
                if (collection.length !== 0) {
                    if (length <= collectionsPageSize) {
                        this.$('.js-backgrid').append('<div class="backgrid-paginator"></div>');
                    } else {
                        this.paginatorView = ADK.Views.Paginator.create({
                            collection: gridOptions.collection,
                            windowSize: 4
                        });
                        this.$('.js-backgrid').append(this.paginatorView.render().el);
                    }
                } else {
                    $('#data-grid-immunizations-modalView').find('tbody').append($('<tr><td>No Records Found</td></tr>'));
                }
            },
            'fetch:error': function(resp) {
                var errorModel = new Backbone.Model(resp);
                this.leftColumn.show(ADK.Views.Error.create({
                    model: errorModel
                }));
            }
        },
        childEvents: {
            'date:range:collection:fetch': function(filterDateRangeView) {
                this.collection.fetchCollection(undefined, filterDateRangeView.observedFrom, filterDateRangeView.observedTo);
                this.leftColumn.show(ADK.Views.Loading.create());
            }
        },
        modelEvents: {
            'change': 'render'
        },
        initialize: function() {
            this.gridOptions = _.clone(gridOptions, {
                deep: true
            });

            if (this.showNavHeader) {
                this.model.set('navHeader', true);
            }

            this.totalTestModel = new TotalTestModel();

            this.modalDisplayName = this.model.get('name');

            this.gridOptions.appletConfig.gridTitle = 'This table represents the selected immunizations vaccine, ' + this.model.get('name');

            this.collection = new ADK.UIResources.Fetch.Immunizations.Collection([], {
                isClientInfinite: true,
                collectionParse: _.bind(this.filterCollection, this)
            });
            this.collection.fetchCollection();

            if (this.sharedDateRange === undefined || this.sharedDateRange === null) {
                this.resetSharedModalDateRangeOptions();
            }
        },
        regions: {
            leftColumn: '.js-backgrid',
            totalTests: '#totalTests',
            dateRangeFilter: '#dateRangeFilter'
        },
        resetSharedModalDateRangeOptions: function() {
            this.sharedDateRange = new DateRangeModel();
        },
        onRender: function() {
            var dateRange;

            if (this.sharedDateRange !== undefined && this.sharedDateRange !== null &&
                this.sharedDateRange.get('preSelectedDateRange') !== undefined &&
                this.sharedDateRange.get('preSelectedDateRange') !== null) {
                dateRange = this.sharedDateRange.clone();
            } else {
                dateRange = new DateRangeModel();
            }

            var filterDateRangeView = new FilterDateRangeView({
                model: dateRange,
                parentView: this,
                collection: this.collection
            });
            filterDateRangeView.setSharedDateRange(this.sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);

            this.leftColumn.show(ADK.Views.Loading.create());
        },
        updateMatchingModel: function(collection) {
            if (_.isString(this.getOption('uid'))) {
                var matchingModel = collection.findWhere({
                    uid: this.getOption('uid')
                });
                if (!_.isUndefined(matchingModel)) {
                    this.model.set(matchingModel.attributes);
                }
            }
        },
        filterCollection: function(coll) {
            coll.models.forEach(function(model) {
                if (model.get('administeredDateTime')) {
                    model.set('numericDate', ADK.utils.formatDate(model.get('administeredDateTime'), 'YYYYMMDD'));
                }
            });

            var resultColl = [];
            var newColl = new Backbone.Collection(coll.where({
                name: this.modalDisplayName
            }));

            var momentToDate = moment(this.sharedDateRange.get('toDate')).format("YYYYMMDD"),
                momentFromDate = moment(this.sharedDateRange.get('fromDate')).format("YYYYMMDD");
            newColl.each(function(column) {
                if (column.get('numericDate') <= momentToDate && (column.get('numericDate') >= momentFromDate || this.sharedDateRange.get('fromDate') === null)) {
                    resultColl.push(column);
                }
            }, this);
            this.updateMatchingModel(coll);
            coll.reset(resultColl);
            return resultColl;
        }
    });

    return ModalView;
});