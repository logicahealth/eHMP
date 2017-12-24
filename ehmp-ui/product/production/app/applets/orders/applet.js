/* global ADK, Backgrid */
define([
    'main/ADK',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'handlebars',
    'app/applets/orders/modalView/modalViewUtils',
    'app/applets/orders/toolBar/toolBarView',
    'hbs!app/applets/orders/toolBar/ordersFilterTemplate',
    'app/applets/orders/detailCommunicator',
    'app/applets/orders/util',
    'app/applets/orders/displayGroupManifest',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/orders/tray/labs/trayView',
    'app/applets/ordersearch/tray/trayView'
], function(ADK, _, Backbone, Marionette, moment, Handlebars, ModalViewUtils,
    ToolBarView, ordersFilterTemplate, DetailCommunicator, orderUtil,
    DisplayGroupManifest, LabOrderTrayUtils, trayView, OrderSearchTrayView) {

    'use strict';
    var summaryColumns, flagColumn, shortSummaryColumn, fullScreenColumns, resourceTitle, _super, GridApplet,
        AppletLayoutView, applet, statusColumn, enteredColumn, orderType, facilityCodeColumn, providerNameColumn,
        summaryColumn, startColumn, stopColumn, summaryOrderType;

    var DATE_FORMAT = 'YYYYMMDDHHmmSS';
    var DATE_LENGTH = DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');
    var FETCH_RESOURCE_TITLE = 'all-orders';
    var ENTERED = 'entered';

    //define grid columns for cover sheet and single page
    enteredColumn = {
        name: 'entered',
        label: 'Order Date',
        flexWidth: 'flex-width-2',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-2'
        }),
        type: 'date',
        sortType: 'cycle',
        template: Handlebars.compile('{{formatDate entered "MM/DD/YYYY"}}')
    };
    flagColumn = {
        name: 'isFlagged',
        label: 'Flag',
        flexWidth: 'flex-width-1',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-1'
        }),
        template: Handlebars.compile('{{#if isFlagged}} {{#unless isDiscontinuedOrder}}<i class="fa fa-flag color-primary" data-toggle="tooltip" title="This order is flagged."></i>{{/unless}}{{/if}}'),
        hoverTip: 'orders_flag'
    };
    statusColumn = {
        name: 'statusName',
        label: 'Status',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'StringCell flex-width-2'
        })
    };
    shortSummaryColumn = {
        name: 'summary',
        label: 'Order',
        template: Handlebars.compile('{{#if longSummary}}<span data-toggle="tooltip" title="{{summary}}">{{shortSummary}}...</span>{{else}}{{shortSummary}}{{/if}}')
    };
    orderType = {
        name: 'kind',
        label: 'Type',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'StringCell flex-width-1_5'
        })
    };
    summaryOrderType = {
        name: 'kind',
        label: 'Type',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        })
    };
    facilityCodeColumn = {
        name: 'facilityMoniker',
        label: 'Facility',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-1_5'
        }),
        template: Handlebars.compile('{{facilityMoniker}}')
    };
    summaryColumn = {
        name: 'summary',
        label: 'Order',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        })
    };
    providerNameColumn = {
        name: 'providerDisplayName',
        label: 'Provider Name',
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
        })
    };
    startColumn = {
        name: 'start',
        label: 'Start Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-date'
        }),
        type: 'date',
        sortType: 'cycle',
        template: Handlebars.compile('{{formatDate start "MM/DD/YYYY"}}')
    };
    stopColumn = {
        name: 'stop',
        label: 'Stop Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-date'
        }),
        type: 'date',
        sortType: 'cycle',
        template: Handlebars.compile('{{formatDate stop "MM/DD/YYYY"}}')
    };

    //Data Grid Columns - summary for coversheet, fullscreen for single page
    summaryColumns = [enteredColumn, flagColumn, statusColumn, shortSummaryColumn, orderType, facilityCodeColumn];
    fullScreenColumns = [enteredColumn, flagColumn, statusColumn, summaryColumn, summaryOrderType, providerNameColumn, startColumn, stopColumn, facilityCodeColumn];
    resourceTitle = FETCH_RESOURCE_TITLE;
    GridApplet = ADK.AppletViews.GridView;
    var MenuItem = Backbone.Model.extend({
        defaults: {
            'displayGroup': 'ALL',
            'mixedName': 'All',
            'show': true
        }
    });
    var MenuItems = Backbone.Collection.extend({
        model: MenuItem
    });
    //These are the drop-down menu selections
    //items with show=false will be filtered out of the collection and the menu will not show them
    var menuItems = new MenuItems([{
        "displayGroup": "ALL",
        "mixedName": "All",
        "show": true
    }, {
        "displayGroup": "ADT",
        "mixedName": "A/D/T",
        "show": true
    }, {
        "displayGroup": "ALG",
        "mixedName": "Allergy",
        "show": true
    }, {
        "displayGroup": "C RX",
        "mixedName": "Clinic Orders",
        "show": true
    }, {
        "displayGroup": "CSLT",
        "mixedName": "Consults",
        "show": true
    }, {
        'displayGroup': 'eHMP CSLT',
        'mixedName': 'Consult-eHMP',
        "show": true
    }, {
        "displayGroup": "DIET",
        "mixedName": "Diet",
        "show": true
    }, {
        "displayGroup": "XRAY",
        "mixedName": "Imaging",
        "show": true
    }, {
        "displayGroup": "LAB",
        "mixedName": "Laboratory",
        "show": true
    }, {
        "displayGroup": "IV RX",
        "mixedName": "Medication, Infusion",
        "show": true
    }, {
        "displayGroup": "I RX",
        "mixedName": "Medication, Inpatient",
        "show": true
    }, {
        "displayGroup": "NV RX",
        "mixedName": "Medication, Non-VA",
        "show": true
    }, {
        "displayGroup": "O RX",
        "mixedName": "Medication, Outpatient",
        "show": true
    }, {
        "displayGroup": "NURS",
        "mixedName": "Nursing",
        "show": true
    }, {
        "displayGroup": "OTHER",
        "mixedName": "Other",
        "show": true
    }, {
        "displayGroup": "PROC",
        "mixedName": "Procedures",
        "show": true
    }, {
        "displayGroup": "SPLY",
        "mixedName": "Supplies",
        "show": true
    }, {
        "displayGroup": "SURG",
        "mixedName": "Surgery",
        "show": true
    }, {
        "displayGroup": "V/M",
        "mixedName": "Vitals",
        "show": true
    }]);

    //the following model is shared between the applet and the toolbar view
    var SharedModel = Backbone.Model.extend({
        defaults: {
            displayGroup: 'ALL'
        }
    });
    AppletLayoutView = GridApplet.extend({
        className: 'app-size-2',
        fetchDisplayGroups: function(parent, node) {
            if (node.shortName === parent) {
                return this.getDisplayGroupChildren(node, []);
            }
            var i, children = node.members,
                child, found;
            for (i = 0; i < children.length; i++) {
                child = children[i];
                found = this.fetchDisplayGroups(parent, child);
                if (found) {
                    return found;
                }
            }
        },
        getDisplayGroupChildren: function(parent, children) {
            var obj = parent.members,
                idx = 0;
            children.push(parent.shortName);
            while (obj.length > 0 && idx < obj.length) {
                this.getDisplayGroupChildren(obj[idx], children);
                idx++;
            }
            return children;
        },
        initialize: function(options) {
            var toolBarView, onClickRow, sharedModelChanged, filterCollection;
            var collection, fetchOptions;
            var exclude, displayGroup, displayGroupList;
            var dataGridOptions;

            fetchOptions = {
                cache: true,
                allowAbort: true,
                pageable: true
            };
            this.expandedAppletId = this.options.appletConfig.instanceId;
            if (this.options.appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                }
            }

            displayGroup = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'activeMenuItem', true, this.parentWorkspace) || 'ALL';
            displayGroupList = this.fetchDisplayGroups(displayGroup, DisplayGroupManifest);
            if (this.sharedModel === undefined) {
                this.sharedModel = new SharedModel({
                    displayGroup: displayGroup
                });
            }
            sharedModelChanged = function(model) {
                displayGroup = model.get('displayGroup');
                displayGroupList = this.fetchDisplayGroups(displayGroup, DisplayGroupManifest);
                this.listenTo(ADK.Messaging, 'globalDate:selected', function() {
                    this.dateRangeRefresh(ENTERED);
                });

                if (displayGroup !== 'ALL') {
                    ADK.utils.filterCollectionByMultipleValues(collection, 'displayGroup', displayGroupList);
                } else {
                    ADK.utils.resetCollection(collection);
                }
                this.refresh();
            };

            this.listenTo(this.sharedModel, 'change:displayGroup', sharedModelChanged);

            _super = GridApplet.prototype;
            var self = this;
            //filter out items that are set not to show in the menu [show: false]
            //this is used in the fetchOptions.criteria and the date filter
            if (ADK.SessionStorage.getAppletStorageModel(this.options.appletConfig.instanceId, 'excludeMenuItems', true, this.parentWorkspace) === undefined) {
                exclude = [];
                for (var i = 0; i < menuItems.models.length; i++) {
                    if (!menuItems.models[i].get('show')) {
                        exclude.push(menuItems.models[i].get('displayGroup'));
                    }
                }
                ADK.SessionStorage.setAppletStorageModel(this.options.appletConfig.instanceId, 'excludeMenuItems', exclude, true, this.parentWorkspace);
            } else {
                exclude = ADK.SessionStorage.getAppletStorageModel(this.options.appletConfig.instanceId, 'excludeMenuItems', true, this.parentWorkspace);
            }
            this.listenTo(ADK.Messaging, 'globalDate:selected', function() {
                self.dateRangeRefresh(ENTERED);
            });
            filterCollection = function(collection) {
                return collection.filter(function(model) {
                    if (model.get('childrenOrderUids')) { //filter parent orders (US14416)
                        return false;
                    }

                    // Not all order entries have a 'displayGroup' attribute; for those entries, we attempt to map
                    // back to an appropriate display group using the entry 'service' attribute, which should contain the
                    // displayed group name as shown in the order group dropdown menu.
                    var displayGroup = model.get('displayGroup') || orderUtil.getDisplayGroupFromDoDService(model.get('service'));
                    if (!_.contains(exclude, displayGroup)) {
                        model.set(orderUtil.parseOrderResponse(model.attributes, displayGroup));
                        return true;
                    }
                    return false;
                });
            };
            fetchOptions.criteria = {
                filter: this.buildJdsDateFilter(ENTERED)
            };
            //set comparator based on view type 'summary' or 'expanded'

            var _dateSort = function(order) {
                var _entered = order.get(ENTERED);
                // Pad the end of the string with zeros
                if (_entered !== DATE_LENGTH) {
                    _entered = String(_entered + ZERO_FILL).substr(0, DATE_LENGTH);
                }
                return -_entered;
            };

            if (this.columnsViewType === 'summary') {
                fetchOptions.collectionConfig = {
                    //sort the collection by entered date descending
                    comparator: _dateSort,
                    collectionParse: filterCollection
                };
            } else if (this.columnsViewType === 'expanded') {
                fetchOptions.collectionConfig = {
                    //sort the collection by order type ascending, and entered date descending
                    comparator: function(order) {
                        var kind = order.attributes.kind;
                        var uid = order.attributes.uid;
                        var dateEntered = moment(order.attributes.entered, 'YYYYMMDDHHmmssSSS');
                        return kind + '-' + dateEntered + '-' + uid;
                    },
                    //parse the collection and filter out the excluded types
                    collectionParse: filterCollection
                };
            }

            fetchOptions.onSuccess = function(collection) {
                if (displayGroup !== 'ALL') {
                    ADK.utils.filterCollectionByMultipleValues(collection, 'displayGroup', displayGroupList);
                }
            };
            collection = new ADK.UIResources.Fetch.Orders.AllOrders();
            collection.fetchCollection(fetchOptions);
            toolBarView = new ToolBarView({
                instanceId: options.appletConfig.instanceId,
                collection: this.collection,
                menuItems: menuItems,
                sharedModel: this.sharedModel,
                expandedAppletId: this.expandedAppletId,
                parentWorkspace: this.parentWorkspace
            });

            //Row click event handler - display the Modal window
            onClickRow = function(model, event, targetElement) {
                event.preventDefault();
                _.defaults(options, {
                    hideNavigation: false
                });

                options.collection = _.get(model, 'collection');
                options.triggerElement = targetElement;
                ModalViewUtils.showOrderDetails(model, options);
            };

            dataGridOptions = {
                enableModal: true,
                toolbarView: toolBarView,
                collection: collection,
                filterFields: ['statusName', 'summary', 'enteredFormatted', 'kind', 'providerDisplayName', 'facilityMoniker'],
                filterDateRangeEnabled: true,
                filterDateRangeField: {
                    name: "entered",
                    label: "Date",
                    format: "YYYYMMDD"
                },
                formattedFilterFields: {
                    'entered': function(model, key) {
                        var val = model.get(key);
                        val = val.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
                        return val;
                    }
                },
                tileOptions: {
                    primaryAction: {
                        enabled: true,
                        onClick: function(params, event) {
                            var targetElement = _.get(params, '$el');
                            onClickRow(params.model, event, targetElement);
                        }
                    },
                    quickMenu: {
                        enabled: true,
                        buttons: [{
                            type: 'detailsviewbutton',
                            onClick: function(params, event) {
                                var targetElement = _.get(params, '$el', this.$('.dropdown--quickmenu > button'));
                                onClickRow(params.model, event, targetElement);
                            }
                        }]
                    }
                }
            };

            if (ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista() && ADK.UserService.hasPermissions('add-lab-order')) {
                dataGridOptions.onClickAdd = LabOrderTrayUtils.launchLabForm;
            }

            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name');
            if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else if (this.columnsViewType === "expanded") {
                dataGridOptions.columns = fullScreenColumns;
            }

            this.registerEventListeners();

            this.appletOptions = dataGridOptions;

            //add refreshGridView to messaging
            this.listenTo(ADK.Messaging.getChannel('orders'), 'refreshGridView', function() {
                this.refresh({});
            });
            _super.initialize.apply(this, arguments);
        },
        registerEventListeners: function() {
            this.listenTo(ADK.Messaging.getChannel('orders'), 'applet:refresh', this.refresh);
        }
    });

    applet = {
        id: 'orders',
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }, {
            //new writeback code added from ADK documentation
            type: 'writeback',
            view: trayView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };
    // expose detail view through messaging
    DetailCommunicator.initialize(applet.id, resourceTitle);
    return applet;
});
