package gov.va;


import java.util.ArrayList;
import java.util.List;

public class CDSResponseBody {

	private String resourceType;
	private List<CDSResponseModifierExtension> modifierExtension = new ArrayList<CDSResponseModifierExtension>();
	private List<CDSResponsePayload> payload = new ArrayList<CDSResponsePayload>();
	private List<CDSResponseReason> reason = new ArrayList<CDSResponseReason>();
	private CDSResponsePriority priority;
	private CDSResponseText text;
//	private CDSResponseCode code;
//	private String valueString;
//	private String status;

	/**
	* 
	* @return
	* The resourceType
	*/
	public String getResourceType() {
		return resourceType;
	}

	/**
	* 
	* @param resourceType
	* The resourceType
	*/
	public void setResourceType(String resourceType) {
		this.resourceType = resourceType;
	}

	/**
	* 
	* @return
	* The modifierExtension
	*/
	public List<CDSResponseModifierExtension> getModifierExtension() {
		return modifierExtension;
	}

	/**
	* 
	* @param modifierExtension
	* The modifierExtension
	*/
	public void setModifierExtension(List<CDSResponseModifierExtension> modifierExtension) {
		this.modifierExtension = modifierExtension;
	}

	/**
	* 
	* @return
	* The code
	*/
//	public CDSResponseCode getCode() {
//		return code;
//	}

	/**
	* 
	* @param code
	* The code
	*/
//	public void setCode(CDSResponseCode code) {
//		this.code = code;
//	}

	/**
	* 
	* @return
	* The valueString
	*/
//	public String getValueString() {
//		return valueString;
//	}

	/**
	* 
	* @param valueString
	* The valueString
	*/
//	public void setValueString(String valueString) {
//		this.valueString = valueString;
//	}

	/**
	* 
	* @return
	* The status
	*/
//	public String getStatus() {
//		return status;
//	}

	/**
	* 
	* @param status
	* The status
	*/
//	public void setStatus(String status) {
//		this.status = status;
//	}

	public List<CDSResponsePayload> getPayload() {
		return payload;
	}

	public void setPayload(List<CDSResponsePayload> payload) {
		this.payload = payload;
	}

	public List<CDSResponseReason> getReason() {
		return reason;
	}

	public void setReason(List<CDSResponseReason> reason) {
		this.reason = reason;
	}

	public CDSResponsePriority getPriority() {
		return priority;
	}

	public void setPriority(CDSResponsePriority priority) {
		this.priority = priority;
	}

	public CDSResponseText getText() {
		return text;
	}

	public void setText(CDSResponseText text) {
		this.text = text;
	}

}
