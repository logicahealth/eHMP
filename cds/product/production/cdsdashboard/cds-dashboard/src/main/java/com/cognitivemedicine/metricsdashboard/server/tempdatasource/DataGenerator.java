/*
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
 */
package com.cognitivemedicine.metricsdashboard.server.tempdatasource;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.ChartType;
import com.cognitivemedicine.metricsservice.model.Configuration;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.DashboardSettings;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.Period;
import com.cognitivemedicine.metricsservice.model.Role;
import com.cognitivemedicine.metricsservice.model.UserRoles;
import com.ibm.icu.text.DateFormat;

/**
 * This is used to generate sample data for dev testing and debugging
 * 
 * @author sschechter
 * 
 */
public class DataGenerator {

  public static int roleId;
  public static int userId;
  public static int dashboardId;
  public static int metricId;
  public static int metricGroupId;
  public static int chartId;
  public static int originId;

  private static SecureRandom random = new SecureRandom();
  private static final String[] DICTIONARY = { "Lorem", "ipsum", "dolor", "sit", "amet,",
      "consectetur", "adipiscing", "elit,", "sed", "do", "eiusmod", "tempor", "incididunt", "ut",
      "labore", "et", "dolore", "magna", "aliqua.", "Ut", "enim", "ad", "minim", "veniam,", "quis",
      "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
      "commodo", "consequat.", "Duis", "aute", "irure", "dolor", "in", "reprehenderit", "in",
      "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur.",
      "Excepteur", "sint", "occaecat", "cupidatat", "non", "proident,", "sunt", "in", "culpa",
      "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum.", "A", "dashboard",
      "contains", "pre-developed,", "dynamic", "reports", "that", "can", "display", "a", "lot",
      "of", "information", "in", "a", "quick,", "visual,", "and", "interactive", "format.",
      "Users", "are", "able", "to", "glance", "at", "a", "dashboard", "to", "get", "a",
      "high-level", "view", "and", "then", "drill", "down", "to", "what", "they", "wish", "to",
      "see", "in", "more", "detail.", "", "iTwo", "dashboards", "are", "organized", "by",
      "subject", "area,", "such", "as", "Student", "Enrollment", "or", "Financial", "Information.",
      "Each", "dashboard", "contains", "any", "number", "of", "pages." };
  private static final String[] UNIT_TYPE = { "days", "hours", "miles", "feet / second", "seconds",
      "units" };
  private static final String[] DASHBOARD_CATEGORY = { "IT Metrics", "Business Metrics", "Rules",
      "Dates" };

  public static String generatateRandomParagraph(int wordCount) {
    StringBuilder sb = new StringBuilder();

    for (int i = 0; i < wordCount; i++) {
      sb.append(generateRandomWord() + " ");
    }

    String result = sb.toString();
    return result.substring(0, result.length() - 1);
  }

  public static String generateRandomWord() {
    return DICTIONARY[random.nextInt(DICTIONARY.length)];
  }

  public static Metric generateMetric() {
    // TODO - this is outtdated for a random generated metric
    Metric metric = new Metric();
    metric.setName(generateRandomWord());
    metric.setDescription(generatateRandomParagraph(12));
    // metric.set_id(String.valueOf((metricId++));
    int lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure(UNIT_TYPE[random.nextInt(UNIT_TYPE.length)]);
    return metric;
  }

  // public static Origin generateOrigin() {
  // Origin origin = new Origin();
  // // origin.set_id(String.valueOf(originId++));
  // origin.setName(String.valueOf(originId++));
  // origin.setDescription(generatateRandomParagraph(10));
  // return origin;
  // }

