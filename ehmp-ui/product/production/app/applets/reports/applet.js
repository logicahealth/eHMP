define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/documents/detailCommunicator',
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',

], function(Backbone, Marionette, _, moment, DetailCommunicator, appletHelper, DocDetailsDisplayer) {
    'use strict';

    //The important changes are in the columns array as well as replacing the dataGridOptions.groupBy logic with this:   dataGridOptions.groupable = this.options.groupView;
    var fullScreenColumns = [{
        name: 'dateDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, string) { //this is what needs to change to server-side sorting
            return model.get('referenceDateTime');
        },
        groupable: true,
        groupableOptions: {
            primary: true,
            innerSort: 'referenceDateTime',
            groupByDate: true,
            groupByFunction: function(collectionElement) {
                if (collectionElement.model !== undefined)
                    return collectionElement.model.get('referenceDateTime').toString().substr(0, 6);
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function(item) {
                return moment(item, 'YYYYMM').format('MMMM YYYY');
            }
        },
        hoverTip: 'reports_date'
    }, {
        name: 'localTitle',
        label: 'Description',
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
        }),
        groupable: true,
        groupableOptions: {
            innerSort: 'referenceDateTime'
        },
        hoverTip: 'reports_description'

    }, {
        name: 'kind',
        label: 'Type',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: 'referenceDateTime'
        },
        hoverTip: 'reports_type'
    }, {
        name: 'authorDisplayName',
        label: 'Author/Verifier',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: 'referenceDateTime'
        },
        hoverTip: 'reports_enteredby'
    }, {
        name: 'facilityMoniker',
        label: 'Facility',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: 'referenceDateTime'
        },
        hoverTip: 'reports_facility'
    }];
    var summaryColumns = [fullScreenColumns[0], fullScreenColumns[2], fullScreenColumns[3]];
    var DEFAULT_FILTER = 'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))),' +
        'in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result","Surgery"])';

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            this.modalCollection = new Backbone.Collection();
            var dataGridOptions = {
                filterEnabled: true, //make sure the filter is actully on screen
                onClickRow: function(model, event) {
                    if (this.parent !== undefined) {
                        this.parent.modalCollection.reset(model);
                        this.parent.getDetailsModal(model);
                    }
                }
            };
            dataGridOptions.parent = this;
            dataGridOptions.summaryColumns = summaryColumns;
            dataGridOptions.fullScreenColumns = fullScreenColumns;
            dataGridOptions.appletConfig = options.appletConfig;
            dataGridOptions.groupable = true;
            dataGridOptions.filterFields = ['dateDisplay', 'localTitle', 'kind', 'authorDisplayName', 'facilityName'];

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(date) {
                this.loading();
                this.dataGridOptions.collection.fetchCollection({
                    criteria: {
                        filter: this.getJdsFilter()
                    }
                });
            }, this);
            this.dataGridOptions = dataGridOptions;
            var fetchOptions = {
                criteria: {
                    filter: this.getJdsFilter()
                }
            };

            this.dataGridOptions.collection = new ADK.UIResources.Fetch.Document.DocumentViews.PageableCollection({
                isClientInfinite: true
            });
            this.listenTo(this.dataGridOptions.collection, 'sync', this.updateCollection);
            this.dataGridOptions.collection.fetchCollection(fetchOptions);

            this._super.initialize.apply(this, arguments);
        },
        updateCollection: function(collection) {
            var fullCollection = collection.fullCollection || collection;
            fullCollection.each(function(model) {
                var complexDocBool = model.get('complexDoc');
                if (complexDocBool && model.get('authorDisplayName').toLowerCase() === 'none') {
                    appletHelper.getResultsFromUid(model, function(additionalDetailCollection) {
                        model.set('authorDisplayName', additionalDetailCollection.models[0].get('signerDisplayName'));
                    });
                }
            });
        },
        getJdsFilter: function() {
            return 'or(' + this.buildJdsDateFilter('referenceDateTime') + ',' + this.buildJdsDateFilter('dateTime') + '),' + DEFAULT_FILTER;
        },
        getDetailsModal: function(detailModel) {
            var complexDocBool = detailModel.get('complexDoc');
            var docType = detailModel.get('kind');
            var resultDocCollection = new ADK.UIResources.Fetch.Document.Collections.ResultsByUidCollection();
            var childDocCollection = new ADK.UIResources.Fetch.Document.Collections.DocumentCollection();
            appletHelper.getChildDocs.call(this, detailModel, childDocCollection);
            if (complexDocBool) {
                resultDocCollection = appletHelper.getResultsFromUid.call(this, detailModel, resultDocCollection);
            }

            var results = DocDetailsDisplayer.getView(detailModel, docType, resultDocCollection, childDocCollection, new Backbone.Collection(detailModel));
            var View = results.view.extend({
                model: detailModel
            });
            var modalOptions = {
                'size': 'large',
                'title': results.title || DocDetailsDisplayer.getTitle(detailModel, docType),
                'nextPreviousCollection': detailModel.collection
            };

            var modal = new ADK.UI.Modal({
                view: new View(),
                callbackView: this,
                options: modalOptions
            });
            modal.show();
        }
    });

    var applet = {
        id: 'reports',
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView,
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };
    DetailCommunicator.initialize(applet.id);
    return applet;
});