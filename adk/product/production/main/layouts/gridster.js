define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'api/Messaging',
    'gridster',
    'api/UserDefinedScreens',
    'main/adk_utils/resizeUtils',
    'main/ADKApp',
    'jsHelpers'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    Messaging,
    Gridster,
    UserDefinedScreens,
    ResizeUtils,
    ADKApp,
    jsHelpers
) {
    "use strict";

    var MINIMUM_NUMBER_OF_COLUMNS = 12;
    var WIDGET_PADDING = 2 * ResizeUtils.dimensions.gridsterWidget.get('GRIDSTER_MARGIN_VALUE');
    var PAGINATION_LEFT_OFFSET = 18;
    var PAGINATION_RIGHT_OFFSET = 75;
    var BROWSER_SCROLLBAR_HEIGHT = 17;

    /**
     *  Overwriting Gridster Methods
     */
    Gridster.prototype.resize_widget_dimensions = function(options) {

        if (options.widget_margins) {
            this.options.widget_margins = options.widget_margins;
        }

        if (options.widget_base_dimensions) {
            this.options.widget_base_dimensions = options.widget_base_dimensions;
        }

        this.min_widget_width = (this.options.widget_margins[0] * 2) + this.options.widget_base_dimensions[0];
        this.min_widget_height = (this.options.widget_margins[1] * 2) + this.options.widget_base_dimensions[1];

        try {
            var serializedGrid = this.serialize();
            this.$widgets.each($.proxy(function(i, widget) {
                var $widget = $(widget);
                var data = serializedGrid[i];
                this.resize_widget($widget, data.size_x, data.size_y);
            }, this));
        } catch (e) {}
        this.generate_grid_and_stylesheet();
        this.get_widgets_from_DOM();
        this.set_dom_grid_height();
        if (options.callBack) {
            options.callBack();
        }
        return false;
    };
    Gridster.prototype.set_dom_grid_width = function(cols, model) {
        var gridsterWidgetModel = model || ResizeUtils.dimensions.gridsterWidget;
        var extraMargin = gridsterWidgetModel.get('GRIDSTER_MARGIN_VALUE') || 5;  // = left margin of leftmost widget + right margin of rightmost widget
        var isWorkspaceEditorGridster = Messaging.request('get:adkApp:region', 'modalRegion').currentView;

        if (typeof cols === 'undefined') {
            cols = this.get_highest_occupied_cell().col;
        }
        var max_cols = (this.options.autogrow_cols ? this.options.max_cols : this.cols);
        cols = Math.min(max_cols, Math.max(cols, this.options.min_cols));

        if (isWorkspaceEditorGridster) {
            this.container_width = this.get_highest_occupied_cell().col * (this.min_widget_width + this.resize_max_size_x) + (extraMargin / 2);
        } else {
            this.container_width = cols * this.min_widget_width;  // original logic
        }
        this.$el.css({
            'width': this.container_width,
            'margin': '0 2px'
        });
        return this;
    };
    Gridster.prototype.set_dom_grid_height = function(height) {
        this.container_height = this.$wrapper.height();
        this.$el.css('height', ResizeUtils.dimensions.gridsterRegion.get('height') || this.wrapper_height);
        return this;
    };

    var layoutView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile('<div class="gridster"></div>'),
        className: "contentPadding hidden-overflow-y auto-overflow-x percent-height-100",
        saveThrottleProperties: {
            lastSave: {
                time: 0,
                numMoves: 0
            }
        },
        initialize: function(options) {
            // load configs from app.json
            var appConfig = new Backbone.Model();
            appConfig.set(ADK.Messaging.request('appConfig').attributes);

            this.freezeApplets = options.freezeApplets;
            this.saveThrottleProperties.maxMoves = appConfig.get("numMovesBeforeSaveUDSConfig");
            this.saveThrottleProperties.gracePeriod = appConfig.get("saveUDSConfigTimeout");
            if (typeof this.saveThrottleProperties.maxMoves != 'number') {
                this.saveThrottleProperties.maxMoves = 10;
            } else {
                // double the number of maxMoves because of the number of times saveGridsterAppletsConfig gets called
                this.saveThrottleProperties.maxMoves *= 2;
            }
            if (typeof this.saveThrottleProperties.gracePeriod != 'number') {
                this.saveThrottleProperties.gracePeriod = 15000;
            }
            this.model = new Backbone.Model({});
        },
        onBeforeShow: function() {
            var gridsterRegionModel = ResizeUtils.dimensions.gridsterRegion;
            this.listenTo(gridsterRegionModel, 'change:height', function(model) {
                this.$("> .gridster").height(model.get('height'));
            }, this);

            var gridsterWidgetModel = ResizeUtils.dimensions.gridsterWidget;
            this.listenTo(gridsterWidgetModel, 'change', function(model) {
                var xSize = model.get('width'),
                    ySize = model.get('height');
                var $gridsterEl = this.$(".gridster").gridster().data('gridster');

                $gridsterEl.resize_widget_dimensions({
                    widget_base_dimensions: [xSize, ySize]
                });
            }, this);

            this.listenTo(Messaging, 'loaded.ehmp.workspace resized.ehmp.window resized.ehmp.close-tray', function(dimensionsObject) {
                jsHelpers.debounce(_.bind(function() {
                    this.initializeScrollPanel(dimensionsObject);
                }, this), 100, false)();
            });
            this.listenTo(Messaging, 'resized.ehmp.open-tray', function(dimensionsObject) {
                jsHelpers.debounce(_.bind(function() {
                    this.initializeScrollPanel(dimensionsObject);
                }, this), 100, false)();
            });
        },
        initializeScrollPanel: function(dimensionsObject, adjustArrowButtonSpeed) {
            var gridsterWidgetModel, contentRegionWidth;
            if (_.isObject(dimensionsObject)) {
                gridsterWidgetModel = dimensionsObject.gridsterWidget;
                contentRegionWidth = dimensionsObject.contentRegion.get('viewport');
            } else {
                gridsterWidgetModel = ResizeUtils.dimensions.gridsterWidget;
                contentRegionWidth = ResizeUtils.dimensions.contentRegion.get('viewport');
            }
            this.$el.width(contentRegionWidth);
            this.$(".gridster").gridster().data('gridster').set_dom_grid_width(undefined, gridsterWidgetModel);
            var numberOfCols = gridsterWidgetModel.get('breakPointValue');
            var scrollSpeed = gridsterWidgetModel.get('width') * numberOfCols + (numberOfCols * WIDGET_PADDING);
            var options = {
                showArrows: true,
                horizontalArrowPositions: 'after',
                arrowButtonSpeed: scrollSpeed,
                scrollPagePercent: 0.5,
                maintainPosition: true
            };
            if (!_.isUndefined(this.$el.data('jsp'))) {
                if (adjustArrowButtonSpeed) {
                    _.extend(options, {
                        arrowButtonSpeed: scrollSpeed / 3
                    });
                }
                this.$el.data('jsp').reinitialise(options);
            } else {
                return this.$el.jScrollPane(options);

            }
        },
        onDomRefresh: function() {
            UserDefinedScreens.getGridsterMaxColumn(ADKApp.currentScreen);
            var self = this;
            var gridster;
            var $gridsterEl = this.$("> .gridster");
            var screenId = Messaging.request('get:current:screen').id;
            var appletsConfig;

            var gridsterWidgetModel = ResizeUtils.dimensions.gridsterWidget,
                gridsterRegionModel = ResizeUtils.dimensions.gridsterRegion;

            function saveGridsterAppletsConfig(overrideThrottle, isStackedGraph) {
                var screen = Messaging.request('get:current:screen').id;
                appletsConfig = UserDefinedScreens.serializeGridsterScreen($gridsterEl, screen);
                // check if anything changed from last save
                if (self.saveThrottleProperties.lastSave.currentScreenModule && UserDefinedScreens.getGridsterTemplate(self.saveThrottleProperties.lastSave.currentScreenModule) === UserDefinedScreens.getGridsterTemplate(appletsConfig) && !isStackedGraph) {
                    self.saveThrottleProperties.lastSave.numMoves = 0;
                    clearSaveGridsterAppletsConfigOnTimeout();
                    return;
                }

                ADK.UserDefinedScreens.setHasCustomize(screenId);

                // save to the session
                UserDefinedScreens.saveGridsterConfigToSession(appletsConfig, screen);

                var currentTime = getSaveTime();
                var timeDiff = currentTime - self.saveThrottleProperties.lastSave.time;
                self.saveThrottleProperties.lastSave.numMoves++;
                if (self.saveThrottleProperties.lastSave.numMoves === 1 && !overrideThrottle) {
                    // This is the first move so let's start a "timer"
                    self.saveThrottleProperties.lastSave.time = currentTime;
                } else if (overrideThrottle || timeDiff > self.saveThrottleProperties.gracePeriod || self.saveThrottleProperties.lastSave.numMoves >= self.saveThrottleProperties.maxMoves) {
                    // Force save, elapsed time longer than grace perieod, or more than enough moves to do the save
                    // so save and reset the counters/"timer"
                    UserDefinedScreens.saveGridsterConfig(appletsConfig, screen);
                    self.saveThrottleProperties.lastSave.time = currentTime;
                    self.saveThrottleProperties.lastSave.numMoves = 0;
                    self.saveThrottleProperties.lastSave.currentScreenModule = appletsConfig;
                }
                // reset the timeout to save in case this save is not called again
                clearSaveGridsterAppletsConfigOnTimeout();
                saveGridsterAppletsConfigOnTimeout(appletsConfig, screen);
            }

            function saveGridsterAppletsConfigOnTimeout(configuration, screen) {
                Gridster.saveGridsterConfigTimeout = setTimeout(function() {
                    UserDefinedScreens.saveGridsterConfig(configuration, screen);
                    self.saveThrottleProperties.lastSave.time = getSaveTime();
                    self.saveThrottleProperties.lastSave.numMoves = 0;
                }, self.saveThrottleProperties.gracePeriod);
            }

            function clearSaveGridsterAppletsConfigOnTimeout() {
                clearTimeout(Gridster.saveGridsterConfigTimeout);
            }

            function getSaveTime() {
                var d = new Date();
                return d.getTime();
            }


            var xSize = gridsterWidgetModel.get('width');
            var ySize = gridsterWidgetModel.get('height');
            var maxCol = 1;
            this.$('> .gridster div[data-col]').each(function() {
                var col = parseInt($(this).attr('data-col')) - 1;
                var size = parseInt($(this).attr('data-sizex'));
                col += size;
                if (col > maxCol) maxCol = col;
            });
            var resizable = {};
            var draggable = {};

            if (this.freezeApplets) {
                resizable = {
                    enabled: false
                };
                draggable = {
                    ignore_dragging: function() {
                        return true;
                    }
                };
                this.$('> .gridster').addClass('freeze-applets');
            } else {
                resizable = {
                    enabled: true,
                    stop: function(e, ui, $widget) {
                        self.$el.data('jsp').reinitialise(null, true);
                        saveGridsterAppletsConfig();
                    }
                };
                draggable = {
                    handle: "div.panel-heading.grid-applet-heading",
                    stop: function(e, ui, $widget) {
                        self.$el.data('jsp').reinitialise(null, true);
                        saveGridsterAppletsConfig();
                    }
                };
                maxCol = maxCol + 4;
            }
            gridster = $gridsterEl.gridster({
                widget_selector: "div",
                avoid_overlapped_widgets: true,
                widget_margins: [5, 5],
                widget_base_dimensions: [xSize, ySize],
                autogrow_cols: true,
                min_cols: _.max([MINIMUM_NUMBER_OF_COLUMNS, maxCol]),
                resize: resizable,
                draggable: draggable
            }).data('gridster');

            gridsterRegionModel.calculateHeight();
            gridsterWidgetModel.calculateHeight();
            gridsterWidgetModel.calculateWidth();

            this.listenTo(Messaging, 'user:beginSessionEnd', function() {
                clearSaveGridsterAppletsConfigOnTimeout();
                if (appletsConfig)
                    UserDefinedScreens.saveGridsterConfig(appletsConfig, screenId);
            });

            this.listenTo(Messaging, 'gridster:saveAppletsConfig', function(isStackedGraph) {
                isStackedGraph = isStackedGraph || false;
                saveGridsterAppletsConfig(true, isStackedGraph);
            });

            var scrollPosition = Math.abs(UserDefinedScreens.getScrollPositionFromSession());
            this.initializeScrollPanel().data('jsp').scrollToX(scrollPosition, false);
            UserDefinedScreens.saveScrollPositionToSession(0);
        },
        onBeforeDestroy: function() {
            this.$(".gridster").gridster().data('gridster').destroy();
        }
    });

    return layoutView;
});