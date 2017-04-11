define(["backbone", "api/Messaging"], function(Backbone, Messaging) {
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
                $bottomRegion = Messaging.request('get:adkApp:region', 'bottomRegion').$el || $('#bottom-region');

            var centerRegionHeight = $(window).height() - topRegionHeight - $bottomRegion.children().height();

            $centerRegion.css({
                'margin-top': topRegionHeight + 'px',
                'height': centerRegionHeight + 'px'
            });

            this.set('height', centerRegionHeight);
            return centerRegionHeight;
        },
        calculateWidth: function() {
            var windowWidth = $(window).width();

            this.set('width', windowWidth);
            return windowWidth;
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
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster') || $('#center-region .gridster'),
                gridsterHeight = null,
                windowHeight = $(window).height();
            if ($gridsterEl.offset()) {
                gridsterHeight = windowHeight - $gridsterEl.offset().top - 20;
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
            width: 91.5
        },
        calculateHeight: function() {
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster') || $('#center-region .gridster'),
                gridsterWidgetHeight = null,
                divisableUnits = 12,
                windowHeight = $(window).height();

            if ($gridsterEl.offset()) {
                gridsterWidgetHeight = (windowHeight - $gridsterEl.offset().top - 160) / divisableUnits;
                this.set('height', gridsterWidgetHeight);
            }
            return gridsterWidgetHeight;
        },
        calculateWidth: function() {
            var $gridsterEl = Messaging.request('get:adkApp:region', 'centerRegion').$el.find('.gridster') || $('#center-region .gridster'),
                gridsterWidgetWidth = null,
                windowWidth = $(window).width();

            if ($gridsterEl.length > 0) {
                var breakPoint1 = 12,
                    breakPoint2 = 12,
                    breakPoint3 = 16,
                    breakPoint4 = 20,
                    breakPoint5 = 24,
                    baseBreakPointValue = 12;
                var winWidth = windowWidth - 2 * $gridsterEl.position().left;
                var baseGridster = winWidth - (breakPoint1 * 10 + 30);
                var maxCol = 1;

                $gridsterEl.find('div[data-col]').each(function() {
                    var col = parseInt($(this).attr('data-col'));
                    var size = parseInt($(this).attr('data-sizex'));
                    col += size;
                    if (col > maxCol) maxCol = col;
                });
                if (windowWidth <= 1024) {
                    gridsterWidgetWidth = (1024 - 2 * $gridsterEl.position().left - 150) / breakPoint1;
                } else if (windowWidth > 1024 && windowWidth < 1280) {
                    gridsterWidgetWidth = baseGridster / 12;
                } else {
                    if (windowWidth >= 1280 && windowWidth < 1440) {
                        baseBreakPointValue = breakPoint2;
                    } else {
                        if (maxCol <= 13) {
                            gridsterWidgetWidth = baseGridster / breakPoint1;
                            this.set('width', gridsterWidgetWidth);
                            return gridsterWidgetWidth;
                        } else {
                            if (windowWidth >= 1440 && windowWidth < 1920) {
                                baseBreakPointValue = breakPoint3;
                            } else if (windowWidth >= 1920 && windowWidth < 2560) {
                                if (maxCol <= 17) {
                                    baseBreakPointValue = breakPoint3;
                                } else {
                                    baseBreakPointValue = breakPoint4;
                                }
                            } else {
                                if (maxCol <= 17) {
                                    baseBreakPointValue = breakPoint3;
                                } else if (maxCol <= 21) {
                                    baseBreakPointValue = breakPoint4;
                                } else {
                                    baseBreakPointValue = breakPoint5;
                                }
                            }
                        }
                    }
                    gridsterWidgetWidth = (winWidth - (baseBreakPointValue * 10 + 30)) / baseBreakPointValue;
                }
            }
            this.set('width', gridsterWidgetWidth);
            return gridsterWidgetWidth;
        }
    });
    // END OF: DIMENSION MODEL DEFINITIONS
    // -------------------------------------------------

    // Define an object that holds a single reusable model for each
    // element in which the application needs to keep track of it's size.
    var appDimensions = ResizeUtils.dimensions = {
        gridsterRegion: new GridsterRegionDimensionModel(),
        gridsterWidget: new GridsterWidgetDimensionModel(),
        centerRegion: new CenterRegionDimensionModel(),
        patientDemographics: new DimensionModel(),
        workspaceNavigation: new DimensionModel(),
        header: new DimensionModel(),
        footer: new DimensionModel(),
        viewport: new WindowDimensionModel()
    };

    // Group all the resize methods for the application's wrapping container together
    var containerResize = ResizeUtils.containerResize = function() {
        appDimensions.viewport.calculateHeight();
        appDimensions.viewport.calculateWidth();
        
        appDimensions.centerRegion.calculateHeight();
        appDimensions.centerRegion.calculateWidth();
    };
    // Group all the resize methods for gridster together
    var gridsterResize = ResizeUtils.gridsterResize = function() {
        appDimensions.gridsterRegion.calculateHeight();
        appDimensions.gridsterWidget.calculateHeight();
        appDimensions.gridsterWidget.calculateWidth();
    };

    // One single method that gets called on the window's resize event
    var windowResize = ResizeUtils.windowResize = function() {
        containerResize();
        gridsterResize();
    };

    // Methods to Register and Un-register to the window resize event
    // (These should be used at App Start and at APP End)
    var debouncedWindowResize = _.debounce(windowResize, 100);
    ResizeUtils.register = function() {
        $(window).on('resize.resizeUtil', debouncedWindowResize);
    };
    ResizeUtils.unRegister = function() {
        $(window).off('resize.resizeUtil', debouncedWindowResize);
        debouncedWindowResize.cancel();
    };

    // TODO : Clean up logic and create an appropriate dimension model
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
    ResizeUtils.jqPlugs = function() {
        (function($) {
            $.fn.resizeEnd = function(a) {
                var args = $.extend({
                    cb: function() {},
                    namespace: '',
                    duration: 100,
                    timeoutName: 'resizeTimeout',
                    timeoutCallbackName: 'resizeCallback',
                    timeoutFunctionName: 'resizeFunction'
                }, a);
                this.each(function() {
                    var t = $(this);
                    t.data(args.timeoutCallbackName, args.cb);
                    t.data(args.timeoutFunctionName, function() {
                        clearTimeout($(this).data(args.timeoutName));
                        $(this).data(args.timeoutName, setTimeout(function() {
                            args.cb();
                        }), args.duration);
                    });
                    t.bind('resize' + (args.namespace === '' ? '' : '.' + args.namespace), function() {
                        clearTimeout($(this).data(args.timeoutName));
                        $(this).data(args.timeoutName, setTimeout(function() {
                            clearTimeout($(this).data('resizeTimeout'));
                            $(this).data(args.timeoutName, setTimeout(function() {
                                args.cb();
                            }), args.duration);
                        }, args.duration));
                    });
                });
            };
        })(jQuery);
    }();
    ResizeUtils.filteredView = function(view) {
        if (!_.isUndefined(view)) {
            if (view.indexOf('-full') > -1) {
                if (ResizeUtils.hasMob()) {
                    var mobName = 'captureFilter';
                    ResizeUtils.deployMob({
                        name: mobName,
                        target: $('#center-region')[0],
                        args: {
                            attributes: false,
                            childList: true,
                            characterData: false,
                            subtree: true
                        },
                        mobCb: function(mutes) {
                            for (var i = 0; i < mutes.length; i++) {
                                var mute = mutes[i];
                                var nodes = mute.addedNodes;
                                for (var j = 0; j < nodes.length; j++) {
                                    var node = nodes[j];
                                    if ($(node).find('.gridContainer').not('.filter-parsed').length > 0) {
                                        var gc = $('.gridContainer');
                                        gc.addClass('filter-parsed');
                                        ResizeUtils.destroyMob(mobName);
                                        break;
                                    }
                                }
                            }
                            var fp = $('.gridContainer.filter-parsed');
                            var scrollingView = fp.find('.grid-container');

                            var svAdjustHeight = function(obj) {
                                var sh = 0;
                                obj.siblings().each(function() {
                                    if ($(this).is(':visible')) {
                                        sh += $(this).height();
                                    }
                                });
                                obj.height(obj.parent().height() - sh);
                            };
                            svAdjustHeight(scrollingView);

                            var collapsingDiv = fp.find('[id^="grid-filter"]');
                            collapsingDiv.on('hidden.bs.collapse', function() {
                                svAdjustHeight(scrollingView);
                            });
                            collapsingDiv.on('shown.bs.collapse', function() {
                                svAdjustHeight(scrollingView);
                            });
                            // i set a resize event listener to window in order to resize the scrolling area
                            $(window).resizeEnd({
                                cb: function() {
                                    svAdjustHeight(scrollingView);
                                },
                                namespace: 'fullViewFilterResize',
                                duration: 300,
                                timeoutName: 'fr_resizeTimeout',
                                timeoutCallbackName: 'fr_resizeCallback',
                                timeoutFunctionName: 'fr_resizeFunction'
                            });
                            // now i have to remove the window resize event listener if i go outside the full applet view
                            ResizeUtils.deployMob({
                                name: 'removeCaptureFilter',
                                target: $('#center-region')[0],
                                args: {
                                    attributes: false,
                                    childList: true,
                                    characterData: false,
                                    subtree: true
                                },
                                mobCb: function(mutes_2) {
                                    for (var i = 0; i < mutes_2.length; i++) {
                                        var mute_2 = mutes_2[i];
                                        var nodes_2 = mute_2.removedNodes;
                                        for (var j = 0; j < nodes_2.length; j++) {
                                            var node_2 = nodes_2[j];
                                            if ($(node_2).find('.gridContainer.filter-parsed').length > 0) {
                                                var win = $(window);
                                                win.unbind('resize.fullViewFilterResize');
                                                delete win.data().fr_resizeTimeout;
                                                delete win.data().fr_resizeCallback;
                                                delete win.data().fr_resizeFunction;
                                                ResizeUtils.destroyMob('removeCaptureFilter');
                                                break;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    };
    // END OF: RESIZING CODE FOR APPLETS WITH FILTERS
    // -------------------------------------------------

    return ResizeUtils;
});