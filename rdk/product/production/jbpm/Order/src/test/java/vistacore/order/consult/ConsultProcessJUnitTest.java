package vistacore.order.consult;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.jboss.logging.Logger;
import org.jbpm.test.JbpmJUnitBaseTestCase;
import org.jbpm.test.listener.IterableProcessEventListener;
import org.jbpm.test.listener.TrackingProcessEventListener;
import org.jbpm.workflow.instance.WorkflowProcessInstance;
import org.junit.Test;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.RuntimeManager;

import gov.va.jbpm.eventlisteners.CustomProcessEventListener;
import gov.va.jbpm.eventlisteners.CustomTaskEventListener;
import vistacore.order.Facility;
import vistacore.order.OrderProcessTestUtil;
import vistacore.order.Provider;
import vistacore.order.Visit;

public class ConsultProcessJUnitTest extends JbpmJUnitBaseTestCase {
	private static final String CONSULT_ORDER_PROCESS = "vistacore/order/consult/Consult.bpmn2";
	private static final String CONSULT_ORDER_PROCESS_ID = "Order.Consult";
	private static final Logger logger = Logger.getLogger(ConsultProcessJUnitTest.class);
	private static final String ANSWER_CODE_RADIOLOGY = "c928767e-f519-3b34-bff2-a2ed3cd5c6c3";
	private static final String ANSWER_CODE_NSAID = "c928767e-f519-3b34-bff2-a2ed3cd5c6c4";
	private static final String ANSWER_CODE_PHYSICAL_THERAPY = "c928767e-f519-3b34-bff2-a2ed3cd5c6c4";
	private static final String ANSWER_CODE_MRI = "c928767e-f519-3b34-bff2-a2ed3cd5c6c5";
	private RuntimeManager runtimeManager;
	private RuntimeEngine runtimeEngine;
	private IterableProcessEventListener eventListener;
	private TrackingProcessEventListener processListener;
	
	public ConsultProcessJUnitTest(){
		super(true, true, "gov.va.activitydb");
	}
	@Test 
	public void testConsultProcess() throws Exception {
		CustomTaskEventListener taskEventListener = new CustomTaskEventListener();
		customTaskListeners.add(taskEventListener);
		
		runtimeManager = createRuntimeManager(CONSULT_ORDER_PROCESS);
		runtimeEngine = getRuntimeEngine();
		taskEventListener.setRuntimeManager(runtimeManager);

		KieSession kieSession = runtimeEngine.getKieSession();
		OrderProcessTestUtil.registerWorkItemHandlers(kieSession);
		Map<String, Object> params = buildProcessParams();
		params.put("consultOrder", buildConsultOrderObject());
		registerListners(kieSession);
		
		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(CONSULT_ORDER_PROCESS_ID, params);
		long processInstanceId = processInstance.getId();
		assertNodeTriggered(processInstanceId, "Instantiate Objects");
		assertNodeTriggered(processInstanceId, "Save Signal & Clinical Object Subprocess");
		assertNodeTriggered(processInstanceId, "saveSignalClinObj"); // Signal node, will stop until signal is sent.
		assertNodeTriggered(processInstanceId, "END"); // Signal node
		assertNodeTriggered(processInstanceId, "Main Workflow Subprocess");
		assertNodeTriggered(processInstanceId, "terminateAllSubs"); // Signal node
		assertNodeTriggered(processInstanceId, "Prepare ClinicalObject");
		assertNodeTriggered(processInstanceId, "Save ClinicalObject to pJDS");
		assertNodeTriggered(processInstanceId, "Read ClinicalObject from pJDS");
		assertNodeTriggered(processInstanceId, "Check Prerequisites");
		assertNodeTriggered(processInstanceId, "Save noteObject to pJDS");
		assertNodeTriggered(processInstanceId, "Sign Consult");
		// sign the consult by completing the human task.
		OrderProcessTestUtil.completeTaskByName(runtimeEngine, processInstanceId, params, "Sign Consult");
		assertNodeTriggered(processInstanceId, "Read ClinicalObject from pJDS");
		System.out.println("Nodes Triggered = " + processListener.getNodesTriggered());
	}

