package vistacore.order.discharge;

import gov.va.jbpm.entities.impl.TaskInstanceImpl;
import gov.va.jbpm.entities.impl.ProcessInstanceImpl;
import gov.va.jbpm.eventlisteners.CustomProcessEventListener;
import gov.va.jbpm.eventlisteners.CustomTaskEventListener;
import org.jboss.logging.Logger;
import org.jbpm.test.JbpmJUnitBaseTestCase;
import org.jbpm.test.listener.IterableProcessEventListener;
import org.jbpm.test.listener.TrackingProcessEventListener;
import org.jbpm.workflow.instance.WorkflowProcessInstance;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Test;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.RuntimeManager;
import org.kie.api.task.TaskService;
import org.kie.api.task.model.Task;
import vistacore.order.OrderProcessTestUtil;
import vistacore.order.Visit;

import javax.persistence.EntityManager;
import java.util.*;
import java.text.SimpleDateFormat;


public class DischargeProcessJUnitTest extends JbpmJUnitBaseTestCase {
	private static final String DISCHARGE_ORDER_PROCESS = "vistacore/order/discharge/Followup.bpmn2";
	private static final String DISCHARGE_ORDER_PROCESS_ID = "Order.DischargeFollowup";
	private static final String DEPLOYMENT_ID = "VistaCore:Order:1:0";
	private static final Logger LOGGER = Logger.getLogger(DischargeProcessJUnitTest.class);
	private RuntimeManager runtimeManager;
	private RuntimeEngine runtimeEngine;
	private IterableProcessEventListener eventListener;
	private TrackingProcessEventListener processListener;

    public DischargeProcessJUnitTest(){
		super(true, true, "gov.va.activitydb");
	}

