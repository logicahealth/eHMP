package us.vistacore.ehmp.health;

import com.codahale.metrics.health.HealthCheck;
import com.vistacowboy.jVista.VistaConnection;
import us.vistacore.aps.VistaConfiguration;

public class VistAHealthCheck extends HealthCheck {

    private VistaConfiguration vistaConfiguration;

    public VistAHealthCheck(VistaConfiguration vistaConfiguration) {
        this.vistaConfiguration = vistaConfiguration;
    }

    @Override
    protected Result check() throws Exception {
        VistaConnection connection = new VistaConnection(vistaConfiguration.getHost(), Integer.valueOf(vistaConfiguration.getPort()));
        connection.connect();
        if (!connection.getIsConnected()) {
            return Result.unhealthy("Cannot connect to " + vistaConfiguration.getHost() + " on port " + vistaConfiguration.getPort());
        }
        return Result.healthy();
    }
}