	private ConsultOrder buildConsultOrderObject(){
		ConsultOrder consultOrder = new ConsultOrder();
		
		Condition condition = new Condition();
		condition.setCode("247373008");
		condition.setName("Ankle Joint Pain");
		List<Condition> conditions = new ArrayList<>();
		conditions.add(condition);
		consultOrder.setConditions(conditions);
		
		consultOrder.setConsultName("Neurosurgery");
		consultOrder.setDeploymentId("VistaCore:Order:0.0.0");
		consultOrder.setDestinationFacility(new Facility("500", "PANORAMA"));
		consultOrder.setEarliestDate("04/20/2017");
		consultOrder.setExecutionUserId("urn:va:user:SITE;991");
		consultOrder.setExecutionUserName("PROVIDER, EIGHT");
		consultOrder.setFormAction("accepted");
		consultOrder.setLatestDate("05/20/2017");
		consultOrder.setOrderingFacility(new Facility("500", "PANORAMA"));
		consultOrder.setOrderingProvider(new Provider("PROVIDER, EIGHT", "urn:va:user:SITE;991"));
		consultOrder.setOverrideReason("N/A");
		ConsultPreReqOrder preReqOrder = new ConsultPreReqOrder();
		List<ConsultPreReqOrder> preReqOrders = new  ArrayList<ConsultPreReqOrder>();
		consultOrder.setPreReqOrders(preReqOrders);
		preReqOrder.setIen("60621009");
		preReqOrder.setStatus("Override");
		preReqOrder.setOrderName("BMI");
		
		// Set Pre Requisite Questions
		List<ConsultPreReqQuestion> preReqQuestions = new ArrayList<>();
		consultOrder.setPreReqQuestions(preReqQuestions);
		ConsultPreReqQuestion preReqQuestion1 = new ConsultPreReqQuestion();
		preReqQuestions.add(preReqQuestion1);
		preReqQuestion1.setQuestion("Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?");
		preReqQuestion1.setAnswer(ANSWER_CODE_RADIOLOGY);
		ConsultPreReqQuestion preReqQuestion2 = new ConsultPreReqQuestion();
		preReqQuestions.add(preReqQuestion2);
		preReqQuestion2.setQuestion("Has the patient had an eight (8) week trial of NSAIDs?");
		preReqQuestion2.setAnswer(ANSWER_CODE_NSAID);
		ConsultPreReqQuestion preReqQuestion3 = new ConsultPreReqQuestion();
		preReqQuestions.add(preReqQuestion3);
		preReqQuestion3.setQuestion("Has the patient completed a course of Physical Therapy for their back pain?");
		preReqQuestion3.setAnswer(ANSWER_CODE_PHYSICAL_THERAPY);
		ConsultPreReqQuestion preReqQuestion4 = new ConsultPreReqQuestion();
		preReqQuestions.add(preReqQuestion4);
		preReqQuestion4.setQuestion("Has the patient had a MRI or CT Myelogram POSITIVE for nerve root compression or foraminal stenosis in the past 6 months?");
		preReqQuestion4.setAnswer(ANSWER_CODE_MRI);
		
		consultOrder.setProcessDefId("Order.Consult");
		consultOrder.setRequestReason("Testing the consult");
		consultOrder.setRequestComment("Consult Process Unit test");
		consultOrder.setTeamFocus(new TeamFocus("62", "Neurosurgery"));
		consultOrder.setUrgency("9");
		consultOrder.setVisit(new Visit("urn:va:location:SITE:158", "I", "20140814130730", "7A GEN MED"));
		return consultOrder;
	}
	private Map<String, Object>  buildProcessParams(){
		Map<String, Object> params = new HashMap<String, Object>();
		ClassLoader classLoader = getClass().getClassLoader();
		  try {
			  String orderable = IOUtils.toString(classLoader.getResourceAsStream("orderable.json"));
			  params.put("orderable", orderable);
		  } catch (IOException e) {
			logger.error("Error in loading orderable.json file" + e.getMessage());
		  }
		params.put("assignedTo", "[FC:PANORAMA(500)/TF:Neurosurgery(62)]");
		params.put("domain", "ehmp-activity");
		params.put("icn", "SITE;3");
		params.put("instanceName", "Neurosurgery");
		params.put("subDoamin", "consult");
		params.put("type", "Order");
		params.put("urgency", "9");
		params.put("initiator", "SITE;991");
		String creationTime = Instant.now().toString();
		params.put("creationDateTime", creationTime);
		return params;
	}
	public void registerListners(KieSession kieSession) {
		processListener = new TrackingProcessEventListener();
		eventListener = new IterableProcessEventListener();
		kieSession.addEventListener(eventListener);
		kieSession.addEventListener(processListener);
		kieSession.addEventListener(new CustomProcessEventListener());
	}
	
}
