package gov.va;


public class CDSResponseResult {

	private CDSResponseBody body;
	private String callId;
	private String generatedBy;
	private Object provenance;
	private Object title;
	private String type;
	
	/**
	* 
	* @return
	* The body
	*/
	public CDSResponseBody getBody() {
		return body;
	}

	/**
	* 
	* @param body
	* The body
	*/
	public void setBody(CDSResponseBody body) {
		this.body = body;
	}

	/**
	* 
	* @return
	* The callId
	*/
	public String getCallId() {
		return callId;
	}

	/**
	* 
	* @param callId
	* The callId
	*/
	public void setCallId(String callId) {
		this.callId = callId;
	}

	/**
	* 
	* @return
	* The generatedBy
	*/
	public String getGeneratedBy() {
		return generatedBy;
	}

	/**
	* 
	* @param generatedBy
	* The generatedBy
	*/
	public void setGeneratedBy(String generatedBy) {
		this.generatedBy = generatedBy;
	}

	/**
	* 
	* @return
	* The provenance
	*/
	public Object getProvenance() {
		return provenance;
	}

	/**
	* 
	* @param provenance
	* The provenance
	*/
	public void setProvenance(Object provenance) {
		this.provenance = provenance;
	}

	/**
	* 
	* @return
	* The title
	*/
	public Object getTitle() {
		return title;
	}

	/**
	* 
	* @param title
	* The title
	*/
	public void setTitle(Object title) {
		this.title = title;
	}

	/**
	* 
	* @return
	* The type
	*/
	public String getType() {
		return type;
	}

	/**
	* 
	* @param type
	* The type
	*/
	public void setType(String type) {
		this.type = type;
	}

}

