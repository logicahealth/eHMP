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
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitivemedicine.metricsdashboard.shared.MetricsServiceProperties;
import com.cognitivemedicine.metricsdashboard.shared.service.MetricsDashboardService;
import com.cognitivemedicine.metricsservice.client.DateUtils;
import com.cognitivemedicine.metricsservice.client.MetricsServiceClient;
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
 * A service class which implements the MetricsServiceClient API. The MetricsServiceClient API makes
 * REST calls to the Metrics Retrieval Service, while serializing JSON requests and deserializing
 * JSON responses
 * 
 * @author sschechter
 * 
 */
public class MetricsDashboardServiceImpl extends RemoteServiceServlet implements
    MetricsDashboardService {

  private static final Logger log = Logger.getLogger(MetricsDashboardServiceImpl.class.getName());
  // private MetricsServiceProperties properties;
  private String metricsServiceUrl;

  private MetricsServiceClient metricsService;

  MetricsServiceProperties properties;

  public MetricsDashboardServiceImpl() {
    try {
      ApplicationContext context = new ClassPathXmlApplicationContext("cdsdashboard-context.xml");
      properties = (MetricsServiceProperties) context.getBean("metricsServiceProperties");
      metricsService = new MetricsServiceClient(properties.getRdkUrl(),
          properties.getMetricsServicePath());
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error: could not load connection properties.");
    }
  }

  @Override
  public AuthResponse authenticate(AuthRequest request) throws RdkTimeoutException {
    return metricsService.authenticate(request);
  }

  @Override
  public AuthResponse reauthenticate() throws RdkTimeoutException {
    return metricsService.reauthenticate();
  }

  @Override
  public AuthResponse logOut() throws RdkTimeoutException {
    return metricsService.logOut();
  }

  @Override
  public List<Site> getSiteList() throws RdkTimeoutException{
    return metricsService.getSiteList();
  }

  @Override
  public List<Metric> getMetricDefinitions() throws RdkTimeoutException {
    return metricsService.getMetricDefinitions();
  }

  @Override
  public List<Dashboard> getDashboards() throws RdkTimeoutException {
    return metricsService.getDashboards("testuser");
    // return metricsService.getDashboards();
  }

  @Override
  public List<MetricGroup> getMetricGroups() throws RdkTimeoutException {
    return metricsService.getMetricGroups();
  }

  @Override
  public Dashboard getDashboard(String dashboardId) throws RdkTimeoutException {
    return metricsService.getDashboard(dashboardId);
  }

  @Override
  public Dashboard createDashboard(Dashboard dashboard) throws RdkTimeoutException {
    return metricsService.createDashboard(dashboard);
  }

  @Override
  public MetricGroup createMetricGroup(MetricGroup metricGroup) throws RdkTimeoutException {
    return metricsService.createMetricGroup(metricGroup);
  }

  @Override
  public String deleteDashboard(String dashboardId) throws RdkTimeoutException {
    return metricsService.deleteDashboard(dashboardId);
  }

  @Override
  public String deleteMetricGroup(String metricGroupId) throws RdkTimeoutException {
    return metricsService.deleteMetricGroup(metricGroupId);
  }

  @Override
  public List<Datapoint> getMetrics(MetaDefinition metaDefinition, long startPeriod,
      long endPeriod, Granularity granularity) throws RdkTimeoutException {
    return metricsService.getMetrics(metaDefinition, startPeriod, endPeriod, granularity);
  }

  @Override
  public List<Role> getRoles() throws RdkTimeoutException {
    return metricsService.getRoles();
  }

  @Override
  public List<UserRoles> getUserRoles() throws RdkTimeoutException {
    return metricsService.getUserRoles();
  }

  @Override
  public String updateDashboard(Dashboard dashboard) throws RdkTimeoutException {
    return metricsService.updateDashboard(dashboard);
  }

  @Override
  public String updateMetricGroup(MetricGroup metricGroupId) throws RdkTimeoutException {
    return metricsService.updateMetricGroup(metricGroupId);
  }

  @Override
  public List<Dashboard> getDashboards(String userId) throws RdkTimeoutException {
    return metricsService.getDashboards(userId);
  }

  @Override
  public long roundDate(long datetime, Granularity granularity) {
    return DateUtils.roundDate(datetime, granularity);
  }

  @Override
  public String getRdkCookie() {
    return metricsService.getRdkCookie();
  }
}