	@Test
	public void testDischargeFollowupTask() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 100;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
	}

	@Test
	public void testDischargeFollowupVerifyTaskProperties() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();

		//set discharge date to Friday, due date should be a Tuesday
		dischargeFollowup.getData().getStay().setDischargeDateTime("20170707000000");
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 100;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		EntityManager em = getEmf().createEntityManager();
		List<TaskInstanceImpl> results = em.createQuery("from TaskInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
				TaskInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<TaskInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			TaskInstanceImpl task = (TaskInstanceImpl) iterator.next();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			assertTrue(sdf.format(task.getDueDate()).equals("2017-07-11"));
		}

		//set discharge date to Monday, due date should be a Wednesday
		dischargeFollowup.getData().getStay().setDischargeDateTime("20170703000000");
        params.put("dischargeFollowup", dischargeFollowup);

		processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		em = getEmf().createEntityManager();
		results = em.createQuery("from TaskInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
				TaskInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<TaskInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			TaskInstanceImpl task = (TaskInstanceImpl) iterator.next();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			assertTrue(sdf.format(task.getDueDate()).equals("2017-07-05"));

			assertTrue(task.getPermission().equals("{ \"ehmp\": [\"edit-discharge-followup\"],\"pcmm\": [],\"user\": []}"));
		}
	}

	@Test
	public void testDischargeFollowupCompleteSignal() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 100;
        LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		DischargeSignal signal = buildSignalData();
		kieSession.signalEvent("COMPLETE", signal, processInstance.getId());

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "COMPLETE");
		assertNodeTriggered(processInstance.getId(), "Process COMPLETE Signal");
		assertNodeTriggered(processInstance.getId(), "SignalWriteService");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));

		printProcessCreatedTasks(processInstance.getId());
	}

	@Test
	public void testDischargeFollowupEndSignal() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 100;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		DischargeSignal signal = buildSignalData();
		signal.setActionId(1);
		kieSession.signalEvent("END", signal, processInstance.getId());

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "END");
		assertNodeTriggered(processInstance.getId(), "Process END Signal");
		assertNodeTriggered(processInstance.getId(), "SignalWriteService");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));

		printProcessCreatedTasks(processInstance.getId());
	}

	@Test
	public void testDischargeFollowupTimeout() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

        //create activity with discharge date as current date. Activity should be active, it should not timeout
        DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		//set past date as discharge date, 30 days prior to current date. Activity should timeout
		dischargeFollowup.getData().getStay().setDischargeDateTime(getPastDate(100));
		params.put("dischargeFollowup", dischargeFollowup);

        WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 500;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
        assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
        assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "Process Timer");
		assertNodeTriggered(processInstance.getId(), "SignalWriteService");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));


		//set past date as discharge date, 30 days prior to current date. Activity should timeout
		dischargeFollowup = buildDischargeFollowup();

		params.put("dischargeFollowup", dischargeFollowup);

		processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);

        assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
        assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		// Assert the process is completed
		EntityManager em = getEmf().createEntityManager();
		List<TaskInstanceImpl> results = em.createQuery("from TaskInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
				TaskInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<TaskInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			TaskInstanceImpl task = (TaskInstanceImpl) iterator.next();
			//check task status, it should be active == 1
			assertTrue(task.getStatusId() == 1);
		}

		printProcessCreatedTasks(processInstance.getId());
	}

	@Test
	public void testDischargeFollowupPerformanceIndicators() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		//create discharge activity with discharge date as current date. Activity should not be set to unhealthy
		DischargeFollowup dischargeFollowup = buildDischargeFollowup();

        params.put("dischargeFollowup", dischargeFollowup);

        WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 1000;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		EntityManager em = getEmf().createEntityManager();
		List<ProcessInstanceImpl> results = em.createQuery("from ProcessInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
				ProcessInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<ProcessInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			ProcessInstanceImpl process = (ProcessInstanceImpl) iterator.next();
			assertTrue(process.getActivityHealthy().equals(true));
			assertTrue(process.getActivityHealthDescription().equals(""));
		}

		//set discharge date in the past, more than 2 days
		dischargeFollowup.getData().getStay().setDischargeDateTime(getPastDate(10));

        params.put("dischargeFollowup", dischargeFollowup);

		processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
        LOGGER.debug("Awake!");

        assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
        assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process PI");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		em = getEmf().createEntityManager();
		results = em.createQuery("from ProcessInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
                ProcessInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<ProcessInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			ProcessInstanceImpl process = (ProcessInstanceImpl) iterator.next();
			assertTrue(process.getActivityHealthy().equals(false));
			assertTrue(process.getActivityHealthDescription().equals("Follow-up not completed within 2 weekdays"));
		}
	}

	@Test
	public void testDischargeFollowupVisitEvent() throws Exception {
		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);

		//Admission, INpatient should end the activity
		DischargeUpdateSignalData signal = new DischargeUpdateSignalData();
		signal.setCategoryName("Admission");
		signal.setPatientClassName("Inpatient");
		signal.setPrimaryStopCode("10");
		signal.setSecondaryStopCode("20");
		signal.setDateTime(getDateInFuture(1));

		kieSession.signalEvent("DISCHARGE.UPDATED", signal, processInstance.getId());

		int sleep = 100;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "DISCHARGE.UPDATED");
		assertNodeTriggered(processInstance.getId(), "END");
		assertNodeTriggered(processInstance.getId(), "Process END Signal");
		assertNodeTriggered(processInstance.getId(), "SignalWriteService");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "SignalUnRegistrationService");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));

		dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);
		processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);

		//Admission, Outpatient should not complete the activity
		signal = new DischargeUpdateSignalData();
		signal.setCategoryName("Admission");
		signal.setPatientClassName("Outpatient");
		signal.setPrimaryStopCode("10");
		signal.setSecondaryStopCode("20");
		signal.setDateTime(getDateInFuture(1));

		kieSession.signalEvent("DISCHARGE.UPDATED", signal, processInstance.getId());
		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Process Discharge Data");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "DISCHARGE.UPDATED");

		// Assert the process is not completed
		EntityManager em = getEmf().createEntityManager();
		List<ProcessInstanceImpl> results = em.createQuery("from ProcessInstanceImpl ti where  ti.processInstanceId = :processInstanceId",
				ProcessInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<ProcessInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			ProcessInstanceImpl process = (ProcessInstanceImpl) iterator.next();
			assertTrue(process.getState().equals("Active: Pending Follow-up"));
		}

		//Admission, Outpatient, primary & secondary stop code (caseone) should complete the activity
		signal = new DischargeUpdateSignalData();
		signal.setCategoryName("Admission");
		signal.setPatientClassName("Outpatient");
		signal.setPrimaryStopCode("170");
		signal.setSecondaryStopCode("170");
		signal.setDateTime(getDateInFuture(1));

		kieSession.signalEvent("DISCHARGE.UPDATED", signal, processInstance.getId());

		assertNodeTriggered(processInstance.getId(), "DISCHARGE.UPDATED");
		assertNodeTriggered(processInstance.getId(), "COMPLETE");
		assertNodeTriggered(processInstance.getId(), "Process COMPLETE Signal");
		assertNodeTriggered(processInstance.getId(), "SignalWriteService");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");
		assertNodeTriggered(processInstance.getId(), "SignalUnRegistrationService");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));

	}

	public void testDischargeFollowupManualAction() throws Exception {

		KieSession kieSession = setupRunTime();

		Map<String, Object> params = buildInitParams();

		DischargeFollowup dischargeFollowup = buildDischargeFollowup();
		params.put("dischargeFollowup", dischargeFollowup);

		WorkflowProcessInstance processInstance = (WorkflowProcessInstance)kieSession.startProcess(DISCHARGE_ORDER_PROCESS_ID, params);
		int sleep = 1000;
		LOGGER.debug("Sleeping " + sleep + " milliseconds");

		Thread.sleep(sleep);
		LOGGER.debug("Awake!");

		Followup followup = new Followup();
		followup.setActionId("1");
		followup.setExecutionUserId("urn:va:user:SITE;991");
		followup.setExecutionUserName("PROVIDER, EIGHT");
		followup.setVisit(buildVisit());
		followup.setComment("test successful manual action");

		params.put("followup", followup);

		OrderProcessTestUtil.completeTaskByName(runtimeEngine, processInstance.getId(), params, "Follow-Up");

		EntityManager em = getEmf().createEntityManager();
		List<ProcessInstanceImpl> results = em.createQuery("from ProcessInstanceImpl where processInstanceId = :processInstanceId",
				ProcessInstanceImpl.class).setParameter("processInstanceId", processInstance.getId()).getResultList();
		for (Iterator<ProcessInstanceImpl> iterator = results.iterator(); iterator.hasNext();) {
			ProcessInstanceImpl pi = (ProcessInstanceImpl) iterator.next();
			assertEquals(pi.getState(), "Completed: Successful");
		}

		assertNodeTriggered(processInstance.getId(), "Follow-Up");
		assertNodeTriggered(processInstance.getId(), "Save pJDS Record");

		// Assert the process is completed
		assertTrue(processListener.getProcessesCompleted().contains(DISCHARGE_ORDER_PROCESS_ID));

	}

	private void registerListners(KieSession kieSession) {
		processListener = new TrackingProcessEventListener();
		eventListener = new IterableProcessEventListener();
		kieSession.addEventListener(eventListener);
		kieSession.addEventListener(processListener);
        kieSession.addEventListener(new CustomProcessEventListener());
	}

	private KieSession setupRunTime() {
		CustomTaskEventListener taskEventListener = new CustomTaskEventListener();
		customTaskListeners.add(taskEventListener);
		runtimeManager = createRuntimeManager(DISCHARGE_ORDER_PROCESS);
        taskEventListener.setRuntimeManager(runtimeManager);
		runtimeEngine = getRuntimeEngine();

		KieSession kieSession = runtimeEngine.getKieSession();
		registerListners(kieSession);
        OrderProcessTestUtil.registerWorkItemHandlers(kieSession);

		return kieSession;
	}

	private Map<String, Object> buildInitParams() {
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("icn", "SITE;991");
		params.put("pid", "SITE;991");
		params.put("deploymentId", DEPLOYMENT_ID);
		params.put("processDefId", DISCHARGE_ORDER_PROCESS_ID);
		return params;
	}

	private DischargeFollowup buildDischargeFollowup() {
		DischargeFollowup dischargeFollowup = new DischargeFollowup();

		dischargeFollowup.setAuthorUid("urn:va:user:SITE;991");
		dischargeFollowup.setPatientUid("urn:va:patient:SITE:3:3");
		dischargeFollowup.setReferenceId("urn:va:user:SITE:3");
		dischargeFollowup.setDomain("ehmp-activity");
		dischargeFollowup.setUid("");

		//Setup VprData
		DischargeVprData vprData = new DischargeVprData();
		vprData.setDeceased("false");
		vprData.setLastUpdateTime("20170517094313");
		vprData.setFacilityCode("998");
		vprData.setFacilityName("ABILENE (CAA)");
		vprData.setKind("discharge");
		vprData.setLocationDisplayName("7A Gen Med");
		vprData.setLocationName("7A GEN MED");
		vprData.setLocationUid("urn:va:location:SITE:158");
		vprData.setIcn("10108V420871");

		Stay stay = new Stay();
		stay.setArrivalDateTime("20150404133047");
		stay.setDischargeDateTime(getCurrentDate());
		vprData.setStay(stay);

		dischargeFollowup.setData(vprData);

		dischargeFollowup.setVisit(buildVisit());
		return dischargeFollowup;
	}

	private Visit buildVisit() {
		Visit visit = new Visit();
		visit.setDateTime("20140624160558");
		visit.setLocation("urn:va:location:SITE:w158");
		visit.setLocationDesc("7A GEN MED");
		visit.setServiceCategory("D");
		return visit;
	}

	private DischargeSignal buildSignalData() {
		DischargeSignal signal = new DischargeSignal();
		DischargeSignalData data = new DischargeSignalData();
		data.setComment("Test COMPLETE");

		signal.setData(data);
		signal.setExecutionUserId("urn:va:user:SITE;991");
		return signal;
	}

	private void printProcessCreatedTasks(Long processInstanceId) {
		TaskService taskService = runtimeEngine.getTaskService();
		List<Long> tasks = taskService.getTasksByProcessInstanceId(processInstanceId);
		for (Long taskId : tasks) {
			Task task = taskService.getTaskById(taskId);
			System.out.println("Task Name = " + task.getName());
		}
	}

	public static void completeTaskByName(RuntimeEngine runtimeEngine, long processInstanceId, Map<String, Object> params, String taskName) {
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

    private static String getCurrentDate() {
        String pattern = "yyyyMMddHHmmss";
        DateTime currentDate = new DateTime(DateTimeZone.UTC);
        DateTimeFormatter dtformatter = DateTimeFormat.forPattern(pattern);

        String currentDateString = currentDate.toString(dtformatter);
        return currentDateString;
    }

	private static String getDateInFuture(int numberOfDays) {
		String pattern = "yyyyMMddHHmmss";
		DateTime currentDate = new DateTime(DateTimeZone.UTC).plusDays(numberOfDays);
		DateTimeFormatter dtformatter = DateTimeFormat.forPattern(pattern);

		String currentDateString = currentDate.toString(dtformatter);
		return currentDateString;
	}

	private static String getPastDate(int numberOfDays) {
		String pattern = "yyyyMMddHHmmss";
		DateTime date = new DateTime(DateTimeZone.UTC).minusDays(numberOfDays);
		DateTimeFormatter dtformatter = DateTimeFormat.forPattern(pattern);

		String currentDateString = date.toString(dtformatter);
		return currentDateString;
	}
}
