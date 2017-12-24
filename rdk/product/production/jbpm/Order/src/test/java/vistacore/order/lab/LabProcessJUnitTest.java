/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package vistacore.order.lab;

import static org.jbpm.test.tools.IterableListenerAssert.assertMultipleVariablesChanged;
import static org.jbpm.test.tools.IterableListenerAssert.assertProcessStarted;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.jboss.logging.Logger;
import org.jbpm.test.JbpmJUnitBaseTestCase;
import org.jbpm.test.listener.IterableProcessEventListener;
import org.jbpm.test.listener.TrackingProcessEventListener;
import org.junit.Test;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.audit.ProcessInstanceLog;
import org.kie.api.task.TaskService;
import org.kie.api.task.model.Task;

import gov.va.jbpm.eventlisteners.CustomProcessEventListener;
import vistacore.order.OrderProcessTestUtil;

/**
 *
 * 
 */
public class LabProcessJUnitTest extends JbpmJUnitBaseTestCase {
	private static final String LAB_ORDER_PROCESS = "vistacore/order/lab/Lab.bpmn2";
	private static final String LAB_ORDER_PROCESS_ID = "Order.Lab";
	private static final Logger LOGGER = Logger.getLogger(LabProcessJUnitTest.class);
	private RuntimeEngine runtimeEngine;
	private SignalData signalData;
	private IterableProcessEventListener eventListener;
	private TrackingProcessEventListener processListener;

	public LabProcessJUnitTest() {
		super(true, true, "gov.va.activitydb");
		// populate signalData values
		signalData = buildSignalDataObject();
	}

