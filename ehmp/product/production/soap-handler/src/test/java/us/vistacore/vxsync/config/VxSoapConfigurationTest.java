package us.vistacore.vxsync.config;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class VxSoapConfigurationTest
{
    @Test
    public void testGenerateUrl() {
        VxSoapConfiguration cfg = new VxSoapConfiguration();
        assertEquals(cfg.generateUrlString("http", "IP_ADDRESS", 80, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://IP_ADDRESS/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "IP_ADDRESS", 443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://IP_ADDRESS/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("http", "IP_ADDRESS", 8080, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://IP_ADDRESS:PORT/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "IP_ADDRESS", 8443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://IP_ADDRESS:PORT/jMeadows/JMeadowsDataService?wsdl");
    }
}
