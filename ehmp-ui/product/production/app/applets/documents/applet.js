define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'handlebars',
    'app/applets/documents/debugFlag',
    'app/applets/documents/detailCommunicator',
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',
    'app/applets/documents/collectionHandler',
    'app/applets/notes/writeback/formUtil',
    'app/applets/documents/modalFooter',
    'app/applets/documents/docUtils'
], function (Backbone, Marionette, _, moment, Handlebars, DEV, DetailCommunicator, appletHelper, DocDetailsDisplayer,
    CollectionHandler, NotesFormUtil, ModalFooter, DocUtils) {
    "use strict";

    var DEBUG = DEV.flag;
    var fetchOptions = {
        cache: true,
        pageable: true,
        resourceTitle: 'patient-record-document-view',
        allowAbort: true,
    };
    //var DEBUG = true;
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
                return collectionElement.model.get("referenceDateTime").substr(0, 6);
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function (item) {
                return moment(item, "YYYYMM").format("MMMM YYYY");
            }
        },
        hoverTip: 'documents_date'
    }, {
        name: 'localTitle',
        label: 'Description',
        flexWidth: 'flex-width-2',
        cell: Backgrid.HandlebarsCell.extend ({
            className: 'handlebars-cell flex-width-2'
        }),
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        template: Handlebars.compile('{{localTitle}}{{#if addendaText}} <strong>(w/ Addendum)</strong> {{/if}}'),
        hoverTip: 'documents_description'
    }, {
        name: 'kind',
        label: 'Type',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'documents_type'
    }, {
        name: 'authorDisplayName',
        label: 'Author or Verifier',
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'documents_enteredby'
    }, {
        name: 'facilityName',
        label: 'Facility',
        cell: 'handlebars',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        template: Handlebars.compile('{{facilityName}}{{#if dodComplexNoteUri}}*{{/if}}'),
        hoverTip: 'documents_facility'
    }];
    var summaryColumns = [fullScreenColumns[0], fullScreenColumns[2], fullScreenColumns[3]];

    //------------------------------------------------------------

    var filterOptions = {
        filterFields: ['dateDisplay', 'localTitle', 'kind', 'authorDisplayName', 'facilityName', 'imageLocation', 'dateTimeDisplay', 'orderName', 'reason']
    };
    //------------------------------------------------------------

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function (options) {
            if (DEBUG) console.log("Doc Tab App -----> init start");
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var self = this;
            var dataGridOptions = {
                filterEnabled: true,
                onClickRow: function (model, event, gridView) {
                    var docType = model.get('kind');
                    var complexDocBool = model.get('complexDoc');
                    var resultDocCollection;
                    var childDocCollection = appletHelper.getChildDocs.call(gridView, model);

                    if (complexDocBool) {
                        resultDocCollection = appletHelper.getResultsFromUid.call(gridView, model);
                    }

                    if (this.parent !== undefined) {
                        self.changeModelAndView(model, docType, resultDocCollection, childDocCollection);
                    }

                    //  show visual indicator of active row
                    var $target = $(event.target);
                    this.parent.$("#data-grid-documents").find("tr.active").removeClass('active');
                    if ($target.hasClass('selectable')) {
                        $target.addClass('active');
                    } else if ($target.parent().hasClass('selectable')) {
                        $target.parent().addClass('active');
                    }
                }
            };
            dataGridOptions.parent = this;
            dataGridOptions.appletConfig = options.appletConfig;
            dataGridOptions.groupable = true;
            if (ADK.UserService.hasPermission('sign-note') && ADK.UserService.hasPermission('add-encounter')) {
                dataGridOptions.onClickAdd = function (event) {
                    var notesFormOptions = {
                        model: undefined,
                        showVisit: true,
                        isEdit: false,
                        openTrayOnDestroy: false
                    };
                    NotesFormUtil.launchNoteForm(notesFormOptions);
                };
            } else {
                dataGridOptions.onClickAdd = undefined;
            }

            if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else {
                dataGridOptions.columns = fullScreenColumns;
            }
            dataGridOptions.filterFields = filterOptions.filterFields;
            this.listenTo(ADK.Messaging, 'globalDate:selected', function (date) {
                this.loading();
                if (DEBUG) console.log("Doc Tab date filter range----->" + JSON.stringify(date));
                this.dataGridOptions.collection.fetchOptions.criteria.filter = 'or(' + this.buildJdsDateFilter('referenceDateTime') + ',' + this.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))'; //fill out incomplete consults, images and procedures.;
                this.fetchData();

            }, this);
            this.dataGridOptions = dataGridOptions;
            fetchOptions.criteria = {
                    filter: 'or(' + this.buildJdsDateFilter('referenceDateTime') + ',' + this.buildJdsDateFilter('dateTime') + '),' +
                        'not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))' //fill out incomplete consults, images and procedures.
            };
            var model = Backbone.Model.extend({
                parse: function(resp) {
                    ADK.Enrichment.addFacilityMoniker(resp);
                    appletHelper.parseDocResponse(resp);
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

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:added', function(model) {
                this.refresh({});
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:deleted', function(model) {
                this.refresh({});
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:signed', function(model) {
                this.refresh({});
            });
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

        changeModelAndView: function (newModel, docType, resultDocCollection, childDocCollection, modelCollection) {
            var self = this;
            if (newModel.get('documentClass') === "PROGRESS NOTES") {
                DocUtils.getDoc.call(this, newModel.get('uid'), function (error, model) {
                    if (error || !model) {
                        DocUtils.showDocError.call(this);
                    } else {
                        self.changeModelView(model, docType, resultDocCollection, childDocCollection);
                    }
                });
            } else {
                this.changeModelView(newModel, docType, resultDocCollection, childDocCollection);
            }

        },

        changeModelView: function (newModel, docType, resultDocCollection, childDocCollection) {
            if (DEBUG) console.log("Doc Tab App -----> changeView");
            var deferredViewResponse = DocDetailsDisplayer.getView.call(this, newModel, docType, resultDocCollection, childDocCollection);
            var self = this;
            deferredViewResponse.done(function (results) {
                var modalOptions = {
                    'title': results.title || DocDetailsDisplayer.getTitle(newModel, docType),
                    'size': 'large' //,
                };
                if (DocUtils.canAddAddendum(newModel)) {
                    modalOptions.footerView = ModalFooter.extend({
                        model: newModel
                    });
                }

                //dod pdf documents
                if (results.view.model && results.view.model.get('dodPdfDocumentUri')) {
                    modalOptions.size = 'xlarge';
                }

                var modal = new ADK.UI.Modal({
                    view: results.view,
                    options: modalOptions
                });
                modal.show();

                //dod pdf documents
                if (results.view.model && results.view.model.get('dodPdfDocumentUri')) {

                    //prevent modal from displaying a scroll bar (needed to avoid display of two scroll bars)
                    $('#modal-body').css('max-height', '100%');
                }

            });
        },

    });

    var applet = {
        id: 'documents',
        viewTypes: [{
            type: 'expanded',
            view: AppletLayoutView,
            chromeEnabled: true
        }, {
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'expanded'
    };
    DetailCommunicator.initialize(applet.id);

    return applet;
});
