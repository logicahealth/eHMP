package gov.va.rdk.http.resources;

import static org.junit.Assert.assertEquals;

import org.jboss.logging.Logger;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import gov.va.ehmp.services.exception.EhmpServicesException;


public class RdkResourceUtilTest extends RdkResourceUtil {
	private static Logger LOGGER = Logger.getLogger(RdkResourceUtilTest.class);

	@Before
	public void setUp() throws Exception {
		
	}

	@After
	public void tearDown() throws Exception {
	}

	@Test
	public void testGetRDKUrl() throws EhmpServicesException {
		LOGGER.debug("Starting test run");
		RdkResourceUtilTest test1 = new RdkResourceUtilTest();
		String resourceUrl = test1.getRDKUrl(RDK_FETCHSERVER_CONFIG);
		assertEquals(resourceUrl,"http://IP              /" );
		resourceUrl = test1.getRDKUrl(RDK_WRITEBACKSERVER_CONFIG);
		assertEquals(resourceUrl,"http://IP              /" );

		//Check the logs to see only one entry of:
		//Loading Properties files; rdkconfig.properties - rdkwritebackconfig.properties
		RdkResourceUtilTest test2 = new RdkResourceUtilTest();
		resourceUrl = test2.getRDKUrl(RDK_FETCHSERVER_CONFIG);
		assertEquals(resourceUrl,"http://IP              /" );
		resourceUrl = test2.getRDKUrl(RDK_WRITEBACKSERVER_CONFIG);
		assertEquals(resourceUrl,"http://IP              /" );
		
		//Check the logs to see there is still only one entry of:
		//Loading Properties files; rdkconfig.properties - rdkwritebackconfig.properties
		
	}

}
