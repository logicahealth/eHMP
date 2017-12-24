package vistacore.order;

import java.util.List;
import java.util.Map;

import org.jbpm.test.listener.IterableProcessEventListener;
import org.jbpm.test.listener.TrackingProcessEventListener;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.task.TaskService;
import org.kie.api.task.model.Task;

import gov.va.clinicalobjectstorageservice.ClinicalObjectReadHandler;
import gov.va.clinicalobjectstorageservice.ClinicalObjectWriteHandler;
import gov.va.clinicalobjectstorageservice.NotificationsWriteHandler;
import gov.va.patientpcmmteaminfo.PatientPcmmTeamInfoHandler;
import gov.va.eventstatewriteservice.WriteHandler;
import gov.va.jbpm.eventlisteners.CustomProcessEventListener;
import gov.va.signalregistrationservice.RegistrationHandler;
import gov.va.storageservice.signal.SignalWriteHandler;
import gov.va.signalregistrationservice.UnRegistrationHandler;

public class OrderProcessTestUtil {
	private static IterableProcessEventListener eventListener;
	private static TrackingProcessEventListener processListener;
	
	public static void registerWorkItemHandlers(KieSession kieSession) {
		kieSession.getWorkItemManager().registerWorkItemHandler("EventStateWriteService", new WriteHandler(kieSession));
		kieSession.getWorkItemManager().registerWorkItemHandler("SignalWriteService", new SignalWriteHandler(kieSession));
		kieSession.getWorkItemManager().registerWorkItemHandler("SignalRegistrationService", new RegistrationHandler(kieSession));
		kieSession.getWorkItemManager().registerWorkItemHandler("ClinicalObjectWriteService", new ClinicalObjectWriteHandler());
		kieSession.getWorkItemManager().registerWorkItemHandler("ClinicalObjectReadService", new ClinicalObjectReadHandler());
		kieSession.getWorkItemManager().registerWorkItemHandler("NotificationsWriteService", new NotificationsWriteHandler());
		kieSession.getWorkItemManager().registerWorkItemHandler("PatientPcmmTeamInfoService", new PatientPcmmTeamInfoHandler());
		kieSession.getWorkItemManager().registerWorkItemHandler("SignalUnRegistrationService", new UnRegistrationHandler(kieSession));

	}
	public static void registerListners(KieSession kieSession) {
		processListener = new TrackingProcessEventListener();
		eventListener = new IterableProcessEventListener();
		kieSession.addEventListener(eventListener);
		kieSession.addEventListener(processListener);
		kieSession.addEventListener(new CustomProcessEventListener());
	}
	public static IterableProcessEventListener getEventListener() {
		return eventListener;
	}
	
	public static TrackingProcessEventListener getProcessListener() {
		return processListener;
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
}
