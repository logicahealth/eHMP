package gov.va.jbpm.eventlisteners;

import java.util.Date;
import java.util.Map;

import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.event.process.DefaultProcessEventListener;
import org.kie.api.event.process.ProcessCompletedEvent;
import org.kie.api.event.process.ProcessStartedEvent;
import org.kie.api.event.process.ProcessVariableChangedEvent;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeManager;

/*
 * Custom process event listener
 * 
 * */
public class CustomProcessEventListener extends DefaultProcessEventListener{

	private static final String PATIENT_ID = "icn";
	private static final String FACILITY_ID = "facility";
	private static final String INITIATOR = "initiator";
	private static final String PARENT_INSTANCE_ID = "parentInstanceId";
	private static final String INSTANCE_NAME = "instanceName";
	private static final String STATE = "state";
	private static final String STATE_DUE_DATE = "stateDueDate";
	private static final String URGENCY = "urgency";
	
	/*
	 * Handler for beforeProcessStarted event. This is the first event raised when new process created.
	 * Create a new process instance record in the database. Here state of the process is PENDING.
	 * */
	@Override
    public void beforeProcessStarted(ProcessStartedEvent event) {
		
    	WorkflowProcessInstanceImpl processInstance = (WorkflowProcessInstanceImpl) event.getProcessInstance();
    	
		Map<String,Object> procInstVariables = processInstance.getVariables();		

		KieSession session = (KieSession) event.getKieRuntime();
		RuntimeManager manager = (RuntimeManager)session.getEnvironment().get("RuntimeManager");
		
		long processInstanceId = processInstance.getId();
		String patientIcn = "";
		String facilityId = null;
		String processName  = processInstance.getProcessName();
		String processDefinitionId = processInstance.getProcessId();
		String deploymentId = manager.getIdentifier();
		String createdById = "";
		
		String version = processInstance.getProcess().getVersion();
	    long parentInstanceId = -1;
	    String instanceName = null;;
	    String state = null;
	    Date stateDueDate = null;
	    int urgency = -1;
		
		
		if (procInstVariables != null) {
			if (procInstVariables.containsKey(PATIENT_ID)){
				patientIcn = (String)procInstVariables.get(PATIENT_ID);
			}
			
			if (procInstVariables.containsKey(FACILITY_ID)) {
				facilityId = (String)procInstVariables.get(FACILITY_ID);
			}

			if (procInstVariables.containsKey(INITIATOR)) {
				createdById = (String)procInstVariables.get(INITIATOR);
			}			

			if (procInstVariables.containsKey(PARENT_INSTANCE_ID)) {
				parentInstanceId = Long.parseLong((String)procInstVariables.get(PARENT_INSTANCE_ID));
			}
			
			if (procInstVariables.containsKey(INSTANCE_NAME)) {
				instanceName = (String)procInstVariables.get(INSTANCE_NAME);
			}			

			if (procInstVariables.containsKey(STATE)) {
				state = (String)procInstVariables.get(STATE);
			}
			
			if (procInstVariables.containsKey(STATE_DUE_DATE)) {
				try {
		    		DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
		    		stateDueDate = formatter.parseDateTime((String)procInstVariables.get(STATE_DUE_DATE)).toDate();
				}
				catch(Exception e) {
					e.printStackTrace();
				}
			}

			if (procInstVariables.containsKey(URGENCY)) {
				urgency = Integer.parseInt((String)procInstVariables.get(URGENCY));
			}
		}
		
		DataAccessUtil.createProcessInstanceRecord (processInstanceId, 
				patientIcn, 
				facilityId, 
				processName, 
				processDefinitionId, 
				deploymentId, 
				processInstance.getState(),
				createdById,
				version,
				parentInstanceId,
				instanceName,
				state,
				stateDueDate,
				urgency		
				);		
    }	

	/*
	 * Handler for afterProcessStarted event. This event raised after process started successfully.
	 * Here state of the process is ACTIVE. Update process instance record in the database with new state/status.
	 * */    
    @Override
    public void afterProcessStarted (ProcessStartedEvent event) {

    	WorkflowProcessInstanceImpl processInstance = (WorkflowProcessInstanceImpl) event.getProcessInstance();
		DataAccessUtil.updateProcessInstanceStatus(processInstance.getId(), processInstance.getState());    	
    }
	
	/*
	 * Handler for afterProcessCompleted event. This event raised after process completed.
	 * Update process instance record in the database with new state/status.
	 * */    
    @Override
    public void afterProcessCompleted(ProcessCompletedEvent event) {
    	
    	WorkflowProcessInstanceImpl processInstance = (WorkflowProcessInstanceImpl) event.getProcessInstance();
		DataAccessUtil.updateProcessInstanceStatus(processInstance.getId(), processInstance.getState());
    }
 
	/*
	 * Handler for afterVariableChanged event. This event raised after process variable value changed.
	 * Update process instance record in the database with new value.
	 * */ 
    @Override
    public void afterVariableChanged(ProcessVariableChangedEvent event) {
    	if (event.getVariableId().equals(STATE)) {
    		DataAccessUtil.updateProcessInstanceState(event.getProcessInstance().getId(), (String)event.getNewValue());
    	} else if (event.getVariableId().equals(STATE_DUE_DATE)) {
    		
			try {
	    		DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
	    		DateTime dueDate = formatter.parseDateTime((String)event.getNewValue());
	    		
			 	DataAccessUtil.updateProcessInstanceStateDueDate(event.getProcessInstance().getId(), dueDate.toDate());
			}
			catch(Exception e) {
				e.printStackTrace();
			}
    	}
    }
}
