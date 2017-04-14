package us.vistacore.vxsync.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.Configuration;
import org.hibernate.validator.constraints.NotEmpty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.vxsync.dod.JMeadowsVersion;
import us.vistacore.vxsync.dod.JMeadowsVersionUtil;
import us.vistacore.vxsync.hdr.HdrConnection;
import us.vistacore.vxsync.mvi.MessageBuilder;
import us.vistacore.vxsync.mvi.MviSoapConnection;
import us.vistacore.vxsync.term.TerminologyService;
import us.vistacore.vxsync.vler.EntityDocQueryConnection;
import us.vistacore.vxsync.vler.EntityDocRetrieveConnection;
import us.vistacore.vxsync.vler.VlerConfig;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;


public class VxSoapConfiguration extends Configuration {
    @NotEmpty
    @JsonProperty
    private String template;

    @NotEmpty
    @JsonProperty
    private String defaultName = "VX Sync";

    @Valid
    @NotNull
    @JsonProperty("service")
    private ServicesEnabled servicesEnabled = new ServicesEnabled();

    @Valid
    @JsonProperty("hdr")
    private HdrConfiguration hdrConfiguration = new HdrConfiguration();

    @Valid
    @JsonProperty("pgd")
    private PgdConfiguration pgdConfiguration = new PgdConfiguration();

    @Valid
    @JsonProperty("vler")
    private VlerConfiguration vlerConfiguration = new VlerConfiguration();

    @Valid
    @JsonProperty("jmeadows-version")
    private String jMeadowsVersion;

    @Valid
    @JsonProperty("jmeadows-v2.3.0")
    private DodConfiguration jMeadowsConfigurationV2_3_0 = new DodConfiguration();

    @Valid
    @JsonProperty("jmeadows-v2.3.1")
    private DodConfiguration jMeadowsConfigurationV2_3_1 = new DodConfiguration();

    @Valid
    @JsonProperty("jmeadows-v2.3.3.0.2")
    private DodConfiguration jMeadowsConfigurationV2_3_3_0_2 = new DodConfiguration();

    @Valid
    @JsonProperty("mvi")
    private MviConfiguration mviConfiguration = new MviConfiguration();

    @Valid
    @JsonProperty("h2")
    private H2Configuration h2Configuration = new H2Configuration();

    @Valid
    @JsonProperty("security")
    private SecurityConfiguration securityConfig = new SecurityConfiguration();

    private static final Logger LOG = LoggerFactory.getLogger(VxSoapConfiguration.class);


    public ServicesEnabled getServicesEnabled() {
        return servicesEnabled;
    }

    public void setServicesEnabled(ServicesEnabled service) {
        this.servicesEnabled = service;
    }

    public String getTemplate() {
        return template;
    }

    public String getDefaultName() {
        return defaultName;
    }

    public HdrConfiguration getHdrConfiguration() {
        return hdrConfiguration;
    }


    public PgdConfiguration getPgdConfiguration() {
        return pgdConfiguration;
    }

    public void setPgdConfiguration(PgdConfiguration pgdConfiguration) {
        this.pgdConfiguration = pgdConfiguration;
    }

    public VlerConfiguration getVlerConfiguration() {
        return vlerConfiguration;
    }

    public void setVlerConfiguration(VlerConfiguration vlerConfiguration) {

        this.vlerConfiguration = vlerConfiguration;

        LOG.debug("VxSoapConfiguration.setVlerConfiguration - Entering method...()");

        VlerConfig vlerConfig = new VlerConfig();

        vlerConfig.setDocQueryUrl(generateUrlString(vlerConfiguration.getProtocol(),
                vlerConfiguration.getHost(),
                vlerConfiguration.getPort(),
                vlerConfiguration.getDocquerypath(),
                vlerConfiguration.getDocquerypathquery()));

        vlerConfig.setDocQueryTimeoutMs(Integer.parseInt(vlerConfiguration.getDocretrievetimeoutms()));

        vlerConfig.setDocRetrieveUrl(generateUrlString(vlerConfiguration.getProtocol(),
                vlerConfiguration.getHost(),
                vlerConfiguration.getPort(),
                vlerConfiguration.getDocretrievepath(),
                vlerConfiguration.getDocretrievepathquery()));

        vlerConfig.setDocRetrieveTimeoutMs(Integer.parseInt(vlerConfiguration.getDocquerytimeoutms()));
        vlerConfig.setSystemUsername(vlerConfiguration.getSystemusername());
        vlerConfig.setSystemSiteCode(vlerConfiguration.getSystemsitecode());

        EntityDocQueryConnection.setVlerConfig(vlerConfig);
        EntityDocRetrieveConnection.setVlerConfig(vlerConfig);

    }

