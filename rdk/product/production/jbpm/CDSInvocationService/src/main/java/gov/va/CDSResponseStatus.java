package gov.va;


public class CDSResponseStatus {
	private String code;
	private String httpStatus;

	/**
	* 
	* @return
	* The code
	*/
	public String getCode() {
		return code;
	}

	/**
	* 
	* @param code
	* The code
	*/
	public void setCode(String code) {
		this.code = code;
	}

	/**
	* 
	* @return
	* The httpStatus
	*/
	public String getHttpStatus() {
		return httpStatus;
	}

	/**
	* 
	* @param httpStatus
	* The httpStatus
	*/
	public void setHttpStatus(String httpStatus) {
		this.httpStatus = httpStatus;
	}

}