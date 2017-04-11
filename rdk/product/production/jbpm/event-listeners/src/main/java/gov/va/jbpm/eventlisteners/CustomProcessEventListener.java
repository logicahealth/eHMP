package gov.va.jbpm.eventlisteners;

import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.jbpm.workflow.instance.node.HumanTaskNodeInstance;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.event.process.DefaultProcessEventListener;
import org.kie.api.event.process.ProcessCompletedEvent;
import org.kie.api.event.process.ProcessEvent;
import org.kie.api.event.process.ProcessNodeLeftEvent;
import org.kie.api.event.process.ProcessStartedEvent;
import org.kie.api.event.process.ProcessVariableChangedEvent;
import org.kie.api.runtime.Environment;
import org.kie.api.runtime.EnvironmentName;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.RuntimeManager;
import org.kie.api.runtime.process.NodeInstance;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.task.TaskService;
import org.kie.api.task.model.Task;
import org.kie.internal.runtime.manager.context.ProcessInstanceIdContext;

import gov.va.jbpm.entities.impl.ProcessInstanceImpl;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;
import gov.va.jbpm.entities.impl.TaskInstanceImpl;
import gov.va.jbpm.entities.util.ProcessInstanceImplUtil;
import gov.va.jbpm.entities.util.ProcessRouteImplUtil;
import gov.va.jbpm.entities.util.TaskInstanceImplUtil;
import gov.va.jbpm.exception.EventListenerException;
import gov.va.jbpm.utils.Logging;

/*
 * Custom process event listener
 * 
 * */
public class CustomProcessEventListener extends DefaultProcessEventListener {

// -----------------------------------------------------------------------------
// -----------------------Constructors------------------------------------------
// -----------------------------------------------------------------------------
	public CustomProcessEventListener() {
	}

// -----------------------------------------------------------------------------
// -----------------------Overrides---------------------------------------------
// -----------------------------------------------------------------------------

