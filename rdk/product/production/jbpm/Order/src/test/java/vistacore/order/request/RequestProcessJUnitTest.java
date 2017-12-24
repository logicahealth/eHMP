package vistacore.order.request;

import gov.va.jbpm.entities.impl.TaskInstanceImpl;
import gov.va.jbpm.eventlisteners.CustomProcessEventListener;
import gov.va.jbpm.eventlisteners.CustomTaskEventListener;
import org.jboss.logging.Logger;
import org.jbpm.test.JbpmJUnitBaseTestCase;
import org.jbpm.test.listener.IterableProcessEventListener;
import org.jbpm.test.listener.TrackingProcessEventListener;
import org.jbpm.workflow.instance.WorkflowProcessInstance;
import org.junit.Test;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.RuntimeManager;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.task.TaskService;
import org.kie.api.task.model.Task;
import vistacore.order.Activity;
import vistacore.order.OrderProcessTestUtil;
import vistacore.order.Visit;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;


public class RequestProcessJUnitTest extends JbpmJUnitBaseTestCase {
	private static final String REQUEST_ORDER_PROCESS = "vistacore/order/request/Request.bpmn2";
	private static final String REQUEST_ORDER_PROCESS_ID = "Order.Request";
	private static final String DEPLOYMENT_ID = "VistaCore:Order:0:0";
	private static final Logger LOGGER = Logger.getLogger(RequestProcessJUnitTest.class);
	private RuntimeManager runtimeManager;
	private RuntimeEngine runtimeEngine;
	private IterableProcessEventListener eventListener;
	private TrackingProcessEventListener processListener;

	public RequestProcessJUnitTest(){
		super(true, true, "gov.va.activitydb");
	}
	//@Test
	public void testRequestActivityComplete() throws Exception {

		runtimeManager = createRuntimeManager(REQUEST_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);
		Map<String, Object> params = buildInitParams();

		RequestActivity requestActivity = buildRequestActivity();
		params.put("requestActivity", requestActivity);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(REQUEST_ORDER_PROCESS_ID, params);

		assertNodeTriggered(processInstance.getId(), "Prepare pJDS Record");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		// Send accepted edit signal
		requestActivity.setFormAction("accepted");
		kieSession.signalEvent("EDIT", requestActivity, processInstance.getId());
		// For the timer before "Notification/PerfIndicators" script task node
		int sleep = 1000;
		LOGGER.debug("Sleeping "+sleep+" milliseconds");
		Thread.sleep(sleep);
		LOGGER.debug("Awake!");
		System.out.println("Nodes Triggered before second EDIT signal = " + processListener.getNodesTriggered());

		// discontinue or complete the request.
		kieSession.signalEvent("END", requestActivity.getData().getSignals().get(0), processInstance.getId());
		System.out.println("Nodes Triggered after END signal = " + processListener.getNodesTriggered());
	}

	@Test
	public void testRequestActivityReviewTask() throws Exception {

		CustomTaskEventListener taskEventListener = new CustomTaskEventListener();
		customTaskListeners.add(taskEventListener);
		runtimeManager = createRuntimeManager(REQUEST_ORDER_PROCESS);
		taskEventListener.setRuntimeManager(runtimeManager);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		Map<String, Object> params = buildInitParams();

		RequestActivity requestActivity = buildRequestActivity();
		params.put("requestActivity", requestActivity);

		//Setup Response
		Request response = new Request();
		List<Request> responses = new ArrayList<>();
		responses.add(response);
		requestActivity.getData().setResponses(responses);
		response.setUrgency("routine");
		response.setEarliestDate("20170413070000");
		response.setLatestDate("20170514065959");
		response.setTitle("Call Patient");
		response.setAssignTo("Me");
		response.setRequest("The patient needs urgent attention");
		response.setSubmittedByUid("urn:va:user:SITE:991");
		response.setSubmittedByName("PROVIDER,EIGHT");
		response.setSubmittedTimeStamp("2017-04-13T18:41:04.757Z");
		//Setup Response Visit
		Visit responseVisit = new Visit();
		responseVisit.setDateTime("20140624160558");
		responseVisit.setLocation("urn:va:location:SITE:w158");
		responseVisit.setLocationDesc("7A GEN MED");
		responseVisit.setServiceCategory("D");
		response.setVisit(responseVisit);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(REQUEST_ORDER_PROCESS_ID, params);
		int sleep = 5000;
		LOGGER.debug("Sleeping "+sleep+" milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		params.put("out_activity", buildActivityObject("Active: Declined"));
		params.put("out_formAction", "clarification"); // for the 'response' human task
		params.put("out_response", response);
		params.put("out_action", "decline" );
		completeTaskByName(processInstance.getId(), params, "Response");
		assertNodeTriggered(processInstance.getId(), "Response");
		//System.out.println("Nodes Triggered After Completing Response task = " + processListener.getNodesTriggered());

		params.put("out_request", buildRequestObject());
		params.put("out_formAction", "accepted"); // accept the request after the Review task is completed
		completeTaskByName(processInstance.getId(), params, "Review");
		assertNodeTriggered(processInstance.getId(), "Review");
		//System.out.println("Nodes Triggered After Completing Review task = " + processListener.getNodesTriggered());
	}

	@Test
	public void testBeforeEarliestDate() throws Exception {
		CustomTaskEventListener taskEventListener = new CustomTaskEventListener();
		customTaskListeners.add(taskEventListener);
		runtimeManager = createRuntimeManager(REQUEST_ORDER_PROCESS);
		taskEventListener.setRuntimeManager(runtimeManager);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);
		TestWorkItemHandler testHandler = getTestWorkItemHandler();
		kieSession.getWorkItemManager().registerWorkItemHandler("Human Task", testHandler);

		Map<String, Object> params = buildInitParams();
		RequestActivity requestActivity = buildRequestActivity();
		params.put("requestActivity", requestActivity);

		// start the process
		WorkflowProcessInstance processInstance = (WorkflowProcessInstance) kieSession.startProcess(REQUEST_ORDER_PROCESS_ID, params);
		assertProcessInstanceActive(processInstance.getId(), kieSession);
		WorkItem workItem = testHandler.getWorkItem();
		assertNotNull(workItem);
		
		//Verify that the beforeEarliestDate set to true
		assertTrue(Boolean.parseBoolean((String) workItem.getParameter("beforeEarliestDate")));
		
		EntityManager em = getEmf().createEntityManager();
		List<TaskInstanceImpl> results = em.createQuery("from TaskInstanceImpl ti where  ti.processInstanceId = :processInstanceId", 
				TaskInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<TaskInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			TaskInstanceImpl task = (TaskInstanceImpl) iterator.next();
			// For Request activity process the default value for beforeEarliestDate is true.
			assertTrue(task.getBeforeEarliestDate());
		}
	}