  public static ArrayList<Metric> generateDemoMetrics() {
    ArrayList<Metric> metrics = new ArrayList<Metric>();
    Metric metric = new Metric();
    metric.setName("SessionCount");
    metric.setDescription("Number of created sessions for this Knowledge Base");
    metric.set_id(String.valueOf(metricId++));
    // int lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure("Sessions");
    ArrayList<String> origins = new ArrayList<String>();
    ArrayList<String> invocationTypes = new ArrayList<String>();
    ArrayList<String> aggregates = new ArrayList<String>();
    origins.add("System A");
    origins.add("System B");
    aggregates.add("Count");
    metric.setOrigins(origins);
    metric.setInvocationTypes(invocationTypes);
    metric.setAggregation(aggregates);
    metrics.add(metric);

    invocationTypes = new ArrayList<String>();
    invocationTypes.add("Direct");
    invocationTypes.add("Background");
    aggregates = new ArrayList<String>();
    aggregates.add("Count");
    aggregates.add("Max");
    aggregates.add("Avg");
    aggregates.add("Min");
    aggregates.add("Sum");

    metric = new Metric();
    metric.setName("Execution_Begin");
    metric.setDescription("Number of Rules that were fully invoked");
    metric.set_id(String.valueOf(metricId++));
    // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure("rules");
    metric.setOrigins(origins);
    metric.setAggregation(aggregates);
    metric.setInvocationTypes(invocationTypes);
    metrics.add(metric);

    metric = new Metric();
    metric.setName("Execution_End");
    metric.setDescription("Rules that failed to complete execution");
    metric.set_id(String.valueOf(metricId++));
    // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure("Rules");
    metric.setOrigins(origins);
    metric.setAggregation(aggregates);
    metric.setInvocationTypes(invocationTypes);
    metrics.add(metric);

    // metric = new Metric();
    // metric.setName("EngineTwo_Execution_Begin");
    // metric.setDescription("Number of times a rule finished execution with a non-fatal warning");
    // // metric.set_id(String.valueOf((metricId++);
    // // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    // metric.setLowerBound(0);
    // metric.setUpperBound(500);
    // metric.setUnitOfMeasure("Executions");
    // metrics.add(metric);
    //
    // metric = new Metric();
    // metric.setName("EngineTwo_Execution_End");
    // metric.setDescription("Number of times a rule finished execution with a non-fatal warning");
    // // metric.set_id(String.valueOf((metricId++);
    // // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    // metric.setLowerBound(0);
    // metric.setUpperBound(500);
    // metric.setUnitOfMeasure("Executions");
    // metrics.add(metric);

    metric = new Metric();
    metric.setName("Invocation_Begin");
    metric.setDescription("Number of times a rule finished execution with a non-fatal warning");
    metric.set_id(String.valueOf(metricId++));
    // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure("Invocations");

    origins = new ArrayList<String>();
    metric.setOrigins(origins);
    metric.setAggregation(aggregates);
    metric.setInvocationTypes(invocationTypes);
    metrics.add(metric);

    metric = new Metric();
    metric.setName("Invocation_End");
    metric.setDescription("Number of times a rule finished execution with a non-fatal warning");
    metric.set_id(String.valueOf(metricId++));
    // lb = random.nextInt(2) == 1 ? random.nextInt(100) : 0;
    metric.setUnitOfMeasure("Invocations");
    metric.setOrigins(origins);
    metric.setAggregation(aggregates);
    metric.setInvocationTypes(invocationTypes);
    metrics.add(metric);

    return metrics;
  }

  public static MetricGroup generateMetricGroup(ArrayList<Metric> metrics) {
    MetricGroup group = new MetricGroup();
    group.set_id(String.valueOf(metricGroupId++));
    group.setName(generateRandomWord());
    group.setDescription(generatateRandomParagraph(12));

    ArrayList<String> metricList = new ArrayList<String>();
    String x;
    for (int i = 0; i < random.nextInt(metrics.size()) + 1; i++) {
      x = metrics.get(random.nextInt(metrics.size())).get_id();
      if (!metricList.contains(x)) {
        metricList.add(x);
      }
    }
    group.setMetricList(metricList);

    return group;
  }

  public static MetricGroup generateAllGroup(ArrayList<Metric> metrics) {
    MetricGroup group = new MetricGroup();
    group.set_id(String.valueOf(metricGroupId++));
    group.setName("All Metrics");
    group.setDescription("A group for all metrics");

    ArrayList<String> metricList = new ArrayList<String>();
    String x;
    for (int i = 0; i < metrics.size(); i++) {
      x = metrics.get(i).get_id();
      metricList.add(x);
    }
    group.setMetricList(metricList);

    return group;
  }

