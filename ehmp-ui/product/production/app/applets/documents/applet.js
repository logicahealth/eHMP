define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'handlebars',
    'app/applets/documents/debugFlag',
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',
    'app/applets/documents/detailCommunicator',
    'app/applets/documents/collectionHandler',
    'hbs!app/applets/documents/detail/detailWrapperTemplate',
    'app/applets/notes/writeback/formUtil'
], function(Backbone, Marionette, _, moment, Handlebars, DEV, appletHelper, DocDetailsDisplayer,
    DetailCommunicator, CollectionHandler, detailWrapperTemplate, NotesFormUtil) {
    "use strict";

    var DEBUG = DEV.flag, serverDateFilter = DEV.serverDateFilter, defGroupByView = DEV.GroupByView, selectedDocument = null, opts;
    //The important changes are in the columns array as well as replacing the dataGridOptions.groupBy logic with this:   dataGridOptions.groupable = this.options.groupView;
    var fullScreenColumns = [{
        name: 'dateDisplay',
        label: 'Date',
        editable: false,
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend ({
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
                return collectionElement.model.get("referenceDateTime").substr(0, 6);
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function(item) {
                return moment(item, "YYYYMM").format("MMMM YYYY");
            }
        },
        hoverTip: 'documents_date'
    }, {
        name: 'localTitle',
        label: 'Description',
        editable: false,
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-2'
        }),
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'documents_description'

    }, {
        name: 'kind',
        label: 'Type',
        editable: false,
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'documents_type'
    }, {
        name: 'authorDisplayName',
        label: 'Author or Verifier',
        editable: false,
        cell: 'string',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        hoverTip: 'documents_enteredby'
    }, {
        name: 'facilityName',
        label: 'Facility',
        editable: false,
        cell: 'handlebars',
        groupable: true,
        groupableOptions: {
            innerSort: "referenceDateTime"
        },
        template: Handlebars.compile('{{facilityName}}{{#if dodComplexNoteUri}}*{{/if}}'),
        hoverTip: 'documents_facility'
    }];
    var summaryColumns = [fullScreenColumns[0], fullScreenColumns[2], fullScreenColumns[3]];

    var dataGridOptions = {
        filterEnabled: true, //make sure the filter is actully on screen

        //row click handler
        onClickRow: function(model, event) {
            var docType = model.get('kind');
            var complexDocBool = model.get('complexDoc');
            var resultDocCollection;
            var childDocCollection = appletHelper.getChildDocs(model);

            if (complexDocBool) {
                resultDocCollection = appletHelper.getResultsFromUid(model);
            }

            var center = $('#center');
            if (center.hasClass('col-md-12')) {
                var $clickedTr = $(event.target).closest('tr');
                var originalRowTop = $clickedTr.offset().top;

                center.find(".data-grid").removeClass('col-md-12');
                center.find(".data-grid").addClass('col-md-6');

                if ($(".doc-detail-region").length === 0) {
                    center.find(".grid-container div:first-child").append(detailWrapperTemplate({}));

                    this.parent.addRegion("docDetail", ".doc-detail-region");
                } else {
                    $('.doc-detail-container').removeClass('hide');
                }
                if (this.parent !== undefined) {
                    this.parent.hiddenColumns = true;
                    this.parent.changeView(model, docType, resultDocCollection, childDocCollection);
                }

                // update scroll position of summary table so clicked row stays at the same position on the screen
                var originalScrollTop = $clickedTr.closest('.data-grid').scrollTop();
                var newRowTop = $clickedTr.offset().top;
                var diffRowTop = newRowTop - originalRowTop;
                var targetScrollTop = originalScrollTop + diffRowTop;
                $clickedTr.closest('.data-grid').scrollTop(targetScrollTop);

                // shift focus to the detail view title
                selectedDocument = $(':focus');
                $('.doc-detail-container h3:first-child').focus();
            } else {

                if (this.parent !== undefined) {
                    this.parent.changeModelView(model, docType, resultDocCollection, childDocCollection);
                }
            }

            //  show visual indicator of active row
            var $target = $(event.target);
            $('#data-grid-' + this.appletConfig.instanceId).find("tr.active").removeClass('active');
            if ($target.hasClass('selectable')) {
                $target.addClass('active');
            } else if ($target.parent().hasClass('selectable')) {
                $target.parent().addClass('active');
            }
        }
    };

    //------------------------------------------------------------

    var filterOptions = {
        filterFields: ['dateDisplay', 'localTitle', 'kind', 'authorDisplayName', 'facilityName', 'imageLocation', 'dateTimeDisplay', 'orderName', 'reason']
    };
    //------------------------------------------------------------

    var GridApplet = ADK.Applets.BaseGridApplet;
    var _super = GridApplet.prototype;
    var AppletLayoutView = GridApplet.extend({
        className: 'docApp',
        lastTypeClicked: 'unk',
        hiddenColumns: false,
        events: function() {
            return _.extend({}, GridApplet.prototype.events, {
                'click .hide-detail': 'hideDetail'
            });
        },
        showGridView: function() {
            this.refreshGrid(false);
        },
        groupByView: function() {
            this.refreshGrid(true);
        },
        initialize: function(options) {
            if (DEBUG) console.log("Doc Tab App -----> init start");

            opts = this.options = options;
            // GroupByView or GridView
            this.options.groupView = defGroupByView;

            dataGridOptions.parent = this;
            var self = this;

            dataGridOptions.appletConfig = options.appletConfig;
            dataGridOptions.groupable = this.options.groupView;
            if (ADK.UserService.hasPermission('sign-note') && ADK.UserService.hasPermission('add-encounter')) {
                dataGridOptions.onClickAdd = function(event) {
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

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(date) {
                this.loading();
                if (DEBUG) console.log("Doc Tab date filter range----->" + JSON.stringify(date));
                if (!serverDateFilter) {
                    if (appletHelper.globalFilterStatus(date)) {
                        appletHelper.hideAppFilter();
                    } else {
                        appletHelper.showAppFilter();
                    }
                    // hide detail view
                    self.hideDetail();
                    if (DEBUG) console.log("Doc Tab client side filter refresh");
                    this.dataGridOptions.collection = CollectionHandler.queryCollection(date.attributes.fromDate, date.attributes.toDate);
                } else {
                    // hide detail view
                    self.hideDetail();
                    if (DEBUG) console.log("Doc Tab server side filter refresh");
                    this.dataGridOptions.collection = this.fetchData();
                }
            }, this);
            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.collection = this.fetchData();
            _super.initialize.apply(this, arguments);
        },
        refreshGrid: function(groupView) {
            if (DEBUG) console.log("Doc Tab App -----> refreshGrid");
            this.showLoading();
            this.options.groupView = groupView;
            this.initialize(this.options);
        },
        onRender: function() {
            if (DEBUG) console.log("Doc Tab App -----> onRender");
            _super.onRender.apply(this, arguments);
        },
        onShow: function() {
            if (DEBUG) console.log("Doc Tab App -----> onShow");
            if (!defGroupByView) { // Show buttons if Grid View is default
                // Adds Grid View icon to applet title bar
                if ($("#gridView-documents").length === 0) {
                    $("#center").find(".grid-filter-button")
                        .before('<button id="gridView-documents" class="btn btn-sm btn-link" title="Grid View"><span  class="gridView applet-title-button fa fa-th" ><span class="sr-only">Grid View</span></span></button>');
                }
                // Adds Group by View icon to applet title bar
                if ($("#groupByView-documents").length === 0) {
                    $("#center").find(".grid-filter-button")
                        .before('<button id="groupByView-documents" class="btn btn-sm btn-link" title="Group by View"><span class="groupByView applet-title-button fa fa-th-list" ><span class="sr-only">Group by View</span></span></button>');
                }
            }
            _super.onShow.apply(this, arguments);
        },

        fetchData: function() {
            return CollectionHandler.queryCollection(this, this.dataGridOptions.collection);
        },

        changeView: function(newModel, docType, resultDocCollection, childDocCollection) {
            if (DEBUG) console.log("Doc Tab App -----> changeView");
            if (this.lastTypeClicked === docType) {
                this.updateDetailView(newModel);
                this.updateDetailTitle(DocDetailsDisplayer.getTitle(newModel, docType));
            } else {
                var deferredViewResponse = DocDetailsDisplayer.getView(newModel, docType, resultDocCollection, childDocCollection);
                var self = this;
                deferredViewResponse.done(function(results) {
                    self.docDetail.show(results.view);
                    self.updateDetailTitle(results.title || DocDetailsDisplayer.getTitle(newModel, docType));
                });
                this.listenTo(this, 'destroy', function(){
                   delete deferredViewResponse.done;
                });
            }
            this.$(".doc-detail-container").scrollTop(0);
        },
        changeModelView: function(newModel, docType, resultDocCollection, childDocCollection) {
            if (DEBUG) console.log("Doc Tab App -----> changeView");
            var deferredViewResponse = DocDetailsDisplayer.getView(newModel, docType, resultDocCollection, childDocCollection);
            deferredViewResponse.done(function(results) {
                var modalOptions = {
                    'title': results.title || DocDetailsDisplayer.getTitle(newModel, docType),
                    'size': 'large' //,
                };

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

        updateDetailTitle: function(newTitle) {
            $('.doc-detail-container h3:first-child').html(newTitle);
        },

        updateDetailView: function(newModel) {
           if (DEBUG) console.log("Doc Tab App -----> updateDetailView");
            this.docDetailView.model = newModel;
            this.docDetailView.render();
        },

        hideColumns: function() {
            if (this.hiddenColumns === true) {
                if (DEBUG) console.log("Doc Tab App -----> hideColumns");
                $('#data-grid-' + this.appletConfig.instanceId + ' tr *:nth-child(4)').addClass('hide');
                $('#data-grid-' + this.appletConfig.instanceId + ' tr *:nth-child(5)').addClass('hide');
            }
        },

        hideDetail: function() {
            if (DEBUG) console.log("Doc Tab App -----> hideDetail");
            $('.doc-detail-container').addClass('hide');
            var center = $("#center");
            center.find(".data-grid").removeClass('col-md-6');
            center.find(".data-grid").addClass('col-md-12');
            this.hiddenColumns = false;

            if (selectedDocument) {
                selectedDocument.focus();
            }
        },
    });


    //------------------------------------------------------------


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