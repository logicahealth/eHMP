package gov.va.patientdemographics;

import org.jboss.logging.Logger;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import gov.va.patientdemographics.util.DemographicsResourceUtil;


public class PatientDemographicsHandler implements WorkItemHandler, Closeable, Cacheable {

	private static final Logger LOGGER = Logger.getLogger(PatientDemographicsHandler.class);

	@Override
	public void close() {
		// Ignored
	}

	@Override
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.info("PatientDemographicsHandler.abortWorkItem has been called");		
	}

	@Override
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			LOGGER.info("Entering PatientDemographicsHandler.executeWorkItem");
			String pId = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
			
			LOGGER.debug(String.format("PatientDemographicsHandler.executeWorkItem pId = %s", pId));
			
			DemographicsResourceUtil resUtil = new DemographicsResourceUtil();
			
			response = resUtil.invokeGetResource(pId);
			LOGGER.debug(String.format("PatientDemographicsHandler.executeWorkItem response = %s", response));
		} catch (EhmpServicesException e) {
			response = e.createJsonErrorResponse();
			LOGGER.error(e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error(String.format("PatientDemographicsHandler.executeWorkItem: An unexpected condition has happened: "+ e.getMessage(), e));
			response = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "PatientDemographicsHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
		
	}

}
