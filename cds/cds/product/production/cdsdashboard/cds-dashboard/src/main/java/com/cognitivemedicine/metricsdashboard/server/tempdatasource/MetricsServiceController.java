/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
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

import java.util.ArrayList;
import java.util.List;

import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.MetricsServiceResponse;
import com.cognitivemedicine.metricsservice.model.Role;
import com.cognitivemedicine.metricsservice.model.UserRoles;

/**
 * This is a test resource for generating sample data. Useful for development and testing locally
 * 
 * @author sschechter
 * 
 */
public class MetricsServiceController {

  private static MetricsServiceController instance;
  private ArrayList<Role> roleList;
  private ArrayList<UserRoles> userList;
  private ArrayList<Dashboard> dashboardList;
  private ArrayList<Metric> metricList;
  private ArrayList<MetricGroup> metricGroupList;

  // private ArrayList<Origin> originList;

  private void generateTestData() {

    // ROLES
    Role admin = new Role();
    admin.set_id("-1");
    admin.setName("Admin");
    admin.setDescription("Administrator can do everything");
    ArrayList<Role> roles = new ArrayList<Role>();
    roleList = new ArrayList<Role>();
    for (int i = 0; i < 2; i++) {
      roles.add(DataGenerator.generateRole());
    }
    roleList.add(admin);
    roleList.addAll(roles);

    // USER ROLES
    ArrayList<UserRoles> users = new ArrayList<UserRoles>();
    for (int i = 0; i < 5; i++) {
      users.add(DataGenerator.generateUserRole());
    }
    userList = users;

    // METRIC DEFINITIONS
    // ArrayList<Metric> metrics = new ArrayList<Metric>();
    // for(int i = 0; i < 5; i++){
    // metrics.add(DataGenerator.generateMetric());
    // }
    ArrayList<Metric> metrics = DataGenerator.generateDemoMetrics();

    metricList = metrics;
    // METRIC GROUPS

    ArrayList<MetricGroup> groups = new ArrayList<MetricGroup>();
    groups.add(DataGenerator.generateAllGroup(metricList));
    // for(int i = 0; i < 3; i++){
    // groups.add(DataGenerator.generateMetricGroup(metricList));
    // }

    metricGroupList = groups;

    ArrayList<Dashboard> dashboards = new ArrayList<Dashboard>();
    for (int i = 0; i < 10; i++) {
      dashboards.add(DataGenerator.generateFullDashboard());
    }
    // dashboardList = DataGenerator.generateDemoDashboard();
    dashboardList = dashboards;

    // originList = new ArrayList<>();
    // Origin s1 = new Origin();
    // // s1.set_id("0");
    // s1.setName("System A");
    // s1.setDescription("System A");
    // originList.add(s1);
    //
    // Origin s2 = new Origin();
    // // s2.set_id("1");
    // s2.setName("System B");
    // s2.setDescription("System B");
    // originList.add(s2);
  }

  private MetricsServiceController() {
    generateTestData();
  }

  public synchronized static MetricsServiceController getInstance() {
    if (instance == null) {
      instance = new MetricsServiceController();
    }
    return instance;
  }

  public MetricsServiceResponse<List<Metric>> getMetricDefinitions() {
    MetricsServiceResponse<List<Metric>> response = new MetricsServiceResponse<List<Metric>>();
    response.setData(metricList);
    return response;
  }

  public MetricsServiceResponse<List<MetricGroup>> getMetricGroups() {
    MetricsServiceResponse<List<MetricGroup>> response = new MetricsServiceResponse<List<MetricGroup>>();
    response.setData(metricGroupList);
    return response;
  }

  public MetricsServiceResponse<List<Datapoint>> getMetrics(MetaDefinition metaDefinition,
      long startPeriod, long endPeriod, Granularity granularity) {
    MetricsServiceResponse<List<Datapoint>> response = new MetricsServiceResponse<List<Datapoint>>();
    Metric metric = null;
    for (Metric m : metricList) {
      if (m.get_id().equals(metaDefinition.getDefinitionId())) {
        metric = m;
      }
    }
    response.setData(DataGenerator.generateDatapoints(metric, startPeriod, endPeriod,
        granularity.getMilliseconds()));
    return response;
  }

