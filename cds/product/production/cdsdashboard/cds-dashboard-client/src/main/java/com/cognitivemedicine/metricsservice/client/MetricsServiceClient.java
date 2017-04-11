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
package com.cognitivemedicine.metricsservice.client;

import java.text.DateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.GenericResult;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.MetricsServiceResponse;
import com.cognitivemedicine.metricsservice.model.RdkTimeoutException;
import com.cognitivemedicine.metricsservice.model.Role;
import com.cognitivemedicine.metricsservice.model.UserRoles;
import com.cognitivemedicine.metricsservice.model.authentication.AuthRequest;
import com.cognitivemedicine.metricsservice.model.authentication.AuthResponse;
import com.cognitivemedicine.metricsservice.model.authentication.Site;
import com.cognitivemedicine.metricsservice.model.authentication.SiteList;
import com.fasterxml.jackson.jaxrs.annotation.JacksonFeatures;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * A Rest client module that queries the Metrics Retrieval Service for metrics
 * data, and makes CRUD requests for dashboard data
 * 
 * @author sschechter
 * 
 */
public class MetricsServiceClient {

    private String rdkUrl;
    private String metricsServiceUrl;
    private WebTarget authServiceTarget;
    private WebTarget metricsServiceTarget;
    private Map<String, NewCookie> rdkCookies;
    private String jwtHeader;
    private Logger logger = Logger.getLogger(MetricsServiceClient.class.getName());
    private static final String RDK_COOKIE_ID = "ehmp.vistacore.rdk.sid";
    private Gson gson;
   

    public MetricsServiceClient(String rdkUrl, String metricsServicePath) {
        logger.setLevel(Level.INFO);

        final Client client = ClientBuilder.newBuilder().register(ObjectMapperProvider.class).register(JacksonFeatures.class).build();

        this.rdkUrl = rdkUrl;
        this.metricsServiceUrl = rdkUrl + "/" + metricsServicePath;

        authServiceTarget = client.target(rdkUrl);
        metricsServiceTarget = client.target(metricsServiceUrl);

        gson = new GsonBuilder().enableComplexMapKeySerialization().setDateFormat(DateFormat.LONG).setPrettyPrinting().setVersion(1.0).create();
    }

    /**
     * Checks the status of an HTTP Response for errors
     * 
     * @param response
     */
    private void processResponse(Response response) {
        int status = response.getStatus();

        if (status >= 400 && status < 500) {
            logger.severe("Response Error: " + response.getStatus());
            // throw new ClientErrorException(response);
        } else if (status >= 500) {
            logger.severe("Response Error: " + response.getStatus());
            // throw new NotAcceptableException(response);
        }
        logger.info("Response Status: " + response.getStatus());
    }

