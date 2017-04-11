package gov.va.storageservice.signal;

import java.util.Calendar;
import java.util.Date;

import javax.persistence.EntityManager;

import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;

import gov.va.activitydb.entities.SignalInstance;
import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.utils.Logging;
import gov.va.kie.utils.EntityManagerUtil;
import gov.va.kie.utils.WorkItemUtil;

public class SignalWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	private KieSession ksession;
	
	public SignalWriteHandler(KieSession ksession){
		this.ksession = ksession;		
	}
	
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		Logging.debug("SignalWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts the notification (contained in a parameter of the WorkItem called 'notification')
	 * to the Notifications API and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			Logging.info("Entering SignalWriteHandler.executeWorkItem");
			String name = WorkItemUtil.extractStringParam(workItem, "name");
			String action = WorkItemUtil.extractStringParam(workItem, "action");
			String owner = WorkItemUtil.extractStringParam(workItem, "owner");
			Date statusTimeStamp = Calendar.getInstance().getTime();
			String history = WorkItemUtil.extractStringParam(workItem, "history");
			long processedSignalId = workItem.getProcessInstanceId();
			
			Logging.debug("SignalWriteHandler.executeWorkItem name = " + name);
			Logging.debug("SignalWriteHandler.executeWorkItem action = " + action);
			Logging.debug("SignalWriteHandler.executeWorkItem owner = " + owner);
			Logging.debug("SignalWriteHandler.executeWorkItem statusTimeStamp = " + statusTimeStamp);
			Logging.debug("SignalWriteHandler.executeWorkItem history = " + history);
			Logging.debug("SignalWriteHandler.executeWorkItem processedSignalId = " + processedSignalId);
			
			SignalInstance si = new SignalInstance(null, name, action, owner, statusTimeStamp, history, processedSignalId);
			EntityManager em = EntityManagerUtil.getEntityManager(ksession);
			em.persist(si);
			
			Logging.debug("SignalWriteHandler.executeWorkItem persisted data");
			response = WorkItemUtil.buildSuccessResponse("ID: " + si.getId());
			Logging.debug("SignalWriteHandler.executeWorkItem si.getId() = " + si.getId());
			
			Logging.debug("SignalWriteHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}
}
