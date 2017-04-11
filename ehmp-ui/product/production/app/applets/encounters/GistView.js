//----------------------------------------
// Name:        Encounters Applet
// File:        GistView.js
// Version:     1.2
// Date:        2014-12-17
// Modified:    2015-03-09
// Team:        Jupiter
// Description:
//----------------------------------------
define([
    "underscore",
    "jquery",
    "backbone",
    "marionette",
    "highcharts",
    "hbs!app/applets/encounters/templets/itemList",
    "hbs!app/applets/encounters/templets/item",
    "app/applets/encounters/appConfig",
    "app/applets/encounters/appUtil",
    "app/applets/encounters/gistConfig"
], function(_, $, Backbone, Marionette, highcharts, gistView, item,  CONFIG, util, gistConfig) { //subItem,
    'use strict';
    // Switch ON/OFF debug info
    var DEBUG = CONFIG.debug;

    var gistOptions = {
            gistChartOptions: {
                global: {
                    useUTC: false,
                    timezoneOffset: 5 * 60
                },
                chart: {
                    animation: true,
                    zoomType: '',
                    type: 'column',
                    spacing: [1,1,1,1],
                    backgroundColor: '#F2F2F2',
                    events: {
                        click: function(e) {
                            $(e.target).closest('[data-toggle=popover]').trigger('click');
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                title: {
                    text: ""
                },
                tooltip: {
                    enabled: false,
                    hideDelay: 10,
                    borderWidth: 1,
                    formatter: function() {
                        return this.point.plotX;
                    }
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        pointWidth: 5,
                        pointInterval: 24 * 3600 * 1000 * 30, // one month //day
                        enableMouseTracking: false
                    },
                    column: {
                        grouping: false,
                        shadow: false
                    }
                },
                xAxis: {
                    labels: {
                            enabled: false,
                            style: {
                                color: 'red',
                                fontSize: 8
                            }
                        },
                    type: 'datetime',
                    tickWidth: 0,
                    startOnTick: false,
                    endOnTick: false,
                    plotLines: [{ // mark for the now
                        color: '#F20000',
                        value: util.nowChart(),
                        dashStyle: 'solid',
                        width: 2,
                        zIndex: 5
                    }]
                },
                yAxis: [{
                    labels: {
                        enabled: false
                    },
                    lineWidth: 1,
                    title: {
                       enabled: false,
                       text: "y Value"
                    }
                }, {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        enabled: false,
                        text: "y Value"
                    }
                }],
                series: [{
                    data: [],
                    type: 'column',
                    name: "",
                    pointRange: 24 * 3600 * 1000 *30,
                    color: 'rgb(124, 181, 236)'
                }, {
                    data: [],
                    type: 'column',
                    color: '#406E7B',
                    name: "now",
                    pointRange: 24 * 3600 * 1000 *30
                }]
            }
        };
    var gistUtil = {
        setPopover: function(obj){

            obj.$el.find('.has-popover').popup({
                 trigger: 'click',
                 html:'true',
                 container: 'body',
                 template:'<div class="popover gist-popover" role="tooltip"><div class="popover-title all-padding-xs"></div><div class="popover-content"></div></div>',
                 placement: 'bottom',
             });
        },

        reflowHChart: function(e){
                if (DEBUG) console.log("Enc Gist sub gist ----->> reflow chart");
                $(this).find('.graph-container', e.target).each(function() { // target each element with the .contains-chart class
                    if(!_.isUndefined($(this).highcharts())) $(this).highcharts().reflow(); // target the chart itself
                });
        },
        showChart: function(obj) {
            // Reset Chart options
            obj.gistOptions.gistChartOptions.series[0].data = [];
            //obj.gistOptions.gistChartOptions.series[0].pointStart = 0;
            obj.gistOptions.gistChartOptions.series[0].name = "";
            obj.gistOptions.gistChartOptions.series[1].data = [];
            obj.gistOptions.gistChartOptions.xAxis.plotLines[0].width = 0;
            obj.gistOptions.gistChartOptions.yAxis[0].max = null;
            //obj.gistOptions.gistChartOptions.series[1].pointStart = 0;
            var k, max;
            var $pointer = null;
            if(obj.model.get("processed")){
                // prepare chart data
                obj.gistOptions.gistChartOptions.series[0].name = obj.model.get("kind");
                max = 0;
                // if chart is empty -> set yAxis.max = 10
                if(obj.model.get("empty")){
                    obj.gistOptions.gistChartOptions.yAxis[0].max = 10;
                }
                // First event on the Chart
                obj.gistOptions.gistChartOptions.series[1].data.push([util.convertChartDate(obj.model.get("firstEvent")), 0]);
                // Now on the Chart if Now in selected time frame
                if((moment(util.nowChart()).isBefore(util.convertChartDate(obj.model.get("maxChart"))))&&(moment(util.nowChart()).isAfter(util.convertChartDate(obj.model.get("firstEvent"))))){
                    obj.gistOptions.gistChartOptions.xAxis.plotLines[0].width = 2;
                }
                // Right border of chart
                obj.gistOptions.gistChartOptions.series[1].data.push([util.convertChartDate(obj.model.get("maxChart")), 0]);

                //  tooltip data&position correction !!!
                obj.gistOptions.gistChartOptions.plotOptions.column.cropThreshold = obj.model.get("count");
                // Create Chart
                $pointer = obj.$el.find('.graph-container');
                $pointer.highcharts(obj.gistOptions.gistChartOptions);
                obj.$el.find('.highcharts-background').attr('fill', 'rgba(0,0,0,0)');
            }
            return $pointer;
        },
        chartReflow: function(obj){
                    var pointer;
                    var model;
                    if (typeof (obj.model) !== 'undefined' ) {
                      model = obj.model;
                    }else{
                      model = obj;
                    }
                    if(model.get("subKind")){
                        pointer = obj.$el.find('#encounter-chart-subcontainer-' + model.get("elKind")+"-"+model.get("elSubKind"));
                    }
                    else{
                        pointer = obj.$el.find('.graph-container');
                    }
                    if (typeof (pointer.highcharts()) !== 'undefined' ){
                        pointer.highcharts().reflow();
                    }
        },
        binning_normal_function: function(val){return Math.log((val*val*val+1)/0.1);},  // Data normalization function
        chartDataBinning: function(obj){
            // ADK Binning & Normalization
            var model  = obj.model;
            var binned = [];
            var input  = {};
            var config = {
               barPadding: 6,
               normal_function: this.binning_normal_function,
               debug: false
            };
            if(!model.get("empty")){
                var pointer =  obj.$el.find('.graph-container');
                var chartWidth = pointer.width();
                config.chartWidth = chartWidth;
                    if (typeof (pointer.highcharts()) !== 'undefined' ){
                    input.series     = model.get("chartData");
                    input.isDuration = model.get("isDuration") || false;
                    input.oldestDate = util.convertChartDate(model.get("firstEvent"));
                    input.newestDate = util.convertChartDate(model.get("maxChart"));
                    binned =  ADK.utils.chartDataBinning(input, config);
                    pointer.highcharts().series[0].setData(binned);
                }
            }
        }
    };
    var noRecords = Backbone.Marionette.ItemView.extend({
        template: _.template('<div class="empty-gist-list">No Records Found</div>')
    });

    var wrongView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div class="empty-gist-list">Wrong Data</div>')
    });

    var iItem = Backbone.Marionette.CompositeView.extend({
        attributes: function(){
            return {
                'data-group-instanceid': 'panel-' + this.model.get('elKind'),
                'role': 'tab',
                'class': 'table-row-toolbar'
            };
        },
        template: item,
        gistOptions: gistOptions,
        childViewContainer: ".panel-collapse",
        chartPointer: null,
        initialize: function(){
            if(DEBUG) console.log("initialize ----->> iItem");
            //$('[data-toggle=popover]').popover('hide');
            this.model.set('instanceid', appletConfig.instanceId);
            this.collection = this.model.get("node");
            this.addChildViews = false;

        },
        buildChildView: function(child, ChildViewClass, childViewOptions){
            if (!_.isUndefined(child.get('kind'))){
                var childOptions = {appletConfig:     { gistSubName:      child.get('kind'),
                                                        instanceId:       window.appletConfig.instanceId,
                                                        id:               window.appletConfig.id},
                                                        showInfoButton: window.showInfoButton,
                                                        gistHeaders:      gistConfig.gistHeaders[(child.get('kind').toLowerCase())],
                                                        gistModel:        gistConfig.gistModel,
                                                        collection:       child.get('collection'),
                                                        binningOptions:  {
                                                                            barPadding: 6,
                                                                            normal_function: gistUtil.binning_normal_function,
                                                                            debug: false
                                                                          }
                               };
                return ADK.Views.EventGist.create(childOptions);
            }else{
                return wrongView;
            }
        },
        addChild: function(){
            //this prevents graphs being added to DOM on first load.
            //we defer to first time the row is expanded by click. This code will trigger when we trigger collection reset event.
            if(this.addChildViews){
                Marionette.CollectionView.prototype.addChild.apply(this, arguments);
            }
        },
        events: {
            'click .left-side': 'onClickLeftSide',
            'click .right-side': 'onClickRightSide',
            'keydown .right-side': function(evt) {
                if (evt.which == 13) {
                    this.$(evt.currentTarget).click();
                }
            }
        },

        caretStatus: false,
        caretOn: function(){
            this.$el.find("#caret").attr("class","caret");
        },
        caretOff: function(){
            this.$el.find("#caret").attr("class","right-caret"); //this.$el.find('.header').attr("sortDirection", 'none');
        },
        caretSwitch: function(){
            var arrowPosition = this.$el.find(".caret-placer").attr("arrowPosition");
            if(arrowPosition === "right"){
                this.$el.find(".caret-placer").attr("arrowPosition", "down");
                this.$el.find(".caret-placer").addClass("caret").removeClass("right-caret");
            }else if(arrowPosition === "down"){
                this.$el.find(".caret-placer").attr("arrowPosition", "right");
                this.$el.find(".caret-placer").addClass("right-caret").removeClass("caret");
            }
        },
        onClickRightSide: function(event){
            event.preventDefault();
            event.stopImmediatePropagation();
        },
        onClickLeftSide: function(event){
            event.preventDefault();
            event.stopImmediatePropagation();


            this.drawGraphsOnFirstToggle();

            this.$('[data-toggle=popover]').popover('hide');
            if(!this.model.get('empty')){
                this.$('.panel-collapse').collapse('toggle');
                this.caretSwitch();
                var expandedAttr = (this.$(event.currentTarget).attr('aria-expanded') === "true" ? "false" : "true");
                this.$(event.currentTarget).attr('aria-expanded', expandedAttr);
            }
        },
        drawGraphsOnFirstToggle: function(){
            if(!this.addChildViews){
                this.addChildViews = true;
                this.collection.trigger("reset");
            }
        },
        onRender: function() {
            this.chartPointer = gistUtil.showChart(this);
            gistUtil.setPopover(this);
        },
        onDomRefresh: function(){
            gistUtil.chartDataBinning(this);
            gistUtil.chartReflow(this);
        },
        onBeforeDestroy: function() {
            if (this.chartPointer) {
                var chart = this.chartPointer.highcharts();
                if (chart) {
                    chart.destroy();
                }
            }
        }
    });

    function onCustomFilter(search) {
         ADK.Messaging.getChannel("encounters_internal").trigger("filter_collection",search);
    }

    function onClearCustomFilter(search) {
         ADK.Messaging.getChannel("encounters_internal").trigger("clear_filter", search);
    }

    var GistView = Backbone.Marionette.CompositeView.extend({
        template: gistView,
        attributes: {
            class: 'faux-table',
            role: 'tablist'
        },
        emptyView: noRecords,
        childView: iItem,
        childViewContainer: ".enc-gist-list",
        gistOptions: gistOptions,
        initialize: function(options) {
            this.collection = options.collection;
            this.maximizeScreen = options.appletConfig.maximizeScreen;
            this._super = Backbone.Marionette.CompositeView.prototype;
            this._super.initialize.apply(this, arguments);

            this.listenTo(this.collection, "customfilter", onCustomFilter);
            this.listenTo(this.collection, "clear_customfilter", onClearCustomFilter);
            this.listenTo(this.collection, "reset", function () {
                if (DEBUG)  console.log("EncGist ----->> Collection reset -->>GistView");
                if (DEBUG)  console.log(this.collection);
            });
        },
        onShow: function(){
            this.$('.enc-gist-list').on( 'shown.bs.collapse', gistUtil.reflowHChart);
        },
        onDestroy: function() {
            this.$('.enc-gist-list').off();
        }
    });


    return GistView;
});
