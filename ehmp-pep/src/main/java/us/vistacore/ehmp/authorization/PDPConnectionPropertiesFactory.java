package us.vistacore.ehmp.authorization;

import us.vistacore.aps.ApsConfiguration;

import com.axiomatics.sdk.connections.aps5.soap.Aps5SimpleSoapPDPConnectionProperties;
import com.axiomatics.sdk.connections.properties.PDPConnectionProperties;

public final class PDPConnectionPropertiesFactory {

    public static final String PDP_DRIVER = "com.axiomatics.sdk.connections.aps5.soap.Aps5SimpleSoapPDPConnection";

    public static final String WEBSERVICE_NAMESPACE = "http://axiomatics.com/delegent/pdpsimple/v5";
    public static final String WEBSERVICE_LOCALNAME = "DelegentPDP";

    public static final String WEBSERVICE_URL_BASE = "http://";
    public static final String WEBSERVICE_URL_STEM = "/asm-pdp/pdp?wsdl";

    private PDPConnectionPropertiesFactory() { }

    public static Aps5SimpleSoapPDPConnectionProperties getPropertiesInstance(ApsConfiguration configuration) {
        Aps5SimpleSoapPDPConnectionProperties instance = new Aps5SimpleSoapPDPConnectionProperties();

        instance.setProperty(PDPConnectionProperties.KEY_PDP_DRIVER, PDP_DRIVER);
        instance.setProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_BASIC_AUTH_USERNAME, configuration.getUsername());
        instance.setProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_BASIC_AUTH_PASSWORD, configuration.getPassword());
        instance.setProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_URL, getWebserviceUrl(configuration.getHost(), configuration.getPort()));
        instance.setProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_NAMESPACE, WEBSERVICE_NAMESPACE);
        instance.setProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_LOCALNAME, WEBSERVICE_LOCALNAME);

        return instance;
    }

    public static String getWebserviceUrl(String ip, String port) {
        return WEBSERVICE_URL_BASE + ip + ":" + port + WEBSERVICE_URL_STEM;
    }

}
