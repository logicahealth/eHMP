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
        className: "repeatedSig col-sm-12 left-padding-no right-padding-no",
        ui: {
            graphDiv: '.chart'
        },
        initialize: function() {
            this.hasGraph = false;
        },
        onRender: function(options) {
            var meds = options.model.get('medications');
            var vaType = meds.at(0).get("vaType").toLowerCase();
            if (!this.model.get('badGraphingData') && vaType !== "i" && vaType !== "v") {
                if (!(meds.length === 1 && meds.at(0).getModifiedVaStatus() === 'pending')) {
                    this.listenTo(ADK.Messaging, 'medication_review:superAccordionClicked', function() {
                        this.reflowGraph();
                    });
                    this.listenTo(ADK.Messaging, 'meds-review-date-change', function(dateModel) {
                        this.drawGraph();
                    });
                    this.drawGraph();
                }
            } else {
                this.$('.chart').html("Graphs for Inpatient Medications are not available at this time");
            }
        },
        onAttach: function() {
            this.reflowGraph();
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
                            ivSig = "<div>" + this.ivProducts[0] + "</div>";
                        } else {
                            for (var i = 0; i < this.ivProducts.length; i++) {
                                if (i === this.ivProducts.length - 1) {
                                    ivSig = ivSig + "<div class='leftPadding'>" + this.ivProducts[i] + "</div>";
                                } else {
                                    ivSig = ivSig + "<div>" + this.ivProducts[i] + "</div>";
                                }
                            }
                        }
                    } else {
                        ivSig = "<div class='ellipsisFormat'>" + this.computedSig + "</div>";
                    }
                    return ivSig.trim();
                }
            };
        }
    });

    return Backbone.Marionette.CollectionView.extend({
        className: "repeatedSigDiv col-sm-12",
        childView: med
    });
});