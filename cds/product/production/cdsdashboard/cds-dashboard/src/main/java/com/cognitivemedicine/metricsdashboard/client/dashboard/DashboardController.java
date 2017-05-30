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
package com.cognitivemedicine.metricsdashboard.client.dashboard;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Logger;

import com.cognitivemedicine.metricsdashboard.client.Md_sandbox;
import com.cognitivemedicine.metricsdashboard.client.charts.ChartWidgetController;
import com.cognitivemedicine.metricsdashboard.client.charts.GrainMatrix;
import com.cognitivemedicine.metricsdashboard.client.util.DefinitionFactory;
import com.cognitivemedicine.metricsdashboard.client.widgets.Alerts;
import com.cognitivemedicine.metricsdashboard.shared.service.MetricsDashboardService;
import com.cognitivemedicine.metricsdashboard.shared.service.MetricsDashboardServiceAsync;
import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.RdkTimeoutException;
import com.cognitivemedicine.metricsservice.model.Role;
import com.cognitivemedicine.metricsservice.model.UserRoles;
import com.cognitivemedicine.metricsservice.model.authentication.AuthRequest;
import com.cognitivemedicine.metricsservice.model.authentication.AuthResponse;
import com.cognitivemedicine.metricsservice.model.authentication.Site;
import com.google.gwt.core.shared.GWT;
import com.google.gwt.user.client.rpc.AsyncCallback;

/**
 * A dashboard controller that handles all dashboard level service calls and routing of results
 * 
 * @author sschechter
 * 
 */
public class DashboardController {

  private Md_sandbox application;
  private DashboardMainPanel dashboardPanel;
  private ChartWidgetController widgetController;

  private ArrayList<MetaDefinition> metaDefinitions;
  private HashMap<String, MetaDefinition> metaDefinitionsMap = new HashMap<String, MetaDefinition>();
  private HashMap<String, ArrayList<MetaDefinition>> metaGroupMap = new HashMap<String, ArrayList<MetaDefinition>>();
  private HashMap<String, Dashboard> dashboards = new HashMap<String, Dashboard>();
  private HashMap<String, Metric> availableMetrics = new HashMap<String, Metric>();
  private HashMap<String, MetricGroup> metricGroups = new HashMap<String, MetricGroup>();
  private HashMap<String, Role> roles = new HashMap<String, Role>();
  private HashMap<String, UserRoles> userRoles = new HashMap<String, UserRoles>();
  // private HashMap<String, Origin> origins = new HashMap<String, Origin>();

  private static final Logger logger = Logger.getLogger(DashboardController.class.getName());
  private static final MetricsDashboardServiceAsync dashboardService = GWT
      .create(MetricsDashboardService.class);

  private boolean finishedLoading = false;

  public DashboardController(Md_sandbox application) {
    this.application = application;
    this.widgetController = new ChartWidgetController();
  }

  public void loadCdsDashboard(DashboardMainPanel dashboardPanel) {
    // Pre-fetch these lists on the loading of the dashboard
    this.dashboardPanel = dashboardPanel;
    this.dashboardPanel.setController(this);
    fetchDashboards(null);
    fetchMetricDefinitions();
    fetchMetricGroups();
    // fetchRoles();
    // Admin function?
    // fetchUserRoles();
  }

  /**
   * Once the necessary items have finished loading, unlock remaining dashboard functions
   */
  private void didPrefetchedItemsCompletelyLoad() {
    if (finishedLoading == false && availableMetrics != null && availableMetrics.size() > 0
        && metricGroups != null && dashboards != null) {
      // && roles != null
      // && origins != null) {
      // && userRoles != null){
      dashboardPanel.finishedLoadingPrefetechedItems();
      metaGroupMap = new HashMap<String, ArrayList<MetaDefinition>>();
      metaDefinitions = DefinitionFactory.buildMetaDefinitions(availableMetrics);
      ArrayList<MetaDefinition> group;
      for (MetaDefinition d : metaDefinitions) {
        metaDefinitionsMap.put(d.toString(), d);
        group = metaGroupMap.get(d.getName());
        if (group == null) {
          group = new ArrayList<MetaDefinition>();
        }
        group.add(d);
        metaGroupMap.put(d.getName(), group);
      }
      finishedLoading = true;
    }
  }

