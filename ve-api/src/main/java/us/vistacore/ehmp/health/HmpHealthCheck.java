package us.vistacore.ehmp.health;

import com.codahale.metrics.health.HealthCheck;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.util.ClientBuilder;

import javax.ws.rs.core.MediaType;

import static java.lang.String.format;

public class HmpHealthCheck extends HealthCheck {

    private static final String OPERATIONAL_STATUS_PATH = "/sync/operationalSyncStatus";

    private HmpConfiguration hmpConfiguration;

    public HmpHealthCheck(HmpConfiguration hmpConfiguration) {
        this.hmpConfiguration = hmpConfiguration;
    }

    @Override
    protected Result check() throws Exception {
        Client client = ClientBuilder.createClient();
        String host = format("https://%s:%s", hmpConfiguration.getHost(), hmpConfiguration.getPort());
        WebResource resource = client.resource(host + OPERATIONAL_STATUS_PATH);
        String status = resource.accept(MediaType.APPLICATION_JSON).get(String.class);

        if (new Gson().fromJson(status, JsonObject.class).get("syncOperationalComplete").getAsBoolean()) {
            return Result.healthy();
        } else {
            return Result.unhealthy(status);
        }
    }

}
