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

import com.cognitivemedicine.metricsdashboard.client.charts.types.AreaChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.types.ColumnChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.types.ComboChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.types.EmptyChartPanel;
import com.cognitivemedicine.metricsdashboard.client.charts.types.LineChartPanel;
import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.ChartType;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.googlecode.gwt.charts.client.ChartPackage;
import com.googlecode.gwt.charts.client.corechart.AreaChart;
import com.googlecode.gwt.charts.client.corechart.AreaChartOptions;
import com.googlecode.gwt.charts.client.corechart.ColumnChart;
import com.googlecode.gwt.charts.client.corechart.ColumnChartOptions;
import com.googlecode.gwt.charts.client.corechart.ComboChart;
import com.googlecode.gwt.charts.client.corechart.ComboChartOptions;
import com.googlecode.gwt.charts.client.corechart.LineChart;
import com.googlecode.gwt.charts.client.corechart.LineChartOptions;
import com.googlecode.gwt.charts.client.format.DateFormat;
import com.googlecode.gwt.charts.client.format.DateFormatOptions;
import com.googlecode.gwt.charts.client.options.ChartArea;
import com.googlecode.gwt.charts.client.options.CoreOptions;
import com.googlecode.gwt.charts.client.options.FormatType;
import com.googlecode.gwt.charts.client.options.HAxis;
import com.googlecode.gwt.charts.client.options.Legend;
import com.googlecode.gwt.charts.client.options.LegendPosition;
import com.googlecode.gwt.charts.client.options.Options;
import com.googlecode.gwt.charts.client.options.TextStyle;
import com.googlecode.gwt.charts.client.options.Tick;
import com.googlecode.gwt.charts.client.options.TitlePosition;
import com.googlecode.gwt.charts.client.options.VAxis;

/**
 * An abstract factory for creating and configuring charts
 * 
 * @author sschechter
 * 
 */
public class AbstractChartPanelFactory {

  /**
   * Creates a chart and returns it as a panel using the user selected chart type as input
   * 
   * @param grainMatrix
   *          - contains chart configuration settings
   * @return a panel containing a chart
   */
  public static AbstractChartPanel<?, ?> createChartPanel(GrainMatrix grainMatrix) {
    if (grainMatrix == null) {
      return new EmptyChartPanel();
    }

    switch (grainMatrix.getChartSettings().getChartType()) {
    // case STATISTICAL:
    // AreaChart ac = new AreaChart();
    // AreaChartOptions aco = AreaChartOptions.create();
    // aco.setIsStacked(false);
    // aco.setPointSize(3);
    // configureChart(ac);
    // configureOptions(grainMatrix, aco);
    // return new StatisticsChart(ac, aco);
    case COMBO:
      ComboChartOptions comboOptions = ComboChartOptions.create();
      ComboChart comboChart = new ComboChart();
      configureChart(comboChart);
      configureOptions(grainMatrix, comboOptions);
      return new ComboChartPanel(comboChart, comboOptions);
      // Draw the chart
      // chart.draw(dataTable, options);
    case AREAFILL:
      AreaChart areaChart = new AreaChart();
      AreaChartOptions areaChartOptions = AreaChartOptions.create();
      areaChartOptions.setIsStacked(true);
      areaChartOptions.setPointSize(3);
      configureChart(areaChart);
      configureOptions(grainMatrix, areaChartOptions);
      return new AreaChartPanel(areaChart, areaChartOptions);
    case BAR:
      ColumnChart columnChart = new ColumnChart();
      ColumnChartOptions columnChartOptions = ColumnChartOptions.create();
      configureChart(columnChart);
      configureOptions(grainMatrix, columnChartOptions);
      return new ColumnChartPanel(columnChart, columnChartOptions);
    case LINE:
      LineChart lineChart = new LineChart();
      LineChartOptions lineChartOptions = LineChartOptions.create();
      lineChartOptions.setLineWidth(2);
      lineChartOptions.setPointSize(3);
      configureChart(lineChart);
      configureOptions(grainMatrix, lineChartOptions);
      return new LineChartPanel(lineChart, lineChartOptions);
      // case TABLE:
      // Table table = new Table();
      // TableOptions tableOptions = TableOptions.create();
      // tableOptions.setAlternatingRowStyle(true);
      // tableOptions.setShowRowNumber(true);
      // tableOptions.setPage(TablePage.ENABLE);
      // tableOptions.setPageSize(10);
      // configureChart(table);
      // configureOptions(grainMatrix, tableOptions);
      // return new TableChartPanel(table, tableOptions);

    default:
      return new EmptyChartPanel();
    }
  }

  /**
   * Determines the charting package to be loaded by the GWT Charts API
   * 
   * @param chartType
   * @return the GWT ChartPackage to use for loading a specific type of chart
   */
  public static ChartPackage getChartPackage(ChartType chartType) {
    switch (chartType) {
    // case TABLE:
    // return ChartPackage.TABLE;
    case AREAFILL:
    case BAR:
      // case COLUMN:
    case LINE:
      // case STACKED_COLUMN:
    default:
      return ChartPackage.CORECHART;
    }
  }

