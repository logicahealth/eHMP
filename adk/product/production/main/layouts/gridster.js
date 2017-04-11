define([
    "backbone",
    "marionette",
    "underscore",
    "api/Messaging",
    "hbs!main/layouts/templates/gridster",
    "gridster",
    "api/UserDefinedScreens",
    "main/adk_utils/resizeUtils",
    "main/ADKApp"
], function(Backbone, Marionette, _, Messaging, Template, Gridster, UserDefinedScreens, ResizeUtils, ADKApp) {
    "use strict";

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
                this.resize_widget($widget, data.sizex, data.sizey);
                // this.resize_widget($widget, $widget.attr('data-sizex'), $widget.attr('data-sizey'));
            }, this));
        } catch (e) {
            //console.log('error!');
            //console.log(e);
        }
        this.generate_grid_and_stylesheet();
        this.get_widgets_from_DOM();
        this.set_dom_grid_height();
        if (options.callBack) {
            options.callBack();
        }
        return false;
    };

    var layoutView = Backbone.Marionette.LayoutView.extend({
        template: Template,
        className: "contentPadding",
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
            this.setModel();
        },
        events: {
            "click .fa-chevron-left": "scrollLeft",
            "click .fa-chevron-right": "scrollRight"
        },
        scrollLeft: function(e) {
            var maxCol = this.getMaxCol();
            var windowWidth = $(window).width();
            var gridsterWidth = (maxCol + 10) * 100;
            var index = parseInt($(e.currentTarget).attr('data-slide-to'));
            var slides = Math.ceil(gridsterWidth / windowWidth);
            var $gridsterEl = this.$el.find(".gridster");
            var scrollX = Math.abs($gridsterEl.offset().left);
            var scrlLeft;
            var iScroll;

            if (index >= 0) {

                if (index === 0) {
                    if (scrollX > (windowWidth - 71)) {
                        index--;
                        $(e.currentTarget).attr('data-slide-to', (index));
                        $('li[name="right-scroll"]').attr("data-slide-to", (index));

                        if (scrollX <= windowWidth - 71) {
                            $("div").scrollLeft(index * windowWidth - index * 71);
                        } else {
                            for (var i = index; i < slides; i++) {
                                iScroll = i * windowWidth - i * (73 + i);
                                if (scrollX <= iScroll) {
                                    $(e.currentTarget).attr('data-slide-to', (i - 1));
                                    $('li[name="left-scroll"]').attr("data-slide-to", (i - 1));
                                    $("div").scrollLeft((i - 1) * windowWidth - (i - 1) * (73 + (i - 1)));
                                    i = slides;
                                }
                            }
                        }
                    }
                } else if (index > 0) {
                    index--;
                    $(e.currentTarget).attr('data-slide-to', (index));
                    $('li[name="right-scroll"]').attr("data-slide-to", (index));
                    scrlLeft = index * windowWidth - index * (73 + index);
                    //$("div").scrollLeft(index*windowWidth-index*(73+index));
                    if (scrollX > index * windowWidth - index * (73 + index)) {
                        $("div").scrollLeft(index * windowWidth - index * (73 + index));
                    } else {
                        for (var j = 1; j < slides; j++) {
                            iScroll = j * windowWidth - j * (73 + j);
                            if (scrollX <= iScroll) {
                                $(e.currentTarget).attr('data-slide-to', (j - 1));
                                $('li[name="left-scroll"]').attr("data-slide-to", (j - 1));
                                $("div").scrollLeft((j - 1) * windowWidth - (j - 1) * (73 + (j - 1)));
                                j = slides;
                            }
                        }
                    }
                }
            }
        },
        scrollRight: function(e) {
            var maxCol = this.getMaxCol();
            var windowWidth = $(window).width();
            var gridsterWidth = (maxCol + 10) * 100;
            var slides = Math.floor(gridsterWidth / windowWidth);
            var index = parseInt($(e.currentTarget).attr('data-slide-to'));
            var scrlRight;
            var iScroll;

            if (index < (slides - 1)) {
                var $gridsterEl = this.$el.find(".gridster");
                //leftOffset = $gridsterEl.offset().left;
                var scrollX = Math.abs($gridsterEl.offset().left); //$(window).scrollLeft;
                index++;

                $(e.currentTarget).attr('data-slide-to', index);
                $('li[name="left-scroll"]').attr("data-slide-to", index);
                if ((index === 1)) {
                    scrlRight = index * windowWidth - index * (73 + index);
                    if (scrollX <= index * windowWidth - index * 71) {
                        $("div").scrollLeft(index * windowWidth - index * 71);
                    } else {
                        for (var i = slides; i > 1; i--) {
                            iScroll = i * windowWidth - i * (73 + i);
                            if ((scrollX >= iScroll) && (i >= index)) {
                                $(e.currentTarget).attr('data-slide-to', (i + 1));
                                $('li[name="left-scroll"]').attr("data-slide-to", (i + 1));
                                $("div").scrollLeft((i + 1) * windowWidth - (i + 1) * (73 + (i + 1)));
                                i = 1;
                            }
                        }
                    }
                } else if (index > 1) {
                    scrlRight = index * windowWidth - index * (73 + index);
                    if (scrollX <= index * windowWidth - index * (73 + index)) {
                        $("div").scrollLeft(index * windowWidth - index * (73 + index));
                    } else {
                        for (var j = slides; j > 1; j--) {
                            iScroll = j * windowWidth - j * (73 + j);
                            if ((scrollX >= jScroll) && (j >= index)) {
                                $(e.currentTarget).attr('data-slide-to', (j + 1));
                                $('li[name="left-scroll"]').attr("data-slide-to", (j + 1));
                                $("div").scrollLeft((j + 1) * windowWidth - (j + 1) * (73 + (j + 1)));
                                j = 1;
                            }
                        }
                    }
                }
            }
        },
        setModel: function() {
            this.model.set({
                'paginationHtml': '<div class="paginationContainer">' + this.getPaginationHtml() + '</div>'
            });
        },
        getPaginationHtml: function() {
            var html = '';
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var hashChar = '|';
            var maxCol = this.getMaxCol();
            var gridsterWidth = (maxCol + 10) * 100;
            var slides = Math.floor(gridsterWidth / windowWidth);
            var leftOffset = 18;
            var hashArea = windowWidth - 75 - leftOffset;
            var hashDistance = hashArea / slides;

            if (slides > 1) {
                html += '<div data-ride="pagination" style="position:fixed; z-index:3; top:' + (windowHeight - 70) + 'px; left:' + (windowWidth - 50) + 'px;"><ol class="pagination">';
                html += '<li class="fa fa-chevron-left" data-target="#screenPagination" name="left-scroll" data-slide-to="0" style="cursor:pointer" class="active"></li>&nbsp;&nbsp;';
                html += '<li class="fa fa-chevron-right" data-target="#screenPagination" name="right-scroll" style="cursor:pointer" data-slide-to="0"></li>';
                html += '</ol></div>';

                for (var i = 0; i <= slides; i++) {
                    html += '<div style="position:fixed; list-style:none; z-index:3; top:' + (windowHeight - 50) + 'px; left:' + Math.ceil(leftOffset) + 'px; ">|</div>';
                    leftOffset += hashDistance;
                }
            }

            return html;
        },
        getMaxCol: function() {
            var module = ADKApp.currentScreen;
            return UserDefinedScreens.getGridsterMaxColumn(module);
        },
        onBeforeShow: function() {
            var gridsterRegionModel = ResizeUtils.dimensions.gridsterRegion;
            this.listenTo(gridsterRegionModel, 'change:height', function(model) {
                this.$("> .gridster").height(model.get('height'));
            }, this);

            var gridsterWidgetModel = ResizeUtils.dimensions.gridsterWidget;
            this.listenTo(gridsterWidgetModel, 'change', function(model) {
                this.$('> .paginationContainer').html(this.getPaginationHtml());
                var xSize = model.get('width'),
                    ySize = model.get('height');
                var $gridsterEl = this.$(".gridster").gridster().data('gridster');

                $gridsterEl.resize_widget_dimensions({
                    widget_base_dimensions: [xSize, ySize]
                });
            }, this);
        },
        onDomRefresh: function() {
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
                    // console.log("  nothing changed since last save, skipping save check and save");
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
                // console.log("in gridster.js.saveGridsterAppletConfig: time since last save = " + (timeDiff/1000) + ", moveNumber: " + saveThrottleProperties.lastSave.numMoves);
                if (self.saveThrottleProperties.lastSave.numMoves === 1 && !overrideThrottle) {
                    // This is the first move so let's start a "timer"
                    // console.log("  first move not saving, setting reference time");
                    self.saveThrottleProperties.lastSave.time = currentTime;

                    // start a timer for
                } else if (overrideThrottle || timeDiff > self.saveThrottleProperties.gracePeriod || self.saveThrottleProperties.lastSave.numMoves >= self.saveThrottleProperties.maxMoves) {
                    // Force save, elapsed time longer than grace perieod, or more than enough moves to do the save
                    // so save and reset the counters/"timer"

                    UserDefinedScreens.saveGridsterConfig(appletsConfig, screen);
                    self.saveThrottleProperties.lastSave.time = currentTime;
                    self.saveThrottleProperties.lastSave.numMoves = 0;
                    self.saveThrottleProperties.lastSave.currentScreenModule = appletsConfig;
                } else {
                    // console.log("  not saving config");
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
                var col = parseInt($(this).attr('data-col'));
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
                    handle_append_to: '',
                    resize: function(e, ui, $widget) {
                        gridsterResizeSnap($widget);
                    },
                    stop: function(e, ui, $widget) {
                        gridsterResizeSnap($widget);
                        saveGridsterAppletsConfig();

                    }
                };
                draggable = {
                    ignore_dragging: function() {
                        return false;
                    },
                    stop: function(e, ui, $widget) {
                        saveGridsterAppletsConfig();
                    }
                };
            }
            gridster = $gridsterEl.gridster({
                widget_selector: "div",
                avoid_overlapped_widgets: true,
                widget_margins: [5, 5],
                widget_base_dimensions: [xSize, ySize],
                autogrow_cols: true,
                min_cols: Math.max(12, maxCol + 10),
                resize: resizable,
                draggable: draggable
            }).data('gridster');

            gridsterWidgetModel.calculateHeight();
            gridsterWidgetModel.calculateWidth();
            gridsterRegionModel.calculateHeight();

            var scrollPosition = UserDefinedScreens.getScrollPositionFromSession();
            $('#center-region').scrollLeft(scrollPosition);
            UserDefinedScreens.saveScrollPositionToSession(0);

            function gridsterResizeSnap($widget) {
                var sizeX = parseInt($widget.attr('data-sizex'));
                var mod = sizeX % 2;
                if (mod === 1) {
                    gridster.resize_widget($widget, sizeX + 1);
                }
            }

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            function randomId() {
                return S4() + S4() + S4();
            }
            //resetbase is needed to fix some issues that for some browsers the drag's not work properly when page first loads
            //resetGridsterBase(ADK.utils.resizedw);

            this.listenTo(Messaging, 'user:beginSessionEnd', function() {
                clearSaveGridsterAppletsConfigOnTimeout();
                if (appletsConfig)
                    UserDefinedScreens.saveGridsterConfig(appletsConfig, screenId);
            });

            this.listenTo(Messaging, 'gridster:saveAppletsConfig', function(isStackedGraph) {
                isStackedGraph =  isStackedGraph || false;
                saveGridsterAppletsConfig(true, isStackedGraph);
            });
        },
        onBeforeDestroy: function() {
            this.$("> .gridster").gridster().data('gridster').destroy();
        }
    });

    return layoutView;
});