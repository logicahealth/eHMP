package gov.va.clinicalobjectstorageservice;

import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;

import gov.va.clinicalobjectstorageservice.util.ResourceUtil;
import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.utils.Logging;
import gov.va.kie.utils.WorkItemUtil;

public class ClinicalObjectReadHandler implements WorkItemHandler, Closeable, Cacheable {
	
	public void close() {
		//Ignored
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		Logging.info("ClinicalObjectReadHandler.abortWorkItem has been called");
	}

	/**
	 * Reads the clinical object from pJDS and then completes WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			Logging.info("Entering ClinicalObjectReadHandler.executeWorkItem");
			String pId = WorkItemUtil.extractStringParam(workItem, "pid");
			String uId = WorkItemUtil.extractStringParam(workItem, "uid");
			
			Logging.debug("ClinicalObjectReadHandler.executeWorkItem pId = " + pId + ", uId = " + uId);
			
			ResourceUtil resUtil = new ResourceUtil();
			// Read clinical object from pJDS
			response = resUtil.invokeGetResource(pId, uId);
			Logging.debug("ClinicalObjectReadHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}
}
