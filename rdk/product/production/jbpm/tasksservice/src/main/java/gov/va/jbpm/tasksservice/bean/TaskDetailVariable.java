package gov.va.jbpm.tasksservice.bean;

import org.jboss.logging.Logger;

import gov.va.jbpm.tasksservice.controller.TasksController;

public class TaskDetailVariable {
	
	private static final Logger LOGGER = Logger.getLogger(TasksController.class);

	private String name;
    
    private VariableValue variableValue;
    
    private long lastModificationDate;
    
	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * @return the value
	 */
	public VariableValue getValue() {
		return variableValue;
	}
	/**
	 * @param value the value to set
	 */
	public void setValue(VariableValue value) {
		this.variableValue = value;
	}
	/**
	 * @return the modificationDate
	 */
	public long getModificationDate() {
		LOGGER.debug("getModificationDate: "+lastModificationDate);
		return lastModificationDate;
	}
	/**
	 * @param modificationDate the modificationDate to set
	 */
	public void setModificationDate(long modificationDate) {
		LOGGER.debug("setModificationDate: "+lastModificationDate);
		this.lastModificationDate = modificationDate;
	}
	
	/**
	 * @return the modificationDate
	 */
	public long getLastModificationDate() {
		LOGGER.debug("getLastModificationDate: "+lastModificationDate);
		return lastModificationDate;
	}
	/**
	 * @param modificationDate the modificationDate to set
	 */
	public void setLastModificationDate(long modificationDate) {
		LOGGER.debug("setLastModificationDate: "+lastModificationDate);
		this.lastModificationDate = modificationDate;
	}
	
}
