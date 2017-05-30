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
package com.cognitivemedicine.metricsdashboard.client.charts;

import java.util.Date;
import java.util.HashMap;
import java.util.TreeMap;

import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.googlecode.gwt.charts.client.ColumnType;
import com.googlecode.gwt.charts.client.DataTable;
import com.googlecode.gwt.charts.client.format.DateFormat;
import com.googlecode.gwt.charts.client.format.DateFormatOptions;
import com.googlecode.gwt.charts.client.options.FormatType;
import com.googlecode.gwt.charts.client.options.Options;

/**
 * An abstract container for rendering GWT Charts
 * 
 * @author sschechter
 * 
 * @param <S>
 *          A generic chart type that extends com.googlecode.gwt.charts.client.ChartWidget<T>
 * @param <T>
 *          A generic type that extendscom.googlecode.gwt.charts.client.options.Options
 */
public abstract class AbstractChartPanel<S extends com.googlecode.gwt.charts.client.ChartWidget<T>, T extends Options>
    extends HorizontalPanel {

  protected S chart;
  protected T options;
  protected DataTable dataTable;

  public AbstractChartPanel(S chart, T options) {
    this.chart = chart;
    this.options = options;
  }

  /**
   * Logic that must be implemented by a subclass
   * 
   * @param grainMatrix
   *          - contains all the configuartion settings and data needed to populate a chart
   */
  protected abstract void draw(GrainMatrix grainMatrix);

  public S getChart() {
    return chart;
  }

  public void setChart(S chart) {
    this.chart = chart;
  }

  public T getOptions() {
    return options;
  }

  public void setOptions(T options) {
    this.options = options;
  }

  public DataTable getDataTable() {
    return dataTable;
  }

  public void setDataTable(DataTable dataTable) {
    this.dataTable = dataTable;
  }

  /**
   * Logic for building a standard GWT Chart DataTable, the underlying structure used to build a
   * chart
   * 
   * @param grainMatrix
   */
  public void populateDataTable(GrainMatrix grainMatrix) {

    DateFormatOptions dateOptions = DateFormatOptions.create();
    dateOptions.setFormatType(FormatType.SHORT);
    dateOptions.setTimeZone(0);
    dateOptions.setPattern(AbstractChartPanelFactory.choosePattern(grainMatrix.getChartSettings(),
        true));
    DateFormat format = DateFormat.create(dateOptions);

    dataTable = DataTable.create();
    dataTable.addColumn(ColumnType.DATETIME, "Time");
    for (MetaDefinition metric : grainMatrix.getMetaDefinitions()) {
      dataTable.addColumn(ColumnType.NUMBER, metric.toString());
    }

    TreeMap<Long, HashMap<String, Datapoint>> metricMap = grainMatrix.getMetricMap();
    dataTable.addRows(metricMap.size());

    int i = 0;
    for (long datetime : metricMap.keySet()) {
      dataTable.setValue(i, 0, new Date(datetime));
      i++;
    }

    format.format(dataTable, 0);

    int col = 1; // First column is reserved for Time
    int row = 0;
    for (long datetime : metricMap.keySet()) {
      HashMap<String, Datapoint> innerMap = metricMap.get(datetime);
      col = 1;
      for (MetaDefinition metaDefinition : grainMatrix.getMetaDefinitions()) {
        Datapoint d = metricMap.get(datetime).get(metaDefinition.toString());
        if (d != null) {
          Double value = 0d;
          if (metaDefinition.getMethodName().equalsIgnoreCase("Count")) {
            value = d.getCount() != null ? (double) d.getCount() : null;
          } else if (metaDefinition.getMethodName().equalsIgnoreCase("Max")) {
            value = d.getMax();
          } else if (metaDefinition.getMethodName().equalsIgnoreCase("Avg")) {
            value = d.getAvg();
          } else if (metaDefinition.getMethodName().equalsIgnoreCase("Min")) {
            value = d.getMin();
          } else if (metaDefinition.getMethodName().equalsIgnoreCase("Sum")) {
            value = d.getSum();
          }
          if (value == null) {
            continue;
          }
          dataTable.setValue(row, col, value);
        }
        // else { Granularity not specified, no data for this metric at
        // this point }
        col++;
      }
      row++;
    }
  }
}
