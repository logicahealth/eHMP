package gov.va;

import java.util.HashMap;
import java.util.Map;
import gov.va.CDSInvocationServiceHandler;
import gov.va.FOBTServiceHandler;
import org.junit.Test;
import org.kie.api.*;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.ProcessInstance;
import org.junit.Assert;

public class FOBTServiceIntegrationTest extends Assert {
	
	@Test
	public void processTest() {
		KieServices services = KieServices.Factory.get();
		KieBase kbase = services.getKieClasspathContainer().getKieBase();
		KieSession session = kbase.newKieSession();
		session.getWorkItemManager().registerWorkItemHandler("FOBTLabService",
				new FOBTServiceHandler());
		session.getWorkItemManager().registerWorkItemHandler("CDSInvocationService",
				new CDSInvocationServiceHandler());
				
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("facility", "9E7A");
		params.put("icn","9E7A;129");
		
		// start the process
		// process name was originally misspelled and could not be corrected here without recreating it (FOBTIntgerationTest.testProcess)
		ProcessInstance instance = session.startProcess("FOBTIntgerationTest.testProcess",params);
		assertNotNull(instance);
		
		// trigger the close method
		session.dispose();
		
	}
 
}
