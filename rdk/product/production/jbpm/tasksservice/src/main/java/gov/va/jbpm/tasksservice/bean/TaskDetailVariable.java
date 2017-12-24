package gov.va.jbpm.tasksservice.bean;

public class TaskDetailVariable {
	
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
		return lastModificationDate;
	}
	/**
	 * @param modificationDate the modificationDate to set
	 */
	public void setModificationDate(long modificationDate) {
		this.lastModificationDate = modificationDate;
	}
	
	/**
	 * @return the modificationDate
	 */
	public long getLastModificationDate() {
		return lastModificationDate;
	}
	/**
	 * @param modificationDate the modificationDate to set
	 */
	public void setLastModificationDate(long modificationDate) {
		this.lastModificationDate = modificationDate;
	}
	
}
