package us.vistacore.vxsync.vler;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import gov.hhs.fha.nhinc.common.nhinccommonentity.RespondingGatewayCrossGatewayQueryRequestType;
import gov.hhs.fha.nhinc.common.nhinccommonentity.RespondingGatewayCrossGatewayRetrieveRequestType;
import com.codahale.metrics.annotation.Timed;
import ihe.iti.xds_b._2007.RetrieveDocumentSetResponseType;
import oasis.names.tc.ebxml_regrep.xsd.query._3.AdhocQueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import us.vistacore.vxsync.utility.DataConverter;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static us.vistacore.vxsync.vler.VlerConnectUtil.generateDocumentListQuery;
import static us.vistacore.vxsync.vler.VlerConnectUtil.toVlerDocResponse;

@Path("/vler")
public class VlerSoapHandler {

    private static final Logger LOG = LoggerFactory.getLogger(VlerSoapHandler.class);
    private static final String VLER_DOC_TYPE_C32 = "C32 Document";
    private static final String VLER_DOC_TYPE_CCDA = "CCDA Document";
    private static final double MAX_SIZE_HTML = 1887436.8; //1.8 * 1024 * 1024;

    private static final String GENERIC_EXCEPTION = "generic-exception";
    private static final String JSON_EXCEPTION = "json-exception";
    private static final String EMPTY_RESPONSE = "empty-response";

    private final String template;
    private final String defaultName;
    private final AtomicLong counter;


    public VlerSoapHandler(String template, String defaultName) {
        this.template = template;
        this.defaultName = defaultName;
        this.counter = new AtomicLong();
    }

    /*
    This REST endpoint makes a SOAP call to VLER eHealth Exchange, gets the VLER document query response, transforms
    this into JSON string and returns it.
    @param - String icn
    @return - JSON string
     */

    /*
    Note that possible values for "test" are given by the static final String variables:
        GENERIC_EXCEPTION
        PARSE_EXCEPTION
    */
    // This method will return vlerDocQueryResponse as JSON. In the event of an error,
    // it will throw a WebApplicationException so that a 500 is returned. Additionally,
    // a 500 will be returned if the vlerDocQueryResponse cannot be converted into JSON.
    // The only possible return values should be a JSON object with a 200 status code
    // or a 500 status code with no body returned.
    @Path("/documentList")
    @GET
    @Produces("application/json")
    @Timed
    public String getDocumentList(@QueryParam("icn") String icn,
                                  @DefaultValue("false") @QueryParam("debug") String debug,
                                  @QueryParam("test") String test)
    {
        String responseJSON = null;

        try {
            VlerConfig cfg = EntityDocQueryConnection.getVlerConfig();

            LOG.debug("VlerSoapHandler.getDocumentList: icn " + icn + " systemUsername: " + cfg.getSystemUsername() + " systemSiteCode: " + cfg.getSystemSiteCode());
            RespondingGatewayCrossGatewayQueryRequestType requestDocument;
            requestDocument = generateDocumentListQuery(icn, cfg.getSystemUsername(), cfg.getSystemSiteCode());
            if ("true".equals(debug)) {
                LOG.warn("XML REQUEST->JSON");
                LOG.warn(DataConverter.convertObjectToJSON(requestDocument));
            }

            AdhocQueryResponse adhocQueryResponse = EntityDocQueryConnection.getInstance().
                    respondingGatewayCrossGatewayQuery(requestDocument);

            if (GENERIC_EXCEPTION.equals(test)) {
                throw new RuntimeException("Test Exception");
            }

            // A vlerDocQueryResponse object is always returned (barring an exception), although
            // it might be empty or have its error flag set.
            VlerDocQueryResponse vlerDocQueryResponse = toVlerDocResponse(adhocQueryResponse);
            LOG.debug("VlerSoapHandler.getDocumentList: results size " + vlerDocQueryResponse.getDocumentList().size());

            if (vlerDocQueryResponse.isError()) {
                LOG.error("VlerSoapHandler.getDocumentList() error - " + vlerDocQueryResponse.getErrorMsg());
            }

            // simulate an exception when transforming object to JSON if 'test' param == JSON_EXCEPTION
            responseJSON = !JSON_EXCEPTION.equals(test) ? DataConverter.convertObjectToJSON(vlerDocQueryResponse) : null;
            if ("true".equals(debug)) {
                LOG.warn("XML RESPONSE->JSON");
                LOG.warn(responseJSON);
            }
        }
        catch (Exception e)
        {
            LOG.error("VlerSoapHandler.getDocumentList() exception " + e);
            throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
        }

        // a null value means that an exception occurred when converting into JSON, so
        // throw a WebApplicationException and return a status code of 500.
        if (responseJSON == null) {
            LOG.error("VlerSoapHandler.getDocument() failed to parse JSON response to document list request");
            throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
        }

        return responseJSON;
    }


