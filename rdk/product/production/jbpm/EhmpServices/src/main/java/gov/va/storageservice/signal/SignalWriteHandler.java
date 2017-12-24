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
			
			LOGGER.debug(String.format(new StringBuilder("SignalWriteHandler.executeWorkItem name = %s%n")
			.append(" action = %s%n")
			.append(" owner = %s%n")
			.append(" statusTimeStamp = %tc%n")
			.append(" history = %s%n")
			.append(" processedSignalId = %d").toString()
			, name
			, action
			, owner
			, statusTimeStamp
			, history
			, processedSignalId));
			
			SignalInstance si = new SignalInstance(null, name, action, owner, statusTimeStamp, history, processedSignalId);
			EntityManager em = EntityManagerUtil.getEntityManager(ksession);
			em.persist(si);
			
			LOGGER.debug("SignalWriteHandler.executeWorkItem persisted data");
			response = WorkItemUtil.buildSuccessResponse("ID: " + si.getId());
			LOGGER.debug(String.format("SignalWriteHandler.executeWorkItem si.getId() = %f", si.getId()));
			
			LOGGER.debug(String.format("SignalWriteHandler.executeWorkItem response = %s", response));
		} catch (EhmpServicesException e) {
			LOGGER.error(e.getMessage(), e);
			response = e.createJsonErrorResponse();
		} catch (Exception e) {
			LOGGER.error(String.format("SignalWriteHandler.executeWorkItem: An unexpected condition has happened: %s", e.getMessage()), e);
			response = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "SignalWriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}	
}
