package gov.va;

public class LabFHIRIdentifier {

	private String system;
	private LabFHIRType type;
	private String value;

	/**
	* 
	* @return
	* The system
	*/
	public String getSystem() {
		return system;
	}

	/**
	* 
	* @param system
	* The system
	*/
	public void setSystem(String system) {
		this.system = system;
	}

	
	/**
	* 
	* @return
	* The type
	*/
	public LabFHIRType getType() {
		return type;
	}

	/**
	* 
	* @param type
	* The type
	*/
	public void setType(LabFHIRType type) {
		this.type = type;
	}

	/**
	* 
	* @return
	* The value
	*/
	public String getValue() {
		return value;
	}

	/**
	* 
	* @param value
	* The value
	*/
	public void setValue(String value) {
		this.value = value;
	}
	
}
