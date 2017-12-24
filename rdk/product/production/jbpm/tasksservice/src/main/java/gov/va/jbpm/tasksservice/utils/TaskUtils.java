package gov.va.jbpm.tasksservice.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jboss.logging.Logger;

import gov.va.jbpm.tasksservice.bean.*;
import gov.va.jbpm.tasksservice.exception.TaskServiceException;

public class TaskUtils {
	private static final Logger LOGGER = Logger.getLogger(TaskUtils.class);
	/*
	 * Transform Tasks structure to output structure.
	 * */
	public static TasksResponse transformToTasksResponse(Task task) {
		try {
			LOGGER.debug("Entering transformToTasksResponse");
			if (task == null)
				throw new TaskServiceException("TaskUtils.transformToTasksResponse: task cannot be null");
			
			TasksResponse response = new TasksResponse();
			TasksDataResponse tasksData = new TasksDataResponse();
			List<TaskSummary> taskSummaryItems = new ArrayList<TaskSummary>();  
			tasksData.setItems(taskSummaryItems);
			response.setData(tasksData);
			
			List<TaskInfo> taskInfoList = task.getTaskInfoList();
			if (taskInfoList != null && !taskInfoList.isEmpty()) {
				for(TaskInfo taskInfo : taskInfoList){
					List<TaskSummary> taskSummaries = taskInfo.getTaskSummaries();
					if (taskSummaries != null && !taskSummaries.isEmpty()) {
						//if a task has more than 1 summary, take the last summary
						TaskSummary taskSummary = taskSummaries.get(taskSummaries.size() - 1);
						List<Variable> variables = taskInfo.getVariables();
						if (variables != null && !variables.isEmpty()) {
							taskSummary.setVariables(variables);
						}

						//assign the parent's process instance id if it isn't included in the task summary
						if (taskSummary.getProcessInstanceId() <= 0) {
							taskSummary.setProcessInstanceId(taskInfo.getProcessInstanceId());
						}
						taskSummaryItems.add(taskSummary);
					}
				}
			}
			
			return response;
		} catch (TaskServiceException e) {
			LOGGER.error(String.format("TaskUtils.transformToTasksResponse: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("TaskUtils.transformToTasksResponse: An unexpected condition has happened: %s", e.getMessage()));
		}
		return null;
	}

	/*
	 * Filter out variable old history and return only latest values
	 * */
	public static List<Variable> filterVariablesForRecency(List<Variable> variables) {
		List<Variable> newVariablesList = new ArrayList<Variable>();
		
		if (variables == null)
			return newVariablesList;
		
		try {
			Map<String, Integer> indexMap = new HashMap<String, Integer>();
			for(Variable variable : variables) {			
				int location = indexMap.getOrDefault(variable.getName(), -1);
				if (location != -1) {				
					Variable variableAtLocation = newVariablesList.get(location);
					if (variableAtLocation == null)
						throw new TaskServiceException("TaskUtils.filterVariablesForRecency: task cannot be null");
					long existingModDate = variableAtLocation.getModificationDate();
					long newModDate = variable.getModificationDate();
					if (existingModDate > 0) {
						if (newModDate > 0 && (newModDate >= existingModDate)) { //the current element is newer, replace old element with current element
							newVariablesList.set(location, variable);
						}
					} else if (newModDate > 0) {
						newVariablesList.set(location, variable);
					} else {
						newVariablesList.add(variable);
						indexMap.put(variable.getName(), newVariablesList.size() - 1);
					}
				} else {
					newVariablesList.add(variable);
					indexMap.put(variable.getName(), newVariablesList.size() - 1);
				}
			}
			
			return newVariablesList;
		} catch (TaskServiceException e) {
			LOGGER.error(String.format("TaskUtils.filterVariablesForRecency: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("TaskUtils.filterVariablesForRecency: An unexpected condition has happened: %s", e.getMessage()), e);
		}
		
		return newVariablesList;
	}
	
	/*
	 * Check whether given type name is primitive
	 * */
	public static boolean isPrimitiveType(String typeName) {
		if (typeName == null)
			return false;
		
		if (typeName.equals("String") ||
				typeName.equals("Integer") ||
				typeName.equals("Boolean") ||
				typeName.equals("Float")) {
			return true;
		}
		
		return false;
	}
	
	/**
	 * Transform TaskDetail into Task to overcome changes in JSON response
	 */
	public static Task transformTaskDetailToTask(TaskDetail taskDetail) {
		
		Task task = new Task();
		TaskInfo taskInfo = new TaskInfo();
		taskInfo.setProcessInstanceId(taskDetail.getTaskInfoList().get(0).getProcessInstanceId());
		taskInfo.setTaskSummaries(taskDetail.getTaskInfoList().get(0).getTaskSummaries());			
		List<Variable> variables = new ArrayList<Variable>();
		
		for (TaskDetailVariable taskDetailVariable : taskDetail.getTaskInfoList().get(0).getVariables()) {
			Variable variable = new Variable();
			variable.setModificationDate(taskDetailVariable.getLastModificationDate());
			variable.setName(taskDetailVariable.getName());
			variable.setValue(taskDetailVariable.getValue().getValue());
			variables.add(variable);
		}
		taskInfo.setVariables(variables);
		List<TaskInfo> taskInfoList = new ArrayList<TaskInfo>();
		taskInfoList.add(taskInfo);
		task.setTaskInfoList(taskInfoList);
		
		return task;
		
	}
}
