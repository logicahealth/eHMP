define([
    'backbone',
    'api/Messaging',
    'jsHelpers'
], function(
    Backbone,
    Messaging,
    jsHelpers
) {
    "use strict";
    // THIS APPLICATION IS DESIGNED FOR A MINIMUM SCREEN RESOLUTION OF:
    // 1280px x 768px

    var ResizeUtils = {};

    // -------------------------------------------------
    // START OF: DIMENSION MODEL DEFINITIONS
    var DimensionModel = Backbone.Model.extend({
        defaults: {
            height: null,
            width: null,
        },
        calculateHeight: function() {
            return this.height;
        },
        calculateWidth: function() {
            return this.width;
        },
        recalculate: function(options) {
            this.calculateWidth.apply(this, arguments);
            this.calculateHeight.apply(this, arguments);
        }
    });

    // Custom dimension model for the browser's window
    var WindowDimensionModel = DimensionModel.extend({
        defaults: {
            // (base screen height)
            // -------------------------------------------------
            // (768px)
            height: 768,
            // (base screen width)
            // -------------------------------------------------
            // (1280px)
            width: 1280
        },
        calculateHeight: function() {
            var windowHeight = $(window).height();
            this.set('height', windowHeight);
            return windowHeight;
        },
        calculateWidth: function() {
            var windowWidth = $(window).width();

            this.set('width', windowWidth);
            return windowWidth;
        }
    });

    // Custom dimension model for the region in which all the applets are loaded into
    var CenterRegionDimensionModel = DimensionModel.extend({
        defaults: {
            // (base screen height) - (base header height) - (base patient demographics height) -
            // (base workspace navigation height) - (base footer height)
            // -------------------------------------------------
            // (768px - 28px - 58px - 36px - 28px)
            height: 618,
            // (base screen width)
            // -------------------------------------------------
            // (1280px)
            width: 1280
        },
        calculateHeight: function() {
            var topRegionHeight = Messaging.request('get:adkApp:region', 'topRegion').$el.children().height() || 0,
                $centerRegion = Messaging.request('get:adkApp:region', 'centerRegion').$el || $('#center-region'),
                $bottomRegion = Messaging.request('get:adkApp:region', 'bottomRegion').$el || $('#bottom-region'),
                $otherItems = $('.additional-center-region-height-calculation'),
                extraHeight = 0;

            _.each($otherItems, function(item) {
                extraHeight += $(item).outerHeight(true);
            });

            var centerRegionHeight = $(window).height() - topRegionHeight - $bottomRegion.children().height() - extraHeight;
            var centerRegionMargionTop = topRegionHeight + extraHeight;

            $centerRegion.css({
                'margin-top': centerRegionMargionTop + 'px',
                'height': centerRegionHeight + 'px'
            });

            this.set('height', centerRegionHeight);
            return centerRegionHeight;
        },
        calculateWidth: function() {
            var $centerRegion = Messaging.request('get:adkApp:region', 'centerRegion').$el || $('#center-region');
            if (_.isEmpty($centerRegion)) {
                $centerRegion = $(window);
            }
            var centerRegionWidth = $centerRegion.width();

            this.set('width', centerRegionWidth);
            return centerRegionWidth;
        }
    });

    var ContentRegionDimensionModel = DimensionModel.extend({
        defaults: {
            // (base screen height) - (base header height) -
            // (base workspace navigation height) - (base footer height)
            // -------------------------------------------------
            // (768px - 28px  - 36px - 28px)
            height: 676,
            width: null
        },
        calculateHeight: function(centerRegionModel) {
            var $contentRegion = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.content-region-resize-height');
            if (_.isEmpty($contentRegion)) {
                $contentRegion = $('#center-region .content-region-resize-height');
                if (_.isEmpty($contentRegion)) {
                    $contentRegion = $('#center-region #content-region');
                }
            }
            var $otherItems = $('.additional-content-region-height-calculation'),
                extraHeight = 0;

            _.each($otherItems, function(item) {
                extraHeight += $(item).outerHeight(true);
            });

            var contentRegionHeight = centerRegionModel.get('height') - extraHeight;
            $contentRegion.css({
                'height': contentRegionHeight + 'px'
            });

            this.set('height', contentRegionHeight);
            return contentRegionHeight;
        },
        calculateWidth: function(centerRegionModel) {
            var $contentRegion = this.getContentRegion();
            var $otherItems = $('.additional-content-region-width-calculation'),
                extraWidth = 0;

            _.each($otherItems, function(item) {
                extraWidth += $(item).outerWidth(true);
            });

            var contentRegionWidth = centerRegionModel.get('width') - extraWidth;
            $contentRegion.css({
                'width': contentRegionWidth + 'px',
            });
            this.set({
                width: contentRegionWidth
            });

            return contentRegionWidth;
        },
        calculateViewportWidth: function(openTrayModel) {
            var $contentRegion = this.getContentRegion();
            var openTrayWidth = openTrayModel ? openTrayModel.calculateWidth() || 0 : 0;
            var viewportWidth = this.get('width') - openTrayWidth;
            $contentRegion.css({
                'width': viewportWidth + 'px'
            });
            this.set('viewport', viewportWidth);
        },
        getContentRegion: function() {
            var $contentRegion = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.content-region-resize-width');
            if (_.isEmpty($contentRegion)) {
                $contentRegion = $('#center-region .content-region-resize-width');
                if (_.isEmpty($contentRegion)) {
                    $contentRegion = $('#center-region #content-region');
                }
            }
            return $contentRegion;
        }
    });

    // Custom dimension model for the gridster container which appears inside the centerRegion
    var GridsterRegionDimensionModel = DimensionModel.extend({
        defaults: {
            // (base screen height) - (gridster top offset) - (additional spacing)
            // -------------------------------------------------
            // (768px - 122px - 20px)
            height: 626,
            width: null
        },
        calculateHeight: function() {
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster');
            if (_.isEmpty($gridsterEl)) {
                $gridsterEl = $('#center-region .gridster');
            }
            var gridsterHeight = null,
                regionMarginBottom = 20,
                windowHeight = $(window).height(),
                contentRegionHeight = appDimensions.contentRegion.get('height');
            if ($gridsterEl.offset()) {
                gridsterHeight = contentRegionHeight - regionMarginBottom;
                this.set('height', gridsterHeight);
            }
            return gridsterHeight;
        }
    });
    // Custom dimension model for sizing gridster's base widgets
    // (which is gridster's unit of measurment)
    var GridsterWidgetDimensionModel = DimensionModel.extend({
        defaults: {
            // ((base screen height) - (gridster top offset) - (additional spacing)) / (divisable units)
            // -------------------------------------------------
            // (768px - 122px - 160px) / 12
            height: 40.5,
            // (((base screen width) - 2 * (gridster left position)) - ((base breakpoint value) * 10 + 30)) / (base breakpoint value)
            // -------------------------------------------------
            // ((1280px - 2 * 16) - (12 * 10 + 30)) / 12
            width: 91.5,
            breakPointValue: 12,
            totalNumberOfColumnsFilled: 12,
            GRIDSTER_MARGIN_VALUE: 5
        },
        calculateHeight: function() {
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster');
            if (_.isEmpty($gridsterEl)) {
                $gridsterEl = $('#center-region .gridster');
            }
            var gridsterWidgetHeight = null,
                divisableUnits = 12,
                windowHeight = $(window).height(),
                gridsterRegionHeight = appDimensions.gridsterRegion.get('height');
            if ($gridsterEl.offset()) {
                gridsterWidgetHeight = (gridsterRegionHeight / divisableUnits) - (2 * this.get('GRIDSTER_MARGIN_VALUE'));
                this.set('height', gridsterWidgetHeight);
            }
            return gridsterWidgetHeight;
        },
        calculateWidth: function() {
            if (appDimensions.openTray.trayOpen()) return this.get('width');
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster');
            if (_.isEmpty($gridsterEl)) {
                $gridsterEl = $('#center-region .gridster');
            }
            var baseBreakPoint = 12,
                maxCol = 1,
                widgetWidthDimension = null,
                containerWidth = appDimensions.contentRegion.get('width');

            var breakPoint = baseBreakPoint;

            if ($gridsterEl.length > 0) {
                var maxbreakPoint = 32,
                    breakPointIncrement = 4,
                    minWidgetWidthDimension = 75,
                    extraPadding = 2 * this.get('GRIDSTER_MARGIN_VALUE'),
                    extraGridsterRegionMargin = 2 * 5,
                    i;

                $gridsterEl.find('div[data-col]').each(function() {
                    var col = parseInt($(this).attr('data-col')) - 1;
                    var size = parseInt($(this).attr('data-sizex'));
                    col += size;
                    if (col > maxCol) maxCol = col;
                });
                for (i = maxbreakPoint; i > baseBreakPoint; i = i - breakPointIncrement) {
                    if (maxCol >= i && ((containerWidth - (i * extraPadding) - extraGridsterRegionMargin) / i) >= minWidgetWidthDimension) {
                        breakPoint = i;
                        break;
                    }
                }
                widgetWidthDimension = _.max([((containerWidth - (breakPoint * extraPadding) - extraGridsterRegionMargin) / breakPoint), minWidgetWidthDimension]);
            }
            this.set({
                'width': widgetWidthDimension,
                'breakPointValue': breakPoint,
                'totalNumberOfColumnsFilled': maxCol
            });
            return widgetWidthDimension;
        }
    });
    var OpenTrayDimensionModel = DimensionModel.extend({
        defaults: {
            height: null,
            width: 0
        },
        calculateWidth: function() {
            var $tray = $('aside.tray-container .sidebar.open .sidebar-tray >');
            var openTrayWidth = $tray.attr('data-tray-width') || $tray.outerWidth(true);
            this.set('width', openTrayWidth);
            return openTrayWidth;
        },
        trayOpen: function() {
            return this.get('width') > 0;
        }
    });
    // END OF: DIMENSION MODEL DEFINITIONS
    // -------------------------------------------------

    // Define an object that holds a single reusable model for each
    // element in which the application needs to keep track of it's size.
    var appDimensions = ResizeUtils.dimensions = {
        openTray: new OpenTrayDimensionModel(),
        gridsterRegion: new GridsterRegionDimensionModel(),
        gridsterWidget: new GridsterWidgetDimensionModel(),
        centerRegion: new CenterRegionDimensionModel(),
        contentRegion: new ContentRegionDimensionModel(),
        patientDemographics: new DimensionModel(),
        workspaceNavigation: new DimensionModel(),
        header: new DimensionModel(),
        footer: new DimensionModel(),
        viewport: new WindowDimensionModel()
    };

    // Group all the resize methods for the application's wrapping container together
    var containerResize = ResizeUtils.containerResize = function() {
        Messaging.trigger("resize.ehmp.container");
        appDimensions.viewport.recalculate();
        appDimensions.centerRegion.recalculate();
        appDimensions.contentRegion.recalculate(appDimensions.centerRegion);
        appDimensions.contentRegion.calculateViewportWidth(appDimensions.openTray);
        Messaging.trigger("resized.ehmp.container", appDimensions);
    };

    // Group all the resize methods for gridster together
    var gridsterResize = ResizeUtils.gridsterResize = function() {
        Messaging.trigger("resize.ehmp.gridster");
        appDimensions.gridsterRegion.calculateHeight();
        appDimensions.gridsterWidget.recalculate();
        Messaging.trigger("resize.ehmp.gridster", appDimensions);
    };

    // One single method that gets called on the window's resize event
    var windowResize = ResizeUtils.windowResize = function() {
        Messaging.trigger("resize.ehmp.window");
        containerResize();
        gridsterResize();
        Messaging.trigger("resized.ehmp.window", appDimensions);
    };

    var trayOpeningResize = ResizeUtils.trayToggleResize = function() {
        Messaging.trigger("resize.ehmp.toggle-tray");
        if (!appDimensions.openTray.trayOpen()) {
            appDimensions.openTray.calculateWidth();
            appDimensions.contentRegion.calculateViewportWidth(appDimensions.openTray);
            gridsterResize();
            Messaging.trigger("resized.ehmp.toggle-tray resized.ehmp.close-tray", appDimensions);
        } else {
            appDimensions.openTray.set('width', 0);
            appDimensions.contentRegion.calculateViewportWidth();
            gridsterResize();
            Messaging.trigger("resized.ehmp.toggle-tray resized.ehmp.open-tray", appDimensions);
        }
    };

    var debouncedWindowResize = jsHelpers.debounce(windowResize, 100, false);

    // Methods to Register and Un-register to the window resize event
    // (These should be used at App Start and at APP End)
    ResizeUtils.register = function() {
        $(window).on('resize.resizeUtil', debouncedWindowResize);
    };

    ResizeUtils.unRegister = function() {
        $(window).off('resize.resizeUtil', debouncedWindowResize);
    };

    // -------------------------------------------------
    // START OF: RESIZING CODE FOR APPLETS WITH FILTERS
    ResizeUtils.hasMob = function() {
        var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
        for (var i = 0; i < prefixes.length; i++) {
            if (prefixes[i] + 'MutationObserver' in window) {
                return window[prefixes[i] + 'MutationObserver'];
            }
        }
        return false;
    };

    ResizeUtils.deployMob = function(ma) {
        var mobArgs = $.extend({
            name: '',
            target: false,
            args: {},
            mobCb: function() {}
        }, ma);
        if (ResizeUtils.hasMob()) {
            // Create an observer instance
            if (_.isUndefined($(document).data('mobs'))) {
                $(document).data('mobs', {});
            }
            var mobs = $(document).data('mobs');
            mobs[mobArgs.name] = new MutationObserver(function(mutations) {
                mobArgs.mobCb(mutations);
            });
            // Pass in the target node, as well as the observer options
            mobs[mobArgs.name].observe(mobArgs.target, mobArgs.args);
        }
    };
    ResizeUtils.destroyMob = function(mobName) {
        if ((!_.isUndefined($(document).data('mobs'))) && (!_.isUndefined($(document).data('mobs')[mobName]))) {
            $(document).data('mobs')[mobName].disconnect();
            delete $(document).data('mobs')[mobName];
        }
    };
    // END OF: RESIZING CODE FOR APPLETS WITH FILTERS
    // -------------------------------------------------

    return ResizeUtils;
});