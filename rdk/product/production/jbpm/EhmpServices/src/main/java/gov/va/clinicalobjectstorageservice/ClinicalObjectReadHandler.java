package gov.va.clinicalobjectstorageservice;

import org.jboss.logging.Logger;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import gov.va.clinicalobjectstorageservice.util.ResourceUtil;
import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;


public class ClinicalObjectReadHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(ClinicalObjectReadHandler.class);
	public void close() {
		//Ignored
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.info("ClinicalObjectReadHandler.abortWorkItem has been called");
	}

	/**
	 * Reads the clinical object from pJDS and then completes WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			LOGGER.info("Entering ClinicalObjectReadHandler.executeWorkItem");
			String pId = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
			String uId = WorkItemUtil.extractRequiredStringParam(workItem, "uid");
			
			LOGGER.debug("ClinicalObjectReadHandler.executeWorkItem pId = " + pId + ", uId = " + uId);
			
			ResourceUtil resUtil = new ResourceUtil();
			// Read clinical object from pJDS
			response = resUtil.invokeGetResource(pId, uId);
			LOGGER.debug("ClinicalObjectReadHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		} catch (Exception e) {
			LOGGER.error("ClinicalObjectReadHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage(), e);
			response = ErrorResponseUtil.create(HttpStatus.INTERNAL_SERVER_ERROR, "ClinicalObjectReadHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}
}