  /**
   * Authenticates the user from the given credentials in the request
   * 
   * @param request
   */
  public void authenticate(AuthRequest request) {
    dashboardService.authenticate(request, new AsyncCallback<AuthResponse>() {

      @Override
      public void onSuccess(final AuthResponse result) {
        dashboardService.getRdkCookie(new AsyncCallback<String>() {

          @Override
          public void onSuccess(String rdkCookie) {
            application.loginSuccess(result, rdkCookie);
          }

          @Override
          public void onFailure(Throwable caught) {
            logger.severe(caught.getMessage());
            application
                .loginFailed("Could not log in.  Please check your credentials and try again");
          }
        });
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        application.loginFailed("Could not log in.  Please check your credentials and try again");
      }
    });
  }

  /**
   * Authenticates the user from the given credentials in the request
   * 
   * @param request
   */
  public void reauthenticate() {
    dashboardService.reauthenticate(new AsyncCallback<AuthResponse>() {

      @Override
      public void onSuccess(final AuthResponse result) {
        dashboardService.getRdkCookie(new AsyncCallback<String>() {
          @Override
          public void onSuccess(String rdkCookie) {
            application.loginSuccess(result, rdkCookie);
          }

          @Override
          public void onFailure(Throwable caught) {
            logger.severe(caught.getMessage());
            application.loginFailed(null);
            application.promptCredentials();
          }
        });
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        application.loginFailed(null);
        application.promptCredentials();
      }
    });
  }

  /**
   * Logs out the current user
   * 
   * @param request
   */
  public void logOut() {
    dashboardService.logOut(new AsyncCallback<AuthResponse>() {

      @Override
      public void onSuccess(AuthResponse result) {
        application.promptCredentials();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        application.promptCredentials();
      }
    });
  }

  /**
   * Gets the site information for login requests
   */
  public void fetchSites() {
    dashboardService.getSiteList(new AsyncCallback<List<Site>>() {
      @Override
      public void onSuccess(List<Site> result) {
        application.siteListLoaded(result);
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        application.siteListLoadFailed();
      }
    });
  }

