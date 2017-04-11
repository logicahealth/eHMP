define([
    'backbone',
    'marionette',
    'underscore',
    'highcharts',
    'hbs!app/applets/stackedGraph/list/rowItemViewTemplate',
    'hbs!app/applets/stackedGraph/list/rowItemViewMedicationsTemplate',
    'hbs!app/applets/stackedGraph/list/rowItemViewLabsTemplate',
    'app/applets/stackedGraph/utils/utils',
    'app/applets/stackedGraph/tilesorting/rowItemParentView',
    'hbs!app/applets/stackedGraph/list/popoverTemplate',
    'typeahead',
    'highcharts-more'
], function(Backbone, Marionette, _, Highcharts, RowItemViewTemplate, RowItemViewMedicationsTemplate, RowItemViewLabsTemplate, Utils, RowItemParentView, PopoverTemplate) {
    "use strict";


    // This is an asset and it should not be here?!
    // js-hint is causing linting errors on this, but because it is not
    // our code originally I decided not to modify it.
    // It is under MIT so we can change it if we want.

    /* jshint ignore:start */
    /**
     * Detect Element Resize Plugin for jQuery
     *
     * https://github.com/sdecima/javascript-detect-element-resize
     * Sebastian Decima
     *
     * version: 0.5.3
     **/

    (function($) {
        var attachEvent = document.attachEvent,
            stylesCreated = false;

        var jQuery_resize = $.fn.resize;

        $.fn.resize = function(callback) {
            return this.each(function() {
                if (this == window)
                    jQuery_resize.call(jQuery(this), callback);
                else
                    addResizeListener(this, callback);
            });
        };

        $.fn.removeResize = function(callback) {
            return this.each(function() {
                removeResizeListener(this, callback);
            });
        };

        function resetTriggers(element) {
            var triggers = element.__resizeTriggers__,
                expand = triggers.firstElementChild,
                contract = triggers.lastElementChild,
                expandChild = expand.firstElementChild;
            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;
            expandChild.style.width = expand.offsetWidth + 1 + 'px';
            expandChild.style.height = expand.offsetHeight + 1 + 'px';
            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
        }

        function checkTriggers(element) {
            return element.offsetWidth != element.__resizeLast__.width ||
                element.offsetHeight != element.__resizeLast__.height;
        }

        function scrollListener(e) {
            var element = this;
            resetTriggers(this);
            if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
            this.__resizeRAF__ = requestFrame(function() {
                if (checkTriggers(element)) {
                    element.__resizeLast__.width = element.offsetWidth;
                    element.__resizeLast__.height = element.offsetHeight;
                    element.__resizeListeners__.forEach(function(fn) {
                        fn.call(element, e);
                    });
                }
            });
        }

        if (!attachEvent) {
            var requestFrame = (function() {
                var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                    function(fn) {
                        return window.setTimeout(fn, 20);
                    };
                return function(fn) {
                    return raf(fn);
                };
            })();

            var cancelFrame = (function() {
                var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                    window.clearTimeout;
                return function(id) {
                    return cancel(id);
                };
            })();



            /* Detect CSS Animations support to detect element display/re-attach */
            var animation = false,
                animationstring = 'animation',
                keyframeprefix = '',
                animationstartevent = 'animationstart',
                domPrefixes = 'Webkit Moz O ms'.split(' '),
                startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
                pfx = ''; {
                var elm = document.createElement('fakeelement');
                if (elm.style.animationName !== undefined) {
                    animation = true;
                }

                if (animation === false) {
                    for (var i = 0; i < domPrefixes.length; i++) {
                        if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                            pfx = domPrefixes[i];
                            animationstring = pfx + 'Animation';
                            keyframeprefix = '-' + pfx.toLowerCase() + '-';
                            animationstartevent = startEvents[i];
                            animation = true;
                            break;
                        }
                    }
                }
            }

            var animationName = 'resizeanim';
            var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
            var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
        }

        function createStyles() {
            if (!stylesCreated) {
                //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
                var css = (animationKeyframes ? animationKeyframes : '') +
                    '.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
                    '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
                    head = document.head || document.getElementsByTagName('head')[0],
                    style = document.createElement('style');

                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }

                head.appendChild(style);
                stylesCreated = true;
            }
        }

        window.addResizeListener = function(element, fn) {
            if (attachEvent) element.attachEvent('onresize', fn);
            else {
                if (!element.__resizeTriggers__) {
                    if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                    createStyles();
                    element.__resizeLast__ = {};
                    element.__resizeListeners__ = [];
                    (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
                    element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
                        '<div class="contract-trigger"></div>';
                    element.appendChild(element.__resizeTriggers__);
                    resetTriggers(element);
                    element.addEventListener('scroll', scrollListener, true);

                    // /* Listen for a css animation to detect element display/re-attach */
                    // animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
                    //     if (e.animationName == animationName)
                    //         resetTriggers(element);
                    // });
                }
                element.__resizeListeners__.push(fn);
            }
        };

        window.removeResizeListener = function(element, fn) {
            if (attachEvent) element.detachEvent('onresize', fn);
            else {
                element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
                if (!element.__resizeListeners__.length) {
                    element.removeEventListener('scroll', scrollListener);
                    element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
                }
            }
        };
    }(jQuery));

    /* jshint ignore:end */


    var RowItemView = RowItemParentView.extend({
        tagName: 'div',
        className: 'row gist-item',
        attributes: {
            'tabindex': 0
        },
        getTemplate: function() {
            if (this.model.get('graphType') === 'Medications') {
                return RowItemViewMedicationsTemplate;
            } else if (this.model.get('graphType') === 'Lab Tests') {
                return RowItemViewLabsTemplate;
            } else {
                return RowItemViewTemplate;
            }
        },
        events: {
            'click': function(e) {
                e.stopPropagation();
                $('[data-toggle=popover]').popover('hide');
            }
        },
        templateHelpers: function() {
            return {
                displayName: this.model.get('typeName').toLowerCase(),
            };
        },
        initialize: function(options) {
            if (this.model.attributes.observed !== undefined) {
                this.model.attributes.last = moment().diff(moment(ADK.utils.formatDate(this.model.attributes.observed)), 'days') + ' d';
            } else {
                this.model.attributes.last = '--';
            }

            if (this.model.get('graphType') === 'Medications') {
                // 1.
                if (this.model.has('subMedsInternalGroupModels') && this.model.get('subMedsInternalGroupModels').models[0] !== undefined) {
                    this.model.set('graphInfoText', this.model.get('subMedsInternalGroupModels').models[0].get('graphInfoText'));
                } else {
                    //If the subgroup has all bad data, the models array will be empty. We recreate this array here
                    //to allow the list to display the medication name and an icon.
                    this.model.set('emptySubMedsInternalGroupModels', true);
                    if (this.model.has('subMedsInternalGroupModels')) {
                        this.model.get('subMedsInternalGroupModels').reset(new Backbone.Model({
                            isFirstOverlappingMed: true,
                            firstFacilityMed: new Backbone.Model({
                                displayName: this.model.get('displayName'),
                                badDataFound: true
                            })
                        }));
                    } else {
                        this.model.set('subMedsInternalGroupModels', new Backbone.Model({
                            isFirstOverlappingMed: true,
                            firstFacilityMed: new Backbone.Model({
                                displayName: this.model.get('displayName'),
                                badDataFound: true
                            })
                        }));
                    }

                }
                
                if(!this.model.has('uid')){
                    this.model.set('uid', this.model.get("medicationGroupType").get("uid"));
                }
                // 2.
                var numberOfSigs = this.model.get('subMedsInternalGroupModels').length,
                    height;
                switch (numberOfSigs) {
                    case 1:
                        height = '100px';
                        break;
                    case 2:
                        height = '48px';
                        break;
                    case 3:
                        height = '33px';
                        break;
                    default:
                        height = '23px';
                }

                this.model.set('sigHeight', height);
            }


            this.applet = 'stackedGraph';
            this.options = options;
            this.options.AppletID = 'stackedGraph';
            this.activeCharts = options.activeCharts;
            this.timeLineCharts = options.timeLineCharts;
            this.pointers = options.pointers;
            this._base = RowItemParentView.prototype;
        },
        onDestroy: function() {

            $.each(this.activeCharts, function(i, chart) {
                $(chart.container).off('.stackedGraph');
            });
            this._base.onDestroy.apply(this, arguments);

        },
        onRender: function() {
            var self = this,
                $renderTo = self.$('.renderTo');

            // I did not alter any of the following, just refactored
            window.requestAnimationFrame(function() {
                var chartInfo = self.model.get('chart');
                if (chartInfo === undefined) {
                    return;
                }
                chartInfo.graphType = self.model.get('graphType');
                $.extend(true, chartInfo, {
                    title: {
                        text: null
                    },
                    tooltip: {
                        crosshairs: false,
                        shared: true,
                        headerFormat: '',
                        formatter: function () {
                            var s = '';

                            $.each(this.points, function (i, point) {
                                if (this.series.name !== "Ref Range") {
                                    if (this.series.name === 'DBP' || this.series.name === 'SBP') {
                                        s += '<b>' + this.series.name + ' ' + this.y + '</b>' + this.series.tooltipOptions.valueSuffix + '<br/>';
                                    } else {
                                        s += '<b>' + this.y + '</b>' + this.series.tooltipOptions.valueSuffix + '<br/>';
                                    }

                                }
                            });

                            return s;
                        },
                        positioner: function (labelWidth, labelHeight, point) {
                            var tooltipX, tooltipY;
                            if (point.plotX + labelWidth > chart.plotWidth) {
                                tooltipX = point.plotX + chart.plotLeft - labelWidth - 20;
                            } else {
                                tooltipX = point.plotX + chart.plotLeft + 20;
                            }

                            tooltipY = 0 /*point.plotY + chart.plotTop - 20*/;
                            return {
                                x: tooltipX,
                                y: tooltipY
                            };

                        }
                    },
                    chart: {
                        zoomType: '',
                        // height: 100,
                        panning: false,
                        margin: 0,
                        spacing: 0,
                        backgroundColor: 'rgba(0,0,0,0)',
                        dontMoveY: true
                    },
                    plotOptions: {
                        line: {
                            marker: {
                                states: {
                                    hover: {
                                        fillColor: '#F8E71C',
                                        lineColor: '#FFFFFF',
                                        lineWidth: 2
                                    }
                                }
                            }
                        }
                    },
                    xAxis: {
                        labels: {
                            enabled: false
                        },
                        tickLength: 0,
                        lineWidth: 0,
                        lineColor: '#FF0000',
                        startOnTick: false,
                        endOnTick: false,
                        tickPositions: [],
                        plotLines: []
                    },
                    yAxis: {
                        labels: {
                            enabled: false,
                            title: null
                        }
                    }
                });

                    chartInfo.xAxis.plotLines.push({
                        color: '#FF0000',
                        width: 2,
                        zIndex: 5,
                        value: moment({
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        }).valueOf()
                    });
                    _.each(chartInfo.series, function(series) {
                        if (!series.type || (series.type && series.type !== 'arearange')) {
                            series.states = {
                                hover: {
                                    halo: {
                                        size: 8,
                                        attributes: {
                                            // fill: 'rgba(0,0,0,0.38)',
                                            'stroke-width': 5,
                                            stroke: 'rgba(0,0,0,0.38)'
                                        }
                                    }
                                }
                            };
                        }
                    });

                var chart = $renderTo.highcharts(chartInfo, function (chart) {
                    chart.line = chart.renderer.rect(100, 0, 2, chart.chartHeight)
                        .attr({
                            fill: 'black',
                            zIndex: 6
                        })
                        .css({
                            visibility: 'hidden'
                        })
                        .add();
                }).highcharts();

                $renderTo.resize(function () {
                    var width = $(this).width();
                    chart.reflow();

                    $.each(self.timeLineCharts, function (i, tlChart) {
                        tlChart.setSize(width, null);
                        tlChart.reflow();

                    });
                });

                var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                var fromDate = moment(sessionGlobalDate.get('fromDate'), 'MM/DD/YYYY');
                var toDate = moment(sessionGlobalDate.get('toDate'), 'MM/DD/YYYY');

                //add 1 day to toDate to enusure red line for current date is always displayed on the chart
                toDate.add(1, 'd');
                chart.xAxis[0].setExtremes(Date.UTC(fromDate.year(), fromDate.month(), fromDate.date()), Date.UTC(toDate.year(), toDate.month(), toDate.date()));
                var returnedResponse = null;
                if (self.model.get('graphType') !== 'Medications') {
                    returnedResponse = Utils.findPointsInBetween(chart, fromDate, toDate);
                }


                self.activeCharts.unshift(chart);


                _.each(self.timeLineCharts, function (e, i) {
                    e.setSize($renderTo.width(), null);
                });

                self.$el.model = self.model;
                self.$el.$ = function (selector) {
                    return self.$el.find(selector);
                };

                if (self.model.get('graphType') === 'Medications') {
                    self.$el.applet = 'Medications';
                }
                if (self.model.get('graphType') === 'Lab Tests') {
                    self.$el.applet = 'Lab Tests';
                }



                    var currentScreen = ADK.Messaging.request('get:current:screen');
                    var buttonTypes = ['infoButton', 'detailsviewbutton'];
                    if ((!currentScreen.config.predefined && ADK.UserService.hasPermission('access-stack-graph')) ) {
                        buttonTypes.push('deleteStackedGraphButton');
                    }

                self.tlbrOpts = {
                    targetElement: self.$el,
                    buttonTypes: buttonTypes,
                    appletID: self.model.get('applet_id'),
                    model: self.model
                };

                if (self.model.get('graphType') !== 'Medications') {
                    if (returnedResponse !== null && returnedResponse !== 'No Records Found') {
                        self.tlbrOpts.buttonTypes.splice(2, 0, 'quicklookbutton');
                    }

                }

                self._base.onRender.apply(self, arguments);

                if (self.model.get('graphType') !== 'Medications') {


                    self.listenTo(ADK.Messaging, 'globalDate:selected', function (dateModel) {
                        var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                        var fromDate = moment(sessionGlobalDate.get('fromDate'), 'MM/DD/YYYY');
                        var toDate = moment(sessionGlobalDate.get('toDate'), 'MM/DD/YYYY');
                        Utils.findPointsInBetween(chart, fromDate, toDate);
                    });
                }


                if (self.model.get('graphType') === 'Medications') {

                    self.listenTo(ADK.Messaging, 'globalDate:selected', function (dateModel) {
                        var medicationGroupType = self.model.get('medicationGroupType');
                        var buildchart = new self.model.attributes.ChartBuilder(medicationGroupType, true);
                        var medicationChartConfig = new self.model.attributes.GraphConfig(buildchart);
                        _.each(chart.series, function (e, i) {
                            chart.series[i].setData(medicationChartConfig.series[i].data, true);
                        });

                    });
                }
            });
            this.createPopover();
        },
        showPopover: function(evt, popoverElement) {
            evt.stopPropagation();
            $('[data-toggle=popover]').not(popoverElement).popover('hide');
            popoverElement.popover('toggle');
            var selectedGistItem = $(this.el);
            var widthAdjust = selectedGistItem.width() * 0.85;
            var leftAdjust = selectedGistItem.offset().left;
            var widthPxDiff = selectedGistItem.width() - widthAdjust;
            var offsetLeftToCenter = selectedGistItem.offset().left + (widthPxDiff * 0.5);
            $('.gist-popover').css('left', offsetLeftToCenter.toString() + "px");
            $('.gist-popover').width(widthAdjust);


        },
        createPopover: function() {
            var self = this;
            var PopoverView = Backbone.Marionette.ItemView.extend({
                template: PopoverTemplate
            });
            this.$el.find('[data-toggle=popover]').popover({
                trigger: 'manual',
                html: 'true',
                container: 'body',
                template: (new PopoverView().template()),
                placement: 'bottom'
            }).click(function(evt) {
                self.showPopover(evt, $(this));
            }).focus(function(evt) {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                $(this).keyup(function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    if (e.keyCode === 13 || e.keyCode === 32) {
                        self.showPopover(evt, $(this));
                    }
                });

            });
        },
        onBeforeDestroy: function() {
            $('[data-toggle=popover]').popover('hide');
            $('.mainAppletToolbar').remove();
        }

    });

    return RowItemView;
});
