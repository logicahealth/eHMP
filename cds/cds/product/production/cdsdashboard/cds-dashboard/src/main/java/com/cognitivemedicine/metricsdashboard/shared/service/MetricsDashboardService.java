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
package com.cognitivemedicine.metricsdashboard.shared.service;

import java.util.List;

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
import com.google.gwt.user.client.rpc.RemoteService;
import com.google.gwt.user.client.rpc.RemoteServiceRelativePath;

/**
 * @author sschechter
 *
 */
@RemoteServiceRelativePath("metricsDashboardService")
public interface MetricsDashboardService extends RemoteService {

  public AuthResponse authenticate(AuthRequest request) throws RdkTimeoutException;

  public List<Site> getSiteList() throws RdkTimeoutException;

  public List<Metric> getMetricDefinitions() throws RdkTimeoutException;

  public List<Dashboard> getDashboards() throws RdkTimeoutException;

  public List<MetricGroup> getMetricGroups() throws RdkTimeoutException;

  public Dashboard getDashboard(String dashboardId) throws RdkTimeoutException;

  public Dashboard createDashboard(Dashboard dashboard) throws RdkTimeoutException;

  public MetricGroup createMetricGroup(MetricGroup metricGroup) throws RdkTimeoutException;

  public String deleteDashboard(String dashboardId) throws RdkTimeoutException;

  public String deleteMetricGroup(String metricId) throws RdkTimeoutException;

  public List<Datapoint> getMetrics(MetaDefinition metaDefinition, long startPeriod,
      long endPeriod, Granularity granularity) throws RdkTimeoutException;

  public List<Role> getRoles() throws RdkTimeoutException;

  public List<UserRoles> getUserRoles() throws RdkTimeoutException;

  public String updateDashboard(Dashboard dashboard) throws RdkTimeoutException;

  public String updateMetricGroup(MetricGroup metricGroupId) throws RdkTimeoutException;

  public List<Dashboard> getDashboards(String userId) throws RdkTimeoutException;

  public long roundDate(long datetime, Granularity granularity) throws RdkTimeoutException;

  public AuthResponse reauthenticate() throws RdkTimeoutException;

  public AuthResponse logOut() throws RdkTimeoutException;

  public String getRdkCookie();
}
