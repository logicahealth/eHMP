package gov.va;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.jboss.logging.Logger;
import org.junit.Test;
import org.springframework.web.client.RestTemplate;

public class CDSInvocationServiceTest extends CDSInvocationServiceHandler {
	private static Logger LOGGER = Logger.getLogger(CDSInvocationServiceTest.class);

    @Test
    public void testGetCDSInvocationUrl() {
    	CDSInvocationServiceTest cdsHandler = new CDSInvocationServiceTest();
    	String cdsUrl = cdsHandler.getCDSInvocationUrl();
        assertEquals(cdsUrl, "http://IP            /");
    }

    @Test
    public void testGetRestTemplate() {
    	RestTemplate restTemplate = CDSInvocationServiceTest.getRestTemplate();
        assertNotNull(restTemplate);
    }

}
