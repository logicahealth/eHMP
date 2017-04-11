package com.cognitivemedicine.metricsdashboard.client.charts.types;

import com.cognitivemedicine.metricsdashboard.client.charts.AbstractChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.GrainMatrix;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.googlecode.gwt.charts.client.corechart.ComboChart;
import com.googlecode.gwt.charts.client.corechart.ComboChartOptions;
import com.googlecode.gwt.charts.client.corechart.ComboChartSeries;
import com.googlecode.gwt.charts.client.options.FocusTarget;
import com.googlecode.gwt.charts.client.options.Legend;
import com.googlecode.gwt.charts.client.options.LegendAlignment;
import com.googlecode.gwt.charts.client.options.LegendPosition;
import com.googlecode.gwt.charts.client.options.SeriesType;
import com.googlecode.gwt.charts.client.options.VAxis;

public class ComboChartPanel extends AbstractChartPanel<ComboChart, ComboChartOptions> {

  public ComboChartPanel(ComboChart chart, ComboChartOptions options) {
    super(chart, options);
  }

  @Override
  protected void draw(GrainMatrix grainMatrix) {

    options.setSeriesType(SeriesType.LINE);

    int i = 0;
    ComboChartSeries series;
    String method;
    for (MetaDefinition m : grainMatrix.getMetaDefinitions()) {
      method = m.getMethodName();
      if (method.equalsIgnoreCase("Count")) {
        series = ComboChartSeries.create();
        series.setType(SeriesType.BARS);
        series.setTargetAxisIndex(1);
        VAxis vAxis = VAxis.create("Count");
        vAxis.setMinValue(0);
        options.setVAxis(1, vAxis);
        options.setSeries(i, series);
      } else if (method.equalsIgnoreCase("Max")) {
        series = ComboChartSeries.create();
        series.setType(SeriesType.LINE);
        series.setPointSize(3);
        series.setTargetAxisIndex(0);
        VAxis vAxis = VAxis.create("Value");
        vAxis.setMinValue(0);
        options.setVAxis(0, vAxis);
        options.setSeries(i, series);
      } else if (method.equalsIgnoreCase("Avg")) {
        series = ComboChartSeries.create();
        series.setType(SeriesType.LINE);
        series.setPointSize(3);
        series.setLineDashStyle(2, 2);
        series.setTargetAxisIndex(0);
        VAxis vAxis = VAxis.create("Value");
        vAxis.setMinValue(0);
        options.setVAxis(0, vAxis);
        options.setSeries(i, series);
      } else if (method.equalsIgnoreCase("Min")) {
        series = ComboChartSeries.create();
        series.setType(SeriesType.LINE);
        series.setPointSize(3);
        series.setLineDashStyle(10, 2);
        series.setTargetAxisIndex(0);
        VAxis vAxis = VAxis.create("Value");
        vAxis.setMinValue(0);
        options.setVAxis(0, vAxis);
        options.setSeries(i, series);
      } else if (method.equalsIgnoreCase("Sum")) {
        series = ComboChartSeries.create();
        series.setType(SeriesType.AREA);
        series.setPointSize(3);
        series.setAreaOpacity(.33);
        series.setTargetAxisIndex(0);
        VAxis vAxis = VAxis.create("Value");
        vAxis.setMinValue(0);
        options.setVAxis(0, vAxis);
        options.setSeries(i, series);
      }
      i++;
    }
    Legend legend = Legend.create();
    legend.setAligment(LegendAlignment.START);
    legend.setPosition(LegendPosition.TOP);
    legend.setMaxLines(5);

    options.setLegend(legend);
    options.setFocusTarget(FocusTarget.CATEGORY);

    // Show only points for raw data
    if (grainMatrix.getChartSettings().getGranularity() == null) {
      options.setLineWidth(0);
    }

    super.populateDataTable(grainMatrix);
    chart.draw(dataTable, options);
  }
}
