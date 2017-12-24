package gov.va;

import static org.junit.Assert.assertFalse;
import org.junit.Test;

public class FOBTServiceHandlerTest {
	@Test
	public void validateErrorForBadNotification() {
		FOBTServiceHandler handler = new FOBTServiceHandler();
		String result = null;
		String resourceUrl = FOBTServiceHandler.getRDKurl().concat(FOBTServiceHandler.labResultResource.replace("{pid}", "SITE;100022")).concat(FOBTServiceHandler.queryString);
		result = handler.getRdkResponse(resourceUrl, false);
	
		assertFalse(result == null || result.isEmpty());
	}
}
