package us.vistacore.ehmp;

import us.vistacore.aps.VistaConfiguration;
import us.vistacore.aps.VistaConfigurationDispenser;
import us.vistacore.aps.VistaConfigurationDispenserException;
import us.vistacore.ehmp.authentication.EhmpAuthenticator;
import us.vistacore.ehmp.authorization.PDPConnectionPropertiesFactory;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.health.ApsHealthCheck;
import us.vistacore.ehmp.health.HmpHealthCheck;
import us.vistacore.ehmp.health.JdsHealthCheck;
import us.vistacore.ehmp.health.VistAHealthCheck;
import us.vistacore.ehmp.resources.AdminResource;
import us.vistacore.ehmp.resources.FhirResource;
import us.vistacore.ehmp.resources.MockCDSResource;
import us.vistacore.ehmp.resources.MockVlerDasResource;
import us.vistacore.ehmp.resources.VprResource;
import us.vistacore.ehmp.webapi.HystrixRuntimeExceptionMapper;
import us.vistacore.ehmp.webapi.OperationalSyncCheckFilter;
import us.vistacore.ehmp.webapi.logging.RuntimeExceptionMapper;
import us.vistacore.ehmp.webapi.logging.SocketExceptionMapper;
import us.vistacore.ehmp.webapi.meta.MetaResource;

import com.axiomatics.sdk.connections.PDPConnectionException;
import com.axiomatics.sdk.connections.PDPConnectionFactory;
import com.axiomatics.sdk.connections.aps5.soap.Aps5SimpleSoapPDPConnectionProperties;
import com.google.common.collect.ImmutableMap;
import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
import com.netflix.hystrix.contrib.requestservlet.HystrixRequestContextServletFilter;
import com.sun.jersey.api.core.ResourceConfig;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.auth.basic.BasicAuthProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import java.io.IOException;
import java.util.EnumSet;

import javax.servlet.DispatcherType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class VeApiApplication extends Application<VeApiConfiguration> {
    private static Logger logger = LoggerFactory.getLogger(VeApiApplication.class);

    public static void main(String[] args) throws Exception {
        new VeApiApplication().run(args);
    }

    @Override
    public String getName() {
        return "eHMP FHIR Application";
    }

    @Override
    public void initialize(Bootstrap<VeApiConfiguration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle());
        bootstrap.addBundle(new ViewBundle());
    }

    @Override
    public void run(VeApiConfiguration configuration, Environment environment) throws PDPConnectionException, IOException {
        logger.info("starting run()");
        logger.info("configuration: " + configuration);

        logger.info("set FEATURE_MATCH_MATRIX_PARAMS=true to allow @PathParams with semicolons");
        environment.jersey().getResourceConfig().setPropertiesAndFeatures(ImmutableMap.<String, Object> builder().put(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true).build());

        // Add a RuntimeExceptionMapper to the Environment to support
        // better logging and error handling for these types of errors.
        //-------------------------------------------------------------
        environment.jersey().register(new RuntimeExceptionMapper());

        // Add an ExceptionMapper to return a proper message
        // when a SocketException is thrown because a web service
        // cannot be contacted or some other communication failure has occurred.
        environment.jersey().register(new SocketExceptionMapper());

        logger.info("register HystrixRuntimeExceptionMapper");
        environment.jersey().register(new HystrixRuntimeExceptionMapper());

        logger.info("register MetaResource");
        environment.jersey().register(new MetaResource());

        logger.info("register healthChecks");
        environment.healthChecks().register("JDS", new JdsHealthCheck(configuration.getJdsConfiguration()));
        environment.healthChecks().register("HMP", new HmpHealthCheck(configuration.getHmpConfiguration()));
        environment.healthChecks().register("APS", new ApsHealthCheck(configuration.getApsConfiguration()));
        for (VistaConfiguration vista : configuration.getVistaConfigList()) {
            environment.healthChecks().register("vista-" + vista.getName(), new VistAHealthCheck(vista));
        }

        VistaConfigurationDispenser vistaConfigurations = null;
        try {
            vistaConfigurations = new VistaConfigurationDispenser(configuration.getVistaConfigList());
        } catch (VistaConfigurationDispenserException e) {
            logger.warn("Failed initializing VistaConfigurationDispenser", e);
        }

        logger.info("create PEP and connect to PDP");
        Aps5SimpleSoapPDPConnectionProperties propertiesInstance = PDPConnectionPropertiesFactory.getPropertiesInstance(configuration.getApsConfiguration());
        PEP pep = new PEP(PDPConnectionFactory.getPDPConnection(propertiesInstance), vistaConfigurations, configuration.getApsConfiguration());

        logger.info("register EhmpAuthenticator");
        environment.jersey().register(new BasicAuthProvider<>(new EhmpAuthenticator(vistaConfigurations, configuration.getApsConfiguration()), "Fhir Application"));

        logger.info("register FhirResource");
        environment.jersey().register(new FhirResource(configuration.getHmpConfiguration(), configuration.getJdsConfiguration(), pep));

        logger.info("register JdsResource");
        environment.jersey().register(new VprResource(configuration.getHmpConfiguration(), configuration.getJdsConfiguration(), pep));

        logger.info("register AdminResource");
        environment.jersey().register(new AdminResource(configuration.getHmpConfiguration(), configuration.getJdsConfiguration()));

        logger.info("register MockCDSResource");
        environment.jersey().register(new MockCDSResource());
        
        logger.info("register MockVlerDasResource");
        environment.jersey().register(new MockVlerDasResource());

        logger.info("register HystrixRequestContextServletFilter");
        environment.servlets().addFilter("HystrixRequestContextServletFilter", new HystrixRequestContextServletFilter()).addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        logger.info("register OperationalSyncCheckFilter");
        environment.servlets().addFilter("OperationalSyncCheckFilter", new OperationalSyncCheckFilter(configuration.getJdsConfiguration())).addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        logger.info("register HystrixMetricsStreamServlet");
        environment.servlets().addServlet("HystrixMetricsStreamServlet", new HystrixMetricsStreamServlet()).addMapping("/hystrix.stream");

        logger.info("finished run()");
    }
}