  public static UserRoles generateUserRole() {
    UserRoles ur = new UserRoles();
    ur.setUserId(String.valueOf(userId++));

    int numRoles = roleId + 1; // includes Admin
    ArrayList<String> roles = new ArrayList<String>();

    roles.add(String.valueOf(-1));
    roles.add(String.valueOf(roleId - 1));

    // int[] idList = {1,2,3,4,5};
    ur.setRoleIdList(roles);
    return ur;
  }

  public static Role generateRole() {
    Role r = new Role();
    r.set_id(String.valueOf(roleId++));
    r.setName(generateRandomWord());
    r.setDescription(generatateRandomParagraph(6));
    return r;
  }

  public static List<Datapoint> generateDatapoints(Metric metric, long startPeriod, long endPeriod,
      long granularity) {

    Date sd = new Date(startPeriod);
    Date ed = new Date(endPeriod);
    DateFormat f = DateFormat.getDateTimeInstance();

    double lb = 0;
    double ub = 500;

    double min = 0;
    double max = 0;
    double average = 0;
    double sum = 0;
    int count = 0;
    double value = 0;
    long datetime = 0;

    granularity = granularity != 0 ? granularity : (endPeriod - startPeriod) / 25;
    int numberOfPoints = (int) ((endPeriod - startPeriod) / granularity);

    if (numberOfPoints > 100)
      numberOfPoints = 100;
    List<Datapoint> datapoints = new ArrayList<Datapoint>();
    Datapoint d;

    // /To test small data sets randomly create sets of 0, 1, 2 points
    int aaa = random.nextInt(50);
    if (aaa == 0)
      numberOfPoints = 0;
    if (aaa == 1)
      numberOfPoints = 1;
    if (aaa == 2)
      numberOfPoints = 2;

    for (int i = 0; i < numberOfPoints; i++) {
      d = new Datapoint();
      value = lb + (random.nextDouble() * random.nextInt((int) ub - (int) lb));

      // ensure min <= avg <= max && sum == count * avg
      min = random.nextInt((int) ub);
      average = min + random.nextInt((int) (ub - min));
      max = average + random.nextInt((int) (ub - average));
      count = random.nextInt(20);
      sum = count * average;

      if (average > max) {
        System.err.println("WTF???");
      }

      d.setValue(value);
      datetime = startPeriod + (granularity * i);

      System.err.println("datetime: " + f.format(datetime) + " " + datetime + " value: " + value
          + " min: " + min + " max: " + max + " avg: " + average + " sum " + sum);

      d.setDatetime(datetime);
      d.setLabel(generatateRandomParagraph(random.nextInt(2) + 1));
      d.setMin((double) min);
      d.setMax((double) max);
      d.setAvg(average);
      d.setCount((int) count);
      d.setSum((double) sum);

      datapoints.add(d);
    }

    return datapoints;
  }