	private void registerListners(KieSession kieSession) {
		processListener = new TrackingProcessEventListener();
		eventListener = new IterableProcessEventListener();
		kieSession.addEventListener(eventListener);
		kieSession.addEventListener(processListener);
		kieSession.addEventListener(new CustomProcessEventListener());
	}

	private Map<String, Object> buildInitParams() {
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("icn", "SITE;8");
		params.put("pid", "SITE;8");
		params.put("instanceName", "Call Patient");
		params.put("formAction", "accepted");
		params.put("urgency", "9");
		params.put("subDomain", "Request");
		params.put("assignedTo", "SITE;991");
		params.put("type", "Order");
		params.put("facility", "500");
		params.put("destinationFacility", "500");
		params.put("description", "Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.");
		return params;
	}

	private RequestActivity buildRequestActivity() {
		//Build initial requestActivity object
		RequestActivity requestActivity = new RequestActivity();

		//requestActivity.setEhmpState("accepted");
		requestActivity.setAuthorUid("urn:va:user:SITE:991");
		requestActivity.setPatientUid("SITE;3");
		requestActivity.setSubDomain("request");
		requestActivity.setDisplayName("Call Patient");
		requestActivity.setInstanceName("Call Patient");

		//Setup RequestData
		RequestData requestData = new RequestData();
		requestActivity.setData(requestData);

		//Setup Activity
		Activity activity = buildActivityObject("accepted");
		requestData.setActivity(activity);

		List<Request> requests = new ArrayList<>();
		requestData.setRequests(requests);
		requests.add(buildRequestObject());

		//Setup RequestActivity Visit
		Visit visit = new Visit();
		visit.setDateTime("20140624160558");
		visit.setLocation("urn:va:location:SITE:w158");
		visit.setLocationDesc("7A GEN MED");
		visit.setServiceCategory("D");
		requestActivity.setVisit(visit);
		return requestActivity;
	}

	private Request buildRequestObject() {
		Request request = new Request();
		request.setUrgency("routine");
		request.setEarliestDate("20170413070000");
		request.setLatestDate("20170514065959");
		request.setTitle("Call Patient");
		request.setAssignTo("Me");
		request.setRequest("The patient needs urgent attention");
		request.setSubmittedByUid("urn:va:user:SITE:991");
		request.setSubmittedByName("PROVIDER,EIGHT");
		request.setSubmittedTimeStamp("2017-04-13T18:41:04.757Z");
		//Setup Request Visit
		Visit visit = new Visit();
		visit.setDateTime("20140624160558");
		visit.setLocation("urn:va:location:SITE:w158");
		visit.setLocationDesc("7A GEN MED");
		visit.setServiceCategory("D");
		request.setVisit(visit);
		return request;
	}
	private Activity buildActivityObject(String state) {
		Activity activity = new Activity();
		activity.setDeploymentId(DEPLOYMENT_ID);
		activity.setProcessDefinitionId("Order.Request");
		activity.setState(state);
		activity.setInitiator("991");
		activity.setUrgency(9);
		activity.setAssignedTo("SITE;991");
		activity.setInstanceName("Call Patient");
		activity.setDomain("Request");
		activity.setSourceFacilityId("500");
		activity.setDestinationFacilityId("500");
		activity.setType("Order");
		return activity;
	}

	private void completeTaskByName(long processInstanceId, Map<String, Object> params, String taskName) {
		TaskService taskService = runtimeEngine.getTaskService();
		List<Long> tasks = taskService.getTasksByProcessInstanceId(processInstanceId);
		for (Long taskId : tasks) {
			Task task = taskService.getTaskById(taskId);
			if(task.getName().equals(taskName)) {
				taskService.start(taskId, "SITE;991");
				taskService.complete(taskId, "SITE;991", params);
				System.out.println("Task Name = " + task.getName() + "  " + task.getTaskData().getStatus());
			}
		}
		
	}
}
