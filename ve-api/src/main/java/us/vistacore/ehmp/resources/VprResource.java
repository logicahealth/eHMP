package us.vistacore.ehmp.resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Stopwatch;
import com.google.common.base.Throwables;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.sun.jersey.api.client.ClientResponse;
import io.dropwizard.auth.Auth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.audit.AuditLogger;
import us.vistacore.ehmp.audit.AuditLogger.LogCategory;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.DecisionInfo;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.command.HmpCommand;
import us.vistacore.ehmp.command.JdsCommand;
import us.vistacore.ehmp.command.JdsSearchCommand;
import us.vistacore.ehmp.command.JdsSearchCommand.ResultsRecordType;
import us.vistacore.ehmp.command.SyncCommand;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.util.AuthorizationUtils;
import us.vistacore.ehmp.webapi.JsonResponseMessage;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

@Path(VprResource.CONTEXT)
public class VprResource extends BaseVeResource {

    public static final String CONTEXT = "/vpr";
    private static final String NO_DATA_FOUND_MESSAGE = "No Data Found";
    private static final String MISSING_FULLNAME_PARAM_MESSAGE = "'fullName' query parameter must be specified and must contain at least 2 letters.";

    private JdsConfiguration jdsConfiguration;
    private HmpConfiguration hmpConfiguration;

    @SuppressWarnings("unused")
    private static final Logger LOGGER = LoggerFactory.getLogger(VprResource.class);

    /**
     * XACML policy enforcement point.
     */
    private PEP pep;

    public VprResource(HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, PEP pep) {
        this.hmpConfiguration = hmpConfiguration;
        this.jdsConfiguration = jdsConfiguration;
        this.pep = pep;
    }

