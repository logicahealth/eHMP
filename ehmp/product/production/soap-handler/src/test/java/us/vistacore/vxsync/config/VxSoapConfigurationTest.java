package us.vistacore.vxsync.config;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class VxSoapConfigurationTest
{
    @Test
    public void testGenerateUrl() {
        VxSoapConfiguration cfg = new VxSoapConfiguration();
        assertEquals(cfg.generateUrlString("http", "172.16.4.104", 80, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://172.16.4.104/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "172.16.4.104", 443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://172.16.4.104/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("http", "172.16.4.104", 8080, "/jMeadows/JMeadowsDataService", "wsdl"),
                "http://172.16.4.104:8080/jMeadows/JMeadowsDataService?wsdl");
        assertEquals(cfg.generateUrlString("https", "172.16.4.104", 8443, "/jMeadows/JMeadowsDataService", "wsdl"),
                "https://172.16.4.104:8443/jMeadows/JMeadowsDataService?wsdl");
    }
}