    /*
    Note that possible values for "test" are given by the static final String variables:
        GENERIC_EXCEPTION
        PARSE_EXCEPTION
        EMPTY_RESPONSE
    */
    // This method will return vlerRetrieveResponse as JSON. In the event of an error,
    // it will throw a WebApplicationException so that a 500 is returned. Additionally,
    // a 500 will be returned if the vlerRetrieveResponse cannot be converted into JSON.
    // The only possible return values should be a JSON object with a 200 status code
    // or a 500 status code with no body returned.
    @Path("/document")
    @GET
    @Produces("application/json")
    @Timed
    public String getDocument(@QueryParam("icn") String icn,
                              @QueryParam("documentUniqueId") String documentUniqueId,
                              @QueryParam("homeCommunityId") String homeCommunityId,
                              @QueryParam("repositoryUnqiueId") String repositoryUniqueId,
                              @DefaultValue("false") @QueryParam("debug") String debug,
                              @QueryParam("test") String test) {
        String responseJSON = null;

        try {
            LOG.debug("VlerSoapHandler.getDocument - icn " + icn + ", documentUniqueId: " + documentUniqueId + ", " +
                    "homeCommunityId: " + homeCommunityId + ", repositoryUniqueId: " + repositoryUniqueId);

            VlerConfig cfg = EntityDocRetrieveConnection.getVlerConfig();

            RespondingGatewayCrossGatewayRetrieveRequestType requestDocument;
            requestDocument = VlerConnectUtil.generateDocumentQuery(icn, documentUniqueId,
                            homeCommunityId, repositoryUniqueId, cfg.getSystemSiteCode());

            if ("true".equals(debug)) {
                LOG.warn("XML REQUEST->JSON");
                LOG.warn(DataConverter.convertObjectToJSON(requestDocument));
            }
            RetrieveDocumentSetResponseType response = EntityDocRetrieveConnection.getInstance().
                    respondingGatewayCrossGatewayRetrieve(requestDocument);

            if (GENERIC_EXCEPTION.equals(test)) {
                throw new RuntimeException("Test Exception");
            }

            VlerDocRetrieveResponse vlerRetrieveResponse = new VlerDocRetrieveResponse();

            // simulate an empty response
            if (EMPTY_RESPONSE.equals(test)) {
                response = null;
            }

            // If no document is found, return the vlerRetrieveResponse with the error flag set
            // and the error message populated.
            if (response == null ||
                response.getDocumentResponse() == null ||
                response.getDocumentResponse().size() == 0 ||
                response.getDocumentResponse().get(0) == null ||
                response.getDocumentResponse().get(0).getDocument() == null)
            {
                vlerRetrieveResponse.setError(true);
                vlerRetrieveResponse.setErrorMsg("VLER document is null");

                return DataConverter.convertObjectToJSON(vlerRetrieveResponse);
            }

            byte[] rawDoc = response.getDocumentResponse().get(0).getDocument();
            Document xmlDoc = VlerDocumentUtil.parseXMLDocument(rawDoc);
            String htmlDoc;

            if (VlerDocumentUtil.isCcdaDoc(xmlDoc)) {
                htmlDoc = VlerDocumentUtil.xsltCcdaDocument(new String(rawDoc, "UTF-8"));
                vlerRetrieveResponse.setVlerDocType(VLER_DOC_TYPE_CCDA);
            } else {
                htmlDoc = VlerDocumentUtil.xsltC32Document(new String(rawDoc, "UTF-8"));
                vlerRetrieveResponse.setVlerDocType(VLER_DOC_TYPE_C32);
            }

            htmlDoc = htmlDoc.replaceAll("(\\r|\\n|\\t)", "");
            if (MAX_SIZE_HTML < htmlDoc.getBytes().length) {
                vlerRetrieveResponse.setCompressRequired(true);
            }

            vlerRetrieveResponse.setVlerDocHtml(htmlDoc.replaceAll("\"","\'"));

            // simulate an exception when transforming object to JSON if 'test' param == JSON_EXCEPTION
            responseJSON = !JSON_EXCEPTION.equals(test) ? DataConverter.convertObjectToJSON(vlerRetrieveResponse) : null;
            if ("true".equals(debug)) {
                LOG.warn("XML RESPONSE->JSON");
                LOG.warn(responseJSON);
            }
        }
        catch (Exception e) {
            LOG.error("VlerSoapHandler.getDocument() exception " + e);
            throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
        }

        // a null value means that an exception occurred when converting into JSON, so
        // throw a WebApplicationException and return a status code of 500.
        if (responseJSON == null) {
            LOG.error("VlerSoapHandler.getDocument() failed to parse JSON response to document request");
            throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
        }

        return responseJSON;
    }
}
