package gov.va.eventstatewriteservice;

import javax.persistence.EntityManager;

import org.jboss.logging.Logger;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.eventstatewriteservice.entities.ProcessedEventState;
import gov.va.kie.utils.EntityManagerUtil;
import gov.va.kie.utils.WorkItemUtil;

public class WriteHandler implements WorkItemHandler, Closeable {

	private KieSession ksession;
	private WorkItem workItem;
	private WorkItemManager manager;
	private static final Logger LOGGER = Logger.getLogger(WriteHandler.class);
	public WriteHandler(KieSession ksession){
		this.ksession = ksession;		
	}

	public WriteHandler(){
	}

	public void close() {
		// Do nothing
	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		this.workItem = workItem;
		this.manager = manager;

		long listenerId;
		String dataLocation, value, serviceResponse;

		try {
			LOGGER.info("Event State Write Service WriteHandler.executeWorkItem has been called");

			dataLocation  = WorkItemUtil.extractRequiredStringParam(workItem, "dataLocation");
			LOGGER.debug("Event State Write Service WriteHandler.executeWorkItem: dataLocation=" + dataLocation);

			value  = WorkItemUtil.extractRequiredStringParam(workItem, "value");
			LOGGER.debug("Event State Write Service WriteHandler.executeWorkItem: value=" + value);

			listenerId  = WorkItemUtil.extractRequiredLongParam(workItem, "listenerId");	
			LOGGER.debug("Event State Write Service WriteHandler.executeWorkItem: listenerId=" + listenerId);
											
			insertDataIntoProcessedEventStateTable(dataLocation, value, listenerId);

			serviceResponse = WorkItemUtil.buildSuccessResponse();
		}
		catch (EhmpServicesException e) {
			e.printStackTrace();
			serviceResponse = e.toJsonString();
		} catch (Exception e) {
			LOGGER.error("WriteHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage(), e);
			serviceResponse = ErrorResponseUtil.create(HttpStatus.INTERNAL_SERVER_ERROR, "WriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
	
		LOGGER.debug("Event State Write Service WriteHandler.executeWorkItem: ServiceResponse=" + serviceResponse);
		WorkItemUtil.completeWorkItem(workItem, manager, serviceResponse);
	}

	/**
	 * @param listenerId
	 * @param value
	 */
	private void insertDataIntoProcessedEventStateTable(String dataLocation, String value, long listenerId) 
			throws EhmpServicesException {

		EntityManager em = EntityManagerUtil.getEntityManager(ksession);		
		try {
			
			Long count = (Long)em.createQuery( 
				"SELECT COUNT(*) FROM ProcessedEventState pes WHERE pes.dataLocation = :dataLocation AND pes.value = :value AND pes.listenerId = :listenerId")
					.setParameter("dataLocation", dataLocation)
					.setParameter("value", value)
					.setParameter("listenerId", listenerId).getSingleResult();

			if(count == null || count == 0) {
				em.joinTransaction();
	
				em.persist(new ProcessedEventState(dataLocation, value, listenerId));
				em.flush();
	
				LOGGER.debug("Event State Write Sevice WriteHandler.executeWorkItem: PROCESSED_EVENT_STATE record created.");
			}
			else {
				//Signal to the manager to abort the workItem
				manager.abortWorkItem(workItem.getId());

				//Abort the calling processInstance
				abortProcessInstance();
				
				String error = String.format("WriteHandler.insertDataProcessedEventStateTable - duplicate entry detected for "+
						"DATA_LOCATION:'%s' LISTENER_ID:'%s' VALUE:'%s'",dataLocation,listenerId,value);
				LOGGER.debug(error);
			}
		}
		catch(Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage()); 
		}
	}


	//Aborts the calling processInstance 
	private void abortProcessInstance() {
		//Abort the processInstance
		long processInstanceId = workItem.getProcessInstanceId();
        LOGGER.debug("WriteHandler.abortProcessInstance - aborting processInstanceId:'"+processInstanceId+"'");
		ksession.abortProcessInstance(processInstanceId);
	}

	
	@Override
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		manager.abortWorkItem(workItem.getId());
		LOGGER.debug("Event State Write Sevice WriteHandler.abortWorkItem has been called");
	}

}