    /**
     * Returns VPR demographics data stored in JDS.
     *
     * @param pid
     *            the patient id, either ICN or {@code sitehash;dfn}
     * @param ack
     *            set to true to acknowledge authorization obligation
     * @return a JSON response of VPR data.
     */
    @GET
    @Path("/{pid}")
    @Timed
    public Response getJdsDemographics(@Auth User user,
                                       @Context HttpHeaders headers,
                                       @Context HttpServletRequest httpServletRequest,
                                       @Context UriInfo uriInfo,
                                       @PathParam("pid") String pid,
                                       @QueryParam("_ack") boolean ack) {
        String json;
        try {
            // Trigger non-blocking preemptive sync.
            // Synchronization is not required for returning demographics data,
            // but there is a high likelihood that other
            // domains will be requested.
            new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).execute();
            json = new JdsCommand(jdsConfiguration, pid, VprDomain.PATIENT).execute().toString();
        } catch (HystrixBadRequestException e) {
            if (Throwables.getRootCause(e).getClass().equals(IllegalArgumentException.class)) {
                String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "pid " + pid + " does not exist.").toJson();
                Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
                int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getJdsDemographics(...)", pid, ack);

                return oResponse;
            } else {
                throw e;
            }
        }

        DecisionInfo controllingDecision = null;
        Response oResponse = null;
        String sResponseMessage = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, pid, ack, user);
            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);
            sResponseMessage = createJsonResponseString(json, controllingDecision, uriInfo);
            oResponse = Response.status(httpStatusCode).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
            int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

            AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getJdsDemographics(...)", pid, ack);

            return oResponse;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, pid, VprDomain.PATIENT.name(), oResponse, sResponseMessage, ack, controllingDecision);
        }
    }

    /**
     * Synchronizes a patient search and returns VPR data stored in HMP
     */
    @GET
    @Path("/{pid}/search/{domain}")
    @Timed
    public Response getHmpByPidAndSearchAndDomain(@Auth User user,
                                                  @Context HttpHeaders headers,
                                                  @Context HttpServletRequest httpServletRequest,
                                                  @Context UriInfo uriInfo,
                                                  @PathParam("pid") String pid,
                                                  @QueryParam("text") String search,
                                                  @PathParam("domain") String searchDomain,
                                                  @QueryParam("_ack") boolean ack) {

        if (VprDomain.hasDomain(searchDomain)) {
            String json;
            try {
                new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).execute();
                json = new HmpCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid, search, searchDomain).execute().toString();
            } catch (HystrixBadRequestException e) {
                if (Throwables.getRootCause(e).getClass().equals(IllegalArgumentException.class)) {
                    String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "pid " + pid + " does not exist.").toJson();
                    Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
                    int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

                    AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getHmpByPidAndSearchAndDomain(...)",
                                    pid, searchDomain, search, ack);

                    return oResponse;
                } else {
                    throw e;
                }
            }

            DecisionInfo controllingDecision = null;
            String sResponseMessage = null;
            Response oResponse = null;

            try {
                controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, pid, ack, user);

                Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

                sResponseMessage = createJsonResponseString(json, controllingDecision, uriInfo);
                oResponse = Response.status(httpStatusCode).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
                int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getHmpByPidAndSearchAndDomain(...)", pid,
                        searchDomain, search, ack);

                return oResponse;
            } finally {
                logBreakGlass(user, headers, httpServletRequest, uriInfo, pid, searchDomain, oResponse, sResponseMessage, ack, controllingDecision);
            }
        }

        String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "No such domain.").toJson();
        Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
        int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

        AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getHmpByPidAndSearchAndDomain(...)", pid,
                searchDomain, search, ack);

        return oResponse;
    }

    /**
     * Synchronizes a patient and returns VPR data stored in JDS.
     *
     * @param pid
     *            the patient id, either ICN or {@code sitehash;dfn}
     * @param domain
     *            the name of the {@link VprDomain} to return data for
     * @param ack
     *            set to true to acknowledge authorization obligation
     * @return a JSON response of VPR data.
     */
    @GET
    @Path("/{pid}/{domain}")
    @Timed
    public Response getJdsByPidAndDomain(@Auth User user, @Context HttpHeaders headers, @Context HttpServletRequest httpServletRequest, @Context UriInfo uriInfo, @PathParam("pid") String pid,
                    @PathParam("domain") String domain, @QueryParam("_ack") boolean ack) {

        Stopwatch stopwatch = Stopwatch.createStarted();
        
        for (VprDomain vprDomain : VprDomain.values()) {
            if (vprDomain.getId().equalsIgnoreCase(domain)) {
                String json;
                try {
                    LOGGER.info("TIME ELAPSED BEFORE SYNC =     " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                    new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).execute();
                    LOGGER.info("TIME ELAPSED AFTER SYNC =      " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                    json = new JdsCommand(jdsConfiguration, pid, vprDomain).execute().toString();
                    LOGGER.info("TIME ELAPSED AFTER RETRIEVAL = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                } catch (HystrixBadRequestException e) {
                    if (Throwables.getRootCause(e).getClass().equals(IllegalArgumentException.class)) {
                        String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "pid " + pid + " does not exist.").toJson();
                        Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
                        int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

                        AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength,
                                        LogCategory.AUDIT, "Entered: getJdsByPidAndDomain(...)", pid, domain, ack);

                        return oResponse;
                    } else {
                        throw e;
                    }
                }

                DecisionInfo controllingDecision = null;
                String sResponseMessage = null;
                Response oResponse = null;
                
                try {
                    LOGGER.info("TIME ELAPSED BEFORE AUTHORIZE = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));

                    controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, pid, ack, user);

                    LOGGER.info("TIME ELAPSED AFTER AUTHORIZE = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));

                    Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

                    LOGGER.info("TIME ELAPSED AFTER STATUSCODE = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));

                    sResponseMessage = createJsonResponseString(json, controllingDecision, uriInfo);
                    oResponse = Response.status(httpStatusCode).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();

                    int responseLength = 0;
                    if (sResponseMessage != null) {
                        responseLength = sResponseMessage.length();
                    }
                    
                    LOGGER.info("TIME ELAPSED BEFORE AUDIT = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                    
                    AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseLength,
                            LogCategory.AUDIT, "Entered: getJdsByPidAndDomain(...)", pid, domain, ack);

                    LOGGER.info("TIME ELAPSED AFTER AUDIT = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));

                    return oResponse;
                } finally {
                    LOGGER.info("TIME ELAPSED BEFORE BREAKTHEGLASS = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                    logBreakGlass(user, headers, httpServletRequest, uriInfo, pid, domain, oResponse, sResponseMessage, ack, controllingDecision);
                    LOGGER.info("TIME ELAPSED AFTER BREAKTHEGLASS = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
                }
            }
        }
        String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "No such domain.").toJson();
        Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
        int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

        AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength,
                        LogCategory.AUDIT, "Entered: getJdsByPidAndDomain(...)", pid, domain, ack);

        return oResponse;
    }

    /**
     * Returns VPR demographics data stored in JDS
     *
     * @param fullName
     *            all or part of a patient name
     * @return a JSON response of VPR data.
     */
    @GET
    @Path("/search/{resource : [Pp]atient}")
    @Timed
    public Response findPatientsByFullnameSearch(@Auth User user, @Context HttpHeaders headers, @Context HttpServletRequest httpServletRequest, @Context UriInfo uriInfo,
                    @QueryParam("fullName") String fullName, @DefaultValue("100") @QueryParam("itemsPerPage") int count, @DefaultValue("0") @QueryParam("startIndex") int skip,
                    @DefaultValue("") @QueryParam("resultsRecordType") String resultsRecordType) {

        if (isNullish(fullName) || fullName.trim().length() < 2) {
            Response oResponse = Response.status(Response.Status.BAD_REQUEST).entity(MISSING_FULLNAME_PARAM_MESSAGE).type(MediaType.TEXT_PLAIN).build();

            AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), MISSING_FULLNAME_PARAM_MESSAGE.length(),
                            LogCategory.AUDIT, "Entered: findPatientsByFullnameSearch(...)", VprDomain.PATIENT.toString(), fullName, count, skip, resultsRecordType);

            return oResponse;
        }

        JdsSearchCommand.SearchFilter filter = new JdsSearchCommand.SearchFilter(JdsSearchCommand.Field.NAME, JdsSearchCommand.MatchType.STARTS_WITH, fullName);
        JdsSearchCommand search = new JdsSearchCommand(this.jdsConfiguration, JdsSearchCommand.Index.PATIENT_NAME, count, skip, filter, ResultsRecordType.fromString(resultsRecordType));
        String json = new Gson().toJson(search.execute());
        if (isNotNullish(json)) {
            Response oResponse = Response.ok().type(MediaType.APPLICATION_JSON).entity(json).build();

            AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), json.length(),
                            LogCategory.AUDIT, "Entered: findPatientsByFullnameSearch(...)", VprDomain.PATIENT.toString(), fullName, count, skip, resultsRecordType);

            return oResponse;
        }

        Response oResponse = Response.status(Response.Status.NOT_FOUND).entity(NO_DATA_FOUND_MESSAGE).type(MediaType.TEXT_PLAIN).build();

        AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), NO_DATA_FOUND_MESSAGE.length(),
                        LogCategory.AUDIT, "Entered: findPatientsByFullnameSearch(...)", VprDomain.PATIENT.toString(), fullName, count, skip, resultsRecordType);

        return oResponse;
    }

    /**
     * Returns VPR lab data given an order stored in JDS
     *
     * @param pid The patient Id
     * @param orderUid The UID of the order with the labs to return
     * @param ack set to true to acknowledge authorization obligation
     * @return a JSON response of VPR lab data
     */
    @GET
    @Path("/{pid}/labs/{order_uid}")
    @Timed
    public Response getJdsLabsByOrderUid(@Auth User user,
			                             @Context HttpHeaders headers,
			                             @Context HttpServletRequest httpServletRequest,
			                             @Context UriInfo uriInfo,
			                             @PathParam("pid") String pid,
			                             @PathParam("order_uid") String orderUid,
			                             @QueryParam("_ack") boolean ack) {
		String json;

		try {
			new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).execute();
			json = new JdsCommand(jdsConfiguration, orderUid).execute().toString();
			List<String> labUids = JdsCommand.getLabUids(json);
			JsonArray labArray = new JsonArray();

			for (String labUid : labUids) {
			    json = new JdsCommand(jdsConfiguration, pid, labUid, VprDomain.LAB, true).execute().toString();
			    JsonElement labElement = JdsCommand.getFirstLab(json);

			    if (labElement != null) {
			        labArray.add(labElement);
			    }
			}

			JsonObject innerObject = new JsonObject();
			innerObject.add("items", labArray);

			JsonObject mainObject = new JsonObject();
			mainObject.add("data", innerObject);
			json = mainObject.toString();
		} catch (HystrixBadRequestException e) {
			if (Throwables.getRootCause(e).getClass().equals(IllegalArgumentException.class)) {
				String sResponseMessage = new JsonResponseMessage(Response.Status.NOT_FOUND, "pid " + pid + " does not exist or order uid " + orderUid + " does not exsit").toJson();
				Response oResponse = Response.status(ClientResponse.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();
				int responseMsgLength = sResponseMessage == null ? 0 : sResponseMessage.length();

				AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseMsgLength, LogCategory.AUDIT, "Entered: getJdsLabsByOrderUid(...)", pid, orderUid, ack);

				return oResponse;
			} else {
				throw e;
			}
		}

		DecisionInfo controllingDecision = null;
		String sResponseMessage = null;
		Response oResponse = null;

		try {
			controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, pid, ack, user);
			Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

			sResponseMessage = createJsonResponseString(json, controllingDecision, uriInfo);
			oResponse = Response.status(httpStatusCode).type(MediaType.APPLICATION_JSON).entity(sResponseMessage).build();

			int responseLength = 0;
			if (sResponseMessage != null) {
				responseLength = sResponseMessage.length();
			}

			AuditLogger.log(user, headers, httpServletRequest, uriInfo, oResponse.getStatus(), responseLength, LogCategory.AUDIT, "Entered: getJdsLabsByOrderUid(...)", pid, orderUid, ack);

			return oResponse;
		} finally {
			logBreakGlass(user, headers, httpServletRequest, uriInfo, pid, orderUid, oResponse, sResponseMessage, ack, controllingDecision);
		}
	}

    private static String createJsonResponseString(String theData, DecisionInfo decision, UriInfo uriInfo) {
        switch (decision.getDecisionValue()) {
        case PERMIT:
            return theData;
        case WARN:
            return AuthorizationUtils.getObligation(decision.getDecisionMessage(), uriInfo).toJson();
        case DENY:
        case ERROR:
        default:
            return null;
        }
    }

}
