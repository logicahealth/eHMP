package us.vistacore.vxsync.config;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class VxSoapConfigurationTest
{
    @Test
    public void testGenerateUrl() {
        VxSoapConfiguration cfg = new VxSoapConfiguration();
        assertEquals(cfg.generateUrlString("http", "IP        ", 80, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://IP        /jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "IP        ", 443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://IP        /jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("http", "IP        ", 8080, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://IP             /jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "IP        ", 8443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://IP             /jMeadows/JMeadowsDataService?wsdl");
    }
}
