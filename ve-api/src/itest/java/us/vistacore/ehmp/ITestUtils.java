package us.vistacore.ehmp;

import ch.qos.logback.classic.Level;
import com.axiomatics.sdk.connections.PDPConnectionException;
import com.axiomatics.sdk.connections.PDPConnectionFactory;
import com.axiomatics.sdk.connections.aps5.soap.Aps5SimpleSoapPDPConnectionProperties;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import com.google.gson.GsonBuilder;
import io.dropwizard.configuration.ConfigurationException;
import io.dropwizard.configuration.ConfigurationFactory;
import io.dropwizard.jackson.Jackson;
import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfiguration;
import us.vistacore.aps.VistaConfigurationDispenser;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.PDPConnectionPropertiesFactory;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;

import javax.validation.Validation;
import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertTrue;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

public final class ITestUtils {

    /**
     * This Utility class should not be instantiated.
     */
    private ITestUtils() { }

    public static final String CONFIG_FILE_PROPERTY = "itest.config";

    private static final String APS_RESOURCE = "aps.json";

    /**
     * Returns the configuration file passed as an 'itest.config' system property, or default config.json if no such property is set.
     * @return a configuration for the Fhir application
     */
    protected static VeApiConfiguration getConfiguration() {
        String configFileName = System.getProperty(CONFIG_FILE_PROPERTY);
        VeApiConfiguration config;

        if (isNullish(configFileName)) {
            throw new IllegalStateException("No system property itest.config set. Are you running using 'gradle itest'?");
        }

        File configFile = new File(configFileName);
        assertTrue("Configuration file " + configFileName + " does not exist.", configFile.exists());
        assertTrue("Cannot read file " + configFileName, configFile.canRead());

        ConfigurationFactory<VeApiConfiguration> configFactory =
                new ConfigurationFactory<VeApiConfiguration>(VeApiConfiguration.class, Validation.buildDefaultValidatorFactory().getValidator(), Jackson.newObjectMapper(), "dw");

        try {
            config = configFactory.build(configFile);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        } catch (ConfigurationException e) {
            e.printStackTrace();
            return null;
        }

        return config;
    }

    /**
     * Set logging level
     * @param level Level to set logging
     */
    public static void setLoggingLevel(Level level) {
        ch.qos.logback.classic.Logger root = (ch.qos.logback.classic.Logger) org.slf4j.LoggerFactory.getLogger(ch.qos.logback.classic.Logger.ROOT_LOGGER_NAME);
        root.setLevel(level);
    }
    
    public static User getUser() {
    	return new User("pu1234", "pu1234!!", "9E7A", "500");
    }

    public static JdsConfiguration getJdsConfiguration() {
        String ip = System.getProperty("JDS_IP");
        JdsConfiguration jdsConfiguration = getConfiguration().getJdsConfiguration();
        jdsConfiguration.setHost(ip);
        return jdsConfiguration;
    }

    public static HmpConfiguration getHmpConfiguration() {
        String ip = System.getProperty("EHMP_IP");
        HmpConfiguration hmpConfiguration = getConfiguration().getHmpConfiguration();
        hmpConfiguration.setHost(ip);
        return hmpConfiguration;
    }

    public static JdsConfiguration getJdsConfiguration(int veInstance) {
        if (veInstance == 1) {
            return getJdsConfiguration();
        }

        String ip = System.getProperty("VE" + veInstance + "_JDS_IP");
        JdsConfiguration jdsConfiguration = getConfiguration().getJdsConfiguration();
        jdsConfiguration.setHost(ip);
        return jdsConfiguration;
    }

    public static HmpConfiguration getHmpConfiguration(int veInstance) {
        if (veInstance == 1) {
            return getHmpConfiguration();
        }

        String ip = System.getProperty("VE" + veInstance + "_EHMP_IP");
        HmpConfiguration hmpConfiguration = getConfiguration().getHmpConfiguration();
        hmpConfiguration.setHost(ip);
        return hmpConfiguration;
    }

    public static VistaConfigurationDispenser getVistaConfigurationDispenser() {
        List<VistaConfiguration> vistaConfigs = getConfiguration().getVistaConfigList();
        for (VistaConfiguration vistaConfiguration : vistaConfigs) {
            if (vistaConfiguration.getName().equalsIgnoreCase("panorama")) {
                vistaConfiguration.setHost(System.getProperty("VISTA_PANORAMA_IP"));
            }
            if (vistaConfiguration.getName().equalsIgnoreCase("kodak")) {
                vistaConfiguration.setHost(System.getProperty("VISTA_KODAK_IP"));
            }
        }

        return new VistaConfigurationDispenser(vistaConfigs);
    }

    public static ApsConfiguration getApsConfiguration() {
        try {
            ApsConfiguration apsConfiguration = new GsonBuilder().create().fromJson(Resources.toString(Resources.getResource(APS_RESOURCE), Charsets.UTF_8), ApsConfiguration.class);
            apsConfiguration.setHost(System.getProperty("APS_IP"));
            return apsConfiguration;
        } catch (IOException e) {
            org.junit.Assert.fail("IOException reading " + APS_RESOURCE);
            return null;
        }
    }

    public static PEP getPEP() {
        try {
            Aps5SimpleSoapPDPConnectionProperties propertiesInstance = PDPConnectionPropertiesFactory.getPropertiesInstance(getApsConfiguration());
            return new PEP(PDPConnectionFactory.getPDPConnection(propertiesInstance), getVistaConfigurationDispenser(), getApsConfiguration());
        } catch (PDPConnectionException e) {
            throw new RuntimeException("Failed to connect to PDP.");
        }
    }

    public static boolean isVe2Up() {
        return System.getProperty("VE2STATUS", "down").equalsIgnoreCase("up");
    }

    public static String getVeInstanceMessage(int veInstance) {
        if (!isVe2Up()) {
            return null;
        }
        return "On VE Instance #" + veInstance;
    }

    public static void fail(int veInstance, Throwable errorToHandle) {
        String label = isVe2Up() ? (getVeInstanceMessage(veInstance) + ": ") : "";
        String reason = errorToHandle.getMessage();
        org.junit.Assert.fail(label + reason);
    }

}
