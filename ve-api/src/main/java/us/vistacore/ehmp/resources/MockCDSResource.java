package us.vistacore.ehmp.resources;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

import us.vistacore.ehmp.webapi.JsonResponseMessage;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

import java.io.IOException;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("repositories.domain.ext")
public class MockCDSResource {

    private static Logger logger = LoggerFactory.getLogger(MockCDSResource.class);
    
    private static final String DATA_RESOURCE_PATH = "mockcds/";
    private static final String DATA_RESOURCE_EXTENSION = ".json";
    
    private static final String EXPECTED_TEMPLATE = "GenericObservationRead1";
    private static final String EXPECTED_FILTER = "GENERIC_VISTA_LIST_DATA_FILTER";
    private static final String EXPECTED_TYPE = "json";

    @GET
    @Path("/fpds/{templateId}/{filterId}/{patientId}/{domain}")
    public Response fpds(@PathParam("templateId") String templateId, 
                         @PathParam("filterId") String filterId, 
                         @PathParam("patientId") String patientId, 
                         @PathParam("domain") String domain,
                         @QueryParam("clientName") String clientName,
                         @QueryParam("excludedIdentifier") String excludedIdentifier,
                         @QueryParam("siteId") String siteId, // "excluded Id site"
                         @QueryParam("text") String text,
                         @QueryParam("start") String start, // yyyy-MM-dd
                         @QueryParam("stop") String stop, // yyyy-MM-dd
                         @QueryParam("max") int max,
                         @QueryParam("id") String id,
                         @QueryParam("requestId") String requestId,
                         @DefaultValue(EXPECTED_TYPE) @QueryParam("_type") String type) {
        Response.Status status = Response.Status.INTERNAL_SERVER_ERROR;
        String content = "";
        
        try {
            content = Resources.toString(Resources.getResource(DATA_RESOURCE_PATH + domain + DATA_RESOURCE_EXTENSION), Charsets.UTF_8);
            status = Response.Status.OK;

            if (!EXPECTED_TEMPLATE.equalsIgnoreCase(templateId)) {
                status = Response.Status.BAD_REQUEST;
                content = buildJsonResponse(status, "Bad Template Id: " + templateId);
            } else if (!EXPECTED_FILTER.equalsIgnoreCase(filterId)) {
                status = Response.Status.BAD_REQUEST;
                content = buildJsonResponse(status, "Bad Filter Id: " + filterId);
            } else if (isNullish(clientName)) {
                status = Response.Status.BAD_REQUEST;
                content = buildJsonResponse(status, "Missing required parameter: clientName");
            } else if ((isNotNullish(type)) && !EXPECTED_TYPE.equalsIgnoreCase(type)) {
                status = Response.Status.BAD_REQUEST;
                content = buildJsonResponse(status, "Requested datatype of " + type + " is not supported.");
            }
        } catch (IOException | IllegalArgumentException e) {
            logger.warn("MockCDSResource.fpds: Error while reading data file.", e);
            status = Response.Status.BAD_REQUEST;
            content = buildJsonResponse(status, "Requested data domain of " + domain + " is not supported.");
        }
        
        return Response.status(status).type(MediaType.APPLICATION_JSON).entity(content).build();
    }

    private String buildJsonResponse(Response.Status status, String content) {
        return new JsonResponseMessage(status, content).toJson();
    }

}
