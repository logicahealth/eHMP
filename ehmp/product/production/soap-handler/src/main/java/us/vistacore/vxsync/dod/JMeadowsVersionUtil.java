package us.vistacore.vxsync.dod;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.vxsync.config.DodConfiguration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Calendar;
import java.util.GregorianCalendar;

import static us.vistacore.vxsync.dod.JMeadowsVersion.*;

public class JMeadowsVersionUtil {

    private static final Logger LOG = LoggerFactory.getLogger(JMeadowsVersionUtil.class);

    private static JMeadowsVersionUtil INSTANCE = new JMeadowsVersionUtil();

    private JMeadowsConfig jMeadowsConfigV230;
    private JMeadowsConfig jMeadowsConfigV231;
    private JMeadowsConfig jMeadowsConfigV23302;

    public static JMeadowsVersionUtil getInstance() {
        return INSTANCE;
    }

    /**
     * Private Constructor
     */
    private JMeadowsVersionUtil() {

    }

    /**
     * VxSoapHandler run method will set jMeadows v2.3.0 configuration.
     * @param dodConfiguration
     */
    public void setJMeadowsConfigV230(DodConfiguration dodConfiguration) {
        jMeadowsConfigV230 = createJMeadowsConfig(dodConfiguration);
    }

    /**
     * VxSoapHandler run method will set jMeadows v2.3.1 configuration.
     * @param dodConfiguration
     */
    public void setJMeadowsConfigV231(DodConfiguration dodConfiguration) {
        jMeadowsConfigV231 = createJMeadowsConfig(dodConfiguration);
    }

    /**
     * VxSoapHandler run method will set jMeadows v2.3.3.0.2 configuration.
     * @param dodConfiguration
     */
    public void setJMeadowsConfigV233302(DodConfiguration dodConfiguration) {
        jMeadowsConfigV23302 = createJMeadowsConfig(dodConfiguration);
    }

    /**
     * Gets the jMeadows configuration for a specified version.
     * @param version JMeadows version
     * @return jMeadows configuration for a specified version.
     */
    public JMeadowsConfig getJMeadowsConfig(JMeadowsVersion version) {

        switch(version) {

            case V_2_3_3_0_2:
                return jMeadowsConfigV23302;
            case V_2_3_1:
                return jMeadowsConfigV231;
            case V_2_3_0:
                return jMeadowsConfigV230;
            default:
                throw new UnsupportedVersionException(version);
        }
    }

    /**
     * Creates jMeadows Soap Handler for specified version.
     * @param version jMeadows version.
     * @param template Soap Handler template
     * @param defaultName Soap Handler default name
     * @return jMeadows Soap Handler for specified version.
     */
    public JMeadowsSoapHandler createSoapHandler(JMeadowsVersion version, String template, String defaultName) {
        switch(version) {
            case V_2_3_3_0_2:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_3_0_2.JMeadowsSoapHandlerImpl(template, defaultName);
            case V_2_3_1:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_1.JMeadowsSoapHandlerImpl(template, defaultName);
            case V_2_3_0:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_0.JMeadowsSoapHandlerImpl(template, defaultName);
            default:
                throw new UnsupportedVersionException(version);
        }
    }

    /**
     * Creates a jMeadows Query Builder that's configured to only query for DoD clinical data.
     *
     * @return AbstractJMeadowsQueryBuilder instance.
     */
    public AbstractJMeadowsQueryBuilder createDodJMeadowsQueryBuilder(JMeadowsVersion version, String edipi) {
        switch(version) {
            case V_2_3_3_0_2:
                return createQueryBuilderV23302(edipi);
            case V_2_3_1:
                return createQueryBuilderV231(edipi);
            case V_2_3_0:
                return createQueryBuilderV230(edipi);
            default:
                throw new UnsupportedVersionException(version);
        }
    }

