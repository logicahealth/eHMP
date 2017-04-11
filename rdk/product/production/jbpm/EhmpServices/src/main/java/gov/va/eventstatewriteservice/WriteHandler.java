package gov.va.eventstatewriteservice;

import javax.persistence.EntityManager;

import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;


import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.utils.Logging;
import gov.va.eventstatewriteservice.entities.ProcessedEventState;
import gov.va.kie.utils.EntityManagerUtil;
import gov.va.kie.utils.WorkItemUtil;

public class WriteHandler implements WorkItemHandler, Closeable,
	Cacheable {
	
	private KieSession ksession;
	public WriteHandler(KieSession ksession){
	this.ksession = ksession;		
	}
	
	public WriteHandler(){
	}
	
	public void close() {
	// Do nothing
	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		
		long listenerId;
		String dataLocation, value, serviceResponse;
		
		try {
			Logging.info("Event State Write Service WriteHandler.executeWorkItem has been called");

			dataLocation  = WorkItemUtil.extractStringParam(workItem, "dataLocation");
			Logging.debug("Event State Write Service WriteHandler.executeWorkItem: dataLocation=" + dataLocation);

			value  = WorkItemUtil.extractStringParam(workItem, "value");
			Logging.debug("Event State Write Service WriteHandler.executeWorkItem: value=" + value);

			listenerId  = WorkItemUtil.extractLongParam(workItem, "listenerId");	
			Logging.debug("Event State Write Service WriteHandler.executeWorkItem: listenerId=" + listenerId);
											
			insertDataIntoProcessedEventStateTable(dataLocation, value, listenerId);
						
			serviceResponse = WorkItemUtil.buildSuccessResponse();
			
		}
		catch (EhmpServicesException e) {
			e.printStackTrace();
			serviceResponse = e.toJsonString();
		}
	
		Logging.debug("Event State Write Service WriteHandler.executeWorkItem: ServiceResponse=" + serviceResponse);
		WorkItemUtil.completeWorkItem(workItem, manager, serviceResponse);
	}

	/**
	* @param listenerId
	* @param value
	*/
	private void insertDataIntoProcessedEventStateTable(String dataLocation, String value, long listenerId) 
			throws EhmpServicesException {
	
		try {
			EntityManager em = EntityManagerUtil.getEntityManager(ksession);		
			em.joinTransaction();
						
			em.persist(new ProcessedEventState(dataLocation, value, listenerId));
								
			Logging.debug("Event State Write Sevice WriteHandler.executeWorkItem: PROCESSED_EVENT_STATE record created.");
		}
		catch(Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage()); 
		}
	}


	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		Logging.debug("Event State Write Sevice WriteHandler.abortWorkItem has been called");
	}	
}