    /**
     * Authenticates to the RDK
     * 
     * @param dashboard
     *            the dashboard to create
     * @return newId - the id of the dashboard being created
     */
    public AuthResponse authenticate(AuthRequest authRequest) throws RdkTimeoutException {
        logger.log(Level.INFO, "POST " + rdkUrl + "/authentication");
        logger.log(Level.INFO, gson.toJson(authRequest));
        WebTarget authTarget = authServiceTarget.path("authentication");
        Response response = authTarget.request(MediaType.APPLICATION_JSON).accept(MediaType.TEXT_PLAIN).post(Entity.entity(authRequest, MediaType.APPLICATION_JSON));

        if (response.getStatus() == 400 || response.getStatus() == 401) {
            logger.log(Level.SEVERE, "Error: Not a valid ACCESS CODE/VERIFY CODE pair.  Please log in again");
            throw new RdkTimeoutException();
        } else {
            processResponse(response);
            // Store the authentication cookie (RDK_COOKIE_ID)
            rdkCookies = response.getCookies();
            jwtHeader = response.getHeaderString("X-Set-JWT");
            MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
            });
            logger.log(Level.INFO, "authenticateResponse: \n" + gson.toJson(authResponse));
            return authResponse.getData();
        }
    }

    /**
     * Reauthenticates to the RDK
     * 
     * @return AuthResponse
     * @throws RdkTimeoutException
     */
    public AuthResponse reauthenticate() throws RdkTimeoutException {
        logger.log(Level.INFO, "GET " + rdkUrl + "/authentication");
        WebTarget dashboardsTarget = authServiceTarget.path("authentication");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();

        if (response.getStatus() == 400 || response.getStatus() == 401) {
            logger.log(Level.SEVERE, "Unauthorized access.  Please log in again.  Status: " + response.getStatus());
            throw new RdkTimeoutException();
        } else {
            MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
            });
            logger.log(Level.INFO, "authenticateResponse: \n" + gson.toJson(authResponse));
            return authResponse.getData();
        }
    }

    /**
     * Logs out the user.
     * 
     * @return AuthResponse
     * @throws RdkTimeoutException
     */
    public AuthResponse logOut() throws RdkTimeoutException {
        logger.log(Level.INFO, "DELETE " + rdkUrl + "/authentication");
        WebTarget dashboardsTarget = authServiceTarget.path("authentication");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).delete();

        processResponse(response);
        MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
        });
        logger.log(Level.INFO, "authenticateResponse: \n" + gson.toJson(authResponse));
        return authResponse.getData();
    }

    public String getRdkCookie() {
        return rdkCookies.get(RDK_COOKIE_ID).getValue();
    }

    /**
     * Gets a list of login sites
     * 
     * @return List<Site> a list of system sites
     */
    public List<Site> getSiteList() throws RdkTimeoutException{
        try{
            logger.log(Level.INFO, "GET " + rdkUrl + "/authentication/list");
            WebTarget dashboardsTarget = authServiceTarget.path("authentication/list");
            Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).get();
            processResponse(response);
            MetricsServiceResponse<SiteList> sites = response.readEntity(new GenericType<MetricsServiceResponse<SiteList>>() {
            });
            logger.log(Level.INFO, "getSiteListResponse: \n" + gson.toJson(sites));
            return sites.getData().getItems();
        }
        catch(Exception e){
            logger.severe(e.getMessage());
            throw new RdkTimeoutException();
        }
    }

    /**
     * Gets a list of system Roles
     * 
     * @return List<Role> a list of system roles
     * @throws RdkTimeoutException
     */
    public List<Role> getRoles() throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/roles");
        WebTarget dashboardsTarget = metricsServiceTarget.path("roles");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<Role>> roles = response.readEntity(new GenericType<MetricsServiceResponse<List<Role>>>() {
        });
        logger.log(Level.INFO, "getRolesResponse: \n" + gson.toJson(roles));
        return roles.getData();
    }

    /**
     * Gets a list of users, and the roles they belong to
     * 
     * @return List<UserRoles> roles the user belongs to
     * @throws RdkTimeoutException
     */
    public List<UserRoles> getUserRoles() throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/userRoles");
        WebTarget dashboardsTarget = metricsServiceTarget.path("userRoles");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<UserRoles>> userRoles = response.readEntity(new GenericType<MetricsServiceResponse<List<UserRoles>>>() {
        });
        logger.log(Level.INFO, "getUserRolesResponse: \n" + gson.toJson(userRoles));
        return userRoles.getData();
    }

    /**
     * Gets a list of Metric objects which define how a metric should be
     * displayed
     * 
     * @return List<Metric> the list of definitions
     * @throws RdkTimeoutException
     */
    public List<Metric> getMetricDefinitions() throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/definitions");
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<Metric>> metrics = response.readEntity(new GenericType<MetricsServiceResponse<List<Metric>>>() {
        });
        logger.log(Level.INFO, "getMetricDefinitionsResponse: \n" + gson.toJson(metrics));
        return metrics.getData();
    }

    /**
     * Gets a list of Metric Groups, which contain associations with Metric
     * definitions
     * 
     * @return List<MetricGroup> the list of groups
     * @throws RdkTimeoutException
     */
    public List<MetricGroup> getMetricGroups() throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/groups");
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<MetricGroup>> groups = response.readEntity(new GenericType<MetricsServiceResponse<List<MetricGroup>>>() {
        });
        logger.log(Level.INFO, "getMetricGroupsResponse: \n" + gson.toJson(groups));
        return groups.getData();
    }

    /**
     * Queries for a list of Metrics. This is the core function of the entire
     * library
     * 
     * @param metricId
     *            - the id of the type of metric to be displayed
     * @param startPeriod
     *            - the beggining range of when a queried metric is captured
     * @param endPeriod
     *            - the end range of when a queried metric is captured
     * @param granularity
     *            - the length of time in which metrics are aggregated
     * @param origin
     *            - the source from where the metric originated. Leave null to
     *            query for all
     * @return List<Datapoint> the list of datapoints requested by the user
     * @throws RdkTimeoutException
     */
    public List<Datapoint> getMetrics(MetaDefinition metaDefinition, long startPeriod, long endPeriod, Granularity granularity) throws RdkTimeoutException {
        reauthenticate();
        // Add the granularity to the endPeriod to get the most recent, but
        // incomplete interval
        long granMillis = granularity != null ? granularity.getMilliseconds() : 0;

        String origin = metaDefinition.getOrigin();
        String invocationType = metaDefinition.getInvocationType();
        String gText = granMillis > 0 ? "&granularity=" + granMillis : "";
        String oText = origin != null && !origin.equalsIgnoreCase("All Origins") ? "&origin=" + origin : "";
        String iText = invocationType != null && !invocationType.equalsIgnoreCase("All Invocation Types") ? "&invocationType=" + invocationType : "";
        logger.log(Level.INFO, "Start: " + new Date(startPeriod) + " End: " + new Date(endPeriod));
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/metrics?metricId=" + metaDefinition.getDefinitionId() + "&startPeriod=" + startPeriod + "&endPeriod=" + endPeriod + gText + oText + iText);

        WebTarget metricsTarget = metricsServiceTarget.path("metrics").queryParam("metricId", metaDefinition.getDefinitionId()).queryParam("startPeriod", startPeriod)
                .queryParam("endPeriod", endPeriod);

        if (granMillis > 0) {
            metricsTarget = metricsTarget.queryParam("granularity", granMillis);
        }
        if (!oText.isEmpty()) {
            metricsTarget = metricsTarget.queryParam("origin", origin);
        }
        if (!iText.isEmpty()) {
            metricsTarget = metricsTarget.queryParam("invocationType", invocationType);
        }

        Invocation.Builder b = metricsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader);

        Response response = b.get();
        processResponse(response);
        MetricsServiceResponse<List<Datapoint>> metrics = response.readEntity(new GenericType<MetricsServiceResponse<List<Datapoint>>>() {
        });
        logger.log(Level.INFO, "getMetricsResponse: \n" + gson.toJson(metrics));
        return metrics.getData();
    }

    /**
     * Gets a list of dashboards that were saved by the user. This list will
     * only contain dashboard metadata, and will not store chart details
     * 
     * @return List<Dashboard> The list of dashboards
     * @throws RdkTimeoutException
     */
    public List<Dashboard> getDashboards() throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/dashboards");
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboards");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.log(Level.INFO, "getDashboardsResponse: \n" + gson.toJson(dashboards));
        return dashboards.getData();
    }

    /**
     * Gets a list of dashboards that were saved by the user. This list will
     * only contain dashboard metadata, and will not store chart details
     * 
     * @return List<Dashboard> the list of dashboards
     * @throws RdkTimeoutException
     */
    public List<Dashboard> getDashboards(String userId) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/dashboards/" + userId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboards/" + userId);
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.log(Level.INFO, "getDashboardsResponse: \n" + gson.toJson(dashboards));
        return dashboards.getData();
    }

    /**
     * Gets a full dashboard implementation, with chart details
     * 
     * @param dashboardId
     *            the id of the dashboard being requested
     * @return Dashboard a complete dashboard implementation, including charts
     * @throws RdkTimeoutException
     */
    public Dashboard getDashboard(String dashboardId) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "GET " + metricsServiceUrl + "/dashboard/" + dashboardId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboardId);
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        MetricsServiceResponse<Dashboard> dashboard = response.readEntity(new GenericType<MetricsServiceResponse<Dashboard>>() {
        });
        logger.log(Level.INFO, "getDashboardResponse: \n" + gson.toJson(dashboard));
        return dashboard.getData();
    }

    /**
     * Creates a new dashboard
     * 
     * @param dashboard
     *            the dashboard to create
     * @return newId - the id of the dashboard being created
     * @throws RdkTimeoutException
     */
    public Dashboard createDashboard(Dashboard dashboard) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "POST " + metricsServiceUrl + "/dashboard");
        logger.log(Level.INFO, gson.toJson(dashboard));
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(dashboard, MediaType.APPLICATION_JSON));
        processResponse(response);
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.log(Level.INFO, "getDashboardsResponse: \n" + gson.toJson(dashboards));
        return dashboards.getData().get(0);
    }

    /**
     * Updates an existing dashboard
     * 
     * @param dashboard
     *            the dashboard to be updated
     * @return the id of the dashboard being updated
     * @throws RdkTimeoutException
     */
    public String updateDashboard(Dashboard dashboard) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "PUT " + metricsServiceUrl + "/dashboard/" + dashboard.get_id());
        logger.log(Level.INFO, gson.toJson(dashboard));
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboard.get_id());
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).put(Entity.entity(dashboard, MediaType.APPLICATION_JSON));
        processResponse(response);
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.log(Level.INFO, "updateDashboardResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    /**
     * Deletes a dashboard
     * 
     * @param dashboardId
     *            the id of the dashboard to be deleted
     * @return the id of the dashboard deleted
     * @throws RdkTimeoutException
     */
    public String deleteDashboard(String dashboardId) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "DELETE " + metricsServiceUrl + "/dashboard/" + dashboardId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboardId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.log(Level.INFO, "deleteDashboardResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    /**
     * Creates a metric group
     * 
     * @param group
     *            - the group to be created
     * @return newId - the id of the new group
     * @throws RdkTimeoutException
     */
    public MetricGroup createMetricGroup(MetricGroup group) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "POST " + metricsServiceUrl + "/groups");
        logger.log(Level.INFO, gson.toJson(group));
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(group, MediaType.APPLICATION_JSON));
        processResponse(response);
        MetricsServiceResponse<List<MetricGroup>> newGroup = response.readEntity(new GenericType<MetricsServiceResponse<List<MetricGroup>>>() {
        });
        logger.log(Level.INFO, "createMetricGroupResponse: \n" + gson.toJson(newGroup));
        return newGroup.getData().get(0);
    }

    /**
     * Creates a metric definition
     * 
     * @param metric
     *            - the definition to create
     * @return newId - the id of the definition that was created
     * @throws RdkTimeoutException
     */
    public Metric createDefinition(Metric metric) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "POST " + metricsServiceUrl + "/definitions");
        logger.log(Level.INFO, gson.toJson(metric));
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(metric, MediaType.APPLICATION_JSON));
        processResponse(response);
        MetricsServiceResponse<List<Metric>> newDefinition = response.readEntity(new GenericType<MetricsServiceResponse<List<Metric>>>() {
        });
        logger.log(Level.INFO, "createDefinitionResponse: \n" + gson.toJson(newDefinition));
        return newDefinition.getData().get(0);
    }

    /**
     * Deletes a metric definition
     * 
     * @param definitionId
     *            - the id of the definition to be deleted
     * @return id - the id of the definition that was deleted
     * @throws RdkTimeoutException
     */
    public String deleteDefinition(String definitionId) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "DELETE " + metricsServiceUrl + "/definitions/" + definitionId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions/" + definitionId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.APPLICATION_JSON)
        		.cookie(rdkCookies.get(RDK_COOKIE_ID)).header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.log(Level.INFO, "deleteDefinitionResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    /**
     * Updates a metric group
     * 
     * @param group
     *            - the group to be updated
     * @return id - the id of the group that was updated
     * @throws RdkTimeoutException
     */
    public String updateMetricGroup(MetricGroup group) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "PUT " + metricsServiceUrl + "/groups/" + group.get_id());
        logger.log(Level.INFO, gson.toJson(group));
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups/" + group.get_id());
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).put(Entity.entity(group, MediaType.APPLICATION_JSON));
        processResponse(response);
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.log(Level.INFO, "updateMetricGroupResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    /**
     * Deletes a metric group
     * 
     * @param metricGroupId
     *            - the id of the group to be deleted
     * @return id - the id of the group that was deleted
     * @throws RdkTimeoutException
     */
    public String deleteMetricGroup(String metricGroupId) throws RdkTimeoutException {
        reauthenticate();
        logger.log(Level.INFO, "DELETE " + metricsServiceUrl + "/groups/" + metricGroupId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups/" + metricGroupId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.log(Level.INFO, "deleteMetricGroupResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    public String getMetricsServiceUri() {
        return metricsServiceUrl;
    }
}
