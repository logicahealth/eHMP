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
package com.cognitivemedicine.metricsdashboard.server;

import java.util.List;
import java.util.logging.Logger;

import com.cognitivemedicine.metricsdashboard.server.tempdatasource.MetricsServiceController;
import com.cognitivemedicine.metricsdashboard.shared.service.MetricsDashboardService;
import com.cognitivemedicine.metricsservice.client.DateUtils;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.RdkTimeoutException;
import com.cognitivemedicine.metricsservice.model.Role;
import com.cognitivemedicine.metricsservice.model.UserRoles;
import com.cognitivemedicine.metricsservice.model.authentication.AuthRequest;
import com.cognitivemedicine.metricsservice.model.authentication.AuthResponse;
import com.cognitivemedicine.metricsservice.model.authentication.Site;
import com.google.gwt.user.server.rpc.RemoteServiceServlet;

/**
 * A temporary datasource for generating dashboard data
 * 
 * @author sschechter
 * 
 */
public class MetricsDashboardServiceImpl2 extends RemoteServiceServlet implements
    MetricsDashboardService {

  private static final Logger log = Logger.getLogger(MetricsDashboardServiceImpl2.class.getName());
  private MetricsServiceController controller;

  public MetricsDashboardServiceImpl2() {
    controller = MetricsServiceController.getInstance();
  }

  @Override
  public AuthResponse authenticate(AuthRequest request) {
    return new AuthResponse();
  }

  @Override
  public AuthResponse reauthenticate() throws RdkTimeoutException {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<Metric> getMetricDefinitions() {
    return controller.getMetricDefinitions().getData();
  }

  @Override
  public List<Dashboard> getDashboards() {
    return controller.getAllDashboardsInfo().getData();
  }

  @Override
  public List<MetricGroup> getMetricGroups() {
    return controller.getMetricGroups().getData();
  }

  @Override
  public Dashboard getDashboard(String dashboardId) {
    return controller.getDashboard(dashboardId).getData();
  }

  @Override
  public Dashboard createDashboard(Dashboard dashboard) {
    return controller.createDashboard(dashboard);
  }

  @Override
  public MetricGroup createMetricGroup(MetricGroup metricGroup) {
    return controller.createMetricGroup(metricGroup);
  }

  @Override
  public String deleteDashboard(String dashboardId) {
    return controller.deleteDashboard(dashboardId);
  }

  @Override
  public String deleteMetricGroup(String metricGroupId) {
    return controller.deleteMetricGroup(metricGroupId);
  }

  @Override
  public List<Datapoint> getMetrics(MetaDefinition metaDefinition, long startPeriod,
      long endPeriod, Granularity granularity) {
    return controller.getMetrics(metaDefinition, startPeriod, endPeriod, granularity).getData();
  }

  @Override
  public List<Role> getRoles() {
    return controller.getRoleList().getData();
  }

  @Override
  public List<UserRoles> getUserRoles() {
    return controller.getUserRoleList().getData();
  }

  @Override
  public String updateDashboard(Dashboard dashboard) {
    return controller.updateDashboard(dashboard);
  }

  @Override
  public String updateMetricGroup(MetricGroup metricGroupId) {
    return controller.updateMetricGroup(metricGroupId);
  }

  @Override
  public List<Dashboard> getDashboards(String userId) {
    return controller.getUserDashboards(userId).getData();
  }

  @Override
  public long roundDate(long datetime, Granularity granularity) {
    return DateUtils.roundDate(datetime, granularity);
  }

  @Override
  public List<Site> getSiteList() {
    // TODO - create mock list if needed?
    return null;
  }

  @Override
  public AuthResponse logOut() throws RdkTimeoutException {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getRdkCookie() {
    // TODO Auto-generated method stub
    return null;
  }
}
