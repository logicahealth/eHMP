package us.vistacore.ehmp.authorization;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.test.TestUtils;

import com.axiomatics.sdk.connections.aps5.soap.Aps5SimpleSoapPDPConnectionProperties;
import com.axiomatics.sdk.connections.properties.PDPConnectionProperties;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

/**
 * Very basic test for this very basic class.
 */
public class PDPConnectionPropertiesFactoryTest {

    private static final String TEST_IP = "1.2.3.4";
    private static final String TEST_PORT = "8280";
    private static final String TEST_USER = "bogususer";
    private static final String TEST_PASS = "boguspass";

    private ApsConfiguration configuration;

    @Before
    public void setup() {
        configuration = TestUtils.getApsConfiguration();
        configuration.setHost(TEST_IP);
        configuration.setPort(TEST_PORT);
        configuration.setUsername(TEST_USER);
        configuration.setPassword(TEST_PASS);
    }

    @Test
    public void testGetPropertiesInstance() {
        PDPConnectionProperties props = PDPConnectionPropertiesFactory.getPropertiesInstance(configuration);
        Assert.assertTrue(props instanceof Aps5SimpleSoapPDPConnectionProperties);
        Assert.assertEquals(PDPConnectionPropertiesFactory.PDP_DRIVER, props.getProperty(PDPConnectionProperties.KEY_PDP_DRIVER));
        Assert.assertEquals(TEST_USER, props.getProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_BASIC_AUTH_USERNAME));
        Assert.assertEquals(TEST_PASS, props.getProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_BASIC_AUTH_PASSWORD));
        Assert.assertEquals(PDPConnectionPropertiesFactory.getWebserviceUrl(TEST_IP, TEST_PORT), props.getProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_URL));
        Assert.assertEquals(PDPConnectionPropertiesFactory.WEBSERVICE_NAMESPACE, props.getProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_NAMESPACE));
        Assert.assertEquals(PDPConnectionPropertiesFactory.WEBSERVICE_LOCALNAME, props.getProperty(Aps5SimpleSoapPDPConnectionProperties.KEY_APS5_WEBSERVICE_LOCALNAME));
    }

    @Test
    public void testGetWebservice() {
        Assert.assertEquals("http://" + TEST_IP + ":" + TEST_PORT + "/asm-pdp/pdp?wsdl", PDPConnectionPropertiesFactory.getWebserviceUrl(TEST_IP, TEST_PORT));
    }

}
