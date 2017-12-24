define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'handlebars',
    'app/applets/documents/appConfig',
    'app/applets/documents/detailCommunicator',
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',
    'app/applets/notes/writeback/formUtil',
    'app/applets/documents/modalFooter',
    'app/applets/documents/modalHeader',
    'app/applets/documents/modalBody',
    'app/applets/documents/docUtils',
    'app/applets/documents/imaging/views/imageIndicatorView',
], function(
    Backbone,
    Marionette,
    _,
    Moment,
    Handlebars,
    appConfig,
    DetailCommunicator,
    appletHelper,
    DocDetailsDisplayer,
    NotesFormUtil,
    ModalFooter,
    ModalHeader,
    ModalBody,
    DocUtils,
    ImageIndicator
) {
    'use strict';

    var channel = ADK.Messaging.getChannel('documents');

    var FullScreenColumns = [{
        name: 'dateDisplay',
        flexWidth: 'flex-width-date',
        label: 'Date',
        groupKey: function(item) {
            // TODO: not doing anything, add backup attribute or remove "if" block
            if (item.referenceDateTime) {
                return item.referenceDateTime.substr(0, 6);
            }
            return item.referenceDateTime.substr(0, 6);
        },
        sortKeys: {
            asc: 'dateTime asc',
            desc: 'dateTime desc',
            defaultDirection: 'desc'
        }
    }, {
        name: 'localTitle',
        flexWidth: 'flex-width-2',
        label: 'Description',
        bodyTemplate: Handlebars.compile('{{localTitle}} <strong>{{addendumIndicator}}</strong>')
    }, {
        name: 'kind',
        label: 'Type',
        sortKeys: {
            asc: 'kind asc, dateTime desc',
            desc: 'kind desc, dateTime desc'
        }
    }, {
        name: 'authorDisplayName',
        label: 'Author/Verifier'
    }, {
        name: 'facilityName',
        label: 'Facility',
        sortKeys: {
            asc: 'facilityName asc, dateTime desc',
            desc: 'facilityName desc, dateTime desc'
        }
    }, {
        name: 'hasImages',
        flexWidth: 'pixel-width-45',
        label: 'Images',
        bodyTemplate: '{{#if hasImages}}<span><i class="fa fa-paperclip" data-toggle="tooltip" title="Image(s) are attached" aria-label="Document contains attached images"></i></span>{{/if}}'
    }];
    var SummaryColumns = [FullScreenColumns[0], FullScreenColumns[2], FullScreenColumns[3]];
    Object.freeze(FullScreenColumns);
    Object.freeze(SummaryColumns);

    var collectionOptions = {
        cache: false,
        patientData: true,
        resourceTitle: 'patient-record-document-view',
        allowAbort: true,
        criteria: {},
        type: 'POST',
        limit: 100
    };


    var GroupCollection = ADK.UIResources.Fetch.Document.DocumentViews.GroupCollection.extend({
        defaults: {
            filter: {
                fields: ['amended', 'dateTime', 'referenceDateTime', 'localTitle', 'typeName', 'summary', 'name', 'kind', 'authorDisplayName', 'signerDisplayName', 'providerDisplayName', 'clinicians[].displayName', 'activity[].responsible', 'facilityName', 'imageLocation', 'orderName', 'reason']
            }
        }
    });


    var AppletLayoutView = ADK.UI.ServerPagingApplet.extend({
        tileOptions: {
            primaryAction: {
                enabled: true,
                onClick: function(params, event) {
                    var targetElement = _.get(params, '$el', this.$('.dropdown--quickmenu > button'));
                    channel.trigger('onClickRow', this.model, targetElement);
                }
            },
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'detailsviewbutton',
                    onClick: function(params, event) {
                        var targetElement = _.get(params, '$el', this.$('.dropdown--quickmenu > button'));
                        channel.trigger('onClickRow', this.model, targetElement);
                    }
                }]
            }
        },
        defaultSortColumn: FullScreenColumns[0].name,
        groupable: true,
        helpers: {
            'dateDisplay_groupHeader': function(groupModel) {
                // groupHeader helpers will only have the value returned from `groupKey` function collection option..
                // somehow need to call out this in the docs, or readdress
                return new Moment(groupModel.get('dateDisplay'), 'YYYYMM').format('MMMM YYYY');
            },
            // 'dateDisplay_cell': function(model) {
            //     return new Moment(this.dateDisplay).format('MMMM DD YYYY');
            // }
        },
        initialize: function(options) {
            this.collectionOptions = _.cloneDeep(collectionOptions);
            this.modalCollection = new ADK.UIResources.Fetch.Document.DocumentViews.Collection();

            if (ADK.UserService.hasPermission('sign-note') && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista()) {
                this.onClickAdd = this._onClickAdd;
            }

            this.listenTo(ADK.Messaging, 'globalDate:selected', function() {
                // This will trigger a new fetch and therefore call the view's beforeFetch method
                // which updates the criteria's range property
                this.triggerMethod('refresh');
            });

            this.listenTo(this.collection, 'sync', this.updateCollection);
            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:added addendum:deleted addendum:signed', function() {
                this.triggerMethod('refresh');
            });

            this.listenTo(channel, 'onClickRow', this.onClickRow);

            this.collection = new GroupCollection([], this.collectionOptions);
        },
        _onClickAdd: function() {
            var notesFormOptions = {
                model: undefined,
                showVisit: true,
                isEdit: false,
                openTrayOnDestroy: false
            };
            NotesFormUtil.launchNoteForm(notesFormOptions);
        },
        getColumns: function() {
            if (this.columnsViewType === "summary") {
                return SummaryColumns;
            }
            return FullScreenColumns;
        },
        onClickRow: function(model, target) {
            var docType = model.get('kind');
            var complexDocBool = model.get('complexDoc');
            var resultDocCollection = new ADK.UIResources.Fetch.Document.Collections.ResultsByUidCollection();
            var childDocCollection = new ADK.UIResources.Fetch.Document.Collections.DocumentCollection();
            appletHelper.getChildDocs.call(this, model, childDocCollection);

            if (complexDocBool) {
                appletHelper.getResultsFromUid.call(this, model, resultDocCollection);
            }

            this.modalCollection.reset();
            this.changeModelAndView(model, docType, resultDocCollection, childDocCollection, target);
        },
        beforeFetch: function() {
            if (!_.has(this.collection, 'fetchOptions')) {
                this.collection.fetchOptions = this.collectionOptions;
            }
            this.createFilter();
        },
        createFilter: function() {
            var filter = this.collection.Criteria.Query;
            if (filter.hasQueries()) {
                filter.reset();
            }
            this.collection.Criteria.Range.createFromGlobalDate();
            this.collection.Criteria.NoText.enable();
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
        changeModelAndView: function(newModel, docType, resultDocCollection, childDocCollection, target) {
            if (newModel.get('documentClass') === "PROGRESS NOTES") {
                this.showDetailsView(newModel, docType, resultDocCollection, childDocCollection, target);
                DocUtils.getDoc.call(this, newModel.get('uid'), this.modalCollection);
            } else {
                this.modalCollection.reset(newModel);
                this.showDetailsView(newModel, docType, resultDocCollection, childDocCollection, target);
            }
        },
        showDetailsView: function(initialModel, docType, resultDocCollection, childDocCollection, target) {
            initialModel = initialModel || this.collection.first().get('rows').first();

            var PagingModel = Backbone.Model.extend({
                defaults: {
                    hasPrevious: false,
                    hasNext: false,
                    currentModel: null,
                    currentGroup: null,
                    groupIndex: null,
                    modelIndex: null
                }
            });
            var pagingModel = new PagingModel({
                currentModel: initialModel
            });
            var HeaderModel = Backbone.Model.extend({
                updateTitle: function() {
                    this.set('title', DocDetailsDisplayer.getTitle(this.pagingModel.get('currentModel'), this.get('docType')));
                },
                updateHasPrevious: function() {
                    this.set('hasPrevious', this.pagingModel.get('hasPrevious'));
                },
                updateHasNext: function() {
                    this.set('hasNext', this.pagingModel.get('hasNext'));
                },
                updateFetchingNextPage: function() {
                    this.set('fetchingNextPage', this.pagingModel.get('fetchingNextPage'));
                },
                initialize: function(attributes, options) {
                    this.pagingModel = _.get(options, 'pagingModel');
                    this._updateAttributes();
                    this.listenTo(this.pagingModel, 'change', function(model, options) {
                        if (_.has(model.changed, 'groupIndex') || _.has(model.changed, 'modelIndex')) {
                            this._updateAttributes();
                        } else if (_.has(model.changed, 'fetchingNextPage')) {
                            this.updateFetchingNextPage();
                        }
                    });
                },
                _updateAttributes: function() {
                    this.updateTitle();
                    this.updateHasNext();
                    this.updateHasPrevious();
                    this.updateFetchingNextPage();
                }
            });

            var headerModel = new HeaderModel({
                docType: initialModel.get('kind')
            }, {
                pagingModel: pagingModel
            });

            var detailsView = new ModalBody({
                headerModel: headerModel,
                model: initialModel,
                collection: this.collection,
                modalCollection: this.modalCollection,
                pagingModel: pagingModel
            });

            var modalOptions = {
                title: headerModel.get('title'),
                size: 'large',
                headerView: ModalHeader.extend({
                    model: headerModel
                }),
                footerView: ModalFooter.extend({
                    model: initialModel,
                    pagingModel: pagingModel
                }),
                triggerElement: target
            };

            var detailsModal = new ADK.UI.Modal({
                view: detailsView,
                options: modalOptions
            });

            detailsModal.show();
        }
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
