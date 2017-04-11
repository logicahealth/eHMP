define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/documents/detailCommunicator',
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',

], function (Backbone, Marionette, _, moment, DetailCommunicator, appletHelper, DocDetailsDisplayer) {
    "use strict";
    var DEBUG = false;
    var fetchOptions = {
        cache: true,
        pageable: true,
        allowAbort: true,
        resourceTitle: 'patient-record-document-view'
    };
    //The important changes are in the columns array as well as replacing the dataGridOptions.groupBy logic with this:   dataGridOptions.groupable = this.options.groupView;
    var fullScreenColumns = [{
        name: 'dateDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function (model, string) { //this is what needs to change to server-side sorting
            return model.get('referenceDateTime');
        },
        groupable: true,
        groupableOptions: {
            primary: true,
            innerSort: 'referenceDateTime',
            groupByDate: true,
            groupByFunction: function (collectionElement) {
                if (collectionElement.model !== undefined)
                    return collectionElement.model.get("referenceDateTime").toString().substr(0, 6);
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function (item) {
                return moment(item, "YYYYMM").format("MMMM YYYY");
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
            innerSort: "referenceDateTime"
        },
        hoverTip: 'reports_description'

    }, {
        name: 'kind',
        label: 'Type',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'reports_type'
    }, {
        name: 'authorDisplayName',
        label: 'Author/Verifier',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'reports_enteredby'
    }, {
        name: 'facilityMoniker',
        label: 'Facility',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'reports_facility'
    }];
    var summaryColumns = [fullScreenColumns[0], fullScreenColumns[2], fullScreenColumns[3]];

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function (options) {
            if (DEBUG) console.log("Reports App -----> init start");
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var self = this;
            this.modalCollection = new Backbone.Collection();
            var dataGridOptions = {
                filterEnabled: true, //make sure the filter is actully on screen

                //row click handler
                onClickRow: function (model, event) {
                    if (this.parent !== undefined) {
                        self.modalCollection.reset(model);
                        self.getDetailsModal(model);
                    }
                }
            };
            dataGridOptions.parent = this;
            dataGridOptions.summaryColumns = summaryColumns;
            dataGridOptions.fullScreenColumns = fullScreenColumns;
            dataGridOptions.appletConfig = options.appletConfig;
            dataGridOptions.groupable = true;
            dataGridOptions.filterFields = ['dateDisplay', 'localTitle', 'kind', 'authorDisplayName', 'facilityName'];

            this.listenTo(ADK.Messaging, 'globalDate:selected', function (date) {
                this.loading();
                if (DEBUG) console.log("Reports date filter range----->" + JSON.stringify(date));
                this.dataGridOptions.collection.fetchOptions.criteria.filter = 'or(' + self.buildJdsDateFilter('referenceDateTime') + ',' + self.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))),' + //fill out incomplete consults, images and procedures.
                        'in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result","Surgery"])';
                this.fetchData();
            }, this);
            this.dataGridOptions = dataGridOptions;
            fetchOptions.criteria = {
                    filter: 'or(' + self.buildJdsDateFilter('referenceDateTime') + ',' + self.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))),' + //fill out incomplete consults, images and procedures.
                        'in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result","Surgery"])'
            };
            var model = Backbone.Model.extend({
                parse: function(resp) {
                    ADK.Enrichment.addFacilityMoniker(resp);
                    appletHelper.parseDocResponse(resp);
                    if (resp.complexDoc) {
                        resp.authorDisplayName = appletHelper.stringNormalization(appletHelper.getAuthorVerifier(resp));
                    }
                    return resp;
                }
            });
            //this creates a PageableCollection
            dataGridOptions.collection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
            dataGridOptions.collection.model = model;

            dataGridOptions.collection.fetchOptions = fetchOptions;
            this.listenTo(this.dataGridOptions.collection, 'sync', this.updateCollection);

            this._super.initialize.apply(this, arguments);
            this.fetchData();
        },

        updateCollection: function(collection) {
            var fullCollection = collection.fullCollection || collection;
            fullCollection.each(function(model){
                var complexDocBool = model.get('complexDoc');
                if (complexDocBool && model.get('authorDisplayName').toLowerCase() === 'none') {
                    appletHelper.getResultsFromUid(model, function(additionalDetailCollection){
                        model.set('authorDisplayName', additionalDetailCollection.models[0].get('signerDisplayName'));
                    });
                }
            });
        },
        getDetailsModal: function(detailModel) {
            spawnDetailsModal(detailModel, this);
        }
    });

    // Helper
    function spawnDetailsModal(newModel, view) {
        var complexDocBool = newModel.get('complexDoc');
        var docType = newModel.get('kind');
        var resultDocCollection = new appletHelper.ResultsDocCollection();
        var childDocCollection = new appletHelper.ChildDocCollection();
        appletHelper.getChildDocs.call(view, newModel, childDocCollection);
        if (complexDocBool) {
            resultDocCollection = appletHelper.getResultsFromUid.call(view, newModel, resultDocCollection);
        }

        if (DEBUG) console.log("Reports App -----> spawnDetailsModal");

        var results = DocDetailsDisplayer.getView.call(view, newModel, docType, resultDocCollection, childDocCollection, new Backbone.Collection(newModel));
        var View = results.view.extend({
            model: newModel
        });
        var modalOptions = {
            'size': 'large',
            'title': results.title || DocDetailsDisplayer.getTitle(newModel, docType),
            'nextPreviousCollection': newModel.collection
        };

        var modal = new ADK.UI.Modal({
            view: new View(),
            callbackView: view,
            options: modalOptions
        });
        modal.show();
    }

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