  public MetricsServiceResponse<List<Role>> getRoleList() {
    MetricsServiceResponse<List<Role>> response = new MetricsServiceResponse<List<Role>>();
    response.setData(roleList);
    return response;
  }

  // public MetricsServiceResponse<List<Origin>> getOriginList() {
  // MetricsServiceResponse<List<Origin>> response = new MetricsServiceResponse<List<Origin>>();
  // response.setData(originList);
  // return response;
  // }

  public MetricsServiceResponse<List<UserRoles>> getUserRoleList() {
    MetricsServiceResponse<List<UserRoles>> response = new MetricsServiceResponse<List<UserRoles>>();
    response.setData(userList);
    return response;
  }

  public MetricsServiceResponse<List<Dashboard>> getAllDashboardsInfo() {
    MetricsServiceResponse<List<Dashboard>> response = new MetricsServiceResponse<List<Dashboard>>();
    response.setData(dashboardList);
    return response;
  }

  public MetricsServiceResponse<List<Dashboard>> getUserDashboards(String userId) {
    MetricsServiceResponse<List<Dashboard>> response = new MetricsServiceResponse<List<Dashboard>>();
    List<Dashboard> userDashboards = new ArrayList<Dashboard>();
    Dashboard d2;
    for (Dashboard d : dashboardList) {
      if (userId == d.getUserId()) {
        d2 = new Dashboard();
        d2.setUserId(userId);
        d2.setName(d.getName());
        d2.setDescription(d.getDescription());
        d2.set_id(d.get_id());
        d2.setCategory(d.getCategory());
        userDashboards.add(d2);
      }
    }
    response.setData(userDashboards);
    return response;
  }

  public MetricsServiceResponse<Dashboard> getDashboard(String dashboardId) {
    MetricsServiceResponse<Dashboard> response = new MetricsServiceResponse<Dashboard>();
    Dashboard dashboard = null;
    for (Dashboard d : dashboardList) {
      if (d.get_id().equals(dashboardId)) {
        dashboard = d;
        break;
      }
    }

    response.setData(dashboard);
    return response;
  }

  public Dashboard createDashboard(Dashboard dashboard) {
    String newId = String.valueOf(DataGenerator.dashboardId++);
    dashboard.set_id(newId);
    dashboardList.add(dashboard);
    return dashboard;
  }

  public String updateDashboard(Dashboard dashboard) {
    Dashboard toUpdate = null;
    int i = 0;
    for (Dashboard d : dashboardList) {
      if (d.get_id().equals(dashboard.get_id())) {
        toUpdate = d;
        dashboardList.set(i, dashboard);
      }
      i++;
    }
    if (toUpdate == null) {
      return null;
    }
    // dashboardList.
    // dashboardList.set(toUpdate.get_id(), dashboard);
    return toUpdate.get_id();
  }

  public String deleteDashboard(String dashboardId) {
    Dashboard toRemove = null;
    for (Dashboard d : dashboardList) {
      if (d.get_id().equals(dashboardId)) {
        toRemove = d;
      }
    }
    if (toRemove == null) {
      return null; // Dashboard not found, could not be deleted
    }
    dashboardList.remove(toRemove);
    return toRemove.get_id();
  }

  public MetricGroup createMetricGroup(MetricGroup metricGroup) {
    String newId = String.valueOf(DataGenerator.metricGroupId++);
    metricGroup.set_id(newId);
    metricGroupList.add(metricGroup);
    return metricGroup;
  }

  public String updateMetricGroup(MetricGroup metricGroup) {
    MetricGroup toUpdate = null;
    int i = 0;
    for (MetricGroup d : metricGroupList) {
      if (d.get_id().equals(metricGroup.get_id())) {
        toUpdate = d;
        metricGroupList.set(i, metricGroup);
      }
      i++;
    }
    if (toUpdate == null) {
      return null;
    }
    // metricGroupList.set(toUpdate.get_id(), metricGroup);
    return toUpdate.get_id();
  }

  public String deleteMetricGroup(String metricGroupId) {
    MetricGroup toRemove = null;
    for (MetricGroup g : metricGroupList) {
      if (g.get_id().equals(metricGroupId)) {
        toRemove = g;
      }
    }
    if (toRemove == null) {
      return null; // Dashboard not found, could not be deleted
    }
    metricGroupList.remove(toRemove);
    return toRemove.get_id();
  }
}
