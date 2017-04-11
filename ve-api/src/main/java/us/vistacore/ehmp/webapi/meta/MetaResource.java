package us.vistacore.ehmp.webapi.meta;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * Resource for Metadata.
 */
@Path("/meta")
@Produces(MediaType.APPLICATION_JSON)
public class MetaResource {
    @SuppressWarnings("unused")
    private static final Logger LOGGER = LoggerFactory.getLogger(MetaResource.class);

    /**
     * Gets metadata object describing the application.
     *
     * @return 200 response if successful
     */
    @GET
    public MetaData showMetaData() {
        MetaData metadata = new MetaData();
        return metadata;
    }
}
