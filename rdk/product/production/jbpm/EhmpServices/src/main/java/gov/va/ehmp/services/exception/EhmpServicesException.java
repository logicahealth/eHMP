package gov.va.ehmp.services.exception;

import org.springframework.http.HttpStatus;

/**
 * This exception provides a toJsonString method so you can easily return a formatted json string of the error and status code to the UI.
 */
public class EhmpServicesException extends Exception {
	private static final long serialVersionUID = 2719127462276038656L;
	private HttpStatus httpStatus;
	private String serverResponse = null;
	
//-----------------------------------------------------------------------------
//-------------------------Constructors----------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * This exception provides a toJsonString method so you can easily return a formatted json string of the error and status code to the UI.
	 * 
	 * @param httpStatus The error code for why the system is unable to provide a valid response to the UI.<br/>
	 * Usually one of HttpStatus.INTERNAL_SERVER_ERROR or HttpStatus.BAD_REQUEST<br/>
	 * but can be any of the HttpStatus codes.
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 */
	public EhmpServicesException(HttpStatus httpStatus, String message) {
		super(message);
		this.httpStatus = httpStatus;
	}
	
	/**
	 * This exception provides a toJsonString method so you can easily return a formatted json string of the error and status code to the UI.
	 * 
	 * @param httpStatus The error code for why the system is unable to provide a valid response to the UI.<br/>
	 * Usually one of HttpStatus.INTERNAL_SERVER_ERROR or HttpStatus.BAD_REQUEST<br/>
	 * but can be any of the HttpStatus codes.
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 * @param serverResponse The message from an external system as to why we were unable to provide a valid response to the UI.
	 */
	public EhmpServicesException(HttpStatus httpStatus, String message, Throwable cause, String serverResponse) {
		super(message + ", response from external server: " + serverResponse, cause);
		this.httpStatus = httpStatus;
		this.serverResponse = serverResponse;
	}

	/**
	 * This exception provides a toJsonString method so you can easily return a formatted json string of the error and status code to the UI.
	 * 
	 * @param httpStatus The error code for why the system is unable to provide a valid response to the UI.<br/>
	 * Usually one of HttpStatus.INTERNAL_SERVER_ERROR or HttpStatus.BAD_REQUEST<br/>
	 * but can be any of the HttpStatus codes.
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 * @param cause the cause (which is saved for later retrieval by the getCause() method). (A null value is permitted, and indicates that the cause is nonexistent or unknown.)
	 */
	public EhmpServicesException(HttpStatus httpStatus, String message, Throwable cause) {
		super(message, cause);
		this.httpStatus = httpStatus;
	}
	
//-----------------------------------------------------------------------------
//-------------------------Getters---------------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * The HttpStatus code
	 */
	public HttpStatus getHttpStatus() {
		return httpStatus;
	}
	
	public String getServerResponse() {
		return serverResponse;
	}
	
//-----------------------------------------------------------------------------
//-------------------------Overrides-------------------------------------------
//-----------------------------------------------------------------------------


	/**
	 * Calls {@link #createJsonErrorResponse()} to generate a JSON response that can be sent back to the UI<br/>
	 * <font color="red"><b>It's preferred that you use toJsonString</b></font>
	 */
	@Override
	public String toString() {
		return createJsonErrorResponse();
	}
	
	/**
	 * Generates a JSON response that can be sent back to the UI (using {@link ErrorResponseUtil#createJsonErrorResponse(HttpStatus, String, String)}).
	 */
	public String createJsonErrorResponse() {
		return ErrorResponseUtil.createJsonErrorResponse(this.httpStatus, this.getMessage(), this.getServerResponse());
	}
}
