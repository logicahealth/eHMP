define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'highcharts',
    'moment',
    'hbs!app/applets/encounters/templates/gistTemplate',
    'hbs!app/applets/encounters/templates/gistRowItem',
    'app/applets/encounters/appUtil',
    'app/applets/encounters/chartUtil',
    'app/applets/encounters/gistConfig',
    'hbs!app/applets/encounters/templates/quicklookVisit',
    'hbs!app/applets/encounters/templates/quicklookProcedure',
    'hbs!app/applets/encounters/templates/quicklookAdmission',
    'hbs!app/applets/encounters/templates/quicklookAppointment'
], function(
    _,
    $,
    Backbone,
    Marionette,
    highcharts,
    moment,
    GistTemplate,
    ExpandableItemTemplate,
    util,
    chartUtil,
    gistConfig,
    quicklookVisit,
    quicklookProcedure,
    quicklookAdmission,
    quicklookAppointment
) {
    'use strict';
    /* global ADK */

    var mapRecent = function(recentArray) {
        return _.map(recentArray, function(model) {
            return model.toJSON();
        });
    };

    var noRecords = Backbone.Marionette.ItemView.extend({
        template: _.template('<p class="top-padding-xs left-padding-xs color-grey-darkest">No Records Found</p>'),
        attributes: {
            'aria-live': 'assertive'
        },
        className: 'background-color-grey-lightest percent-height-100'
    });

    var WrongView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div class="empty-gist-list">Wrong Data</div>'),
        attributes: {
            'aria-live': 'assertive'
        }
    });

    var EventGistRowItem = ADK.Views.EventGist.getRowItem().extend({
        ui: {
            popoverEl: '[data-toggle=popover]'
        },
        mapRecent: mapRecent,
        mapQuicklook: function(model) {
            var kind = model.get('kind');
            if (!_.isString(kind)) return '';

            var recentJSON = mapRecent(model.get('recent'));
            var serializedResult = {
                id: 'encountersTooltip' + kind + 's',
                allGroupedEncounters: recentJSON
            };

            switch (kind.toLowerCase()) {
                case 'admission':
                    return quicklookAdmission(serializedResult);
                case 'appointment':
                    return quicklookAppointment(serializedResult);
                case 'procedure':
                    return quicklookProcedure(serializedResult);
                case 'visit':
                    return quicklookVisit(serializedResult);
            }
        },
        serializeData: function() {
            //serialize 'subkind'
            var modelJSON = this.model.toJSON();
            var groupName = modelJSON[util.FILTER_FIELD];
            modelJSON.groupName = groupName;
            if (!modelJSON.count) modelJSON.count = this.model.get('collection').length;
            modelJSON.encounterCount = modelJSON.count;
            modelJSON.timeSince = modelJSON.timeSinceLast;
            modelJSON.tooltip = this.mapQuicklook(this.model);
            modelJSON.id = util.stripCharacters(groupName);
            modelJSON.elKind = util.stripCharacters(modelJSON.kind);
            modelJSON.displayName = modelJSON.id;
            return modelJSON;
        }
    });

    var EventGistBaseView = ADK.Views.EventGist.getView();
    var SubKindGistView = EventGistBaseView.extend({
        setChartData: function(child) {
            chartUtil.chartDataBinning({
                model: child.model,
                collection: child.model.get('collection'),
                chartOptions: _.get(child.getOption('appletOptions'), 'gistChartOptions', {}),
                graphPointer: child.$el.find('.graph-container'),
                width: 100 //I don't know why this has to be hardcoded but if it's not the last bar won't render
            });
            chartUtil.chartReflow(child);
            child.$el.find('svg').attr('focusable', false);
            child.$el.find('svg').attr('aria-hidden', true);
        },
        childEvents: _.extend({
            'dom:refresh': function(child) {
                if(this._isAnimationFinished) { //for sorting or re-rendering of children if container is already open
                    this.setChartData(child);
                } else {
                    this.listenToOnce(ADK.Messaging.getChannel('encounters_internal'), 'renderChart', _.partial(this.setChartData, child));
                }
            },
            'render': function(child) {
                child.chartPointer = chartUtil.showChart(child);
            },
            'before:destroy': function(child) {
                if (child.chartPointer) {
                    var chart = child.chartPointer.highcharts();
                    if (chart) {
                        chart.destroy();
                    }
                }
            }
        }, EventGistBaseView.prototype.childEvents),
        childView: EventGistRowItem,
        onDomRefresh: function() {
            this.listenToOnce(ADK.Messaging.getChannel('encounters_internal'), 'renderChart', function() {
                this._isAnimationFinished = true;
            });
        }
    });

    var ExpandableItem = Backbone.Marionette.LayoutView.extend({
        initialize: function() {
            var model = this.model;
            var appletConfig = this.getOption('appletConfig');
            this.appletOptions = {
                appletConfig: {
                    gistSubName: model.get('kind'),
                    instanceId: appletConfig.instanceId,
                    id: appletConfig.id
                },
                showInfoButton: false,
                gistHeaders: gistConfig.gistHeaders[(model.get('kind').toLowerCase())],
                gistModel: gistConfig.gistModel,
                collection: this.collection,
                binningOptions: {
                    barPadding: 6,
                    normal_function: chartUtil.binning_normal_function,
                    debug: false
                },
                gistChartOptions: chartUtil.gistOptions()
            };
        },
        getGraphBoundaries: function() {
            var startStopPoints;
            startStopPoints = this.getOption('startStopPoints') || {};
            _.extend(this.appletOptions.gistChartOptions, {
                graphStartPoint: startStopPoints.start,
                graphEndPoint: startStopPoints.stop
            });
        },
        attributes: function() {
            return {
                'data-group-instanceid': 'panel-' + util.stripCharacters(this.model.get('kind')),
                'role': 'tab',
                'class': 'table-row-toolbar'
            };
        },
        regions: {
            SubKindRegion: '.panel-collapse'
        },
        template: ExpandableItemTemplate,
        chartPointer: null,
        collapseRow: function() {
            this.ui.caret.attr('arrowPosition', 'right');
            this.ui.caret.addClass('fa-caret-right').removeClass('fa-caret-down');
        },
        removeView: function() {
            this.getRegion('SubKindRegion').empty();
        },
        expandRow: function() {
            var model = this.model;
            if (!_.isUndefined(model.get('kind'))) {
                var appletConfig = this.getOption('appletConfig');
                var viewOptions = {
                    appletConfig: {
                        gistSubName: model.get('kind'),
                        instanceId: appletConfig.instanceId,
                        id: appletConfig.id
                    },

                    showInfoButton: false,
                    gistHeaders: gistConfig.gistHeaders[(model.get('kind').toLowerCase())],
                    gistModel: gistConfig.gistModel,
                    collection: model.get('subKindCollection'),
                    binningOptions: {
                        barPadding: 6,
                        normal_function: chartUtil.binning_normal_function,
                        debug: false
                    },
                    gistChartOptions: _.get(this, 'appletOptions.gistChartOptions'),
                    graphStartPoint: this.graphStartPoint,
                    graphEndPoint: this.graphEndPoint,
                    filter: this.getOption('childFilter')
                };
                this.getRegion('SubKindRegion').show(new SubKindGistView(viewOptions));
            } else {
                this.getRegion('SubKindRegion')(new WrongView());
            }

            this.ui.caret.attr('arrowPosition', 'down');
            this.ui.caret.addClass('fa-caret-down').removeClass('fa-caret-right');
        },
        ui: {
            popoverEl: '[data-toggle=popover]',
            caret: '.left-side .fa'
        },
        events: {
            'click .left-side': 'onClickLeftSide',
            'click .right-side': 'onClickRightSide',
            'keydown .right-side': function(evt) {
                if (evt.which == 13) {
                    this.$(evt.currentTarget).click();
                }
            },
            'hidden.bs.collapse': 'removeView',
            'hide.bs.collapse': 'collapseRow',
            'show.bs.collapse': 'expandRow',
            'shown.bs.collapse': function() {
                ADK.Messaging.getChannel('encounters_internal').trigger('renderChart');
            }
        },
        mapRecent: mapRecent,
        serializeModel: function() {
            //serialize 'kind'
            var modelJSON = this.model.toJSON();
            if (!_.isString(modelJSON.kind)) return modelJSON;

            //controls switch block in template for quicklook rendering
            modelJSON[modelJSON.kind.toLowerCase()] = true;

            var collection = this.model.get('collection');

            this.filteredSet = collection.filter(this.getOption('childFilter'));
            modelJSON.count = this.filteredSet.length;

            modelJSON.recent = this.mapRecent(this.filteredSet.slice(0, 5));

            var timeSinceLast;
            var mostRecentDateTimeModel = _.max(this.filteredSet, function(model) {
                return model.get('dateTime');
            });
            if (modelJSON.futureTime === false) {
                timeSinceLast = ADK.utils.getTimeSince(mostRecentDateTimeModel.get('dateTime')).timeSince;
            } else {
                var timeSinceModel = this.model.getNearestFutureDateModel(this.filteredSet) || mostRecentDateTimeModel;
                timeSinceLast = ADK.utils.getTimeSince(timeSinceModel.get('dateTime')).timeSince;
            }
            modelJSON.timeSinceLast = timeSinceLast;
            modelJSON.kindPlural = modelJSON.kind+'s';
            modelJSON.elKind = util.stripCharacters(modelJSON.kind);

            return modelJSON;
        },
        createPopover: function() {
            this.ui.popoverEl.popup({
                trigger: 'click',
                container: 'body',
                placement: 'bottom',
                title: 'Title',
                delay: 0,
                template: '<div class="popover popover--gist-popover" role="tooltip" aria-live="assertive"><div class="popover-title all-padding-xs"></div><div class="popover-content"></div></div>'
            });

            //TODO:  There are bugs in this implementation
            //Resizing the window doesn't close the popover or adjust it
            //It doesn't account for the popover being close to the bottom of the window
            this.ui.popoverEl.on('shown.bs.popover', _.bind(function() {
                this.ui.popoverEl.focus();
                this.ui.popoverEl.on('blur', _.bind(function() {
                    this.ui.popoverEl.popup('hide');
                }, this));
                this.ui.popoverEl.on('keydown', function(e) {
                    var isEscKey = (e.keyCode === 27);
                    if (isEscKey) {
                        e.stopPropagation();
                        $(e.target).closest('[data-toggle="popover"]').popup('hide');
                        $(e.target).closest('[data-toggle="popover"]').focus();
                    }
                });
            }, this));
        },
        onClickRightSide: function(event) {
            if (_.isUndefined(this.ui.popoverEl.attr('aria-describedby'))) {
                var eventTarget = this.$(event.target);
                eventTarget.trigger('click');
            } else {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        },
        onClickLeftSide: function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.$('[data-toggle=popover]').popover('hide');
            this.$('.panel-collapse').collapse('toggle');

            var expandedAttr = this.$(event.currentTarget).attr('aria-expanded') === 'true' ? false : true;
            var msg = expandedAttr ? 'collapse' : 'expand';
            msg = 'Press enter to ' + msg + ' ' + this.model.get('kind') + ' accordion.';
            this.$(event.currentTarget).attr('aria-expanded', expandedAttr);
            this.$(event.currentTarget).attr('title', msg);
        },
        displayChart: function() {
            chartUtil.chartDataBinning({
                model: this.model,
                collection: _.get(this.getOption('appletOptions'), 'collection.collection', new Backbone.Collection()),
                chartOptions: _.get(this.getOption('appletOptions'), 'gistChartOptions', {}),
                graphPointer: this.$el.find('.graph-container'),
                filteredSet: this.filteredSet,
                durationFilter: this.getOption('childFilter')
            });
            chartUtil.chartReflow(this);
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        onDomRefresh: function() {
            this.displayChart();
        },
        onRender: function() {
            this.createPopover();
            this.chartPointer = chartUtil.showChart(this);
        },
        onBeforeRender: function() {
            delete this.filteredSet;
            this.getGraphBoundaries();
        },
        onBeforeDestroy: function() {
            if (this.chartPointer) {
                var chart = this.chartPointer.highcharts();
                if (chart) {
                    chart.destroy();
                }
            }
            this.cleanupPopover();
        },
        cleanupPopover: function() {
            var $popover = this.$('[data-toggle="popover"]');
            $popover.off('shown.bs.popover');
            $popover.off('hidden.bs.popover');
            $popover.popover('destroy');
        }
    });

    var GistView = Backbone.Marionette.CompositeView.extend({
        template: GistTemplate,
        attributes: {
            class: 'faux-table'
        },
        viewComparator: 'order',
        emptyView: noRecords,
        childView: ExpandableItem,
        childViewOptions: function() {
            return this.options;
        },
        childViewContainer: '.enc-gist-list',
        collectionEvents: {
            'customfilter': 'onCustomFilter',
            'clear_customfilter': 'onClearCustomFilter'
        },
        calculateGraphBoundaries: function() {
            var fullCollection = _.get(this, 'collection.collection');
            var firstModel;
            var startStopPoints;
            if (fullCollection instanceof Backbone.Collection) {
                var filter = this.getOption('childFilter');
                fullCollection.each(function(model) {
                    if (_.isFunction(filter) && !filter(model)) return;
                    if (!firstModel) {
                        firstModel = model;
                        return;
                    }
                    if (firstModel.get('dateTime') > model.get('dateTime')) firstModel = model;
                });
            }

            startStopPoints = chartUtil.selectStartStopPoint(firstModel);
            _.set(this, 'options.startStopPoints', startStopPoints);
        },
        onCustomFilter: function onCustomFilter(search) {
            this.options.childFilter = function(model) {
                var key = util.FILTER_FIELD;
                if (model instanceof Backbone.Model) return search.test(model.get(key));
                return search.test(model[key]);
            };
        },
        onClearCustomFilter: function onClearCustomFilter() {
            delete this.options.childFilter;
        },
        onBeforeRender: function() {
            this.calculateGraphBoundaries();
        },
        initialize: function() {
            this.maximizeScreen = _.get(this.getOption('appletConfig'), 'maximizeScreen');
        },
        onShow: function() {
            if (this.collection.length <= 0) {
                this.$('.enc-gist-list').removeAttr('role');
            }
            _.each(this.$('[data-header-instanceid]'), function(span) {
                this.$(span).append('<span class="sr-only">( ' + span.getAttribute('data-original-title') + ' )</span>');
            }, this);
        },
        onDestroy: function() {
            this.$('.enc-gist-list').off();
        },
        behaviors: {
            Tooltip: {}
        }
    });

    return GistView;
});