package us.vistacore.ehmp.resources;

import static java.lang.String.format;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.UrlUtils.fixHttps;

import io.dropwizard.auth.Auth;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AtomEntry;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.Conformance;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.List_;
import org.hl7.fhir.instance.model.MedicationAdministration;
import org.hl7.fhir.instance.model.MedicationDispense;
import org.hl7.fhir.instance.model.MedicationStatement;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Patient;
import org.hl7.fhir.instance.model.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.audit.AuditLogger;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.DecisionInfo;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.command.JdsCommand;
import us.vistacore.ehmp.command.JdsSearchCommand;
import us.vistacore.ehmp.command.SyncCommand;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput;
import us.vistacore.ehmp.model.allergies.transform.AllergiesVistaToFhir;
import us.vistacore.ehmp.model.demographics.PatientDemographics;
import us.vistacore.ehmp.model.demographics.VPRDemographicsRpcOutput;
import us.vistacore.ehmp.model.demographics.transform.DemographicsVistaToFhir;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;
import us.vistacore.ehmp.model.labresults.transform.LabResultsVistaToFhir;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationAdministration;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationDispense;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationStatement;
import us.vistacore.ehmp.model.radiology.VPRRadiologyRpcOutput;
import us.vistacore.ehmp.model.radiology.transform.RadiologyResultsVistaToFhir;
import us.vistacore.ehmp.model.transform.FhirToJson;
import us.vistacore.ehmp.model.transform.FhirToXML;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.model.vitals.VPRVitalsRpcOutput;
import us.vistacore.ehmp.model.vitals.transform.VitalsVistaToFhir;
import us.vistacore.ehmp.util.AuthorizationUtils;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.webapi.FhirConformance;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.netflix.hystrix.exception.HystrixBadRequestException;

/**
 * REST Resource for FHIR Resources URLs are /fhir/{resource}/@{id}(?_format=(json|xml)) /fhir/{resource}(?_format=(json|xml))
 *
 */
