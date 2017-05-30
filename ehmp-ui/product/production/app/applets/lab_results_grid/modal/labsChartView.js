/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'highcharts',
    'moment',
    'app/applets/lab_results_grid/appletHelpers',
    'app/applets/lab_results_grid/modal/chartData'
], function (Backbone, Marionette, _, $, Highcharts, Moment, AppletHelper, ChartData) {
    'use strict';

    //noinspection UnnecessaryLocalVariableJS
    var ChartView = Backbone.Marionette.LayoutView.extend({
        template: '<div></div>',
        id: 'chartContainer',
        initialize: function (options) {
           var ModalChartData = new ChartData.ModalChartData(options);
           this.chartOptions = ModalChartData.chartOptions;
        },
        onShow: function () {
            this.Chart = new Highcharts.Chart(this.chartOptions);
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        onMouseOver: function (event, $target) {
            _.set(this.Chart, 'tooltip.shared', false);
            var $this = $target;
            var $td = $this.find('td:eq(2)');

            // [^\d\.-] match anything that is not [0-9] or . or -
            var tdText = $td.text().replace(/[^\d\.-]/g, '');
            var result = Number(tdText);

            var observed = $this.data('model').get('observed');
            var formattedObserved = AppletHelper.getDateForChart(observed);
            var date = new Moment.utc(formattedObserved).valueOf();

            _.each(this.Chart.series[0].points, function(point) {
                if (point.y === result && point.x === date) {
                    point.onMouseOver();
                    return false;
                }
            });
        },
        onMouseOut: function() {
            _.set(this.Chart, 'tooltip.shared', true);
        }
    });

    return ChartView;
});
