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
import gov.va.jbpm.entities.util.TaskInstanceImplUtil;

/*
 * Custom process event listener
 * 
 * */
public class CustomProcessEventListener extends DefaultProcessEventListener{

//-----------------------------------------------------------------------------
//-----------------------Constructors------------------------------------------
//-----------------------------------------------------------------------------
	public CustomProcessEventListener() {
	}

	//-----------------------------------------------------------------------------
	//-----------------------Overrides---------------------------------------------
	//-----------------------------------------------------------------------------
	
	/*
	 * Handler for beforeNodeLeft event. This event raised before leaving a node.
	 * If it is a Human Task Node, persist taskHistory process variable value if exists, in task instance table.
	 * */
	@Override
    public void beforeNodeLeft(ProcessNodeLeftEvent event) {
        NodeInstance nodeInstance = event.getNodeInstance();
        if( nodeInstance instanceof HumanTaskNodeInstance ) {        	        	        	
        	HumanTaskNodeInstance htni = (HumanTaskNodeInstance)nodeInstance;
        	Object taskHistory = htni.getProcessInstance().getVariable(TaskInstanceImplUtil.TASK_HISTORY);
        	if (taskHistory == null) {
        		return; 
        	}        	
        	        	
    		
    		long taskId = -1;
    		try {
    			KieSession session = (KieSession) event.getKieRuntime();
    			RuntimeManager manager = (RuntimeManager)session.getEnvironment().get("RuntimeManager");    		
	            RuntimeEngine runtime = manager.getRuntimeEngine(ProcessInstanceIdContext.get(htni.getProcessInstance().getId()));
	            TaskService taskService = runtime.getTaskService();
	    		WorkItem workItem = htni.getWorkItem();
	            Task myTask = taskService.getTaskByWorkItemId(workItem.getId());	
	            taskId = myTask.getId();	
    		}
    		catch(Exception exc) {
    			// not able to get the task id. so return.
    			return;
    		}
    		
    		EntityManager em = getEntityManager(event);	
    		TaskInstanceImpl taskInstanceImpl = em.find(TaskInstanceImpl.class, taskId);
    		if (taskInstanceImpl == null) {
    			return;
    		}        	
    		
    		taskInstanceImpl.setHistory((String)taskHistory);
        	em.merge(taskInstanceImpl);
        	em.flush();
        } 
    }
	
	/*
	 * Handler for beforeProcessStarted event. This is the first event raised when new process created.
	 * Create a new process instance record in the database. Here state of the process is PENDING.
	 * */
	@Override
    public void beforeProcessStarted(ProcessStartedEvent event) {

		EntityManager em = getEntityManager(event);

		ProcessInstanceImpl processInstanceImpl = ProcessInstanceImplUtil.create(event);
		//System.out.println("beforeProcessStarted: " + processInstanceImpl);
		em.persist(processInstanceImpl);
		
		List<ProcessRouteImpl> routes = processInstanceImpl.getRoutes();
		for (ProcessRouteImpl processRouteImpl : routes) {
			em.persist(processRouteImpl);
		}
		
		em.flush();
	}
	
	/*
	 * Handler for afterProcessStarted event. This event raised after process started successfully.
	 * Here state of the process is ACTIVE. Update process instance record in the database with new state/status.
	 * */
	@Override
	public void afterProcessStarted (ProcessStartedEvent event) {
		updateProcessInstanceStatus(event);
	}

	/*
	 * Handler for afterProcessCompleted event. This event raised after process completed.
	 * Update process instance record in the database with new state/status.
	 * */
	@Override
	public void afterProcessCompleted(ProcessCompletedEvent event) {
		updateProcessInstanceStatus(event);
	}
 