    /**
     * Private utility that creates a JMeadowsQueryBuilder targeted for jMeadows v2.3.0.
     * @param edipi Patient's DoD identifier.
     * @return AbstractJMeadowsQueryBuilder instance.
     */
    private AbstractJMeadowsQueryBuilder createQueryBuilderV230(String edipi) {
        JMeadowsConfig jMeadowsConfig = getJMeadowsConfig(V_2_3_0);

        gov.va.med.jmeadows_2_3_0.webservice.User user = new gov.va.med.jmeadows_2_3_0.webservice.User();

        user.setAgency("VA");
        gov.va.med.jmeadows_2_3_0.webservice.Site hostSite = new gov.va.med.jmeadows_2_3_0.webservice.Site();
        user.setHostSite(hostSite);
        hostSite.setAgency("VA");

        hostSite.setId(0);
        hostSite.setMoniker(jMeadowsConfig.getUserSiteName());
        hostSite.setName(jMeadowsConfig.getUserSiteName());
        hostSite.setSiteCode(jMeadowsConfig.getUserSiteCode());
        hostSite.setStatus("active");
        user.setName(jMeadowsConfig.getUserSiteName());
        user.setUserIen(jMeadowsConfig.getUserIen());

        gov.va.med.jmeadows_2_3_0.webservice.Patient patient = new gov.va.med.jmeadows_2_3_0.webservice.Patient();

        patient.setEDIPI(edipi);

        Calendar startDate = new GregorianCalendar();
        //set start date to thirty years in the past
        startDate.add(GregorianCalendar.YEAR, -30);
        Calendar endDate = new GregorianCalendar();

        return createQueryBuilder(V_2_3_0)
                .user(user)
                .patient(patient)
                .startDate(startDate)
                .endDate(endDate);
    }

    /**
     * Private utility that creates a JMeadowsQueryBuilder targeted for jMeadows v2.3.1.
     * @param edipi Patient's DoD identifier.
     * @return AbstractJMeadowsQueryBuilder instance.
     */
    private AbstractJMeadowsQueryBuilder createQueryBuilderV231(String edipi) {
        JMeadowsConfig jMeadowsConfig = getJMeadowsConfig(V_2_3_1);

        gov.va.med.jmeadows_2_3_1.webservice.User user = new gov.va.med.jmeadows_2_3_1.webservice.User();

        user.setAgency("VA");
        gov.va.med.jmeadows_2_3_1.webservice.Site hostSite = new gov.va.med.jmeadows_2_3_1.webservice.Site();
        user.setHostSite(hostSite);
        hostSite.setAgency("VA");

        hostSite.setId(0);
        hostSite.setMoniker(jMeadowsConfig.getUserSiteName());
        hostSite.setName(jMeadowsConfig.getUserSiteName());
        hostSite.setSiteCode(jMeadowsConfig.getUserSiteCode());
        hostSite.setStatus("active");
        user.setName(jMeadowsConfig.getUserSiteName());
        user.setUserIen(jMeadowsConfig.getUserIen());

        gov.va.med.jmeadows_2_3_1.webservice.Patient patient = new gov.va.med.jmeadows_2_3_1.webservice.Patient();

        patient.setEDIPI(edipi);

        Calendar startDate = new GregorianCalendar();
        //set start date to thirty years in the past
        startDate.add(GregorianCalendar.YEAR, -30);
        Calendar endDate = new GregorianCalendar();

        return createQueryBuilder(V_2_3_1)
                .user(user)
                .patient(patient)
                .startDate(startDate)
                .endDate(endDate);
    }

    /**
     * Private utility that creates a JMeadowsQueryBuilder targeted for jMeadows v2.3.3.0.2.
     * @param edipi Patient's DoD identifier.
     * @return AbstractJMeadowsQueryBuilder instance.
     */
    private AbstractJMeadowsQueryBuilder createQueryBuilderV23302(String edipi) {
        JMeadowsConfig jMeadowsConfig = getJMeadowsConfig(V_2_3_3_0_2);

        gov.va.med.jmeadows_2_3_3_0_2.webservice.User user = new gov.va.med.jmeadows_2_3_3_0_2.webservice.User();

        user.setAgency("VA");
        gov.va.med.jmeadows_2_3_3_0_2.webservice.Site hostSite = new gov.va.med.jmeadows_2_3_3_0_2.webservice.Site();
        user.setHostSite(hostSite);
        hostSite.setAgency("VA");

        hostSite.setId(0);
        hostSite.setMoniker(jMeadowsConfig.getUserSiteName());
        hostSite.setName(jMeadowsConfig.getUserSiteName());
        hostSite.setSiteCode(jMeadowsConfig.getUserSiteCode());
        hostSite.setStatus("active");
        user.setName(jMeadowsConfig.getUserSiteName());
        user.setUserIen(jMeadowsConfig.getUserIen());

        gov.va.med.jmeadows_2_3_3_0_2.webservice.Patient patient = new gov.va.med.jmeadows_2_3_3_0_2.webservice.Patient();

        patient.setEDIPI(edipi);

        Calendar startDate = new GregorianCalendar();
        //set start date to thirty years in the past
        startDate.add(GregorianCalendar.YEAR, -30);
        Calendar endDate = new GregorianCalendar();

        return createQueryBuilder(V_2_3_3_0_2)
                .user(user)
                .patient(patient)
                .startDate(startDate)
                .endDate(endDate);
    }