	/*
	 * Handler for beforeNodeLeft event. This event raised before leaving a
	 * node. If it is a Human Task Node, persist taskHistory process variable
	 * value if exists, in task instance table.
	 */
	@Override
	public void beforeNodeLeft(ProcessNodeLeftEvent event) {
		Logging.debug("Entering CustomProcessEventListener.beforeNodeLeft");
		try {
			NodeInstance nodeInstance = event.getNodeInstance();
			if (nodeInstance instanceof HumanTaskNodeInstance) {
				HumanTaskNodeInstance htni = (HumanTaskNodeInstance) nodeInstance;
				Object taskHistoryAction = htni.getProcessInstance().getVariable(TaskInstanceImplUtil.TASK_HISTORY_ACTION);
				Object taskHistory = htni.getProcessInstance().getVariable(TaskInstanceImplUtil.TASK_HISTORY);
				if (taskHistory == null && taskHistoryAction == null) {
					return;
				}

				long taskId = -1;
				try {
					KieSession session = (KieSession) event.getKieRuntime();
					RuntimeManager manager = (RuntimeManager) session.getEnvironment().get("RuntimeManager");
					RuntimeEngine runtime = manager.getRuntimeEngine(ProcessInstanceIdContext.get(htni.getProcessInstance().getId()));
					TaskService taskService = runtime.getTaskService();
					WorkItem workItem = htni.getWorkItem();
					Task myTask = taskService.getTaskByWorkItemId(workItem.getId());
					taskId = myTask.getId();
				} catch (Exception exc) {
					throw new EventListenerException("CustomProcessEventListener.beforeNodeLeft: Not able to get the taskId: " + exc.getMessage(), exc);
				}

				EntityManager em = getEntityManager(event);
				TaskInstanceImpl taskInstanceImpl = em.find(TaskInstanceImpl.class, taskId);
				if (taskInstanceImpl == null)
					return;

				if (taskHistory != null)
					taskInstanceImpl.setHistory((String) taskHistory);
				if (taskHistoryAction != null)
					taskInstanceImpl.setHistoryAction((String) taskHistoryAction);

				em.merge(taskInstanceImpl);
				em.flush();
			}
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			Logging.error("CustomProcessEventListener.beforeNodeLeft: An unexpected condition has happened: " + e.getMessage());
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

	/*
	 * Handler for beforeProcessStarted event. This is the first event raised
	 * when new process created. Create a new process instance record in the
	 * database. Here state of the process is PENDING.
	 */
	@Override
	public void beforeProcessStarted(ProcessStartedEvent event) {
		Logging.debug("Entering CustomProcessEventListener.beforeProcessStarted");
		
		try {
			EntityManager em = getEntityManager(event);

			ProcessInstanceImpl processInstanceImpl = ProcessInstanceImplUtil.create(event);
			Logging.debug("CustomProcessEventListener.beforeProcessStarted: processInstanceImpl: " + processInstanceImpl);
			em.persist(processInstanceImpl);

			List<ProcessRouteImpl> routes = processInstanceImpl.getRoutes();
			
			if (routes != null) {
				for (ProcessRouteImpl processRouteImpl : routes) {
					em.persist(processRouteImpl);
				}
			}

			em.flush();
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			Logging.error("CustomProcessEventListener.beforeProcessStarted: An unexpected condition has happened: " + e.getMessage());
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

	/*
	 * Handler for afterProcessStarted event. This event raised after process
	 * started successfully. Here state of the process is ACTIVE. Update process
	 * instance record in the database with new state/status.
	 */
	@Override
	public void afterProcessStarted(ProcessStartedEvent event) {
		Logging.debug("Entering CustomProcessEventListener.afterProcessStarted");
		try {
			updateProcessInstanceStatus(event);
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			Logging.error("CustomProcessEventListener.afterProcessStarted: An unexpected condition has happened: " + e.getMessage());
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

	/*
	 * Handler for afterProcessCompleted event. This event raised after process
	 * completed. Update process instance record in the database with new
	 * state/status.
	 */
	@Override
	public void afterProcessCompleted(ProcessCompletedEvent event) {
		Logging.debug("Entering CustomProcessEventListener.afterProcessCompleted");
		try {
			updateProcessInstanceStatus(event);
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			Logging.error("CustomProcessEventListener.afterProcessCompleted: An unexpected condition has happened: " + e.getMessage());
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

	private int removeOldProcessRoutes(EntityManager em, long processInstanceId) {
		Logging.debug("Entering CustomProcessEventListener.removeOldProcessRoutes");
		int rowsRemoved = em
				.createQuery("DELETE FROM ProcessRouteImpl pri WHERE pri.processInstanceId = :processInstanceId")
				.setParameter("processInstanceId", processInstanceId).executeUpdate();
		Logging.debug("CustomProcessEventListener.removeOldProcessRoutes: routes rowsRemoved: " + rowsRemoved);
		return rowsRemoved;
	}

	private void saveNewProcessRoutes(EntityManager em, long processInstanceId, String assignedTo) throws EventListenerException {
		Logging.debug("Entering CustomProcessEventListener.saveNewProcessRoutes");
		List<ProcessRouteImpl> routes = ProcessRouteImplUtil.create(processInstanceId, assignedTo);
		if (routes == null)
			throw new EventListenerException("CustomProcessEventListener.saveNewProcessRoutes.routes was null");
				
		for (ProcessRouteImpl processRouteImpl : routes) {
			em.persist(processRouteImpl);
		}
	}

	/*
	 * Handler for afterVariableChanged event. This event raised after process
	 * variable value changed. Update process instance record in the database
	 * with new value.
	 */
	@Override
	public void afterVariableChanged(ProcessVariableChangedEvent event) {
		Logging.debug("Entering CustomProcessEventListener.afterVariableChanged");
		try {
			long processInstanceId = event.getProcessInstance().getId();
			EntityManager em = getEntityManager(event);

			
			ProcessInstanceImpl processInstanceImpl = em.find(ProcessInstanceImpl.class, processInstanceId);
			if (processInstanceImpl == null)
				return;

			Object newValue = event.getNewValue();
			switch (event.getVariableId()) {
				case ProcessInstanceImplUtil.ASSIGNED_TO: {
					String assignedTo = getStringFromNewValue(newValue);
	
					removeOldProcessRoutes(em, processInstanceId);
					saveNewProcessRoutes(em, processInstanceId, assignedTo);
	
					processInstanceImpl.setAssignedTo(assignedTo);
				}
				break;
				case ProcessInstanceImplUtil.STATE: {
					String processInstanceState = getStringFromNewValue(newValue);
					processInstanceImpl.setState(processInstanceState);
					processInstanceImpl.setStateStartDate(new Date());
				}
				break;
				case ProcessInstanceImplUtil.STATE_DUE_DATE: {
					Date date = getDateFromNewValue(newValue);
					processInstanceImpl.setStateDueDate(date);
				}
				break;
				case ProcessInstanceImplUtil.CLINICAL_OBJECT_UID: {
					String clinicalObjectUid = getStringFromNewValue(newValue);
					processInstanceImpl.setClinicalObjectUid(clinicalObjectUid);
				}
				break;
				case ProcessInstanceImplUtil.ACTIVITY_HEALTHY: {
					Boolean activityHealthy = getBooleanFromNewValue(newValue);
					processInstanceImpl.setActivityHealthy(activityHealthy);
				}
				break;
				case ProcessInstanceImplUtil.ACTIVITY_HEALTH_DESCRIPTION: {
					String activityHealthDescription = getStringFromNewValue(newValue);
					processInstanceImpl.setActivityHealthDescription(activityHealthDescription);
				}
				break;
				case ProcessInstanceImplUtil.FACILITY_ID: {
					String facilityId = getStringFromNewValue(newValue);
					processInstanceImpl.setFacilityId(facilityId);
				}
				break;
				case ProcessInstanceImplUtil.DESTINATION_FACILITY_ID: {
					String destinationFacilityId = getStringFromNewValue(newValue);
					processInstanceImpl.setDestinationFacilityId(destinationFacilityId);
				}
				break;
				case ProcessInstanceImplUtil.PATIENT_ID: {
					String pidOrIcn = getStringFromNewValue(newValue);
					processInstanceImpl.setIcn(pidOrIcn);
				}
				break;
				case ProcessInstanceImplUtil.TYPE: {
					String type = getStringFromNewValue(newValue);
					processInstanceImpl.setType(type);
				}
				break;
				// the subDomain field in the enterprise-orderable maps to the DOMAIN
				// column in the activityDB
				case ProcessInstanceImplUtil.SUBDOMAIN: {
					String domain = getStringFromNewValue(newValue);
					processInstanceImpl.setDomain(domain);
				}
				break;
				case ProcessInstanceImplUtil.DESCRIPTION: {
					String description = getStringFromNewValue(newValue);
					processInstanceImpl.setDescription(description);
				}
				break;
				case ProcessInstanceImplUtil.INSTANCE_NAME: {
					String instanceName = getStringFromNewValue(newValue);
					processInstanceImpl.setInstanceName(instanceName);
				}
				break;
				case ProcessInstanceImplUtil.URGENCY: {
					long urgency = getlongFromNewValue(newValue);
					processInstanceImpl.setUrgency(urgency);
				}
				break;
				case ProcessInstanceImplUtil.INITIATOR: {
					String initiator = getStringFromNewValue(newValue);
					processInstanceImpl.setCreatedById(initiator);
				}
				break;
				
				default:
				return;
			}

			em.merge(processInstanceImpl);
			em.flush();
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			Logging.error("CustomProcessEventListener.afterVariableChanged: An unexpected condition has happened: " + e.getMessage());
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

// -----------------------------------------------------------------------------
// -----------------------Private Helper Methods--------------------------------
// -----------------------------------------------------------------------------
	private String getStringFromNewValue(Object newValue) throws EventListenerException {
		if (newValue == null)
			return null;
		
		if (!(newValue instanceof java.lang.String)) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "newValue was not a String as expected: " + newValue);
		}
		
		String retvalue = (String)newValue;
		return retvalue;
	}
	private Boolean getBooleanFromNewValue(Object newValue) throws EventListenerException {
		if (newValue == null)
			return null;
		
		if (!(newValue instanceof java.lang.Boolean)) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "newValue was not a Boolean as expected: " + newValue);
		}
		
		Boolean retvalue = (Boolean)newValue;
		return retvalue;
	}
	private long getlongFromNewValue(Object newValue) throws EventListenerException {
		String str = getStringFromNewValue(newValue);
		
		long retvalue;
		try {
			retvalue = Long.parseLong(getStringFromNewValue(str));
		} catch (NumberFormatException e) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "newValue was not a long as expected: " + newValue);
		}
		
		return retvalue;
	}
	private Date getDateFromNewValue(Object newValue) throws EventListenerException {
		String str = getStringFromNewValue(newValue);
		
		Date retvalue;
		try {
			DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
			DateTime dueDate = formatter.parseDateTime(str);

			retvalue = dueDate.toDate();
		} catch (Exception e) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "newValue was not a Date as expected: " + newValue);
		}
		
		return retvalue;
	}
	
	private EntityManager getEntityManager(ProcessEvent event) {
		Logging.debug("Entering CustomProcessEventListener.getEntityManager");
		Environment env = event.getKieRuntime().getEnvironment();
		EntityManagerFactory entityManagerFactory = (EntityManagerFactory) env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
		EntityManager em = entityManagerFactory.createEntityManager();

		em.joinTransaction();

		return em;
	}

	private void updateProcessInstanceStatus(ProcessEvent event) throws EventListenerException {
		Logging.debug("Entering CustomProcessEventListener.updateProcessInstanceStatus");
		long processInstanceId = event.getProcessInstance().getId();
		EntityManager em = getEntityManager(event);

		ProcessInstanceImpl processInstanceImpl = em.find(ProcessInstanceImpl.class, processInstanceId);
		if (processInstanceImpl == null)
			return;

		int state = event.getProcessInstance().getState();
		processInstanceImpl.setStatusId(state);
		processInstanceImpl.setStatusTimeStamp(new Date());
		em.merge(processInstanceImpl);
		em.flush();
	}
}