	/*
	 * Handler for afterVariableChanged event. This event raised after process variable value changed.
	 * Update process instance record in the database with new value.
	 * */ 
	@Override
	public void afterVariableChanged(ProcessVariableChangedEvent event) {
		long processInstanceId = event.getProcessInstance().getId();
		EntityManager em = getEntityManager(event);

		ProcessInstanceImpl processInstanceImpl = em.find(ProcessInstanceImpl.class, processInstanceId);
		if (processInstanceImpl == null) {
			return;
		}

		switch(event.getVariableId()) {		
			case ProcessInstanceImplUtil.ASSIGNED_TO: {
					String assignedTo = (String)event.getNewValue();
					processInstanceImpl.setAssignedTo(assignedTo);
				}
				break;
			case ProcessInstanceImplUtil.STATE: {
					String processInstanceState = (String)event.getNewValue();
					processInstanceImpl.setState(processInstanceState);
					processInstanceImpl.setStateStartDate(new Date());
				}
				break;
			case ProcessInstanceImplUtil.STATE_DUE_DATE: {
					DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
					DateTime dueDate = formatter.parseDateTime((String)event.getNewValue());
	
					Date date = dueDate.toDate();
					processInstanceImpl.setStateDueDate(date);
				}
				break;
			case ProcessInstanceImplUtil.CLINICAL_OBJECT_UID: {
					String clinicalObjectUid = (String)event.getNewValue();
					processInstanceImpl.setClinicalObjectUid(clinicalObjectUid);
				}
				break;
			case ProcessInstanceImplUtil.ACTIVITY_HEALTHY: {
					Boolean activityHealthy = (Boolean)event.getNewValue();
					processInstanceImpl.setActivityHealthy(activityHealthy);
				}
				break;
			case ProcessInstanceImplUtil.ACTIVITY_HEALTH_DESCRIPTION: {
					String activityHealthDescription = (String)event.getNewValue();
					processInstanceImpl.setActivityHealthDescription(activityHealthDescription);
				}
				break;
			case ProcessInstanceImplUtil.FACILITY_ID: {
				String facilityId = (String)event.getNewValue();
				processInstanceImpl.setFacilityId(facilityId);
			}
			break;
			case ProcessInstanceImplUtil.PATIENT_ID: {
				String pidOrIcn = (String)event.getNewValue();
				processInstanceImpl.setIcn(pidOrIcn);
			}
			break;
			case ProcessInstanceImplUtil.TYPE: {
				String type = (String)event.getNewValue();
				processInstanceImpl.setType(type);
			}
			break;
			// the subDomain field in the enterprise-orderable maps to the DOMAIN column in the activityDB
			case ProcessInstanceImplUtil.SUBDOMAIN: {
				String domain = (String)event.getNewValue();
				processInstanceImpl.setDomain(domain);
			}
			break;
			case ProcessInstanceImplUtil.DESCRIPTION: {
				String description = (String)event.getNewValue();
				processInstanceImpl.setDescription(description);
			}
			break;
			case ProcessInstanceImplUtil.INSTANCE_NAME: {
				String instanceName = (String)event.getNewValue();
				processInstanceImpl.setInstanceName(instanceName);
			}
			break;
			case ProcessInstanceImplUtil.URGENCY: {
				long urgency = Long.parseLong((String)event.getNewValue());
				processInstanceImpl.setUrgency(urgency);
			}
			break;
			case ProcessInstanceImplUtil.INITIATOR: {
				String initiator = (String)event.getNewValue();
				processInstanceImpl.setCreatedById(initiator);
			}
			break;			
			default:
				return;
		}
		
		em.merge(processInstanceImpl);
		em.flush();
		
	}


//-----------------------------------------------------------------------------
//-----------------------Private Helper Methods--------------------------------
//-----------------------------------------------------------------------------
	private EntityManager getEntityManager(ProcessEvent event) {
		Environment env = event.getKieRuntime().getEnvironment();
		EntityManagerFactory entityManagerFactory = (EntityManagerFactory)env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
		EntityManager em = entityManagerFactory.createEntityManager();

		em.joinTransaction();

		return em;
	}
	
	private void updateProcessInstanceStatus(ProcessEvent event) {
		long processInstanceId = event.getProcessInstance().getId();
		EntityManager em = getEntityManager(event);

		ProcessInstanceImpl processInstanceImpl = em.find(ProcessInstanceImpl.class, processInstanceId);
		if (processInstanceImpl == null) {
			return;
		}

		int state = event.getProcessInstance().getState();
		processInstanceImpl.setStatusId(state);
		processInstanceImpl.setStatusTimeStamp(new Date());
		em.merge(processInstanceImpl);
		em.flush();
		
	}

}
