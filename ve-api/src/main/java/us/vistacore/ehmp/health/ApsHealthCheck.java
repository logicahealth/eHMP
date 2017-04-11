package us.vistacore.ehmp.health;

import static java.lang.String.format;

import javax.ws.rs.core.MediaType;

import org.eclipse.jetty.server.Response;

import us.vistacore.aps.ApsConfiguration;

import com.codahale.metrics.health.HealthCheck;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.DefaultClientConfig;

/**
 * This class provides a health check for APS.
 *
 * You can also see detailed APS info at <server>:<port>/asm/APP/1/status.txt
 */
public class ApsHealthCheck extends HealthCheck {

    private static final String LANDING_PAGE = "/asm";

    private ApsConfiguration apsConfiguration;

    public ApsHealthCheck(ApsConfiguration apsConfiguration) {
        this.apsConfiguration = apsConfiguration;
    }

    @Override
    protected Result check() throws Exception {
        Client client = Client.create(new DefaultClientConfig());
        String host = format("http://%s:%s", apsConfiguration.getHost(), apsConfiguration.getPort());
        WebResource resource = client.resource(host + LANDING_PAGE);

        if (resource.accept(MediaType.APPLICATION_JSON).get(ClientResponse.class).getStatus() == Response.SC_OK) {
            return HealthCheck.Result.healthy();
        }
        return HealthCheck.Result.unhealthy("Could not connect to " + resource.getURI());
    }
}
