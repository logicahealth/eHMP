/* global ADK, Backgrid */
define([
    'underscore',
    'app/applets/individual_permissions/individual-permissions-details',
    'app/applets/individual_permissions/individual-permissions-details-footer'
], function(_, ModalView, ModalFooter) {
    'use strict';

    var GridView = ADK.AppletViews.GridView;
    var DataGrid = GridView.DataGrid;
    var EXTENDED_COLUMNS_LENGTH = 5;


    /**
     * Individual Permission Applet View.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return GridView.extend({

        DataGrid: DataGrid.extend({
            DataGridRow: DataGrid.DataGridRow.extend({
                serializeModel: function serializeModel() {
                    if (!this.model) {
                        return {};
                    }

                    var data = {
                        label: this.model.display('label'),
                        description: this.model.display('description'),
                        status: this.model.display('status')
                    };

                    if (_.get(this, 'columns', []).length === EXTENDED_COLUMNS_LENGTH) {
                        _.set(data, 'createdOn', this.model.display('createdOn'));
                        _.set(data, 'nationalAccess', this.model.display('nationalAccess'));
                    }

                    return data;
                }
            })
        }),

        initialize: function initialize(options) {
            var viewType = _.get(options, 'appletConfig.viewType', 'summary');
            var columns = viewType === 'summary' ? this.getSummaryColumns() : this.getExpandedColumns();

            this.sharedModel = ADK.UIResources.Fetch.Permission.SharedModel(this);

            this.collection = new ADK.UIResources.Fetch.Permission.IndividualCollection();
            this.listenTo(this.sharedModel.get('permissions'), 'fetch:success', this._syncCollections);

            _.set(this, 'appletOptions.filterFields', this.getFilterFields());
            _.set(this, 'appletOptions.columns', columns);
            _.set(this, 'appletOptions.collection', this.collection);
            _.set(this, 'appletOptions.tileOptions', this.getTileOptions());

            GridView.prototype.initialize.apply(this, arguments);
        },

        _syncCollections: function() {
            var shared = this.sharedModel.get('permissions');
            this.collection.originalModels = shared.originalModels;
            this.collection.set(shared.originalModels);
            this.collection.trigger('fetch:success');
        },

        refresh: function() {
            var shared = this.sharedModel.get('permissions');
            this.loading();
            this.setAppletView();
            shared.fetchCollection();
        },

        /**
         * Checks to see if the collection data already exists, if so triggest event to
         * finish drawing.
         */
        onRender: function onRender() {
            GridView.prototype.onRender.apply(this, arguments);
            var shared = this.sharedModel.get('permissions');
            if (shared.length) {
                shared.trigger('fetch:success');
            }
        },

        /**
         * Creates the details modal
         * @param {Model} model
         * @param {jQuery} triggerElement The element to return focus too
         */
        launchDetails: function launchDetails(model, triggerElement) {
            var modalView = new ModalView({
                model: model,
                collection: this.collection,
                navHeader: false,
                sharedModel: this.sharedModel
            });

            var modalOptions = {
                fullScreen: _.get(this, 'appletConfig.isFullscreen', false),
                size: 'large',
                title: 'Individual Permission Details',
                triggerElement: triggerElement,
                footerView: ModalFooter.extend({
                    model: model,
                    collection: this.sharedModel.get('permissionSets')
                })
            };

            var modal = new ADK.UI.Modal({
                view: modalView,
                options: modalOptions
            });

            modal.show();
        },

        /**
         * Factory Method for created tile options
         * @return {*}
         */
        getTileOptions: function getTileOptions() {
            var QUICK_MENU = '.quickmenu-container button';
            var self = this;

            return {
                quickMenu: {
                    enabled: true,
                    buttons: [{
                        type: 'detailsviewbutton',
                        onClick: function onClickDetailsQuickMenuButton() {
                            var $el = this.$(QUICK_MENU);
                            self.launchDetails(this.model, $el);
                        }
                    }]
                },
                primaryAction: {
                    enabled: true,
                    onClick: function onClickRow() {
                        var $el = this.$(QUICK_MENU);
                        self.launchDetails(this.model, $el);
                    }
                }
            };
        },

        /**
         * Factory method for creating summary columns
         * @return {[*,*,*]}
         */
        getSummaryColumns: function getSummaryColumns() {
            return [{
                name: 'label',
                label: 'Name',
                flexWidth: 'flex-width-2',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-2'
                })
            }, {
                name: 'description',
                label: 'Description',
                flexWidth: 'flex-width-4',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-4'
                })
            }, {
                name: 'status',
                label: 'Status',
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1 transform-text-capitalize'
                })
            }];
        },

        /**
         * Factory Method for creating expanded columns
         * @return {Array.<T>}
         */
        getExpandedColumns: function getExpandedColumns() {
            var summaryColumns = this.getSummaryColumns();
            return summaryColumns.concat([{
                name: 'createdOn',
                label: 'Created On',
                flexWidth: 'flex-width-1',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-1'
                })
            }, {
                name: 'nationalAccess',
                label: 'Nat. Access',
                flexWidth: 'flex-width-0_5',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-0_5'
                })
            }]);
        },

        /**
         * Factory method for creating filter fields.
         * @return {[string,string,string,string,string]}
         */
        getFilterFields: function getFilterFields() {
            return ['label', 'description', 'status', 'createdOn', 'nationalAccess'];
        }
    });
});
