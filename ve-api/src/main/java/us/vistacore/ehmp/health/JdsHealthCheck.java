package us.vistacore.ehmp.health;

import com.codahale.metrics.health.HealthCheck;
import us.vistacore.ehmp.command.JdsCommand;
import us.vistacore.ehmp.config.JdsConfiguration;

public class JdsHealthCheck extends HealthCheck {

    private static final String RUNNING_STATUS = "{\"status\":\"running\"}";

    private JdsConfiguration jdsConfiguration;

    public JdsHealthCheck(JdsConfiguration jdsConfiguration) {
        this.jdsConfiguration = jdsConfiguration;
    }

    @Override
    protected Result check() throws Exception {
        String status = JdsCommand.get(this.jdsConfiguration, "/ping");
        if (status != null && status.trim().equals(RUNNING_STATUS)) {
            return Result.healthy();
        } else {
            return Result.unhealthy(status);
        }
    }

}
