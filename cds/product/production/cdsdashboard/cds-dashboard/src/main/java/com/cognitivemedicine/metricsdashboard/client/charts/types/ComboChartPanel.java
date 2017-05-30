/*******************************************************************************
 *
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 *
 *******************************************************************************/
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
