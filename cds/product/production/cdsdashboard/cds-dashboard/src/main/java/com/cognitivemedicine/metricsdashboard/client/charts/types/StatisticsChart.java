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

import java.util.Date;
import java.util.HashMap;
import java.util.TreeMap;

import com.cognitivemedicine.metricsdashboard.client.charts.AbstractChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.GrainMatrix;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.googlecode.gwt.charts.client.ColumnType;
import com.googlecode.gwt.charts.client.DataTable;
import com.googlecode.gwt.charts.client.corechart.AreaChart;
import com.googlecode.gwt.charts.client.corechart.AreaChartOptions;

/**
 * A chart for showing all statistical functions
 * 
 * @author sschechter
 *
 */
public class StatisticsChart extends AbstractChartPanel<AreaChart, AreaChartOptions> {

  public StatisticsChart(AreaChart chart, AreaChartOptions options) {
    super(chart, options);
  }

  @Override
  protected void draw(GrainMatrix grainMatrix) {
    // Tooltip tooltip = Tooltip.create();
    // tooltip.setShowColorCode(true);
    // tooltip.setIsHtml(true);
    // options.setTooltip(tooltip);
    dataTable = DataTable.create();
    dataTable.addColumn(ColumnType.DATETIME, "Time");
    for (MetaDefinition metric : grainMatrix.getMetaDefinitions()) {
      dataTable.addColumn(ColumnType.NUMBER, "Min");
      addTooltipColumn(dataTable);
      dataTable.addColumn(ColumnType.NUMBER, "Avg");
      addTooltipColumn(dataTable);
      dataTable.addColumn(ColumnType.NUMBER, "Max");
      addTooltipColumn(dataTable);
      dataTable.addColumn(ColumnType.NUMBER, "Count");
      addTooltipColumn(dataTable);
      dataTable.addColumn(ColumnType.NUMBER, "Sum");
      addTooltipColumn(dataTable);
    }

    TreeMap<Long, HashMap<String, Datapoint>> metricMap = grainMatrix.getMetricMap();
    dataTable.addRows(metricMap.size());

    int i = 0;
    for (long datetime : metricMap.keySet()) {
      dataTable.setValue(i, 0, new Date(datetime));
      i++;
    }

    int col = 1; // First column is reserved for Time
    int row = 0;
    Datapoint point;
    String tooltip;
    for (long datetime : metricMap.keySet()) {
      HashMap<String, Datapoint> innerMap = metricMap.get(datetime);
      col = 1;
      for (String metricId : innerMap.keySet()) {
        point = metricMap.get(datetime).get(metricId);
        tooltip = new Date(point.getDatetime()).toString() + "\n" + "Min: " + point.getMin() + "\n"
            + "Avg: " + point.getAvg() + "\n" + "Max: " + point.getMax() + "\n" + "Count: "
            + point.getCount() + "\n" + "Sum: " + point.getSum() + "\n";
        dataTable.setValue(row, col, point.getMin());
        col++;
        dataTable.setValue(row, col, tooltip);
        col++;
        dataTable.setValue(row, col, point.getAvg());
        col++;
        dataTable.setValue(row, col, tooltip);
        col++;
        dataTable.setValue(row, col, point.getMax());
        col++;
        dataTable.setValue(row, col, tooltip);
        col++;
        dataTable.setValue(row, col, point.getCount());
        col++;
        dataTable.setValue(row, col, tooltip);
        col++;
        dataTable.setValue(row, col, point.getSum());
        col++;
        dataTable.setValue(row, col, tooltip);
        col++;
      }
      row++;
    }

    chart.draw(dataTable, options);
  }

  private native void addTooltipColumn(DataTable data) /*-{
		data.addColumn({
			type : 'string',
			role : 'tooltip'
		});
  }-*/;

}