    /**
     * Private utility that constructs an empty JMeadowsQueryBuilder targeted for a specified version of jMeadows.
     * @param version jMeadows version.
     * @return JMeadowsQueryBuilder targeted for a specified version of jMeadows
     */
    private AbstractJMeadowsQueryBuilder createQueryBuilder(JMeadowsVersion version) {
        switch(version) {
            case V_2_3_3_0_2:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_3_0_2.JMeadowsQueryBuilder();
            case V_2_3_1:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_1.JMeadowsQueryBuilder();
            case V_2_3_0:
                return new us.vistacore.vxsync.dod.jmeadows_2_3_0.JMeadowsQueryBuilder();
            default:
                throw new UnsupportedVersionException(version);
        }
    }

    /**
     * Creates a new JMeadowsConfig instance from vx-sync DodConfiguration.
     * @param dodConfiguration vx-sync DoD Configuration
     * @return A JMeadows configuration instance.
     */
    private JMeadowsConfig createJMeadowsConfig(DodConfiguration dodConfiguration) {
        if (dodConfiguration == null) {
            return null;
        }

        JMeadowsConfig jMeadowsConfig = new JMeadowsConfig();

        jMeadowsConfig.setPath(dodConfiguration.getPath());
        jMeadowsConfig.setRetry(dodConfiguration.getRetry());
        jMeadowsConfig.setUserName(dodConfiguration.getUsername());

        if(dodConfiguration.getDodDocServiceEnabled()!=null) {
            jMeadowsConfig.setDodDocServiceEnabled(dodConfiguration.getDodDocServiceEnabled());
        }

        jMeadowsConfig.setUrl(generateUrlString(
                dodConfiguration.getProtocol(),
                dodConfiguration.getHost(),
                dodConfiguration.getPort(),
                dodConfiguration.getPath(),
                dodConfiguration.getQuery()));

        int timeoutMS = 30000;

        try {
            if (dodConfiguration.getTimeoutms() != null) {
                timeoutMS = Integer.parseInt(dodConfiguration.getTimeoutms());
            }
        }
        catch(NumberFormatException e) {
            LOG.warn("Could not parse timeout value: " + dodConfiguration.getTimeoutms());
        }

        jMeadowsConfig.setTimeoutMS(timeoutMS);
        jMeadowsConfig.setUserIen(dodConfiguration.getUserien());
        jMeadowsConfig.setUserSiteName(dodConfiguration.getUsersitename());
        jMeadowsConfig.setUserSiteCode(dodConfiguration.getUsersitecode());
        jMeadowsConfig.setParallelismmin(dodConfiguration.getParallelismmin());

        return jMeadowsConfig;
    }

    /**
     * Generates a url from parameters.
     * @param protocol protocol name
     * @param host host name
     * @param port port value
     * @param path url
     * @return A URL generated parameters.
     */
    private String generateUrlString(String protocol, String host, int port, String path, String query) {

        if (("http".equalsIgnoreCase(protocol) && port == 80) ||
                ("https".equalsIgnoreCase(protocol) && port == 443)) {
            port = -1;
        }

        try {
            return new URI(protocol, null, host, port, path, query, null).toString();
        } catch (URISyntaxException e){
            LOG.warn("Error generating url: " + e.getMessage());
            return null;
        }
    }
}