    public JMeadowsVersion getjMeadowsVersion() {
        return JMeadowsVersion.getVersion(jMeadowsVersion);
    }

    public DodConfiguration getjMeadowsConfigurationV2_3_0()
    {
        return jMeadowsConfigurationV2_3_0;
    }

    public DodConfiguration getjMeadowsConfigurationV2_3_1()
    {
        return jMeadowsConfigurationV2_3_1;
    }

    public DodConfiguration getjMeadowsConfigurationV2_3_3_0_2()
    {
        return jMeadowsConfigurationV2_3_3_0_2;
    }


    public MviConfiguration getMviConfiguration() {
    	return mviConfiguration;
    }

    public void setMviConfiguration(MviConfiguration mviConfiguration) {
    	this.mviConfiguration = mviConfiguration;
    	MviSoapConnection.setConfiguration(mviConfiguration);
        MessageBuilder.setConfiguration(mviConfiguration);
    }

    public H2Configuration getH2Configuration() {
    	return h2Configuration;
    }

    public void setH2Configuration(H2Configuration h2Config) {
    	this.h2Configuration = h2Config;
    	TerminologyService.setConfiguration(h2Config);
    }

       /*
    Get the configuration details from config.json and populate it
    @param - HdrConfiguration hdrConfiguration - contains hdr configuration from config.json
     */

    public void setHdrConfiguration(HdrConfiguration hdrConfiguration)
    {
        LOG.debug("VxSoapConfiguration.setHdrConfiguration - Entering method...()");

        HdrConfiguration hdrConfig = new HdrConfiguration();
        hdrConfig.setProtocol(hdrConfiguration.getProtocol());
        hdrConfig.setUri(hdrConfiguration.getUri());
        hdrConfig.setPath(hdrConfiguration.getPath());
        HdrConnection.setHdrConfig(hdrConfig);
    }


    /*
        Get the configuration details from config.json for jMeadows-v2.3.0 and populate it in JMeadowsConfigService
        @param - DodConfiguration jMeadowsConfigurationV2_3_0 - contains jMeadows v2.3.0 dod configuration from config.json
     */
    public void setjMeadowsConfigurationV2_3_0(DodConfiguration jMeadowsConfigurationV2_3_0)
    {
        LOG.debug("VxSoapConfiguration.setjMeadowsConfigurationV2_3_0 - Entering method...()");

        this.jMeadowsConfigurationV2_3_0 = jMeadowsConfigurationV2_3_0;
    }

    /*
        Get the configuration details from config.json for jMeadows-v2.3.1 and populate it in JMeadowsConfigService
        @param - DodConfiguration jMeadowsConfigurationV2_3_1 - contains the jMeadows v2.3.1 dod configuration from config.json
     */
    public void setjMeadowsConfigurationV2_3_1(DodConfiguration jMeadowsConfigurationV2_3_1)
    {
        LOG.debug("VxSoapConfiguration.setjMeadowsConfigurationV2_3_1 - Entering method...()");

        this.jMeadowsConfigurationV2_3_1 = jMeadowsConfigurationV2_3_1;
    }

    /*
        Get the configuration details from config.json for jMeadows-v2.3.3.0.2 and populate it in JMeadowsConfigService
        @param - DodConfiguration jMeadowsConfigurationV2_3_3_0_2 - contains the jMeadows v2.3.3.0.2 dod configuration from config.json
     */
    public void setjMeadowsConfigurationV2_3_3_3_0_2(DodConfiguration jMeadowsConfigurationV2_3_3_3_0_2)
    {
        LOG.debug("VxSoapConfiguration.setjMeadowsConfigurationV2_3_3_0_2 - Entering method...()");

        this.jMeadowsConfigurationV2_3_3_0_2 = jMeadowsConfigurationV2_3_3_3_0_2;
    }

    /**
     * Generates a url from parameters.
     * @param protocol protocol name
     * @param host host name
     * @param port port value
     * @param path url
     * @return A URL generated parameters.
     */
    protected String generateUrlString(String protocol, String host, int port, String path, String query) {

        if (("http".equalsIgnoreCase(protocol) && port == 80) ||
                ("https".equalsIgnoreCase(protocol) && port == 443)) {
            port = -1;
        }

        try {
            return new URI(protocol, null, host, port, path, query, null).toString();
        } catch (URISyntaxException e){
            LOG.error("Error generating url: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
