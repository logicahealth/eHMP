package us.vistacore.vxsync.config;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class VxSoapConfigurationTest
{
    @Test
    public void testGenerateUrl() {
        VxSoapConfiguration cfg = new VxSoapConfiguration();
        assertEquals(cfg.generateUrlString("http", "127.0.0.1", 80, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://127.0.0.1/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "127.0.0.1", 443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://127.0.0.1/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("http", "127.0.0.1", 8080, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://127.0.0.1:8080/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "127.0.0.1", 8443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://127.0.0.1:8443/jMeadows/JMeadowsDataService?wsdl");
    }
}
