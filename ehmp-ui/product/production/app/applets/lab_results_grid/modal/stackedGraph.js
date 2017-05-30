/* global ADK */
define([
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'app/applets/lab_results_grid/appletHelpers',
    'hbs!app/applets/lab_results_grid/templates/tooltip',
    'app/applets/lab_results_grid/modal/chartData'
], function(moment, Backbone, Marionette, _, AppletHelper, tooltip, ChartData) {
    'use strict';


    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('years', 2).format(ADK.utils.dateUtils.defaultOptions().placeholder),
            toDate: moment().format(ADK.utils.dateUtils.defaultOptions().placeholder)
        }
    });


    //noinspection UnnecessaryLocalVariableJS
    var StackedGraph = Backbone.Marionette.Object.extend({
        dateRange: new DateRangeModel(),
        initialize: function (options) {
            this.options = options || {};
            this.collection = new ADK.UIResources.Fetch.Labs.StackGraphCollection();
            this.model = _.get(this.options, 'model', new Backbone.Model());
            this.listenTo(this.collection, 'fetch:success', this.notifyStackGraphs);

            _.set(this.collection.fetchOptions, 'collectionConfig.comparator', this.observedComparator);
            _.set(this.collection.fetchOptions, 'criteria', {
                'type': this.model.get('typeName'),
                'date.end': moment().format('YYYYMMDD')
            });

            this.collection.fetchCollection();
        },
        observedComparator: function(model1, model2) {
            if (model1.get('observed') > model2.get('observed')) {
                return -1;
            } else if (model1.get('observed') < model2.get('observed')) {
                return 1;
            }

            return 0;
        },
        notifyStackGraphs: function() {
            if (this.collection.length > 0) {
                this.model.set('resultUnits', this.collection.first().get('result') + ' ' + this.collection.first().get('units'));
                this.model.set(this.collection.first().toJSON());
            } else {
                this.model.set('resultUnits', '--');
            }

            var data = new ChartData.StackedGraphChartData({
                chartOptions: _.cloneDeep(AppletHelper.chartOptions),
                model: this.model,
                collection: this.collection
            });
            this.chart = data.getChartOptions();

            var tooltipModel = this.createTooltipModel(this.collection);
            if (!_.isNull(tooltipModel)) {
                this.tooltip = tooltip(tooltipModel.attributes);
            }

            var chartData = this.model.toJSON();
            chartData.chart = this.chart;
            chartData.tooltip = this.tooltip;
            chartData.model = this.model;
            ADK.Messaging.getChannel('stackedGraph').trigger('readyToChart', {
                response: chartData,
                requestParams: _.extend({}, this.options.requestParams)
            });
            this.destroy();
        },
        resetSharedModalDateRangeOptions: function() {
            this.dateRange = new DateRangeModel();
        },
        createTooltipModel: function(collection) {
            var tooltipModel;
            var oldValues = [];

            for (var i = 0, found = 0; i < collection.length && found < 5; i += 1) {
                var model = collection.at(i);
                if(model.get('kind') === 'Laboratory') {
                    var observed = model.get('observed');
                    var formatted = AppletHelper.getObservedFormatted(observed);
                    model.set('observedFormatted', formatted);
                    if (i === 0) {
                        tooltipModel = model.clone();
                    } else {
                        oldValues.push(model);
                    }
                    found += 1;
                }
            }

            if (tooltipModel) {
                tooltipModel.set('limitedoldValues', oldValues);
                return tooltipModel;
            }
            return null;
        }
    });

    return StackedGraph;

});