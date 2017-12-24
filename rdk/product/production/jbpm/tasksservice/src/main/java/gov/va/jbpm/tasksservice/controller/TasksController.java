package gov.va.jbpm.tasksservice.controller;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.task.TaskService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import gov.va.jbpm.tasksservice.bean.ProcessDefinition;
import gov.va.jbpm.tasksservice.bean.Task;
import gov.va.jbpm.tasksservice.bean.TaskDetail;
import gov.va.jbpm.tasksservice.bean.TaskInfo;
import gov.va.jbpm.tasksservice.bean.TaskSummary;
import gov.va.jbpm.tasksservice.bean.TasksResponse;
import gov.va.jbpm.tasksservice.bean.Variable;
import gov.va.jbpm.tasksservice.exception.TaskServiceException;
import gov.va.jbpm.tasksservice.utils.TaskUtils;
import vistacore.jbpm.utils.logging.RequestMessageType;

@RestController
public class TasksController {
	protected static String instanceUrl = "http://127.0.0.1:8080/business-central";
	private static final Logger LOGGER = Logger.getLogger(TasksController.class);
	
	@RequestMapping(value = "/task/{taskid}", method = RequestMethod.GET,headers="Accept=application/json")  
	public TasksResponse getTaskById(HttpServletRequest request, @PathVariable("taskid") long taskId) throws MalformedURLException
	{
		String uri = request.getRequestURI()+StringUtils.defaultIfEmpty(request.getQueryString(),"");
		String method = request.getMethod();
		//Log the Incoming Request
		LOGGER.info(String.format("%s %s %s", RequestMessageType.INCOMING_REQUEST, method, uri));

		TasksResponse taskResponse = new TasksResponse();  //Default value
		try {
			
			String auth = request.getHeader("Authorization");
			if (auth == null) {
				throw new TaskServiceException("TasksController.getTaskById: auth cannot be null");
			}
			
			RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());
			
			HttpHeaders headers = new HttpHeaders();
			headers.add("Authorization", auth);
			headers.add("X-Request-ID", MDC.get("requestId")+"");
			headers.add("X-Session-ID", MDC.get("sid")+"");
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

			HttpEntity<String> requestEntity = new HttpEntity<String>("parameters", headers);
			
			
			// Retrieve task data using below REST call
			// http://<server>/business-central/rest//query/runtime/task?taskId={taskId}
			String url =  instanceUrl + "/rest/query/runtime/task?taskId=" + taskId;

			//Log the Outgoing Request
			LOGGER.info(String.format("%s %s %s", RequestMessageType.OUTGOING_REQUEST,  HttpMethod.POST, url));

			ResponseEntity<TaskDetail> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, TaskDetail.class);
			
			TaskDetail taskDetail = response.getBody();
			Task task = TaskUtils.transformTaskDetailToTask(taskDetail);

			//Log the Incoming Response
			LOGGER.info(String.format("%s Task : %s",RequestMessageType.INCOMING_RESPONSE ,task.getTaskInfoList()));
			
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
				if (taskSummaries != null && !taskSummaries.isEmpty()) {
					taskSummary = taskSummaries.get(taskSummaries.size() - 1);
				}
					
				if (taskSummary != null) {
					if (taskContent.containsKey("Content")) {
						taskSummary.setContent(taskContent.get("Content").toString());
					}
					
					// If there are process variables, remove variable history and replace complex type variable value with it's JSON representation  
					if (!taskInfo.getVariables().isEmpty()) {
						List<Variable> filteredVariableList = TaskUtils.filterVariablesForRecency(taskInfo.getVariables());
						
						List<Variable> variableList = handleVariables(requestEntity, taskSummary, filteredVariableList);
						taskInfo.setVariables(variableList);
					}
				}	
			}
			
			taskResponse = TaskUtils.transformToTasksResponse(task);
		} catch (RestClientException e) {
			LOGGER.error(String.format("TasksController.getTaskById: An unexpected condition has happened with rest: %s", e.getMessage()), e);
		} catch (TaskServiceException e) {
			LOGGER.error(String.format("TasksController.getTaskById: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("TasksController.getTaskById: An unexpected condition has happened: %s", e.getMessage()), e);
		}
		finally{
			//Log the Outgoing Response
			LOGGER.info(String.format("%s TASKID : %d", RequestMessageType.OUTGOING_RESPONSE, taskId ));
		}
		return taskResponse;			
	}

	/**
	 * Replace complex type variable value with its JSON string representation
	 * @throws TaskServiceException 
	 */
	private List<Variable> handleVariables(HttpEntity<String> entity, TaskSummary taskSummary, List<Variable> variableList) throws TaskServiceException {
		try {
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
		} catch (RestClientException e) {
			throw new TaskServiceException("TasksController.handleVariables: " + e.getMessage(), e);
		}
	}
}
