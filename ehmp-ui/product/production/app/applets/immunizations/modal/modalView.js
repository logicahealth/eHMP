define([
    "jquery",
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "moment",
    'app/applets/immunizations/util',
    "app/applets/immunizations/modal/filterDateRangeView",
    'hbs!app/applets/immunizations/modal/modalTemplate',
  ], function($, Backbone, Marionette, _, Handlebars, moment, Util, FilterDateRangeView, modalTemplate) {
    'use strict';
    var gridOptions = {}, columns, TotalTestModel;

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

    var sharedDateRange;

    function parseModel(response) {
        response = Util.getAdministeredFormatted(response);
        response = Util.getContraindicated(response);
        response = Util.getFacilityColor(response);
        response = Util.getStandardizedName(response);
        response = Util.getObservedFormatted(response);
        response = Util.getObservedTimeFormatted(response);
        response = Util.getResultedFormatted(response);
        response = Util.getResultedTimeFormatted(response);
        response = Util.getNumericDate(response);

        return response;
    }


    var TotalView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{totalTests}}'),
        tagName: 'span',
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        }

    });

   TotalTestModel = Backbone.Model.extend({
        defaults: {
            totalTests: 0
        }
   });

   var comparator = function(modelOne, modelTwo){
        return -modelOne.get('administeredDateTime').localeCompare(modelTwo.get('administeredDateTime'));
    };

    var ModalView =  Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        fetchOptions: {},
        modals: [],
        collectionEvents: {
            'fetch:success': function(collection, response) {
                if (this.showNavHeader) {
                    this.model.set('navHeader', true);
                }

                this.gridOptions.collection = collection;
                var length = _.get(collection, 'fullCollection.length', collection.length);

                this.totalTestModel.set({
                    totalTests: length
                });

                this.dataGrid = ADK.Views.DataGrid.create(this.gridOptions);

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
        modelCollectionEvents: {
            'fetch:success': function(collection, resp) {
                var model = collection.first();
                if (model) this.model.set(model.toJSON());
            }
        },
        modelEvents: {
            'change': function() {
                this.render();
            }
        },
        initialize: function(options) {
            this.gridOptions = _.clone(gridOptions, {
                deep: true
            });
            this.collection = this.getOption('collection') || ADK.PatientRecordService.createEmptyCollection({
                pageable: true
            });
            this.dataCollection = options.gridCollection;
            if (!_.isEmpty(this.dataCollection)) {
                this.dataCollection.comparator = comparator;
            }

            if (this.showNavHeader) {
                this.model.set('navHeader', true);
            }

            this.totalTestModel = new TotalTestModel();

            this.fetchOptions.resourceTitle = 'patient-record-immunization';
            this.fetchOptions.criteria = {
                pid: this.model.get('pid')
            };

            if(this.modelCollection) {
                _.set(this.modelCollection, 'fetchOptions.resourceTitle', this.fetchOptions.resourceTitle);
                this.bindEntityEvents(this.modelCollection, this.modelCollectionEvents);
            }

            this.modalDisplayName = this.model.get('name');

            this.fetchOptions.collectionConfig = {
                collectionParse: _.bind(this.filterCollection, this),
                comparator: comparator
            };

            this.fetchOptions.pageable = true;

            this.gridOptions.appletConfig.gridTitle = 'This table represents the selected immunizations vaccine, ' + this.model.get('name');
            this.getModals();
        },
        getModals: function() {
            var modals = [];
            var dataCollection = this.dataCollection;
            if(this.dataCollection !== undefined){
                _.each(this.dataCollection.models, function(m, key) {
                    if (m.get('immunizations')) {
                        var outterIndex = dataCollection.indexOf(m);
                        _.each(m.get('immunizations').models, function(m2, key) {
                            m2.set({
                                'inAPanel': true,
                                'parentIndex': outterIndex,
                                'parentModel': m
                            });
                            modals.push(m2);

                        });
                    } else {
                        modals.push(m);
                    }
                });
            }
            this.modals = modals;
        },
        regions: {
            leftColumn: '.js-backgrid',
            totalTests: '#totalTests',
            dateRangeFilter: '#dateRangeFilter'
        },
        resetSharedModalDateRangeOptions: function() {
            sharedDateRange = new DateRangeModel();
        },
        onRender: function() {
            if (this.modelCollection && this.modelCollection.isEmpty()) {
                ADK.PatientRecordService.fetchCollection(this.modelCollection.fetchOptions, this.modelCollection);
                return;
            } else {
                ADK.PatientRecordService.fetchCollection(this.fetchOptions, this.collection);
            }
            var dateRange;

            if (sharedDateRange === undefined || sharedDateRange === null) {
                this.resetSharedModalDateRangeOptions();
            }

            if (sharedDateRange !== undefined && sharedDateRange !== null &&
                sharedDateRange.get('preSelectedDateRange') !== undefined &&
                sharedDateRange.get('preSelectedDateRange') !== null) {
                dateRange = sharedDateRange.clone();
            } else {
                dateRange = new DateRangeModel();
            }

            new DateRangeModel();
            var filterDateRangeView = new FilterDateRangeView({
                model: dateRange,
                parentView: this,
                collection: this.collection
            });
            filterDateRangeView.setFetchOptions(this.fetchOptions);
            filterDateRangeView.setSharedDateRange(sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);

            this.leftColumn.show(ADK.Views.Loading.create());
        },
        filterCollection: function(coll) {
            coll.models.forEach(function(model) {
                model.attributes = parseModel(model.attributes);
            });

            var resultColl = [];
            var allTypes = $.unique(coll.pluck('name'));
            var knownTypes = [];
            var displayTypes = knownTypes.filter(function(el) {
                return allTypes.indexOf(el) != -1;
            });
            var newColl = new Backbone.Collection(coll.where({
                name: this.modalDisplayName
            }));

            var momentToDate = moment(sharedDateRange.attributes.toDate).format("YYYYMMDD"),
                momentFromDate = moment(sharedDateRange.attributes.fromDate).format("YYYYMMDD");
            newColl.each(function(column){
                if(column.attributes.numericDate <= momentToDate && (column.attributes.numericDate >= momentFromDate|| sharedDateRange.attributes.fromDate === null)){
                    resultColl.push(column);
                }
            });

            coll.reset(resultColl);
            return resultColl;
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.modelCollection, this.modelCollectionEvents);
        }
    });

    return ModalView;
});
