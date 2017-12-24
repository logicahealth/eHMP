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
package com.cognitivemedicine.metricsservice.client;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.DateFormat;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

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
    private Logger logger = LoggerFactory.getLogger(MetricsServiceClient.class);
	private static final Logger REQUESTIDLOG = LoggerFactory.getLogger("RequestIdLogger");
    private static final String RDK_COOKIE_ID = "ehmp.vistacore.rdk.sid";
    private Gson gson;
	public static final DateTimeFormatter DATEFORMATTER = DateTimeFormatter.ISO_INSTANT;
	private static String hostname;


    public MetricsServiceClient(String rdkUrl, String metricsServicePath) {
        final Client client = ClientBuilder.newBuilder().register(ObjectMapperProvider.class).register(JacksonFeatures.class).build();

        this.rdkUrl = rdkUrl;
        this.metricsServiceUrl = rdkUrl + "/" + metricsServicePath;

        authServiceTarget = client.target(rdkUrl);
        metricsServiceTarget = client.target(metricsServiceUrl);

        gson = new GsonBuilder().enableComplexMapKeySerialization().setDateFormat(DateFormat.LONG).setPrettyPrinting().setVersion(1.0).create();
		if(hostname==null) {
			try {
				InetAddress localHost = InetAddress.getLocalHost();
				hostname = localHost.getHostName();
			} catch (UnknownHostException e) {
				logger.error("LocalHost could not be resolved to an address.",e );
			}
		}
    }

    /**
     * Checks the status of an HTTP Response for errors
     * 
     * @param response
     */
    private void processResponse(Response response) {
        int status = response.getStatus();

        if (status >= 400 && status < 500) {
            logger.error("Response Error: " + response.getStatus());
            // throw new ClientErrorException(response);
        } else if (status >= 500) {
            logger.error("Response Error: " + response.getStatus());
            // throw new NotAcceptableException(response);
        }
        logger.info("Response Status: " + response.getStatus());
        String requestId = response.getHeaderString("X-Request-ID");
        logger.info("RequestId : "+requestId);
        if(requestId == null) {
        	requestId = UUID.randomUUID().toString();
        }
    	MDC.put("requestId", requestId);
    }

    /**
     * Authenticates to the RDK
     * 
     * @param dashboard
     *            the dashboard to create
     * @return newId - the id of the dashboard being created
     */
    public AuthResponse authenticate(AuthRequest authRequest) throws RdkTimeoutException {
        logger.info( "POST " + rdkUrl + "/authentication");
        logger.info( gson.toJson(authRequest));
        WebTarget authTarget = authServiceTarget.path("authentication");
        Response response = authTarget.request(MediaType.APPLICATION_JSON).header("X-Request-ID", MDC.get("requestId")).accept(MediaType.TEXT_PLAIN).post(Entity.entity(authRequest, MediaType.APPLICATION_JSON));

        if (response.getStatus() == 400 || response.getStatus() == 401) {
            logger.error( "Error: Not a valid ACCESS CODE/VERIFY CODE pair.  Please log in again");
            throw new RdkTimeoutException();
        } else {
            processResponse(response);
            logRequestId(authTarget, "POST", "authenticate()");
            // Store the authentication cookie (RDK_COOKIE_ID)
            rdkCookies = response.getCookies();
            jwtHeader = response.getHeaderString("X-Set-JWT");
            MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
            });
            logger.info( "authenticateResponse: \n" + gson.toJson(authResponse));
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
        logger.info( "GET " + rdkUrl + "/authentication");
        WebTarget dashboardsTarget = authServiceTarget.path("authentication/systems/internal");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON)
        		.header("X-Request-ID", MDC.get("requestId")).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("Authorization", "Bearer " + jwtHeader).get();

        logRequestId(dashboardsTarget, "GET", "reauthenticate()");
        if (response.getStatus() == 400 || response.getStatus() == 401) {
            logger.error( "Unauthorized access.  Please log in again.  Status: " + response.getStatus());
            throw new RdkTimeoutException();
        } else {
            MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
            });
            logger.info( "authenticateResponse: \n" + gson.toJson(authResponse));
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
        logger.info( "DELETE " + rdkUrl + "/authentication");
        WebTarget dashboardsTarget = authServiceTarget.path("authentication");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).delete();

        processResponse(response);
        logRequestId(dashboardsTarget, "DELETE", "logOut()");
        MetricsServiceResponse<AuthResponse> authResponse = response.readEntity(new GenericType<MetricsServiceResponse<AuthResponse>>() {
        });
        logger.info( "authenticateResponse: \n" + gson.toJson(authResponse));
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
            logger.info( "GET " + rdkUrl + "/authentication/list");
            WebTarget dashboardsTarget = authServiceTarget.path("authentication/list");
            Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).get();
            processResponse(response);
            logRequestId(dashboardsTarget, "GET", "getSiteList()");
            MetricsServiceResponse<SiteList> sites = response.readEntity(new GenericType<MetricsServiceResponse<SiteList>>() {
            });
            logger.info( "getSiteListResponse: \n" + gson.toJson(sites));
            return sites.getData().getItems();
        }
        catch(Exception e){
            logger.error(e.getMessage());
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
        logger.info( "GET " + metricsServiceUrl + "/roles");
        WebTarget dashboardsTarget = metricsServiceTarget.path("roles");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getRoles()");
        MetricsServiceResponse<List<Role>> roles = response.readEntity(new GenericType<MetricsServiceResponse<List<Role>>>() {
        });
        logger.info( "getRolesResponse: \n" + gson.toJson(roles));
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
        logger.info( "GET " + metricsServiceUrl + "/userRoles");
        WebTarget dashboardsTarget = metricsServiceTarget.path("userRoles");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getUserRoles()");
        MetricsServiceResponse<List<UserRoles>> userRoles = response.readEntity(new GenericType<MetricsServiceResponse<List<UserRoles>>>() {
        });
        logger.info( "getUserRolesResponse: \n" + gson.toJson(userRoles));
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
        logger.info( "GET " + metricsServiceUrl + "/definitions");
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getMetricDefinitions()");
        MetricsServiceResponse<List<Metric>> metrics = response.readEntity(new GenericType<MetricsServiceResponse<List<Metric>>>() {
        });
        logger.info( "getMetricDefinitionsResponse: \n" + gson.toJson(metrics));
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
        logger.info( "GET " + metricsServiceUrl + "/groups");
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getMetricGroups()");
        MetricsServiceResponse<List<MetricGroup>> groups = response.readEntity(new GenericType<MetricsServiceResponse<List<MetricGroup>>>() {
        });
        logger.info( "getMetricGroupsResponse: \n" + gson.toJson(groups));
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
        logger.info( "Start: " + new Date(startPeriod) + " End: " + new Date(endPeriod));
        logger.info( "GET " + metricsServiceUrl + "/metrics?metricId=" + metaDefinition.getDefinitionId() + "&startPeriod=" + startPeriod + "&endPeriod=" + endPeriod + gText + oText + iText);

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
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader);

        Response response = b.get();
        processResponse(response);
        logRequestId(metricsTarget, "GET", "getMetrics()");
        MetricsServiceResponse<List<Datapoint>> metrics = response.readEntity(new GenericType<MetricsServiceResponse<List<Datapoint>>>() {
        });
        logger.info( "getMetricsResponse: \n" + gson.toJson(metrics));
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
        logger.info( "GET " + metricsServiceUrl + "/dashboards");
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboards");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getDashboards()");
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.info( "getDashboardsResponse: \n" + gson.toJson(dashboards));
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
        logger.info( "GET " + metricsServiceUrl + "/dashboards/" + userId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboards/" + userId);
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getDashboards()");
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.info( "getDashboardsResponse: \n" + gson.toJson(dashboards));
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
        logger.info( "GET " + metricsServiceUrl + "/dashboard/" + dashboardId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboardId);
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).get();
        processResponse(response);
        logRequestId(dashboardsTarget, "GET", "getDashboard()");
        MetricsServiceResponse<Dashboard> dashboard = response.readEntity(new GenericType<MetricsServiceResponse<Dashboard>>() {
        });
        logger.info( "getDashboardResponse: \n" + gson.toJson(dashboard));
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
        logger.info( "POST " + metricsServiceUrl + "/dashboard");
        logger.info( gson.toJson(dashboard));
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(dashboard, MediaType.APPLICATION_JSON));
        processResponse(response);
        logRequestId(dashboardsTarget, "POST", "createDashboard()");
        MetricsServiceResponse<List<Dashboard>> dashboards = response.readEntity(new GenericType<MetricsServiceResponse<List<Dashboard>>>() {
        });
        logger.info( "getDashboardsResponse: \n" + gson.toJson(dashboards));
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
        logger.info( "PUT " + metricsServiceUrl + "/dashboard/" + dashboard.get_id());
        logger.info( gson.toJson(dashboard));
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboard.get_id());
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("requestId", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).put(Entity.entity(dashboard, MediaType.APPLICATION_JSON));
        processResponse(response);
        logRequestId(dashboardsTarget, "PUT", "updateDashboard()");
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.info( "updateDashboardResponse: \n" + gson.toJson(id));
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
        logger.info( "DELETE " + metricsServiceUrl + "/dashboard/" + dashboardId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("dashboard/" + dashboardId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        logRequestId(dashboardsTarget, "DELETE", "deleteDashboard()");
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.info( "deleteDashboardResponse: \n" + gson.toJson(id));
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
        logger.info( "POST " + metricsServiceUrl + "/groups");
        logger.info( gson.toJson(group));
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(group, MediaType.APPLICATION_JSON));
        processResponse(response);
        logRequestId(dashboardsTarget, "POST", "createMetricGroup()");
        MetricsServiceResponse<List<MetricGroup>> newGroup = response.readEntity(new GenericType<MetricsServiceResponse<List<MetricGroup>>>() {
        });
        logger.info( "createMetricGroupResponse: \n" + gson.toJson(newGroup));
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
        logger.info( "POST " + metricsServiceUrl + "/definitions");
        logger.info( gson.toJson(metric));
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions");
        Response response = dashboardsTarget.request(MediaType.APPLICATION_JSON).cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).post(Entity.entity(metric, MediaType.APPLICATION_JSON));
        processResponse(response);
        logRequestId(dashboardsTarget, "POST", "createDefinition()");
        MetricsServiceResponse<List<Metric>> newDefinition = response.readEntity(new GenericType<MetricsServiceResponse<List<Metric>>>() {
        });
        logger.info( "createDefinitionResponse: \n" + gson.toJson(newDefinition));
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
        logger.info( "DELETE " + metricsServiceUrl + "/definitions/" + definitionId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("definitions/" + definitionId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.APPLICATION_JSON)
        		.cookie(rdkCookies.get(RDK_COOKIE_ID))
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        logRequestId(dashboardsTarget, "DELETE", "deleteDefinition()");
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.info( "deleteDefinitionResponse: \n" + gson.toJson(id));
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
        logger.info( "PUT " + metricsServiceUrl + "/groups/" + group.get_id());
        logger.info( gson.toJson(group));
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups/" + group.get_id());
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).put(Entity.entity(group, MediaType.APPLICATION_JSON));
        processResponse(response);
        logRequestId(dashboardsTarget, "DELETE", "updateMetricGroup()");
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.info( "updateMetricGroupResponse: \n" + gson.toJson(id));
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
        logger.info( "DELETE " + metricsServiceUrl + "/groups/" + metricGroupId);
        WebTarget dashboardsTarget = metricsServiceTarget.path("groups/" + metricGroupId);
        Response response = dashboardsTarget.request().cookie(rdkCookies.get(RDK_COOKIE_ID)).accept(MediaType.TEXT_PLAIN)
        		.header("X-Request-ID", MDC.get("requestId"))
        		.header("Authorization", "Bearer " + jwtHeader).delete();
        processResponse(response);
        logRequestId(dashboardsTarget, "DELETE", "deleteMetricGroup()");
        MetricsServiceResponse<GenericResult> id = response.readEntity(new GenericType<MetricsServiceResponse<GenericResult>>() {
        });
        logger.info( "deleteMetricGroupResponse: \n" + gson.toJson(id));
        return id.getData().getResult();
    }

    public String getMetricsServiceUri() {
        return metricsServiceUrl;
    }
    
    private void logRequestId(WebTarget webTarget, String method, String msg) {
        Set<String> keys = new HashSet<String>(); 
    	put(keys, "dateTime", DATEFORMATTER.format(Instant.now()), true);
        put(keys, "address", webTarget.getUri().getHost()+":"+webTarget.getUri().getPort(), true);
        put(keys, "httpMethod", method, true);
        put(keys, "path", webTarget.getUri().getPath(), true);
        put(keys, "hostname", hostname, false);
        put(keys, "context", "cdsdashboard", false);
	
        REQUESTIDLOG.info(msg);
	    for (String key : keys) {
	        MDC.remove(key);
	    }
    }
    
    private void put(Set<String> keys, String key, String value, boolean addToKeys) {
        if (value != null) {
            MDC.put(key, value);
            if( addToKeys) {
            	keys.add(key);
            }
        }
    }

}