@Path(FhirResource.CONTEXT)
@Produces({ FhirResource.XML_FHIR_MIMETYPE, FhirResource.JSON_FHIR_MIMETYPE, FhirResource.JSON_FEED_FHIR_MIMETYPE, FhirResource.XML_FEED_FHIR_MIMETYPE })
public class FhirResource extends BaseVeResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(FhirResource.class);

    /**
     * Configuration for HMP server
     */
    private HmpConfiguration hmpConfiguration;

    /**
     * Configuration for JDS instance
     */
    private JdsConfiguration jdsConfiguration;

    /**
     * URL Context Root
     */
    public static final String CONTEXT = "/fhir";

    /**
     * Valid mediatypes
     */
    public static final String JSON_FHIR_MIMETYPE = "application/json+fhir";
    public static final String JSON_FEED_FHIR_MIMETYPE = "application/json+fhir";
    public static final String XML_FHIR_MIMETYPE = "application/xml+fhir";
    public static final String XML_FEED_FHIR_MIMETYPE = "application/atom+xml";
    public static final String[] XML_MIMETYPES = {"xml", "text/xml", "application/xml", "application/xml+fhir"};
    public static final String[] JSON_MIMETYPES = {"json", "application/json", "application/json+fhir"};

    public static final String DEFAULT_FORMAT = "json";

    /**
     * Namespace for ICN Identifier
     */
    public static final String ICN_NAMESPACE = DemographicsVistaToFhir.ICN_SYSTEM;

    /**
     * Namespace for UID Identifier
     */
    public static final String UID_NAMESPACE = DemographicsVistaToFhir.UID_SYSTEM;

    /**
     * Print formmatted JSON
     */
    private static final boolean PRETTY = true;

    /**
     * Author information for Feed/Bundle definitions
     */
    private static final String AUTHOR_NAME = "eHMP";
    private static final String AUTHOR_URI = "https://ehmp.vistacore.us";

    public static final String DEFAULT_DOMAIN = "lab";

    public static final boolean INCLUDE_RELATED_RESOURCES = true;

    public static final boolean PACKAGE_RELATED_RESOURCES_AS_CONTAINED = false;

    /**
     * XACML policy enforcement point.
     */
    private PEP pep;

    /**
     * Default Constructor
     *
     * @param jdsConfiguration Configuration for JDS datasource
     * @param jdsConfiguration Configuration for HMP middleware server
     */
    public FhirResource(HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, PEP pep) {
        this.hmpConfiguration = hmpConfiguration;
        this.jdsConfiguration = jdsConfiguration;
        this.pep = pep;
    }

    /**
     * Returns a conformance profile for this FHIR server
     *
     * @return A conformance profile
     */
    @Timed
    @GET
    @Path("/{resource : [Mm]etadata}")
    public Response getMetadata(@Auth User user,
                                @Context HttpHeaders headers,
                                @Context HttpServletRequest httpServletRequest,
                                @Context UriInfo uriInfo,
                                @DefaultValue("xml") @QueryParam("_format") String format) {
        return this.getConformance(user, headers, httpServletRequest, uriInfo, format);
    }

    /**
     * Returns a conformance profile for this FHIR server
     *
     * @return A conformance profile
     */
    @Timed
    @OPTIONS
    public Response getConformance(@Auth User user,
                                   @Context HttpHeaders headers,
                                   @Context HttpServletRequest httpServletRequest,
                                   @Context UriInfo uriInfo,
                                   @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format) {
        try {
            Conformance conformance = FhirConformance.build();

            if (isJsonFormat(format)) {
                String responseMessage = FhirToJson.transform(conformance);

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, Response.Status.OK.getStatusCode(), responseMessage.length(),
                        AuditLogger.LogCategory.AUDIT, "Entered: getConformance(...)", null, false);

                return Response.ok().type(JSON_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                String responseMessage = FhirToXML.transform(conformance);

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, Response.Status.OK.getStatusCode(), responseMessage.length(),
                        AuditLogger.LogCategory.AUDIT, "Entered: getConformance(...)", null, false);

                return Response.ok().type(XML_FHIR_MIMETYPE).entity(responseMessage).build();
            }
        } catch (Exception e) {
            LOGGER.warn("error in getConformance.", e);
            AuditLogger.log(user, headers, httpServletRequest, uriInfo, Response.Status.OK.getStatusCode(), 0,
                    AuditLogger.LogCategory.AUDIT, "Entered: getConformance(...)", null, false);

            return Response.serverError().build();
        }
    }

    /**
     * Returns a feed or bundle of {@link AdverseReaction} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Aa]dverse[Rr]eaction}/_search")
    public Response getAdverseReactionSearch(@Auth User user,
                                             @Context HttpHeaders headers,
                                             @Context HttpServletRequest httpServletRequest,
                                             @Context UriInfo uriInfo,
                                             @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                             @QueryParam("subject.identifier") String subjectId,
                                             @QueryParam("_ack") boolean ack) {
        return this.getAdverseReaction(user, headers, httpServletRequest, uriInfo, format, subjectId, ack);
    }

    /**
     * Returns a feed or bundle of {@link AdverseReaction} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Aa]dverse[Rr]eaction}")
    public Response getAdverseReaction(@Auth User user,
                                       @Context HttpHeaders headers,
                                       @Context HttpServletRequest httpServletRequest,
                                       @Context UriInfo uriInfo,
                                       @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                       @QueryParam("subject.identifier") String subjectId,
                                       @QueryParam("_ack") boolean ack) {
        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
            AtomFeed feed = createFeed(user, AdverseReaction.class, VprDomain.ALLERGY, uriInfo, subjectId);

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getAdverseReaction(...)", subjectId, VprDomain.ALLERGY.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getAdverseReaction(...)", subjectId, VprDomain.ALLERGY.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, VprDomain.ALLERGY.name(), response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link DiagnosticReport} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Dd]iagnostic[Rr]eport}")
    public Response getDiagnosticReport(@Auth User user,
                                        @Context HttpHeaders headers,
                                        @Context HttpServletRequest httpServletRequest,
                                        @Context UriInfo uriInfo,
                                        @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                        @QueryParam("subject.identifier") String subjectId,
                                        @DefaultValue(DEFAULT_DOMAIN) @QueryParam("domain") String domainName,
                                        @QueryParam("_ack") boolean ack) {
        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
            VprDomain vprDomain = null;

            try {
                vprDomain = VprDomain.idToValue(domainName);
            } catch (VprDomain.VprDataTypeException vdte) {
                Response.Status status = Response.Status.BAD_REQUEST;
                responseMessage = "Invalid domain: " + vdte.getMessage();

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, status.getStatusCode(), responseMessage.length(),
                        AuditLogger.LogCategory.AUDIT, "Entered: getDiagnosticReport(...)", subjectId, ack);

                response = Response.status(status).entity(responseMessage).type(MediaType.TEXT_PLAIN).build();
                return response;
            }

            AtomFeed feed = createFeed(user, DiagnosticReport.class, vprDomain, uriInfo, subjectId);

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getDiagnosticReport(...)", subjectId, vprDomain.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getDiagnosticReport(...)", subjectId, vprDomain.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, domainName, response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link DiagnosticReport} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Dd]iagnostic[Rr]eport}/_search")
    public Response getDiagnosticReportSearch(@Auth User user,
                                              @Context HttpHeaders headers,
                                              @Context HttpServletRequest httpServletRequest,
                                              @Context UriInfo uriInfo,
                                              @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                              @QueryParam("subject.identifier") String subjectId,
                                              @DefaultValue(DEFAULT_DOMAIN) @QueryParam("domain") String domainName,
                                              @QueryParam("_ack") boolean ack) {
        return this.getDiagnosticReport(user, headers, httpServletRequest, uriInfo, format, subjectId, domainName, ack);
    }

    /**
     * Returns a feed or bundle of {@link MedicationDispense} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Mm]edication[Dd]ispense}")
    public Response getMedicationDispense(@Auth User user,
                                        @Context HttpHeaders headers,
                                        @Context HttpServletRequest httpServletRequest,
                                        @Context UriInfo uriInfo,
                                        @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                        @QueryParam("subject.identifier") String subjectId,
                                        @QueryParam("_ack") boolean ack) {
        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
            AtomFeed feed = createFeed(user, MedicationDispense.class, VprDomain.MED, uriInfo, subjectId);

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationDispense(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationDispense(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, VprDomain.MED.name(), response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link MedicationDispense} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Mm]edication[Dd]ispense}/_search")
    public Response getMedicationDispenseSearch(@Auth User user,
                                              @Context HttpHeaders headers,
                                              @Context HttpServletRequest httpServletRequest,
                                              @Context UriInfo uriInfo,
                                              @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                              @QueryParam("subject.identifier") String subjectId,
                                              @QueryParam("_ack") boolean ack) {
        return this.getMedicationDispense(user, headers, httpServletRequest, uriInfo, format, subjectId, ack);
    }
    
    /**
     * Returns a feed or bundle of {@link MedicationAdministration} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Mm]edication[Aa]dministration}")
    public Response getMedicationAdministration(@Auth User user,
                                        @Context HttpHeaders headers,
                                        @Context HttpServletRequest httpServletRequest,
                                        @Context UriInfo uriInfo,
                                        @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                        @QueryParam("subject.identifier") String subjectId,
                                        @QueryParam("_ack") boolean ack) {

        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
            AtomFeed feed = createFeed(user, MedicationAdministration.class, VprDomain.MED, uriInfo, subjectId);

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationAdministration(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationAdministration(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, VprDomain.MED.name(), response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link MedicationAdministration} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Mm]edication[Aa]dministration}/_search")
    public Response getMedicationAdministrationSearch(@Auth User user,
                                              @Context HttpHeaders headers,
                                              @Context HttpServletRequest httpServletRequest,
                                              @Context UriInfo uriInfo,
                                              @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                              @QueryParam("subject.identifier") String subjectId,
                                              @QueryParam("_ack") boolean ack) {
        return this.getMedicationAdministration(user, headers, httpServletRequest, uriInfo, format, subjectId, ack);
    }

    /**
     * Returns a feed or bundle of {@link MedicationStatement} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Mm]edication[Ss]tatement}")
    public Response getMedicationStatement(@Auth User user,
                                        @Context HttpHeaders headers,
                                        @Context HttpServletRequest httpServletRequest,
                                        @Context UriInfo uriInfo,
                                        @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                        @QueryParam("subject.identifier") String subjectId,
                                        @QueryParam("_ack") boolean ack) {
        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);

            AtomFeed feed = createFeed(user, MedicationStatement.class, VprDomain.MED, uriInfo, subjectId);

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationStatement(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getMedicationStatement(...)", subjectId, VprDomain.MED.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, VprDomain.MED.name(), response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link MedicationStatement} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Mm]edication[Ss]tatement}/_search")
    public Response getMedicationStatementSearch(@Auth User user,
                                              @Context HttpHeaders headers,
                                              @Context HttpServletRequest httpServletRequest,
                                              @Context UriInfo uriInfo,
                                              @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                              @QueryParam("subject.identifier") String subjectId,
                                              @QueryParam("_ack") boolean ack) {
        return this.getMedicationStatement(user, headers, httpServletRequest, uriInfo, format, subjectId, ack);
    }
    
     /**
     * Returns a feed or bundle of {@link Observation} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Oo]bservation}/_search")
    public Response getObservationSearch(@Auth User user,
                                         @Context HttpHeaders headers,
                                         @Context HttpServletRequest httpServletRequest,
                                         @Context UriInfo uriInfo,
                                         @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                         @QueryParam("subject.identifier") String subjectId,
                                         @QueryParam("_ack") boolean ack) {
        return this.getObservation(user, headers, httpServletRequest, uriInfo, format, subjectId, ack);
    }

    /**
     * Returns a feed or bundle of {@link Observation} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Oo]bservation}")
    public Response getObservation(@Auth User user,
                                   @Context HttpHeaders headers,
                                   @Context HttpServletRequest httpServletRequest,
                                   @Context UriInfo uriInfo,
                                   @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                   @QueryParam("subject.identifier") String subjectId,
                                   @QueryParam("_ack") boolean ack) {
        if (isNotNullish(uriInfo.getQueryParameters().get("subject:Patient"))) {
            subjectId = uriInfo.getQueryParameters().get("subject:Patient").get(0);
        }
        if (subjectId != null) {
            subjectId = subjectId.replaceFirst("@", "");
        }

        DecisionInfo controllingDecision = null;
        String responseMessage = null;
        Response response = null;

        try {
            controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
            AtomFeed feed = createFeed(user, Observation.class, VprDomain.VITAL, uriInfo, subjectId);
            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getObservation(...)", subjectId, VprDomain.VITAL.name(), ack);

                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

                AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode.getStatusCode(), responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getObservation(...)", subjectId, VprDomain.VITAL.name(), ack);

                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }
            return response;
        } finally {
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, VprDomain.VITAL.name(), response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a feed or bundle of {@link Patient} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @GET
    @Path("/{resource : [Pp]atient}/_search")
    public Response getPatientSearch(@Auth User user,
                                     @Context HttpHeaders headers,
                                     @Context HttpServletRequest httpServletRequest,
                                     @Context UriInfo uriInfo,
                                     @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                     @QueryParam("identifier") String subjectId,
                                     @QueryParam("name") String name,
                                     @DefaultValue("10") @QueryParam("_count") int count,
                                     @DefaultValue("0") @QueryParam("_skip") int skip,
                                     @QueryParam("_ack") boolean ack)
                                     throws ModelTransformException {
        return this.getPatient(user, headers, httpServletRequest, uriInfo, format, subjectId, name, count, skip, ack);
    }

    /**
     * Returns a feed or bundle of {@link Patient} objects which match the search criteria
     *
     * @return a feed (XML) or bundle (JSON)
     */
    @Timed
    @GET
    @Path("/{resource : [Pp]atient}")
    public Response getPatient(@Auth User user,
                               @Context HttpHeaders headers,
                               @Context HttpServletRequest httpServletRequest,
                               @Context UriInfo uriInfo,
                               @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                               @QueryParam("identifier") String subjectId,
                               @QueryParam("name") String name,
                               @DefaultValue("10") @QueryParam("_count") int count,
                               @DefaultValue("0") @QueryParam("_skip") int skip,
                               @QueryParam("_ack") boolean ack)
                               throws ModelTransformException {
        Response response = null;
        String responseMessage = null;
        DecisionInfo controllingDecision = null;
        List<String> pids = new LinkedList<>();

        try {
            LOGGER.info("CPRS COR Tab: " + user.getCprsCorTabAccess());
            LOGGER.info("CPRS RPT Tab: " + user.getCprsRptTabAccess());
            AtomFeed feed;

            if (isNotNullish(subjectId)) {
                controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, subjectId, ack, user);
                feed = createFeed(user, Patient.class, VprDomain.PATIENT, uriInfo, subjectId);
                pids.add(subjectId);
            } else {
                String requestUri = fixHttps(uriInfo.getRequestUri().toString());
                String resourceRootUri = fixHttps(uriInfo.getAbsolutePath().toASCIIString());
                feed = new AtomFeed();
                feed.setUpdated(new DateAndTime(Calendar.getInstance()));
                feed.setAuthorName(AUTHOR_NAME);
                feed.setAuthorUri(AUTHOR_URI);
                feed.setId("urn:uuid:" + UUID.randomUUID());
                feed.getLinks().put("self", requestUri);

                feed.setTitle(format("All Patient Resources"));

                JdsSearchCommand.SearchFilter filter = null;
                if (isNotNullish(name)) {
                    filter = new JdsSearchCommand.SearchFilter(JdsSearchCommand.Field.NAME, JdsSearchCommand.MatchType.CONTAINS, name);
                }
                JdsSearchCommand search = new JdsSearchCommand(this.jdsConfiguration, JdsSearchCommand.Index.PATIENT_NAME, count, skip, filter);

                String allPatients = new Gson().toJson(search.execute());
                DemographicsVistaToFhir demographicsVistaToFhir = new DemographicsVistaToFhir();
                VPRDemographicsRpcOutput demographics = new Gson().fromJson(allPatients, VPRDemographicsRpcOutput.class);
                List<Patient> fhirPatients = demographicsVistaToFhir.transform(demographics);
                controllingDecision = DecisionInfo.permit();

                int totalItems = demographics.getData().getTotalItems();
                feed.setTotalResults(totalItems);
                if (totalItems - skip - count > 0) {
                    feed.getLinks().put("next", format("%s?name=%s&_count=%d&_skip=%d", resourceRootUri, name, count, skip + count));
                }

                Multimap<Patient, Patient> patients = Multimaps.index(fhirPatients, new Function<Patient, Patient>() {
                    public Patient apply(Patient patient) {
                        return patient;
                    }
                });

                for (PatientDemographics pd : demographics.getData().getItems()) {
                    pids.add(pd.getPid());
                }

                feed.getEntryList().addAll(getEntries(resourceRootUri, patients.asMap()));
            }

            Response.Status httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

            if (isJsonFormat(format)) {
                responseMessage = createJsonResponseString(feed, controllingDecision, uriInfo);
                response = Response.status(httpStatusCode).type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            } else {
                responseMessage = createXMLResponseString(feed, controllingDecision, uriInfo);
                response = Response.status(httpStatusCode).type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
            }

            return response;
        } finally {
            int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

            if (!pids.isEmpty()) {
                // audit log each pid that was returned
                for (String pid : pids) {
                    AuditLogger.log(user, headers, httpServletRequest, uriInfo, response != null ? response.getStatus() : -1, responseMsgLength,
                            AuditLogger.LogCategory.AUDIT, "Entered: getPatient(...)", pid, ack);
                }
            } else {
                // no pids were returned; just audit log that the endpoint was called
                AuditLogger.log(user, headers, httpServletRequest, uriInfo, response != null ? response.getStatus() : -1, responseMsgLength,
                        AuditLogger.LogCategory.AUDIT, "Entered: getPatient(...)", subjectId, ack);
            }

            // audit log patient sensitivity
            logBreakGlass(user, headers, httpServletRequest, uriInfo, subjectId, null, response, responseMessage, ack, controllingDecision);
        }
    }

    /**
     * Returns a single {@link Patient} resources identified by {@code resourceId}.
     *
     * This is sometimes called the 'Logical Id' and represents the location of a resource.
     *
     * @param resourceId the logical ID of the Patient resource
     * @return A {@link Patient} resource identified by {@code resourceId}
     */
    @GET
    @Path("/{resource : [Pp]atient}/{resourceId}")
    public Response getPatientByResourceId(@Auth User user,
                                           @Context HttpHeaders headers,
                                           @Context HttpServletRequest httpServletRequest,
                                           @Context UriInfo uriInfo,
                                           @PathParam("resourceId") String resourceId,
                                           @QueryParam("_ack") boolean ack) throws Exception {
        String responseMessage = "";
        Response.Status httpStatusCode = null;
        String pid = null;

        try {
            String[] queryParams = resourceId.split("&");
            resourceId = queryParams[0].replaceFirst("@", "");
            String format = DEFAULT_FORMAT;
            if (queryParams.length > 1) {
                String[] queryParamValues = queryParams[1].split("=");
                if (queryParamValues.length > 1) {
                    format = queryParamValues[1];
                }
            }

            Patient patient = this.getPatientByResourceId(resourceId);
            if (patient == null) {
                httpStatusCode = Response.Status.NOT_FOUND;
                return Response.status(httpStatusCode).build();
            } else {
                DecisionInfo controllingDecision = null;
                Response response = null;

                try {
                    // Trigger background synchronization
                    pid = getId(patient, DemographicsVistaToFhir.PID_SYSTEM);
                    controllingDecision = AuthorizationUtils.authorize(pep, jdsConfiguration, pid, ack, user);
                    new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).queue();
                    httpStatusCode = AuthorizationUtils.decisionToStatusCode(controllingDecision);

                    if (isJsonFormat(format)) {
                        responseMessage = createJsonResponseString(patient, controllingDecision, uriInfo);
                        response = Response.status(httpStatusCode).type(JSON_FHIR_MIMETYPE).entity(responseMessage).build();
                    } else {
                        responseMessage = createXMLResponseString(patient, controllingDecision, uriInfo);
                        response = Response.status(httpStatusCode).type(XML_FHIR_MIMETYPE).entity(responseMessage).build();
                    }
                    return response;
                } finally {
                    if (controllingDecision != null) {
                        logBreakGlass(user, headers, httpServletRequest, uriInfo, pid, null, response, responseMessage, ack, controllingDecision);
                    }
                }
            }
        } finally {
            int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;
            AuditLogger.log(user, headers, httpServletRequest, uriInfo, httpStatusCode != null ? httpStatusCode.getStatusCode() : -1,
                    responseMsgLength, AuditLogger.LogCategory.AUDIT, "Entered: getPatientByResourceId(...)", pid, ack);
        }
    }

    private static String createJsonResponseString(AtomFeed feed, DecisionInfo decision, UriInfo uriInfo) {
        switch (decision.getDecisionValue()) {
            case PERMIT:
                return FhirToJson.transform(feed, PRETTY);
            case WARN:
                return AuthorizationUtils.getObligation(decision.getDecisionMessage(), uriInfo).toJson();
            case DENY:
            case ERROR:
            default:
                return null;
        }
    }

    // For a single Patient
    private static String createJsonResponseString(Patient p, DecisionInfo decision, UriInfo uriInfo) throws Exception {
        switch (decision.getDecisionValue()) {
            case PERMIT:
                return FhirToJson.transform(p);
            case WARN:
                return AuthorizationUtils.getObligation(decision.getDecisionMessage(), uriInfo).toJson();
            case DENY:
            case ERROR:
            default:
                return null;
        }
    }

    private static String createXMLResponseString(AtomFeed feed, DecisionInfo decision, UriInfo uriInfo) {
        switch (decision.getDecisionValue()) {
            case PERMIT:
                return FhirToXML.transform(feed, PRETTY);
            case WARN:
                return AuthorizationUtils.getObligation(decision.getDecisionMessage(), uriInfo).toXml();
            case DENY:
            case ERROR:
            default:
                return null;
        }
    }

    // For a single Patient
    private static String createXMLResponseString(Patient p, DecisionInfo decision, UriInfo uriInfo) throws Exception {
        switch (decision.getDecisionValue()) {
            case PERMIT:
                return FhirToXML.transform(p);
            case WARN:
                return AuthorizationUtils.getObligation(decision.getDecisionMessage(), uriInfo).toXml();
            case DENY:
            case ERROR:
            default:
                return null;
        }
    }

    @GET
    @Path("/{resource : [Ll]ist/_search}")
    public Response getListSearch(@Auth(required = false) User user,
                                  @Context HttpHeaders headers,
                                  @Context HttpServletRequest httpServletRequest,
                                  @Context UriInfo uriInfo,
                                  @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                                  @QueryParam("subject") String subjectResourceId,
                                  @QueryParam("code") String code) {
        return this.getList(user, headers, httpServletRequest, uriInfo, format, subjectResourceId, code);
    }

    @GET
    @Path("/{resource : [Ll]ist}")
    public Response getList(@Auth(required = false) User user,
                            @Context HttpHeaders headers,
                            @Context HttpServletRequest httpServletRequest,
                            @Context UriInfo uriInfo,
                            @DefaultValue(DEFAULT_FORMAT) @QueryParam("_format") String format,
                            @QueryParam("subject") String subjectResourceId,
                            @QueryParam("code") String code) {
        if (isNotNullish(uriInfo.getQueryParameters().get("subject:Patient"))) {
            subjectResourceId = uriInfo.getQueryParameters().get("subject:Patient").get(0);
        }
        if (subjectResourceId != null) {
            subjectResourceId = subjectResourceId.replaceFirst("@", "");
        }
        AtomFeed feed = createList(user, uriInfo, subjectResourceId, code);

        if (isJsonFormat(format)) {
            String responseMessage = FhirToJson.transform(feed, PRETTY);
            int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

            AuditLogger.log(user, headers, httpServletRequest, uriInfo, Response.Status.OK.getStatusCode(), responseMsgLength,
                    AuditLogger.LogCategory.AUDIT, "Entered: getList(...)", subjectResourceId, false);

            return Response.ok().type(JSON_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
        } else {
            String responseMessage = FhirToXML.transform(feed, PRETTY);
            int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

            AuditLogger.log(user, headers, httpServletRequest, uriInfo, Response.Status.OK.getStatusCode(), responseMsgLength,
                    AuditLogger.LogCategory.AUDIT, "Entered: getList(...)", subjectResourceId, false);

            return Response.ok().type(XML_FEED_FHIR_MIMETYPE).entity(responseMessage).build();
        }
    }

    @SuppressWarnings("rawtypes")
    private AtomFeed createList(User user, final UriInfo uriInfo, final String subjectResourceId, final String code) {
        AtomFeed feed = createFeed(user, List_.class, VprDomain.VITAL, uriInfo, subjectResourceId);
        feed.getEntryList().retainAll(Lists.transform(feed.getEntryList(), new Function<AtomEntry, AtomEntry>() {
            @Nullable
            @Override
            public AtomEntry apply(@Nullable AtomEntry input) {
                if ("55284-4".equals(code)) {
                    if (input.getResource() instanceof Observation) {
                        Observation observation = (Observation) input.getResource();
                        if (isNotNullish(observation.getName().getCoding())) {
                            for (Coding coding : observation.getName().getCoding()) {
                                if (EqualsBuilder.reflectionEquals(VitalsVistaToFhir.SYSTOLIC_CONCEPT, coding) || EqualsBuilder.reflectionEquals(VitalsVistaToFhir.SYSTOLIC_CONCEPT, coding)) {
                                    return input;
                                }
                            }
                        }
                    }
                }
                return null;
            }
        }));
        return feed;
    }


    /**
     * Creates and returns a new {@link AtomFeed} populated with resources
     *
     * @param user from resource authentication used for HMP services
     * @param resourceClass The class of the resources (must correspond to {@code vprDomain})
     * @param vprDomain The domain of the feed (must correspond to {@code resourceClass})
     * @param uriInfo The uriInfo of the request for this feed
     * @param subjectId The patient identifier for this feed
     * @return A populated resource feed, or a resource feed with a single empty resource if no resources are found
     */
    private <T extends Resource> AtomFeed createFeed(User user, final Class<T> resourceClass, VprDomain vprDomain, UriInfo uriInfo, String subjectId) {

        String requestUri = fixHttps(uriInfo.getRequestUri().toString());
        String resourceRootUri = fixHttps(uriInfo.getAbsolutePath().toASCIIString());

        AtomFeed feed = new AtomFeed();
        feed.setUpdated(new DateAndTime(Calendar.getInstance()));
        feed.setAuthorName(AUTHOR_NAME);
        feed.setAuthorUri(AUTHOR_URI);
        feed.setId("urn:uuid:" + UUID.randomUUID());
        feed.getLinks().put("self", requestUri);

        if (isNotNullish(subjectId)) {
            feed.setTitle(format("%s with subject.identifier '%s'", resourceClass.getSimpleName(), subjectId));
            setPatientFeed(user, feed, subjectId, resourceClass, vprDomain, resourceRootUri);
        } else {
            Map<Patient, Collection<T>> resourceMap = new HashMap<>();
            try {
                resourceMap.put(new Patient(), Collections.singleton(resourceClass.newInstance()));
            } catch (InstantiationException | IllegalAccessException e) {
                LOGGER.warn("error in createFeed.", e);
            }

            feed.setTitle(format("All %s Resources", resourceClass.getSimpleName()));
            feed.getEntryList().addAll(getEntries(resourceRootUri, resourceMap));
        }

        return feed;
    }

    /**
     * Adds resources to {@code feed} object.
     *
     * @param user from resource authentication used for HMP services
     * @param feed The feed to add resources to.
     * @param subjectId The patient of the resources
     * @param resourceClass The class of the resources (must correspond to {@code vprDomain})
     * @param vprDomain The domain of the feed (must correspond to {@code resourceClass})
     */
    private <T extends Resource> void setPatientFeed(User user, AtomFeed feed, String subjectId, Class<T> resourceClass, VprDomain vprDomain, String resourceRootUri) {
        Map<Patient, Collection<T>> resourceMap = new HashMap<>();
        Collection<T> resourcesForPatient = null;

        Patient patient;
        String pid;

        if (isResourceId(subjectId)) {
            patient = getPatientByResourceId(subjectId);
            pid = getId(patient, DemographicsVistaToFhir.PID_SYSTEM);
        } else {
            patient = new Patient();
            patient.addIdentifier().setValueSimple(subjectId).setSystemSimple(ICN_NAMESPACE);
            pid = subjectId;
        }

        try {
            resourcesForPatient = getResources(user, pid, vprDomain, resourceClass);
        } catch (ModelTransformException e) {
            LOGGER.warn("ModelTransformException in setPatientFeed", e);
        }

        feed.setTotalResults(resourcesForPatient != null ? resourcesForPatient.size() : 0);
        resourceMap.put(patient, resourcesForPatient);
        feed.getEntryList().addAll(getEntries(resourceRootUri, resourceMap));
    }

    /**
     * Returns a list of resources for the patient
     *
     * @param user from resource authentication used for HMP services
     * @param subjectId the patient identifier of the resources to return
     * @param vprDomain the domain of the resources to return
     * @return a list of resources
     * @throws ModelTransformException if there is an error converting data to FHIR format
     * @throws NotImplementedException if {@code vprDomain} is not supported
     */

    @SuppressWarnings("unchecked")
    private <T extends Resource> List<T> getResources(User user, String subjectId, VprDomain vprDomain, Class<T> resourceClass) throws ModelTransformException {
        try {
            new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, subjectId).execute();
        } catch (HystrixBadRequestException e) {
            // If patient doesn't exist, return empty list
            return Lists.newArrayList();
        }

        JsonElement json = new JdsCommand(this.jdsConfiguration, subjectId, vprDomain).execute();

        switch (vprDomain) {
            case ALLERGY:
                VPRAllergiesRpcOutput allergiesRpcOutput = new GsonBuilder().create().fromJson(json, VPRAllergiesRpcOutput.class);
                return (List<T>) new AllergiesVistaToFhir().transform(allergiesRpcOutput);
            case LAB:
                VPRLabsRpcOutput labsRpcOutput = new GsonBuilder().create().fromJson(json, VPRLabsRpcOutput.class);
                return (List<T>) new LabResultsVistaToFhir().transform(labsRpcOutput, new VistaPatientIdentity(subjectId, null, null));
            case MED:
                VPRMedicationsRpcOutput medicationsRpcOutput = new GsonBuilder().create().fromJson(json, VPRMedicationsRpcOutput.class);
                if (resourceClass == MedicationDispense.class) {
                    return (List<T>) MedVistaToFhirMedicationDispense.transform(medicationsRpcOutput, new VistaPatientIdentity(subjectId, null, null));
                } else if (resourceClass == MedicationAdministration.class) {
                    return (List<T>) MedVistaToFhirMedicationAdministration.transform(medicationsRpcOutput, new VistaPatientIdentity(subjectId, null, null)); 
                } else if (resourceClass == MedicationStatement.class) {
                    return (List<T>) MedVistaToFhirMedicationStatement.transform(medicationsRpcOutput, new VistaPatientIdentity(subjectId, null, null)); 
                } else {
                    throw new NotImplementedException();
                }
            case PATIENT:
                VPRDemographicsRpcOutput demographicRpcOutput = new GsonBuilder().create().fromJson(json, VPRDemographicsRpcOutput.class);
                return (List<T>) new DemographicsVistaToFhir().transform(demographicRpcOutput);
            case VITAL:
                VPRVitalsRpcOutput vitalsRpcOutput = new GsonBuilder().create().fromJson(json, VPRVitalsRpcOutput.class);
                return (List<T>) new VitalsVistaToFhir().transform(vitalsRpcOutput);
            case RAD:
                VPRRadiologyRpcOutput radiologyRpcOutput = new GsonBuilder().create().fromJson(json, VPRRadiologyRpcOutput.class);
                return (List<T>) new RadiologyResultsVistaToFhir().transform(radiologyRpcOutput, new VistaPatientIdentity(subjectId, null, null));
            default:
                throw new NotImplementedException();
        }
    }

    /**
     * Converts an map of patients and their associated resources into a list of {@link AtomEntry}
     *
     * @param resourceRootUri the root URI of the resource on this server
     * @param resourceMap the map of patients and resources associated with them
     * @return a list of entries, or an empty list
     */
    private <T extends Resource> List<AtomEntry<T>> getEntries(String resourceRootUri, Map<? extends Patient, Collection<T>> resourceMap) {
        List<AtomEntry<T>> entries = new ArrayList<>();
        Collection<T> resourceList;
        for (Map.Entry<? extends Patient, Collection<T>> mapEntry : resourceMap.entrySet()) {
            Patient patient = mapEntry.getKey();
            resourceList = mapEntry.getValue();
            if (resourceList != null) {
                for (T resource : resourceList) {
                    entries.add(createAtomEntry(resourceRootUri, patient, resource));
                }
            }
        }
        return entries;
    }

    /**
     * Creates and returns a {@link AtomEntry}
     *
     * @param resourceRootUri the root URI of the resource on this server
     * @param patient the patient that {@code resource} belongs to
     * @param resource the content of the entry
     * @return a new entry composed of {@code resource}
     */
    private <T extends Resource> AtomEntry<T> createAtomEntry(final String resourceRootUri, final Patient patient, final T resource) {
        String uid = getId(resource, UID_NAMESPACE);
        String icn = getId(patient, ICN_NAMESPACE);
        AtomEntry<T> entry = new AtomEntry<>();
        entry.setTitle(format("%s for patient [%s]", resource.getResourceType() == null ? "Resources" : resource.getResourceType().getPath(), icn));
        entry.setPublished(new DateAndTime(Calendar.getInstance()));
        entry.setUpdated(new DateAndTime(Calendar.getInstance()));
        entry.getLinks().put("self", format("%s/@%s", resourceRootUri, uid));
        entry.setId(format("%s/%s/%s", stripLeadingUri(resourceRootUri), icn, uid));
        entry.setResource(resource);
        entry.setAuthorName(AUTHOR_NAME);
        entry.setAuthorUri(AUTHOR_URI);
        return entry;
    }

    private String stripLeadingUri(String resourceRootUri) {
        return resourceRootUri.substring(resourceRootUri.lastIndexOf('/') + 1);
    }

    private Patient getPatientByResourceId(String resourceId) {
        JsonElement patientJsonElement = new JdsCommand(this.jdsConfiguration, resourceId).execute();
        String patientJson = new Gson().toJson(patientJsonElement);
        VPRDemographicsRpcOutput output = new Gson().fromJson(patientJson, VPRDemographicsRpcOutput.class);
        List<Patient> patients = null;
        try {
            patients = new DemographicsVistaToFhir().transform(output);
        } catch (ModelTransformException e) {
            LOGGER.warn("ModelTransformException in getPatientByResourceId.", e);
        }

        if (isNotNullish(patients)) {
            return patients.get(0);
        } else {
            return null;
        }
    }

    private String getId(Resource resource, String namespace) {
        if (resource != null) {
            Object object = FhirUtils.getBeanPropertyValue(resource, "identifier");
            if (object instanceof Collection) {
                return getId((Collection<?>) object, namespace);
            } else if (object instanceof Identifier) {
                return getId((Identifier) object, namespace);
            } else if (resource.getXmlId() != null) {
                return resource.getXmlId();
            } else {
                return resource.toString();
            }
        }
        return "";
    }

    private String getId(Collection<?> collection, String namespace) {
        for (Object object : collection) {
            if (object instanceof Identifier) {
                String id = getId((Identifier) object, namespace);
                if (id != null) {
                    return id;
                }
            }
        }
        return "";
    }

    private String getId(Identifier identifier, String namespace) {
        if (namespace.equals(identifier.getSystemSimple())) {
            return identifier.getValueSimple();
        }
        return null;
    }

    private static boolean isJsonFormat(String format) {
        return ArrayUtils.contains(JSON_MIMETYPES, format);
    }

    private boolean isResourceId(String subjectId) {
        return subjectId != null && subjectId.startsWith("urn:va:");
    }
}
