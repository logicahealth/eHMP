package us.vistacore.vxsync.vler;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;

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

    private final String template;
    private final String defaultName;
    private final AtomicLong counter;


    public VlerSoapHandler(String template, String defaultName) {
        this.template = template;
        this.defaultName = defaultName;
        this.counter = new AtomicLong();
    }

    /*
	This REST endpoint makes a SOAP call to VLER eHealth Exchange, gets the VLER document query response, transforms this into JSON string and returns it.
	@param - String icn
	@return - JSON string
	 */

    @Path("/documentList")
    @GET
    @Produces("application/json")
    @Timed
    public String getDocumentList(@QueryParam("icn") String icn, @DefaultValue("false") @QueryParam("debug") String debug)
    {
        try
        {
            VlerConfig cfg = EntityDocQueryConnection.getVlerConfig();

            LOG.debug("VlerSoapHandler.getDocumentList: icn "+icn + " systemUsername: " + cfg.getSystemUsername() + " systemSiteCode: " + cfg.getSystemSiteCode());
            RespondingGatewayCrossGatewayQueryRequestType requestDocument;
            requestDocument = generateDocumentListQuery(icn, cfg.getSystemUsername(), cfg.getSystemSiteCode());
            if ("true".equals(debug)) {
                LOG.warn("XML REQUEST->JSON");
                LOG.warn(DataConverter.convertObjectToJSON(requestDocument));
            }
            AdhocQueryResponse adhocQueryResponse = EntityDocQueryConnection.getInstance().
                    respondingGatewayCrossGatewayQuery(requestDocument);

            VlerDocQueryResponse vlerDocQueryResponse = toVlerDocResponse(adhocQueryResponse);
            LOG.debug("VlerSoapHandler.getDocumentList: results size "+vlerDocQueryResponse.getDocumentList().size());

            if (vlerDocQueryResponse.isError()) {
                LOG.error("VlerSoapHandler.getDocumentList() error - " + vlerDocQueryResponse.getErrorMsg());
            }

            String responseJSON = DataConverter.convertObjectToJSON(vlerDocQueryResponse);
            if ("true".equals(debug)) {
                LOG.warn("XML RESPONSE->JSON");
                LOG.warn(responseJSON);
            }
            return (responseJSON);
        }
        catch (Exception e)
        {
            LOG.error("VlerSoapHandler.getDocumentList() exception " + e);
            return null;
        }
    }

    @Path("/document")
    @GET
    @Produces("application/json")
    @Timed
    public String getDocument(@QueryParam("icn") String icn,
                              @QueryParam("documentUniqueId") String documentUniqueId,
                              @QueryParam("homeCommunityId") String homeCommunityId,
                              @QueryParam("repositoryUnqiueId") String repositoryUniqueId,
                              @DefaultValue("false") @QueryParam("debug") String debug) {
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


            VlerDocRetrieveResponse vlerRetrieveResponse = new VlerDocRetrieveResponse();

            if (response == null ||
                response.getDocumentResponse() == null ||
                response.getDocumentResponse().size() == 0 ||
                response.getDocumentResponse().get(0) == null ||
                response.getDocumentResponse().get(0).getDocument() == null)
            {
                vlerRetrieveResponse.setError(true);
                vlerRetrieveResponse.setErrorMsg("VLER document is null");

                return (DataConverter.convertObjectToJSON(vlerRetrieveResponse));
            }

            Document xmlDoc = VlerDocumentUtil.parseXMLDocument(response.getDocumentResponse().get(0).getDocument());
            String htmlDoc;

            if (VlerDocumentUtil.isCcdaDoc(xmlDoc)) {
                htmlDoc = VlerDocumentUtil.xsltCcdaDocument(new String(response.getDocumentResponse().get(0).getDocument(), "UTF-8"));
                vlerRetrieveResponse.setVlerDocType(VLER_DOC_TYPE_CCDA);
            }else {
                htmlDoc = VlerDocumentUtil.xsltC32Document(new String(response.getDocumentResponse().get(0).getDocument(), "UTF-8"));
                vlerRetrieveResponse.setVlerDocType(VLER_DOC_TYPE_C32);
            }
            htmlDoc = htmlDoc.replaceAll("(\\r|\\n|\\t)", "");
	        if (MAX_SIZE_HTML < htmlDoc.getBytes().length) {
                vlerRetrieveResponse.setCompressRequired(true);
            }
            vlerRetrieveResponse.setVlerDocHtml(htmlDoc.replaceAll("\"","\'"));

            String responseJSON = DataConverter.convertObjectToJSON(vlerRetrieveResponse);
            if ("true".equals(debug)) {
                LOG.warn("XML RESPONSE->JSON");
                LOG.warn(responseJSON);
            }
            return (responseJSON);
        }
        catch (Exception e) {
            LOG.error("VlerSoapHandler.getDocument() exception " + e);
            return null;
        }
    }
}
