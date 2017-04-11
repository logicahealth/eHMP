package gov.va.jbpm.tasksservice.controller;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

import javax.servlet.http.HttpServletRequest;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.task.TaskService;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.PathVariable;  
import org.springframework.web.bind.annotation.RequestMapping;  
import org.springframework.web.bind.annotation.RequestMethod;  
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import gov.va.jbpm.tasksservice.bean.*;
import gov.va.jbpm.tasksservice.utils.TaskUtils;

@RestController
public class TasksController {
	
	protected static String instanceUrl = "http://127.0.0.1:8080/business-central";
	
	@RequestMapping(value = "/task/{taskid}", method = RequestMethod.GET,headers="Accept=application/json")  
	public TasksResponse getTaskById(HttpServletRequest request, @PathVariable("taskid") long taskId)  throws MalformedURLException
	{ 
		
		String auth = request.getHeader("Authorization");
		
		RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());
		
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", auth);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

		HttpEntity<String> requestEntity = new HttpEntity<String>("parameters", headers);
		
		
		// Retrieve task data using below REST call
		// http://<server>/business-central/rest//query/runtime/task?taskId={taskId}
		String url =  instanceUrl + "/rest/query/runtime/task?taskId=" + taskId;		
		ResponseEntity<Task> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Task.class);
		
		Task task = response.getBody();
		
		if (task.getTaskInfoList() != null && !task.getTaskInfoList().isEmpty()) {
			Base64.Decoder dec = Base64.getDecoder();
			String authorizationString = new String(dec.decode(auth.substring(6)));
	
			String []authorizationArray = authorizationString.split(":", 2);
						
			//Retrieve task content 
			RuntimeEngine engine = org.kie.remote.client.api.RemoteRuntimeEngineFactory.newRestBuilder()
				.addDeploymentId("")
				.addUrl(new URL(instanceUrl))
				.addUserName(authorizationArray[0]).addPassword(authorizationArray[1])
				.build();
												
			TaskService taskService = engine.getTaskService();
			Map<String, Object> taskContent =  taskService.getTaskContent(taskId);

			TaskInfo taskInfo = task.getTaskInfoList().get(0);
			TaskSummary taskSummary = null;
			List<TaskSummary> taskSummaries = taskInfo.getTaskSummaries();				
			if (!taskSummaries.isEmpty()) {
				taskSummary = taskSummaries.get(taskSummaries.size() - 1);
			}
				
			if (taskSummary != null) {
				if(taskContent.containsKey("Content")) {
					taskSummary.setContent(taskContent.get("Content").toString());
				}
				
				// If there are process variables, remove variable history and replace complex type variable value with it's JSON representation  
				if (!taskInfo.getVariables().isEmpty()) {
					
					List<Variable> variableList = handleVariables(requestEntity,
							taskSummary, TaskUtils.filterVariablesForRecency(taskInfo.getVariables()));
					taskInfo.setVariables(variableList);						
				}
			}
				
		}
		
		return TaskUtils.transformToTasksResponse(task);
	}

	/*
	 * Replace complex type variable value with its JSON string representation
	 * */
	private List<Variable> handleVariables(HttpEntity<String> entity, TaskSummary taskSummary, List<Variable> variableList) {
		
		// For now there is no easy way to get the process variable type other than from process definition 
		// Get process definition using below url 
		// http://<server>/business-central/rest/runtime/{deploymentId}/process/{processId}
		String url =  instanceUrl + "/rest/runtime/" + taskSummary.getDeploymentId() + "/process/" + taskSummary.getProcessId();
		RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());

		ResponseEntity<ProcessDefinition> processDefResponse = restTemplate.exchange(url, HttpMethod.GET, entity, ProcessDefinition.class);
		if (processDefResponse != null) {
			Map<String, String> variablesDefinition = processDefResponse.getBody().getVariables();
			if (variablesDefinition != null) {
				for (Variable processVariable : variableList) {
					if (!TaskUtils.isPrimitiveType (variablesDefinition.get(processVariable.getName()))) {
						
						//Variable is of complex type, so get the actual value as JSON string using below URL
						// http://<server>/business-central/rest/runtime/{deploymentId}/process/instance/{procInstId}/variable/{varName}
						url =  instanceUrl + "/rest/runtime/" + taskSummary.getDeploymentId() + "/process/instance/" + taskSummary.getProcessInstanceId() + "/variable/" + processVariable.getName();
						ResponseEntity<String> jsonResponse = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
						processVariable.setValue(jsonResponse.getBody());
					}
				}								
			}
		}
		
		return variableList;
	}	
}