	@Test 
	public void testLabOrderComplete() throws Exception {

		createRuntimeManager(LAB_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		// Start the process
		kieSession.signalEvent("ORDER.INITIATED", signalData); // this is a start signal
		Long processInstanceId = getProcessInstanceId(LAB_ORDER_PROCESS_ID);
		
		assertMultipleVariablesChanged(eventListener, "signalData");
		assertProcessStarted(eventListener, LAB_ORDER_PROCESS_ID);
		
		assertNodeTriggered(processInstanceId, "ORDER.INITIATED");
		assertNodeTriggered(processInstanceId, "Process received Clinical Object");
		assertNodeTriggered(processInstanceId, "Update Processed Event State");
		assertNodeTriggered(processInstanceId, "Prepare for signal registration");
		assertNodeTriggered(processInstanceId, "Register for Signal");
		assertNodeTriggered(processInstanceId, "Sign");
       
		signalData.setOrderStatusCode("urn:va:order-status:pend");
		kieSession.signalEvent("ORDER.UPDATED", signalData, processInstanceId); //  signal order signed
		assertNodeTriggered(processInstanceId,"Check notification date for collection");
		
		// For the timer before "Lab Sample Missing" human task node
		int sleep = 2000;
        LOGGER.debug("Sleeping "+sleep+" milliseconds");
        Thread.sleep(sleep);
        LOGGER.debug("Awake!");
        
        // assert the node after the timer
        assertNodeTriggered(processInstanceId, "Lab Sample Missing");
        
        
        // set the Lab active
		signalData.setOrderStatusCode("urn:va:order-status:actv");
		kieSession.signalEvent("ORDER.UPDATED", signalData, processInstanceId);
		assertNodeTriggered(processInstanceId, "Check notification date for results");
		
		// For the timer before "Lab Result Missing" human task node
        LOGGER.debug("Sleeping "+sleep+" milliseconds");
        Thread.sleep(sleep);
        LOGGER.debug("Awake!");
        
        // assert the node after the timer
		assertNodeTriggered(processInstanceId, "Lab Results Missing");
		
		// complete the Lab
		signalData.setOrderStatusCode("urn:va:order-status:comp"); // complete the lab
		kieSession.signalEvent("ORDER.UPDATED", signalData, processInstanceId);
        
		// Assert complete node is triggered
		assertNodeTriggered(processInstanceId, "Completed");
		
		// Assert the lab process is completed
		assertTrue(processListener.getProcessesCompleted().contains(LAB_ORDER_PROCESS_ID));
		printProcessCreatedTasks(processInstanceId);
	}
	
	@Test 
	public void testLabOrderDelete() throws Exception {

		createRuntimeManager(LAB_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		// Start the process
		kieSession.signalEvent("ORDER.INITIATED", signalData); // this is a start signal
		Long processInstanceId = getProcessInstanceId(LAB_ORDER_PROCESS_ID);
		
		assertMultipleVariablesChanged(eventListener, "signalData");
		assertProcessStarted(eventListener, LAB_ORDER_PROCESS_ID);
		
		assertNodeTriggered(processInstanceId, "ORDER.INITIATED");
		assertNodeTriggered(processInstanceId, "Process received Clinical Object");
		assertNodeTriggered(processInstanceId, "Update Processed Event State");
		assertNodeTriggered(processInstanceId, "Prepare for signal registration");
		assertNodeTriggered(processInstanceId, "Register for Signal");
		assertNodeTriggered(processInstanceId, "Sign");
       
		signalData.setOrderStatusCode("urn:va:order-status:exp");
		signalData.setEhmpState("delete");
		kieSession.signalEvent("ORDER.UPDATED", signalData, processInstanceId); //  signal order signed
	
		// Assert Discontinued node is triggered
		assertNodeTriggered(processInstanceId, "Discontinued");
		
		// Assert the lab process is completed
		assertTrue(processListener.getProcessesCompleted().contains(LAB_ORDER_PROCESS_ID));
		
		LOGGER.info("Nodes Triggered : " + processListener.getNodesTriggered());
		//printProcessCreatedTasks(processInstanceId);
	}
	
	
	@Test 
	public void testLabOrderCancel() throws Exception {

		createRuntimeManager(LAB_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();

		registerListners(kieSession);
		
		// Register the work item handlers
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		// Start the process
		kieSession.signalEvent("ORDER.INITIATED", signalData); 
		Long processInstanceId = getProcessInstanceId(LAB_ORDER_PROCESS_ID);
		
		assertMultipleVariablesChanged(eventListener, "signalData");
		assertProcessStarted(eventListener, LAB_ORDER_PROCESS_ID);
		
		assertNodeTriggered(processInstanceId, "ORDER.INITIATED");
		assertNodeTriggered(processInstanceId, "Process received Clinical Object");
		assertNodeTriggered(processInstanceId, "Update Processed Event State");
		assertNodeTriggered(processInstanceId, "Prepare for signal registration");
		assertNodeTriggered(processInstanceId, "Register for Signal");
		assertNodeTriggered(processInstanceId, "Sign");
		
		// Cancel the Lab
		signalData.setOrderStatusCode("urn:va:order-status:canc"); 
		kieSession.signalEvent("ORDER.UPDATED", signalData, processInstanceId);
        
		// Assert Discontinued node is triggered since the lab is canceled
		assertNodeTriggered(processInstanceId, "Discontinued");
		
		// Assert the lab process is completed
		assertTrue(processListener.getProcessesCompleted().contains(LAB_ORDER_PROCESS_ID));
		
		//System.out.println("Nodes Triggered = " + processListener.getNodesTriggered());
		printProcessCreatedTasks(processInstanceId);
	}

	@Test 
	public void testLabOrderClinicalObjectPersisted() throws Exception {
		createRuntimeManager(LAB_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();
		
		// the clinical object is already persisted.
		signalData.setClinicalObjectUid("1111"); 
		KieSession kieSession = runtimeEngine.getKieSession();

		registerListners(kieSession);
		
		// Register the work item handlers
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		// Start the process
		kieSession.signalEvent("ORDER.INITIATED", signalData); 
		Long processInstanceId = getProcessInstanceId(LAB_ORDER_PROCESS_ID);
		
		assertMultipleVariablesChanged(eventListener, "signalData");
		assertProcessStarted(eventListener, LAB_ORDER_PROCESS_ID);
		
		assertNodeTriggered(processInstanceId, "ORDER.INITIATED");
		
		// Assert 'Store Clinical Object' node was not triggered
		assertTrue(!processListener.getNodesTriggered().contains("Store Clinical Object"));
	}

	
	@Test 
	public void testLabOrderNoResultNotificationDate() throws Exception {

		createRuntimeManager(LAB_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();
		// Set ResultNotificationDate to null or empty
		signalData.setNoResultNotificationDate(null); 
		KieSession kieSession = runtimeEngine.getKieSession();

		registerListners(kieSession);
		
		// Register the work item handlers
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		// Start the process
		kieSession.signalEvent("ORDER.INITIATED", signalData); 
		Long processInstanceId = getProcessInstanceId(LAB_ORDER_PROCESS_ID);
		
		assertMultipleVariablesChanged(eventListener, "signalData");
		assertProcessStarted(eventListener, LAB_ORDER_PROCESS_ID);
		
		assertNodeTriggered(processInstanceId, "ORDER.INITIATED");
		
		// Assert 'Check notification date for collection' node was not triggered
		assertTrue(!processListener.getNodesTriggered().contains("Check notification date for collection"));
		
		// Assert 'Check notification date for results' node was not triggered
		assertTrue(!processListener.getNodesTriggered().contains("Check notification date for results"));
		
	}
	
	private SignalData buildSignalDataObject() {
		SignalData signalData = new SignalData();
		signalData.setReferenceId("urn:va:order:SITE:100716:44903");
		signalData.setAuthorUid("urn:va:user:SITE:991");
		signalData.setPid("SITE;3");
		signalData.setEhmpState("active");
		//signalData.setClinicalObjectUid("1111"); // if the clinical object is already persisted.
		signalData.setName("Test Lab Order Signals");
		signalData.setListenerId("101"); // set from AM_EVENTLISTENER sequence table
		signalData.setOrderStatusCode("urn:va:order-status:unr");
		signalData.setProviderUid("urn:va:patient:SITE:3:3");
		signalData.setMessage(getFile("signalData.json"));
		signalData.setNoResultNotificationDate("20170315");
		return signalData;
	}

	private void printProcessCreatedTasks(Long processInstanceId) {
		TaskService taskService = runtimeEngine.getTaskService();
		List<Long> tasks = taskService.getTasksByProcessInstanceId(processInstanceId);
		for (Long taskId : tasks) {
			Task task = taskService.getTaskById(taskId);
			System.out.println("Task Name = " + task.getName());
		}
	}

	private long getProcessInstanceId(String processId) {
		long processInstanceId = 0;;
		List<? extends ProcessInstanceLog> instanceLogList = runtimeEngine.getAuditService().findActiveProcessInstances(LAB_ORDER_PROCESS_ID);
		for (Iterator<?> iterator = instanceLogList.iterator(); iterator.hasNext();) {
			ProcessInstanceLog processInstanceLog = (ProcessInstanceLog) iterator.next();
			if(processInstanceLog.getProcessId().equals(processId)) {
				processInstanceId = processInstanceLog.getProcessInstanceId();
			}
		}
		return processInstanceId;
	}

	private String getFile(String fileName) {
		String result = "";
		ClassLoader classLoader = getClass().getClassLoader();
		try {
			result = IOUtils.toString(classLoader.getResourceAsStream(fileName));
		} catch (IOException e) {
			e.printStackTrace();
		}
		return result;
	}
	public void registerListners(KieSession kieSession) {
		processListener = new TrackingProcessEventListener();
		eventListener = new IterableProcessEventListener();
		kieSession.addEventListener(eventListener);
		kieSession.addEventListener(processListener);
		kieSession.addEventListener(new CustomProcessEventListener());
	}
}

