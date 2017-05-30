package gov.va.storageservice.signal;

import java.util.Calendar;
import java.util.Date;

import javax.persistence.EntityManager;

import org.jboss.logging.Logger;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import gov.va.activitydb.entities.SignalInstance;
import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.EntityManagerUtil;
import gov.va.kie.utils.WorkItemUtil;

public class SignalWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	private KieSession ksession;
	private static final Logger LOGGER = Logger.getLogger(SignalWriteHandler.class);
	public SignalWriteHandler(KieSession ksession){
		this.ksession = ksession;		
	}
	
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("SignalWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts the notification (contained in a parameter of the WorkItem called 'notification')
	 * to the Notifications API and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			LOGGER.info("Entering SignalWriteHandler.executeWorkItem");
			String name = WorkItemUtil.extractRequiredStringParam(workItem, "name");
			String action = WorkItemUtil.extractRequiredStringParam(workItem, "action");
			String owner = WorkItemUtil.extractRequiredStringParam(workItem, "owner");
			Date statusTimeStamp = Calendar.getInstance().getTime();
			String history = WorkItemUtil.extractRequiredStringParam(workItem, "history");
			long processedSignalId = workItem.getProcessInstanceId();
			
			LOGGER.debug("SignalWriteHandler.executeWorkItem name = " + name);
			LOGGER.debug("SignalWriteHandler.executeWorkItem action = " + action);
			LOGGER.debug("SignalWriteHandler.executeWorkItem owner = " + owner);
			LOGGER.debug("SignalWriteHandler.executeWorkItem statusTimeStamp = " + statusTimeStamp);
			LOGGER.debug("SignalWriteHandler.executeWorkItem history = " + history);
			LOGGER.debug("SignalWriteHandler.executeWorkItem processedSignalId = " + processedSignalId);
			
			SignalInstance si = new SignalInstance(null, name, action, owner, statusTimeStamp, history, processedSignalId);
			EntityManager em = EntityManagerUtil.getEntityManager(ksession);
			em.persist(si);
			
			LOGGER.debug("SignalWriteHandler.executeWorkItem persisted data");
			response = WorkItemUtil.buildSuccessResponse("ID: " + si.getId());
			LOGGER.debug("SignalWriteHandler.executeWorkItem si.getId() = " + si.getId());
			
			LOGGER.debug("SignalWriteHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		} catch (Exception e) {
			LOGGER.error("SignalWriteHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage(), e);
			response = ErrorResponseUtil.create(HttpStatus.INTERNAL_SERVER_ERROR, "SignalWriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}
}