  public static ArrayList<Dashboard> generateDemoDashboard() {
    ArrayList<String> selecetedMetrics = new ArrayList<String>();

    ArrayList<Dashboard> dashboards = new ArrayList<Dashboard>();
    Dashboard dashboard = new Dashboard();
    dashboard.setCategory(DASHBOARD_CATEGORY[random.nextInt(DASHBOARD_CATEGORY.length)]);
    dashboard.setName("Rules Invocation vs Rules Failed");
    dashboard
        .setDescription("A comparison of rules successfully invocated against rules that were unable to complete");
    dashboard.set_id(String.valueOf(dashboardId++));
    dashboard.setConfiguration(generateConfiguration());
    dashboard.setDashboardSettings(new DashboardSettings());
    dashboard.setUserId("testuser");
    ArrayList<ChartSettings> charts = new ArrayList<ChartSettings>();
    // int numCharts = 1 + random.nextInt(2);
    // for(int i = 0; i < numCharts; i++){
    // charts.add(generateChartSettings(dashboard.getDashboardSettings()));
    // }
    ChartSettings c = new ChartSettings();
    c.set_id(String.valueOf(chartId++));
    // c.setChartType(ChartType.values()[random.nextInt(ChartType.values().length)]);
    c.setChartType(ChartType.COMBO);
    c.setEndPeriod(System.currentTimeMillis());
    c.setPeriod(Period.D30);
    c.setGranularity(Granularity.D1);
    c.setStartPeriod(c.getEndPeriod() - c.getPeriod().getMilliseconds());
    c.setLiveUpdates(random.nextBoolean());
    c.setMetricGroupId("1");
    selecetedMetrics.add("1");
    // TODO - fix this at some point
    // c.setSelectedMetricIds(selecetedMetrics);
    c.setTitle("Rules Invoked");
    charts.add(c);

    c = new ChartSettings();
    c.set_id(String.valueOf(chartId++));
    // c.setChartType(ChartType.values()[random.nextInt(ChartType.values().length)]);
    c.setChartType(ChartType.COMBO);
    c.setEndPeriod(System.currentTimeMillis());
    c.setPeriod(Period.Y1);
    c.setGranularity(Granularity.D30);
    c.setStartPeriod(c.getEndPeriod() - c.getPeriod().getMilliseconds());
    c.setLiveUpdates(random.nextBoolean());
    c.setMetricGroupId("1");
    selecetedMetrics = new ArrayList<String>();
    selecetedMetrics.add("2");
    // c.setSelectedMetricIds(selecetedMetrics);
    c.setTitle("Rules Failed");
    charts.add(c);

    dashboard.setCharts(charts);
    dashboards.add(dashboard);

    // dashboard = new Dashboard();
    // dashboard.setCategory(DASHBOARD_CATEGORY[random.nextInt(DASHBOARD_CATEGORY.length)]);
    // dashboard.setName("IT Metrics");
    // dashboard.setDescription("Metrics to monitor the health of a rules engines");
    // dashboard.set_id(String.valueOf((dashboardId++);
    // dashboard.setConfiguration(generateConfiguration());
    // dashboard.setDashboardSettings(new DashboardSettings());
    // dashboard.setUserId(1);
    // charts = new ArrayList<ChartSettings>();
    //
    // c = new ChartSettings();
    // c.set_id(String.valueOf((chartId++);
    // c.setChartType(ChartType.values()[random.nextInt(ChartType.values().length)]);
    // c.setEndPeriod(System.currentTimeMillis());
    // c.setPeriod(Period.D30);
    // c.setGranularity(Granularity.D1);
    // c.setStartPeriod(c.getEndPeriod() - c.getPeriod().getMilliseconds());
    // c.setLiveUpdates(random.nextBoolean());
    // c.setMetricGroupId(2);
    // c.setTitle("Rules Invoked - 30 Day");
    // charts.add(c);
    //
    // c = new ChartSettings();
    // c.set_id(String.valueOf((chartId++);
    // c.setChartType(ChartType.values()[random.nextInt(ChartType.values().length)]);
    // c.setEndPeriod(System.currentTimeMillis());
    // c.setPeriod(Period.Y1);
    // c.setGranularity(Granularity.D30);
    // c.setStartPeriod(c.getEndPeriod() - c.getPeriod().getMilliseconds());
    // c.setLiveUpdates(random.nextBoolean());
    // c.setMetricGroupId(random.nextInt(metricGroupId));
    // c.setTitle("Rules Invoked - 1 Year");
    // charts.add(c);
    //
    // dashboard.setCharts(charts);
    // dashboards.add(dashboard);

    return dashboards;
  }

  public static Dashboard generateFullDashboard() {
    Dashboard dashboard = new Dashboard();
    dashboard.setCategory(DASHBOARD_CATEGORY[random.nextInt(DASHBOARD_CATEGORY.length)]);
    dashboard.setName(generatateRandomParagraph(random.nextInt(3) + 1));
    dashboard.setDescription(generatateRandomParagraph(12));
    dashboard.set_id(String.valueOf(dashboardId++));
    dashboard.setConfiguration(generateConfiguration());
    dashboard.setDashboardSettings(generateDashboardSettings());
    dashboard.setUserId(String.valueOf(random.nextInt(userId)));
    ArrayList<ChartSettings> charts = new ArrayList<ChartSettings>();
    int numCharts = 1 + random.nextInt(2);
    for (int i = 0; i < numCharts; i++) {
      charts.add(generateChartSettings(dashboard.getDashboardSettings()));
    }
    dashboard.setCharts(charts);
    return dashboard;
  }