  /**
   * Gets the system Roles
   */
  public void fetchRoles() {
    dashboardService.getRoles(new AsyncCallback<List<Role>>() {
      @Override
      public void onSuccess(List<Role> result) {
        roles = new HashMap<String, Role>();
        for (Role r : result) {
          roles.put(r.get_id(), r);
        }

        dashboardPanel.finishLoadingRoles(result);
        didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Gets a User and the roles they belong to
   */
  public void fetchUserRoles() {
    dashboardService.getUserRoles(new AsyncCallback<List<UserRoles>>() {
      @Override
      public void onSuccess(List<UserRoles> result) {
        // userRoles = result;
        userRoles = new HashMap<String, UserRoles>();
        for (UserRoles u : result) {
          userRoles.put(String.valueOf(u.getUserId()), u);
        }
        // didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * @param selectedDashboardId
   *          - leave as null or set to select a dashboard by Id after the list is returned (create
   *          new, save as)
   */
  public void fetchDashboards(final String selectedDashboardId) {
    dashboardService.getDashboards(new AsyncCallback<List<Dashboard>>() {
      @Override
      public void onSuccess(List<Dashboard> result) {
        // dashboards = result;
        dashboards = new HashMap<String, Dashboard>();
        for (Dashboard d : result) {
          dashboards.put(d.get_id(), d);
        }
        dashboardPanel.finishLoadingDashboards(result, selectedDashboardId);
        didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * @param selectedDashboardId
   *          - leave as null or set to select a dashboard by Id after the list is returned (create
   *          new, save as)
   */
  public void fetchDashboards(String userId, final String selectedDashboardId) {
    dashboardService.getDashboards(userId, new AsyncCallback<List<Dashboard>>() {
      @Override
      public void onSuccess(List<Dashboard> result) {
        // dashboards = result;
        dashboards = new HashMap<String, Dashboard>();
        for (Dashboard d : result) {
          dashboards.put(d.get_id(), d);
        }
        dashboardPanel.finishLoadingDashboards(result, selectedDashboardId);
        didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Get the Metric Groups
   */
  public void fetchMetricGroups() {
    dashboardService.getMetricGroups(new AsyncCallback<List<MetricGroup>>() {
      @Override
      public void onSuccess(List<MetricGroup> result) {
        // metricGroups = result;
        metricGroups = new HashMap<String, MetricGroup>();
        for (MetricGroup g : result) {
          metricGroups.put(g.get_id(), g);
        }
        dashboardPanel.finishLoadingMetricGroups(result);
        didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Gets a list of metrics, which define how its data should be displayed
   */
  public void fetchMetricDefinitions() {
    dashboardService.getMetricDefinitions(new AsyncCallback<List<Metric>>() {
      @Override
      public void onSuccess(List<Metric> result) {
        // availableMetrics = result;
        availableMetrics = new HashMap<String, Metric>();
        for (Metric m : result) {
          availableMetrics.put(m.get_id(), m);
        }
        dashboardPanel.finishLoadingMetricDefinitions(result);
        didPrefetchedItemsCompletelyLoad();
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        } else {
          dashboardPanel.finishLoadingMetricDefinitions(null);
        }

      }
    });
  }

  /**
   * Get a full dashboard implementation
   * 
   * @param dashboardId
   */
  public void getDashboard(String dashboardId) {
    dashboardService.getDashboard(dashboardId, new AsyncCallback<Dashboard>() {
      @Override
      public void onSuccess(Dashboard dashboard) {
        dashboardPanel.finishLoadingDashboard(dashboard);
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Makes a service call requesting for metrics based on the supplied configuration
   * 
   * @param grainMatrix
   *          - The results matrix which contains all the parameters needed
   * @param metaDefinition
   *          - contains metric request parameters
   */
  public void getMetrics(final MetaDefinition metaDefinition, final GrainMatrix grainMatrix) {
    ChartSettings settings = grainMatrix.getChartSettings();
    dashboardService.getMetrics(metaDefinition, settings.getStartPeriod(), settings.getEndPeriod(),
        settings.getGranularity(), new AsyncCallback<List<Datapoint>>() {
          @Override
          public void onSuccess(List<Datapoint> data) {
            grainMatrix.metricsReceived(metaDefinition, data);
          }

          @Override
          public void onFailure(Throwable caught) {
            logger.severe(caught.getMessage());
            if (caught instanceof RdkTimeoutException) {
              application.promptCredentials();
            } else {
              Alerts.notify(dashboardPanel, "Failure", caught.getMessage());
            }
          }
        });
  }

  /**
   * Create a new dashboard
   * 
   * @param dashboard
   */
  public void createDashboard(Dashboard dashboard) {
    dashboardService.createDashboard(dashboard, new AsyncCallback<Dashboard>() {
      @Override
      public void onSuccess(Dashboard result) {
        Alerts.notify(dashboardPanel, "Success", "Dashboard Successfully Created.");
        fetchDashboards(null);
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        } else {
          Alerts.notify(dashboardPanel, "Failure", caught.getMessage());
        }
      }
    });
  }

  /**
   * Updates an existing dashboard
   * 
   * @param dashboard
   */
  public void saveDashboard(final Dashboard dashboard) {
    dashboardService.updateDashboard(dashboard, new AsyncCallback<String>() {
      @Override
      public void onSuccess(String result) {
        dashboardPanel.finishDashboardUpdate(dashboard);
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Update an existing dashboard
   * 
   * @param dashboard
   */
  public void updateDashboard(final Dashboard dashboard) {
    dashboardService.updateDashboard(dashboard, new AsyncCallback<String>() {
      @Override
      public void onSuccess(String result) {
        logger.info("Dashboard " + dashboard.getName() + " successfully updated");
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Delete an existing dashboard
   * 
   * @param dashboardId
   */
  public void deleteDashboard(final String dashboardId) {
    dashboardService.deleteDashboard(dashboardId, new AsyncCallback<String>() {
      @Override
      public void onSuccess(String result) {
        dashboardPanel.finishDeletingDashboard(dashboardId);
        fetchDashboards(null); // Reload the dashboard list
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Create a new Metric Group
   * 
   * @param metricGroup
   */
  public void createMetricGroup(MetricGroup metricGroup) {
    dashboardService.createMetricGroup(metricGroup, new AsyncCallback<MetricGroup>() {
      @Override
      public void onSuccess(MetricGroup result) {
        // finishCreateMetricGroup
      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Update an existing metric group
   * 
   * @param metricGroup
   */
  public void updateMetricGroup(MetricGroup metricGroup) {
    dashboardService.updateMetricGroup(metricGroup, new AsyncCallback<String>() {
      @Override
      public void onSuccess(String result) {

      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Deletes a metric group
   * 
   * @param dashboardId
   */
  public void deleteMetricGroup(String dashboardId) {
    dashboardService.deleteMetricGroup(dashboardId, new AsyncCallback<String>() {
      @Override
      public void onSuccess(String result) {

      }

      @Override
      public void onFailure(Throwable caught) {
        logger.severe(caught.getMessage());
        if (caught instanceof RdkTimeoutException) {
          application.promptCredentials();
        }
      }
    });
  }

  /**
   * Gets a mapping of all dashboards
   * 
   * @return A map of dashboards keyed by id
   */
  public HashMap<String, Dashboard> getDashboards() {
    return dashboards;
  }

  /**
   * Gets a mapping of all available metrics
   * 
   * @return A map of metric definitions, keyed by name (TODO replace with id)
   */
  public HashMap<String, Metric> getAvailableMetrics() {
    return availableMetrics;
  }

  /**
   * Gets all permutations for pre-determined queries
   * 
   * @return
   */
  public ArrayList<MetaDefinition> getMetaDefinitions() {
    return metaDefinitions;
  }

  /**
   * Gets a mapping of all metric groups
   * 
   * @return A map of all metric groups, keyed by id
   */
  public HashMap<String, MetricGroup> getMetricsGroups() {
    return metricGroups;
  }

  /**
   * Gets all roles
   * 
   * @return A map of all system roles, keyed by id
   */
  public HashMap<String, Role> getRoles() {
    return roles;
  }

  // /**
  // * Gets all origins
  // *
  // * @return A map of all system origins, keyed by name (TODO replace with id)
  // */
  // public HashMap<String, Origin> getOrigins() {
  // return origins;
  // }

  /**
   * Get a full list of metrics from a group id
   * 
   * @param groupId
   * @return A list of definitions belonging to this group
   */
  public List<Metric> getMetricsInGroup(String groupId) {
    List<Metric> metrics = new ArrayList<Metric>();
    MetricGroup group = metricGroups.get(groupId);
    for (String i : group.getMetricList()) {
      metrics.add(availableMetrics.get(String.valueOf(i)));
    }
    return metrics;
  }

  public List<MetaDefinition> getMetaDefinitionsInGroup(String name) {
    List<MetaDefinition> defs = metaGroupMap.get(name);
    return defs != null ? defs : new ArrayList<MetaDefinition>();
  }

  public HashMap<String, ArrayList<MetaDefinition>> getMetaGroupMap() {
    return metaGroupMap;
  }

  public HashMap<String, MetaDefinition> getMetaDefinitionsMap() {
    return metaDefinitionsMap;
  }

  /**
   * Return the instance of the widget controller
   * 
   * @return The chart widget controller
   */
  public ChartWidgetController getWidgetController() {
    return widgetController;
  }
}