  /**
   * A common method for configuring charts
   * 
   * @param chart
   *          - the chart to configure
   */
  private static void configureChart(com.googlecode.gwt.charts.client.ChartWidget<?> chart) {
    chart.setWidth("475px");
    chart.setHeight("400px");
  }

  /**
   * A common method for configuring chart options
   * 
   * @param grainMatrix
   *          - contains chart configuration settings
   * @param options
   *          - the options to configure
   */
  private static void configureOptions(GrainMatrix grainMatrix, Options options) {
    ChartSettings settings = grainMatrix.getChartSettings();
    Granularity granularity = settings.getGranularity();
    String granString = settings.getGranularity() != null ? "Granularity: "
        + granularity.getSymbol() : "Raw data - no aggregation";

    TextStyle textStyle = TextStyle.create();
    textStyle.setBold(true);
    textStyle.setFontSize(12);

    Legend legend = Legend.create(LegendPosition.TOP);
    legend.setTextStyle(textStyle);
    legend.setMaxLines(4);

    ChartArea chartArea = ChartArea.create();
    chartArea.setWidth("77%");
    chartArea.setHeight("62%");

    // String vAxisLabel = "Count";
    // for(MetaDefinition m : grainMatrix.getMetaDefinitions()){
    // vAxisLabel = con
    // }
    // TODO - get this value dynamically
    VAxis vAxis = VAxis.create("Value");
    vAxis.setMinValue(0);
    vAxis.setMaxValue(20);

    HAxis hAxis = HAxis.create(granString + " (Note: all times are displayed in UTC)");

    Date d = new Date(System.currentTimeMillis());

    String pattern = choosePattern(settings, false);
    DateFormatOptions dateOptions = DateFormatOptions.create();
    dateOptions.setFormatType(FormatType.SHORT);
    dateOptions.setTimeZone(0);
    dateOptions.setPattern(pattern);
    DateFormat format = DateFormat.create(dateOptions);
    // hAxis.setMinValue(new Date(settings.getStartPeriod()));
    // hAxis.setMaxValue(new Date(settings.getEndPeriod()));

    Tick[] ticks;
    Date date;
    Date firstTick = null;
    Date lastTick = null;
    // If we know the granularity, we'll set the Tick marks, otherwise let
    // chart library handle it
    if (grainMatrix.getChartSettings().getGranularity() != null) {
      int size = grainMatrix.getMetricMap().keySet().size();
      ticks = new Tick[size];
      int i = 0;
      for (long l : grainMatrix.getMetricMap().keySet()) {
        date = new Date(l);
        if (i == 0) {
          firstTick = date;
        }
        if (i == size - 1) {
          lastTick = date;
        }
        ticks[i] = Tick.create(date, format.formatValue(date));
        i++;
      }
      hAxis.setTicks(ticks);
    }
    hAxis.setSlantedText(true);
    hAxis.setSlantedTextAngle(20);

    DateFormatOptions do2 = DateFormatOptions.create();
    do2.setFormatType(FormatType.SHORT);
    do2.setPattern(choosePattern(settings, true));
    do2.setTimeZone(0);
    DateFormat f2 = DateFormat.create(do2);
    // int numTicks = grainMatrix.getMetricMap().size() < 6 ?
    // grainMatrix.getMetricMap().size() : 6;
    if (options instanceof CoreOptions) {
      CoreOptions co = (CoreOptions) options;
      co.setTitle(settings.getTitle() + " (" + f2.formatValue(firstTick) + " - "
          + f2.formatValue(lastTick) + ")");
      co.setTitlePosition(TitlePosition.OUT);
      co.setFontName("Tahoma");
      co.setTitleTextStyle(textStyle);
      co.setLegend(legend);
      co.setChartArea(chartArea);
      co.setVAxis(vAxis);
      co.setHAxis(hAxis);
    }
  }

  /**
   * Choose the pattern to use for the Date Formatter
   * 
   * @param settings
   *          - the settings of the chart that needs date formatting
   * @param isTitle
   *          - is a title or tooltip, which allows for extra room to display more characters of
   *          additional information
   * @return
   */
  public static String choosePattern(ChartSettings settings, boolean isTitle) {
    long millis = settings.getGranularity() != null ? settings.getGranularity().getMilliseconds()
        : settings.getPeriod().getMilliseconds();

    if (millis <= Granularity.H1.getMilliseconds()) {
      if (isTitle) {
        return "M/d h:mm a";
      }
      return "h:mm a";
    } else if (millis > Granularity.H1.getMilliseconds()
        && millis < Granularity.D1.getMilliseconds()) {
      return "M/d h:mm a";
    } else if (millis == Granularity.D1.getMilliseconds()) {
      if (isTitle) {
        return "M/d/yy";
      }
      return "EEE M/d";
    } else if (millis > Granularity.D1.getMilliseconds()
        && millis < Granularity.D30.getMilliseconds()) {
      return "M/d/yy";
    } else if (millis >= Granularity.D30.getMilliseconds()) {
      if (isTitle) {
        return "M/d/yy";
      }
      return "yyyy";
    }

    return "M/d/yy";
  }
}
