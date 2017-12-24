/* global ADK, Backgrid */
define([
    'underscore',
    'app/applets/permission_sets/modal-details/permission-sets-details',
    'app/applets/permission_sets/modal-details/permission-sets-details-footer',
    'app/applets/permission_sets/workflows/permission-sets-create-workflow'
], function(_, ModalView, ModalFooter, createOptions) {
    'use strict';

    var GridView = ADK.AppletViews.GridView;
    var DataGrid = GridView.DataGrid;

    return GridView.extend({

        initialize: function initialize() {
            this.sharedModel = ADK.UIResources.Fetch.Permission.SharedModel(this);
            this.collection = new ADK.UIResources.Fetch.Permission.SetsCollection();
            var sharedSets = this.sharedModel.get('permissionSets');

            this.listenTo(sharedSets, 'fetch:success', this._syncCollections);
            this.listenTo(this.getRegion('appletFilter'), 'show', this._getFilter);

            _.set(this, 'appletOptions.columns', this.getColumns());
            _.set(this, 'appletOptions.filterFields', this.getFilterFields());
            _.set(this, 'appletOptions.collection', this.collection);
            _.set(this, 'appletOptions.tileOptions', this.getTileOptions());

            if (ADK.UserService.hasPermission('add-permission-sets')) {
                _.set(this, 'onClickAdd', this._onClickAdd);
            }

            GridView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Because, Datagrid removes items from the collection when filtering the shared collection can not be
         * used directly on the applet.  This function finds the filter box in order to determine
         * if it contains any filter text.
         * @private
         */
        _getFilter: function() {
            this.stopListening(this.collection, 'backgrid:refresh');
            var region = this.getRegion('appletFilter');
            var currentView = region.currentView;
            this.$filter = currentView.$('input[type=search]');
            this.listenTo(currentView, 'before:destroy', function() {
                this.$filter = null;
            });
            this.listenTo(this.collection, 'backgrid:refresh', this._onClearFilter);
        },

        /**
         * If the backgrid filter is called, and the original collection has been updated
         * use the original collections data instead of this collections.
         * @private
         */
        _onClearFilter: function() {
            var value = _.get(this.$filter, '[0].value');
            var sharedSet = this.sharedModel.get('permissionSets');
            if (_.isEmpty(value) && this.collection.length !== sharedSet.length) {
                this._syncCollections();
            }
        },

        /**
         * Synchronizes that data the shared collection into this collection
         * @private
         */
        _syncCollections: function() {
            var sharedSets = this.sharedModel.get('permissionSets');

            this.collection.originalModels = sharedSets.originalModels;
            this.collection.set(sharedSets.originalModels);
            this.stopListening(sharedSets, 'all');
            this.listenTo(sharedSets, 'all', function(event, model) {
                if (_.get(this.collection, event) && event !== 'sync') {
                    var args = Array.prototype.slice.call(arguments);
                    this.collection[event].apply(this.collection, args.slice(1));
                } else if (event === 'edit:success' || event === 'deprecate:success') {
                    this.collection.get(model.id).set(model.attributes);
                    this.collection.trigger('reset', this);
                    //Not ideal but need a way to refocus on the modal after deprecate/edit events since collection reset moves default focus
                    $('#mainModal').focus();
                } else {
                    this.collection.trigger.apply(this.collection, arguments);
                }
            });
            this.collection.trigger('fetch:success');
        },

        refresh: function() {
            var sharedSets = this.sharedModel.get('permissionSets');
            this.loading();
            this.setAppletView();
            sharedSets.fetchCollection();
        },

        onRender: function onRender() {
            GridView.prototype.onRender.apply(this, arguments);
            var sharedSet = this.sharedModel.get('permissionSets');
            if (sharedSet.length) {
                sharedSet.trigger('fetch:success');
            }
        },

        DataGrid: DataGrid.extend({
            DataGridRow: DataGrid.DataGridRow.extend({
                serializeModel: function serializeModel() {
                    if (!this.model) {
                        return {};
                    }

                    return {
                        'label': this.model.display('label'),
                        'category': this.model.display('category'),
                        'status': this.model.display('status'),
                        'createdOn': this.model.display('createdOn'),
                        'authorName': this.model.display('authorName'),
                        'editedOn': this.model.display('editedOn'),
                        'lastUpdatedName': this.model.display('lastUpdatedName'),
                        'nationalAccess': this.model.display('nationalAccess')
                    };
                }
            })
        }),

        _onClickAdd: function onClickAdd() {
            var workflowController = new ADK.UI.Workflow(createOptions(this.sharedModel));
            workflowController.show();
        },

        launchDetails: function launchDetails(model, triggerElement) {
            var modalView = new ModalView({
                model: model,
                collection: this.collection,
                navHeader: false
            });

            var modalOptions = {
                fullScreen: _.get(this, 'appletConfig.isFullscreen', false),
                size: 'large',
                title: 'Permission Set Details',
                triggerElement: triggerElement,
                footerView: ModalFooter.extend({
                    model: model,
                    sharedModel: this.sharedModel
                })
            };


            var modal = new ADK.UI.Modal({
                view: modalView,
                options: modalOptions
            });

            modal.show();
        },

        getTileOptions: function getTileOptions() {
            var QUICK_MENU = '.quickmenu-container button';
            var self = this;

            return {
                quickMenu: {
                    enabled: true,
                    buttons: [{
                        type: 'detailsviewbutton',
                        onClick: function onQuickMenuDetailsClick() {
                            var $el = this.$(QUICK_MENU);
                            self.launchDetails(this.model, $el);
                        }
                    }]
                },
                primaryAction: {
                    enabled: true,
                    onClick: function onRowClick() {
                        var $el = this.$(QUICK_MENU);
                        self.launchDetails(this.model, $el);
                    }

                }
            };
        },

        getColumns: function getColumns() {
            return [{
                name: 'label',
                label: 'Set Name',
                flexWidth: 'flex-width-2',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-2'
                })
            }, {
                name: 'category',
                label: 'Category',
                sortable: false,
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1'
                })
            }, {
                name: 'status',
                label: 'Status',
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1 transform-text-capitalize'
                })
            }, {
                name: 'createdOn',
                label: 'Created On',
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1'
                })
            }, {
                name: 'authorName',
                label: 'Created By',
                flexWidth: 'flex-width-2',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-2'
                })
            }, {
                name: 'editedOn',
                label: 'Edited On',
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1'
                })
            }, {
                name: 'lastUpdatedName',
                label: 'Edited By',
                flexWidth: 'flex-width-2',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-2'
                })
            }, {
                name: 'nationalAccess',
                label: 'Nat. Access',
                flexWidth: 'flex-width-0_5',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-0_5'
                })
            }];
        },

        getFilterFields: function getFilterFields() {
            return ['label', 'sub-sets', 'status', 'createdOn', 'authorName', 'editedOn', 'lastUpdatedName', 'nationalAccess'];
        }
    });
});
