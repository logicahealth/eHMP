/* global window */
define([
    'underscore',
    'jquery',
    'backbone',

    'app/applets/addApplets/list/gridsterItemView'
], function(_, $, Backbone, ChildView) {
    'use strict';

    var GRIDSTER_CONTAINER_RIGHT_PADDING = 15;
    var MAX_COLUMNS = 40;
    var MAX_ROWS = 20;
    var DEFAULT_DIMENSIONS = [MAX_COLUMNS, MAX_ROWS];
    var DEFAULT_MARGINS = [5, 5];

    var PLACEHOLDER_DEFAULT_SIZE = 4;
    var PLACEHOLDER_DEFAULT_LOCATION = 1;
    var PLACEHOLDER_HTML = '<li class="preview-holder dragHere">Drag Applet Here</li>';

    var GridsterView = ADK.Views.GridsterView;


    // noinspection JSUnusedGlobalSymbols
    return GridsterView.extend({
        childView: ChildView,

        onBeforeWidgetAdd: function onBeforeWidgetAdd(options) {
            var $drag = this.$('.dragHere');
            if ($drag.length) {
                options.col = $drag.attr('data-col');
            } else {
                options.col = null;
                options.row = null;
            }
            this._removePlaceHolder();
        },

        onAfterWidgetAdd: function(child) {
            this._restoreChildEvents(child);
            this._afterAddWidget();
            this._resetChanged();
        },

        initialize: function(options) {
            if (!_.has(options, 'gridsterOptions')) {
                _.set(options, 'gridsterOptions', this._defaultGridsterOptions());
            }
            this.listenTo(ADK.utils.resize.dimensions.gridsterWidget, 'change', this.setGridsterBaseDimension);
            GridsterView.prototype.initialize.call(this, options);
        },

        onShow: function() {
            GridsterView.prototype.onShow.apply(this, arguments);
            this.gridster = this.getGridsterData();
            this._getBoundarySize();
            this._setGridsterBaseDimension();
        },

        onBeforeDestroy: function() {
            this.gridster.destroy(true);
        },

        /**
         * Adds an applet into gridster while maintaining the collection view.
         * @param {String} appletId
         * @param {String} title
         */
        createWidget: function(appletId, title) {
            var baseData = ADK.UserDefinedScreens.getAppletDefaultConfig(appletId);
            var defaultView = _.get(baseData, 'defaultViewType');
            if (!defaultView) {
                defaultView = this._requestDefaultView(appletId);
            }

            var max = ADK.utils.getViewTypeMaxSize(defaultView);
            var min = ADK.utils.getViewTypeMinSize(defaultView);
            var size = ADK.utils.getViewTypeSize(defaultView);
            var region = this._getNextId();
            var column = this.$('.dragHere').attr('data-col');

            var data = _.extend({}, baseData, {
                dataMaxSizeX: max.x,
                dataMaxSizeY: max.y,
                dataMinSizeX: min.x,
                dataMinSizeY: min.y,
                dataSizeX: size.x,
                dataSizeY: size.y,
                dataRow: '1',
                dataCol: column,
                title: title,
                region: region,
                instanceId: region
            });

            this.collection.add(data);
        },

        /**
         * Adds a placeholder into gridster without adding it into the collection.
         * @return {*}
         */
        addPlaceHolder: function() {
            if (!this.hasPlaceholder) {
                this.hasPlaceholder = true;

                var top = this.collection.where({'dataRow': '1'});
                var max = _.max(top, function(model) {
                    return model.get('dataCol');
                });

                if (_.isNumber(max) && !_.isFinite(max)) {
                    return this._addPlaceHolder();
                }
                var column = parseInt(max.get('dataCol'));
                column += parseInt(max.get('dataSizeX'));
                return this._addPlaceHolder(column);
            }
        },

        /**
         * Wrapper for add widget to place the placeholder defaults
         * @param {number} [column=PLACEHOLDER_DEFAULT_LOCATION]
         * @return {*}
         * @private
         */
        _addPlaceHolder: function(column) {
            var col = column || PLACEHOLDER_DEFAULT_LOCATION;
            return this.gridster.add_widget(
                PLACEHOLDER_HTML,
                PLACEHOLDER_DEFAULT_SIZE,
                PLACEHOLDER_DEFAULT_SIZE,
                col,
                PLACEHOLDER_DEFAULT_LOCATION
            );
        },

        /**
         * Used to save the gridster configuration
         */
        getConfig: function() {
            return this.collection.toJSON();
        },

        isSwitchboardOpen: function() {
            return this.viewModel.get('isSwitchBoardOpen') || false;
        },

        _defaultGridsterOptions: function() {
            return {
                namespace: '#gridster2',
                widget_selector: 'li',
                widget_base_dimensions: DEFAULT_DIMENSIONS,
                widget_margins: DEFAULT_MARGINS,
                helper: 'clone',
                avoid_overlapped_widgets: true,
                autogrow_cols: true,
                min_cols: 100,
                resize: {
                    enabled: true,
                    stop: this._stopHandler.bind(this)
                },
                draggable: {
                    stop: this._stopHandler.bind(this)
                }
            };
        },

        /**
         * Removes the list of the change widgets
         * @private
         */
        _resetChanged: function() {
            this.gridster.$changed = $([]);
        },

        /**
         * Called at the end of drag and resize
         * @private
         */
        _stopHandler: function() {
            this._setGridsterBaseDimension();
            this._updateGridsterModels();
        },

        /**
         * Extracts the data from the DOM elements and places it into the collection models
         * @private
         */
        _updateGridsterModels: function() {
            var changed = this.gridster.$changed;
            _.each(changed, function(element) {
                var id = element.getAttribute('data-instanceid');
                var model = this.collection.get(id);
                if (model) {
                    model.setFromElement(element);
                }
            }, this);
            this._resetChanged();
        },

        /**
         * Checks if a place holder widget exists and gets rid of it.
         * @private
         */
        _removePlaceHolder: function() {
            this.hasPlaceholder = false;
            var $dragHere = this.$('.dragHere');
            if ($dragHere.length) {
                this.gridster.remove_widget($dragHere);
            }
        },

        /**
         * This is a hack to force the force to make the item view work with gridster.
         *
         * Removes the old view events and re-attaches them
         * @param {Backbone.View} child An active childView
         * @private
         */
        _restoreChildEvents: function(child) {
            child.undelegateEvents();
            child.$el = this.$el.children().last();
            child.el = child.$el[0];
            child.delegateEvents();
            child.displaySwitchBoard();
        },

        /**
         * @param {string} appletId
         * @return {string}
         * @private
         */
        _requestDefaultView: function(appletId) {
            var channel = ADK.Messaging.getChannel(appletId);
            var response = channel.request('viewTypes');
            var defaultView = _.first(response);
            return _.get(defaultView, 'type');
        },

        /**
         * Finds the next available instance/region id
         * @return {string}
         * @private
         */
        _getNextId: function() {
            var offset = 1;
            var prefix = 'applet-';
            var id = prefix + (this.collection.length + offset);
            var prefixLength = prefix.length;
            var ids = this.collection.pluck('instanceId');
            var sortedId = _.sortBy(ids, function(value) {
                var suffix = value.substr(prefixLength);
                return Number(suffix);
            });

            _.each(sortedId, function(value, index) {
                var checkId = prefix + (index + offset);
                if (value !== checkId) {
                    id = checkId;
                    return false;
                }
            });
            return id;
        },

        /**
         * Warning if you don't do this gridster has a massive memory leak????
         * @private
         */
        _afterAddWidget: function() {
            var widgets = this.gridster.$widgets.toArray();
            this.gridster.arrange_widgets_no_vertical_clipping(widgets);
            this._setGridsterBaseDimension();
        },

        _setGridsterBaseDimension: function() {
            this.gridster.resize_widget_dimensions({
                widget_base_dimensions: this._getGridsterDimension()
            });
        },

        _getGridsterDimension: function() {
            var xOffset = 10;

            var windowWidth = window.innerWidth;
            var highestCell = this.gridster.get_highest_occupied_cell();
            var highestCol = highestCell.col + GRIDSTER_CONTAINER_RIGHT_PADDING;

            if (highestCol < 1) {
                return DEFAULT_DIMENSIONS;
            }

            var x = Math.floor(windowWidth / highestCol) - xOffset;
            x = Math.min(x, MAX_COLUMNS);

            return [x, MAX_ROWS];
        },

        _getBoundarySize: function() {
            // I have no clue what the intent of the function was ... there are two many magic numbers
            // I just preserved the original logic and dropped it in this file
            var minWorkspaces = 3;

            // I don't know why `4`
            var multiplier = 4;

            // I don't know why `45`
            var offsetPixels = 45;

            var xSize = ADK.utils.resize.dimensions.gridsterWidget.get('width');
            var workspaceTotalApplets = Math.floor(ADK.utils.resize.dimensions.viewport.get('width') / (xSize * 5));
            var workspaceAppletsPerPage = Math.max(minWorkspaces, workspaceTotalApplets);
            var editorAppletSize = (this._getGridsterDimension()[0] * multiplier) + offsetPixels;
            var editorIndicatorWidth = editorAppletSize * workspaceAppletsPerPage;
            this.triggerMethod('boundary:width', editorIndicatorWidth);
        }
    });
});