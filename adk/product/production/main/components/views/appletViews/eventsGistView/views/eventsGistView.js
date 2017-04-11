define([
    "jquery",
    "underscore",
    "backbone",
    "main/Utils",
    'main/components/applets/baseDisplayApplet/baseDisplayAppletItem',
    'main/components/applets/baseDisplayApplet/baseGistView',
    "hbs!main/components/views/appletViews/eventsGistView/templates/eventsGistLayout",
    "hbs!main/components/views/appletViews/eventsGistView/templates/eventsGistChild",
    "api/ResourceService",
    "api/Messaging",
    'api/UserDefinedScreens',
    "main/components/appletToolbar/appletToolbarView",
    "main/components/views/appletViews/TileSortManager",
    "highcharts",
    "main/components/views/appletViews/eventsGistView/views/eventsBarGraphConfiguration",
    '_assets/js/tooltipMappings'
], function($, _, Backbone, Utils, BaseAppletItem, BaseGistView, eventsGistLayoutTemplate, eventsGistChildTemplate, ResourceService, Messaging, UserDefinedScreens, ToolbarView, TileSortManager, highcharts, EventGistGraph, TooltipMappings) {
    'use strict';

    var EventGistItem = BaseAppletItem.extend({
        template: eventsGistChildTemplate,
        onDomRefresh: function() {
            //highcharts can't be rendered without the dom being completely loaded.
            //render highcharts
            if (this.model.has('graphData')){
                var config = this.options.binningOptions;
                var chartConfig = new EventGistGraph(this.model.get('graphData'));
                this.chartPointer = this.$('[data-cell-instanceid="graph_' + this.model.get('id') + '"]');
                if (config) {
                    config.chartWidth = (this.chartPointer).width();
                    config.chartWidth = config.chartWidth === 0 ? 100 : config.chartWidth;
                    chartConfig.series[0].data = Utils.chartDataBinning(this.model.get('graphData'), config);
                }
                this.chartPointer.highcharts(chartConfig);
            }

            // needed to disable ie11 508 tab focus on svg in gistItem
            this.$el.find('svg').attr('focusable', 'false');
            this.$el.find('svg').attr('aria-hidden', 'true');
            this.$el.find('svg desc').empty();
        },
        onBeforeDestroy: function() {
            if (this.chartPointer && this.chartPointer.length > 0) {
                var chart = this.chartPointer.highcharts();
                if (chart) {
                    chart.destroy();
                }
            }
        },
        initialize: function() {
            var buttonTypes = [];

            var tlbrOpts = {};

            var toolbarView;

            if (this._enableTileSorting) {
                buttonTypes.push('tilesortbutton');
            }

            if (this.options.showInfoButton) {
                buttonTypes.push('infobutton');
            }

            if(this.options.showCrsButton){
                buttonTypes.push('crsbutton');
            }

            buttonTypes.push('detailsviewbutton');
            buttonTypes.push('quicklookbutton');

            if (this.options.showLinksButton) {
                buttonTypes.push('submenubutton');
                tlbrOpts.submenuItems = new Backbone.Collection();
                tlbrOpts.submenuTitle = 'Select Associated Workspace';
                if (!_.isUndefined(this.model.get('snomedCode'))) {
                    this.listenTo(ADK.Messaging, 'close:workspaceManager', function() {
                        this.setToolbarItems(this.toolbarOptions.submenuItems);
                    });
                    this.setToolbarItems(tlbrOpts.submenuItems);
                }
            }

            if (this.options.showEditButton) {
                buttonTypes.push('editviewbutton');
                tlbrOpts.disableNonLocal = this.options.disableNonLocal;
            }

            tlbrOpts.buttonTypes = buttonTypes;
            this.toolbarOptions = tlbrOpts;
        },
        setToolbarItems: function(collection) {
            UserDefinedScreens.getScreenBySnomedCt(this.model.get('snomedCode')).done(function(filteredScreenList) {
                if (filteredScreenList.length > 0) {
                    var currentScreen = Messaging.request('get:current:screen');
                    var models = [];
                    _.each(filteredScreenList, function(filteredScreen) {
                        if (filteredScreen.id !== currentScreen.id) {
                            var scrnObj = {
                                displayText: filteredScreen.title,
                                url: ('#' + filteredScreen.routeName)
                            };
                            models.push(new Backbone.Model(scrnObj));
                        }
                    });
                    collection.reset(models);
                }
            });
        }
    });

    var EventGist = BaseGistView.extend({
        className: 'faux-table-container',
        attributes: function(){
            var gridTitle = '';
            if(this.options) {
                gridTitle = (this.options.appletConfig.title ? this.options.appletConfig.title : this.options.appletConfig.gistSubName) + ' Grid';
            }
            return {
                'role': 'grid',
                'aria-label': gridTitle
            };
        },
        template: eventsGistLayoutTemplate,
        events: {
            'after:hidetoolbar': function(e) {
                this.$el.find('.dragging-row').removeClass('dragging-row');
            }
        },
        childView: EventGistItem.extend({}),
        childViewContainer: ".gist-item-list",
        initialize: function(options) {
            this.childViewOptions = {
                AppletID: this.AppletID,
                binningOptions: options.binningOptions,
                appletOptions: options,
                showInfoButton: options.showInfoButton === false ? false : true,
                showLinksButton: options.showLinksButton || false,
                showEditButton: options.showEditButton || false,
                disableNonLocal: options.disableNonLocal || false,
                showCrsButton: options.showCrsButton || false
            };
            this.collectionParser = options.collectionParser || function(collection) {
                return collection;
            };
            this.collection = options.collection;
            this.gistModel = options.gistModel;
            //this is the model for the outer part of the composite view
            this.model = new Backbone.Model();
            this.model.set('gistHeaders', options.gistHeaders || {
                name: '',
                description: '',
                grapic: 'Dose',
                age: 'Age',
                count: 'Count'
            });

            this.gistModel = options.gistModel;
            this.model.set('appletID', this.AppletID);
        },
        onRender: function(){
            _.each(this.$('.toolbar-508'), function(span) {
                var tooltipKey = span.innerHTML;
                span.innerHTML = '( ' + TooltipMappings[tooltipKey] + ' )';
            });
        },
        behaviors: {
            Tooltip: {}
        }
    });

    var EventGistView = {
        create: function(options) {
            var eventGistView = new EventGist(options);
            return eventGistView;
        },
        getView: function() {
            return EventGist;
        },
        getRowItem: function() {
            return EventGistItem;
        }
    };

    return EventGistView;
});
