define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupRow',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/graph/chartBuilder',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/graph/highchartConfig'
], function(Backbone, Marionette, GraphingGroupRow, ChartBuilder, HighchartConfig) {
    'use strict';

    var med = Backbone.Marionette.ItemView.extend({
        template: GraphingGroupRow,
        className: "repeated-sig col-xs-12 left-padding-no right-padding-no",
        ui: {
            graphDiv: '.chart'
        },
        initialize: function() {
            this.hasGraph = false;
        },
        onRender: function(options) {
            var meds = options.model.get('medications');
            var vaType = meds.at(0).get("vaType").toLowerCase();
            if (!this.model.get('badGraphingData') && (vaType !== "i" && vaType !== "v")) {
                if (!(meds.length === 1 && meds.at(0).getModifiedVaStatus() === 'pending')) {
                    this.listenTo(ADK.Messaging, 'medication_review:superAccordionClicked', function() {
                        this.reflowGraph();
                    });
                    this.setHighChartsOptions(false);
                    this.listenTo(ADK.Messaging, 'meds-review-date-change', function(dateModel) {
                        this.setHighChartsOptions(false);
                        this.drawGraph();
                        this.setHighChartsOptions(true);
                    });
                    this.drawGraph();
                }
            } else if (vaType === "i" || vaType === "v") {
                this.$('.chart').html("Graphs for Inpatient Medications are not available at this time");
            } else {
                this.$('.chart').html("Data not graphable");
            }
        },
        onAttach: function() {
            this.reflowGraph();
            this.setHighChartsOptions(true);
        },
        setHighChartsOptions: function(useUTC) {
            Highcharts.setOptions({
                global: {
                    //Switch whether highcharts is using UTC or local browser time.
                    useUTC: useUTC
                }
            });
        },
        onBeforeDestroy: function() {
            if (this.hasGraph) {
                this.ui.graphDiv.highcharts().destroy();
            }
        },
        drawGraph: function() {
            if (this.hasGraph) {
                this.ui.graphDiv.highcharts().destroy();
                this.hasGraph = false;
            }
            var draw = _.bind(function() {
                var buildchart = new ChartBuilder(this.model);
                var medChartConfig = new HighchartConfig(buildchart);
                this.ui.graphDiv.highcharts(medChartConfig);
                this.hasGraph = true;
                this.$el.find('svg').attr('focusable', false);
                this.$el.find('svg').attr('aria-hidden', true);
            }, this);
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(draw);
                return;
            }
            draw();
        },
        reflowGraph: function() {
            if (this.hasGraph) {
                this.ui.graphDiv.highcharts().reflow();
            }
        },
        templateHelpers: function() {
            return {
                sigColumn: function() {
                    var ivSig = "";
                    if (this.ivProducts) {
                        if (this.ivProducts.length === 1) {
                            ivSig = "<span>" + this.ivProducts[0] + "</span>";
                        } else {
                            for (var i = 0; i < this.ivProducts.length; i++) {
                                if (i === this.ivProducts.length - 1) {
                                    ivSig = ivSig + "<div class='left-padding-sm'>" + this.ivProducts[i] + "</div>";
                                } else {
                                    ivSig = ivSig + "<span>" + this.ivProducts[i] + "</span>";
                                }
                            }
                        }
                    } else {
                        ivSig = "<span>" + this.computedSig + "</span>";
                    }
                    return ivSig.trim();
                }
            };
        }
    });

    return Backbone.Marionette.CollectionView.extend({
        className: "repeated-sigdiv col-xs-12",
        childView: med
    });
});