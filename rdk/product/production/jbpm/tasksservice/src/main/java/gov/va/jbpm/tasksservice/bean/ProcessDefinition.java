package gov.va.jbpm.tasksservice.bean;

import java.util.Map;

public class ProcessDefinition {

	private Map<String, String> variables;

	/**
	 * @return the variables
	 */
	public Map<String, String> getVariables() {
		return variables;
	}

	/**
	 * @param variables the variables to set
	 */
	public void setVariables(Map<String, String> variables) {
		this.variables = variables;
	}
	
	//As we do not need any other data except variables from process definition, all other properties are ignored.
}
