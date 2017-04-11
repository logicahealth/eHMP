define([
    "jquery",
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    'app/applets/immunizations/util',
    "app/applets/immunizations/modal/filterDateRangeView",
    'hbs!app/applets/immunizations/modal/modalTemplate',
    "app/applets/immunizations/modal/modalHeaderView",
  ], function($, Backbone, Marionette, _, Handlebars, Util, FilterDateRangeView, modalTemplate, modalHeader) {
    'use strict';
    var currentModel, currentCollection, gridOptions = {},
    columns, mockData2, DataGridView, DataGridCollection, chartOptions, Chart, categories, data, fetchCollection = {},
    low, high, TotalTestModel;
    var modals = [],
    panelModals = [], modalDisplayName,
    dataCollection;

    DataGridCollection = Backbone.Collection.extend({});

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

   var totalTestModel = new TotalTestModel();

   var comparator = function(modelOne, modelTwo){
        return -modelOne.get('administeredDateTime').localeCompare(modelTwo.get('administeredDateTime'));
    };

    var ModalView =  Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        fetchOptions: {},
        initialize: function(options) {
            this.loadingView = ADK.Views.Loading.create();
            dataCollection = options.gridCollection;
            if (!_.isEmpty(dataCollection)) {
                dataCollection.comparator = comparator;
            }
            this.getModals();

            if (this.showNavHeader) {
                this.model.attributes.navHeader = true;
            }

            this.fetchOptions.resourceTitle = 'patient-record-immunization';
            this.fetchOptions.criteria = {
                pid: this.model.attributes.pid // "10108V420871"
            };

            modalDisplayName = this.model.attributes.name;


            var self = this;

            this.fetchOptions.collectionConfig = {
                collectionParse: self.filterCollection,
                comparator: comparator
            };

            this.fetchOptions.pageable = true;

            gridOptions.appletConfig.gridTitle = 'This table represents the selected immunizations vaccine, ' + this.model.attributes.name;

            this.fetchOptions.onSuccess = function(collection, response) {
                self.collection = collection;
                self.$el.find('.immunizationsNext, .immunizationsPrev').attr('disabled', false);

                if (self.showNavHeader) {
                    self.model.attributes.navHeader = true;
                }

                gridOptions.collection = self.collection;

                currentModel = options.model;
                self.model = options.model;
                currentCollection = options.collection;

                totalTestModel.set({
                    totalTests: gridOptions.collection.fullCollection.length
                });

                self.dataGrid = ADK.Views.DataGrid.create(gridOptions);

                if (self.leftColumn !== undefined && self.leftColumn !== null) {
                    self.leftColumn.reset();
                    self.leftColumn.show(self.dataGrid);
                }

                gridOptions.collection = self.collection;
                if (collection.length !== 0) {

                    self.paginatorView = ADK.Views.Paginator.create({
                        collection: gridOptions.collection,
                        windowSize: 4
                    });
                    self.$('.js-backgrid').append(self.paginatorView.render().el);
                } else {
                    $('#data-grid-immunizations-modalView').find('tbody').append($('<tr><td>No Records Found</td></tr>'));
                }
            }; // end of onSuccess

            this.fetchOptions.onError = function(resp) {
              var errorModel = new Backbone.Model(resp);
              self.leftColumn.show(ADK.Views.Error.create({
                model: errorModel
              }));
            };
        },
        events: {
            'click .immunizationsNext': 'getNextModal',
            'click .immunizationsPrev': 'getPrevModal'
        },
        getNextModal: function(e) {
            var next = _.indexOf(modals, this.model) + 1;
            if (next >= modals.length) {
                this.getModals();
                next = 0;
            }
            var model = modals[next];
            this.setNextPrevModal(model, e);

        },
        getPrevModal: function(e) {
            var next = _.indexOf(modals, this.model) - 1;
            if (next < 0) {
                this.getModals();
                next = modals.length - 1;
            }
            var model = modals[next];

            this.setNextPrevModal(model, e);

        },
        getModals: function() {
            modals = [];
            panelModals = [];
            if(dataCollection !== undefined){
                _.each(dataCollection.models, function(m, key) {
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
        },
        setNextPrevModal: function(model, e) {
            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }
            if (model.get('inAPanel')) {
                var dataTableEl = $('#data-grid-' + this.options.appletConfig.instanceId);
                var tr = $(dataTableEl + ' > tbody>tr.selectable').eq(model.get('parentIndex'));
                if (!tr.data('isOpen')) {
                    tr.trigger('click');
                }
                $(dataTableEl + ' > tbody>tr.selectable').not(tr).each(function() {
                    var $this = $(this);
                    if ($this.data('isOpen')) {
                        $this.trigger('click');
                    }
                });

            }

            var view = new ModalView({
                model: model,
                gridCollection: dataCollection,
                navHeader: this.showNavHeader
            });

            var siteCode = ADK.UserService.getUserSession().get('site'),
                pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

            var modalOptions = {
                'title': 'Vaccine - ' + model.get('name'),
                'size': 'xlarge',
                'headerView': modalHeader.extend({
                    model: model,
                    theView: view
                })
            };

            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').find('#' + e).focus();
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
                parentView: this
            });
            filterDateRangeView.setFetchOptions(this.fetchOptions);
            filterDateRangeView.setSharedDateRange(sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);

            this.leftColumn.show(this.loadingView);

            self.collection = ADK.PatientRecordService.fetchCollection(this.fetchOptions);
        },filterCollection: function(coll) {
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
                name: modalDisplayName
            }));

            //TODO: Remove once resource gets created
            var momentToDate = moment(sharedDateRange.attributes.toDate).format("YYYYMMDD"),
                momentFromDate = moment(sharedDateRange.attributes.fromDate).format("YYYYMMDD");
            newColl.each(function(column){
                if(column.attributes.numericDate <= momentToDate && (column.attributes.numericDate >= momentFromDate|| sharedDateRange.attributes.fromDate === null)){
                    resultColl.push(column);
                }
            });

            return resultColl;
        }
    });

    return ModalView;
});