  public static Dashboard generateDashboardInfo() {
    Dashboard dashboard = new Dashboard();
    dashboard.setCategory(DASHBOARD_CATEGORY[random.nextInt(DASHBOARD_CATEGORY.length)]);
    dashboard.setName(generateRandomWord());
    dashboard.setDescription(generatateRandomParagraph(12));
    dashboard.set_id(String.valueOf(dashboardId++));
    dashboard.setConfiguration(generateConfiguration());
    dashboard.setDashboardSettings(generateDashboardSettings());
    return dashboard;
  }

  private static class PgWrapper {
    public Period period;
    public Granularity granularity;

    public PgWrapper(Period p, Granularity g) {
      this.period = p;
      this.granularity = g;
    }
  }

  private static PgWrapper generateValidGranularityPeriod() {
    Period p = Period.values()[random.nextInt(Period.values().length)];
    Granularity g = Granularity.values()[random.nextInt(Granularity.values().length)];

    boolean isValid = (p.getMilliseconds() > g.getMilliseconds())
        && (p.getMilliseconds() / g.getMilliseconds() < 200);

    if (isValid) {
      return new PgWrapper(p, g);
    } else {
      return generateValidGranularityPeriod();
    }
  }

  private static DashboardSettings generateDashboardSettings() {
    DashboardSettings ds = new DashboardSettings();

    Period p;
    long millis = 0;

    PgWrapper w = generateValidGranularityPeriod();
    if (random.nextInt(2) == 1) {
      ds.setGranularity(w.granularity);
    }
    if (random.nextInt(2) == 1) {
      // if(ds.getGranularity() != null){
      // do{
      // p = Period.values()[random.nextInt(Period.values().length)];
      // millis = p.getMilliseconds();
      // }while(millis <= ds.getGranularity().getMilliseconds());
      // ds.setPeriod(p);
      // }
      // else{
      // ds.setPeriod(Period.values()[random.nextInt(Period.values().length)]);
      // }
      ds.setPeriod(w.period);
    }
    ds.setEndPeriod(System.currentTimeMillis());
    ds.setEndDate(new Date(ds.getEndPeriod()));
    ds.setAmPm(random.nextInt(2) == 1 ? "AM" : "PM");
    ds.setHours(String.valueOf(random.nextInt(12) + 1));
    ds.setMinutes("00");
    // ds.setStartPeriod(System.currentTimeMillis() - (1000 * 60 * 60 * 24 *
    // 365));
    if (ds.getPeriod() != null)
      ds.setStartPeriod(ds.getEndPeriod() - ds.getPeriod().getMilliseconds());
    return ds;
  }

  private static Configuration generateConfiguration() {
    Configuration c = new Configuration();
    c.setTodoReplace("Figure this out");
    return c;
  }

  private static ChartSettings generateChartSettings(DashboardSettings ds) {
    ChartSettings c = new ChartSettings();
    c.set_id(String.valueOf(chartId++));
    // c.setChartType(ChartType.values()[random.nextInt(ChartType.values().length)]);
    c.setChartType(ChartType.COMBO);
    c.setEndPeriod(System.currentTimeMillis());
    long startPeriod;
    // c.setStartPeriod(System.currentTimeMillis() - (1000 * 60 * 60 * 24 *
    // (random.nextInt(365) + 1)));
    long millis = 0;
    Period p;
    PgWrapper w = generateValidGranularityPeriod();
    if (ds.getGranularity() == null) {
      c.setGranularity(w.granularity);
    } else {
      c.setGranularity(ds.getGranularity());
    }

    if (ds.getPeriod() == null) {
      c.setPeriod(w.period);
    } else {
      c.setPeriod(ds.getPeriod());
    }

    c.setStartPeriod(c.getEndPeriod() - c.getPeriod().getMilliseconds());
    c.setLiveUpdates(random.nextBoolean());
    c.setMetricGroupId(String.valueOf(random.nextInt(metricGroupId)));
    c.setTitle(generatateRandomParagraph(random.nextInt(3) + 1));
    return c;
  }
}
