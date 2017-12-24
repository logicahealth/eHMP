package gov.va.signalregistrationservice;

import java.util.List;

import javax.persistence.EntityManager;

import org.jboss.logging.Logger;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import gov.va.signalregistrationservice.entities.EventMatchAction;
import gov.va.signalregistrationservice.util.RegistrationUtil;

public class UnRegistrationHandler implements WorkItemHandler, Closeable,
		Cacheable {

	private static final Logger LOGGER = Logger.getLogger(UnRegistrationHandler.class);
	private KieSession ksession;
	public UnRegistrationHandler(KieSession ksession){
		this.ksession = ksession;		
	}
   
	public UnRegistrationHandler(){
	}
	
	public void close() {
		// Do nothing
	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String serviceResponse;
		
		try {
			LOGGER.info("Signal Service UnRegistrationHandler.executeWorkItem has been called");

			long processInstanceId = workItem.getProcessInstanceId();
			LOGGER.debug(String.format("Signal Service UnRegistrationHandler.executeWorkItem: processInstanceId=%s", processInstanceId));
		
			deleteDataFromEventMatchingTables(processInstanceId);
						
			serviceResponse = RegistrationUtil.buildSuccessResponse();
			
		}
		catch (EhmpServicesException e) {
			LOGGER.error(e.getMessage(), e);;
			serviceResponse = e.createJsonErrorResponse();
		} catch (Exception e) {
			LOGGER.error(String.format("UnRegistrationHandler.executeWorkItem: An unexpected condition has happened: %s", e.getMessage()), e);
			serviceResponse = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "UnRegistrationHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, serviceResponse);
	}

	/**
	 * @param processInstanceId
	 */
	private void deleteDataFromEventMatchingTables(long processInstanceId) throws EhmpServicesException {
		
		try {
			EntityManager em = RegistrationUtil.getEntityManager(ksession);
			em.joinTransaction();
			
			// Retrieve rows from EVENT_MATCH_ACTION for a ProcessInstance
			List<EventMatchAction> eventMatchActions = RegistrationUtil.retrieveMatchActions(em, processInstanceId);
			LOGGER.debug(String.format("Signal Service UnRegistrationHandler.deleteDataFromEventMatchingTables: EVENT_MATCH_ACTION %d records retreived for processInstanceId= %d"
					,eventMatchActions.size(), processInstanceId));
			
			for(EventMatchAction eventMatchAction : eventMatchActions) {		
				// Delete row from AM_EVENTLISTENER
				RegistrationUtil.removeAmEventListener(em, eventMatchAction.getId());

				// Delete SIMPLE_MATCH rows
				RegistrationUtil.removeSimpleMatchOnCriteriaId(em, eventMatchAction.getId());
				
				// Delete EVENT_MATCH_CRITERIA rows
				RegistrationUtil.removeEventMatchCriteria(em, eventMatchAction.getId());
				
				// Delete EVENT_MATCH_ACTION rows
				RegistrationUtil.removeEventMatchAction(em, eventMatchAction);
			}			
		}
		catch(Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e); 
		}
	}


	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("Signal Service UnRegistrationHandler.abortWorkItem has been called");
	}	
}
