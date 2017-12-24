package vistacore.order.exception;

/**
 * This exception can be used to provide a status code to the UI
 */
public class OrderException extends Exception {
	private static final long serialVersionUID = -2175822771965735740L;
	
	public static final Integer BAD_REQUEST = 400;
	public static final Integer INTERNAL_SERVER_ERROR = 500;
	
	private Integer httpStatus = INTERNAL_SERVER_ERROR;
//-----------------------------------------------------------------------------
//-------------------------Constructors----------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * This exception can be used to provide a status code to the UI
	 * 
	 * @param httpStatus The error code for why the system is unable to provide a valid response to the UI.<br/>
	 * Usually one of 500 or 400 but can be any of the HTTP Status codes.
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 */
	public OrderException(Integer httpStatus, String message) {
		super(message);
		this.httpStatus = httpStatus;
	}
	
	/**
	 * This exception can be used to provide a status code to the UI
	 * 
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 */
	public OrderException(String message) {
		super(message);
	}

	/**
	 * This exception can be used to provide a status code to the UI
	 * 
	 * @param httpStatus The error code for why the system is unable to provide a valid response to the UI.<br/>
	 * Usually one of 500 or 400 but can be any of the HTTP Status codes.
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 * @param cause the cause (which is saved for later retrieval by the getCause() method). (A null value is permitted, and indicates that the cause is nonexistent or unknown.)
	 */
	public OrderException(Integer httpStatus, String message, Throwable cause) {
		super(message, cause);
		this.httpStatus = httpStatus;
	}
	
	/**
	 * This exception can be used to provide a status code to the UI
	 * 
	 * @param message The message for why the system is unable to provide a valid response to the UI.
	 * @param cause the cause (which is saved for later retrieval by the getCause() method). (A null value is permitted, and indicates that the cause is nonexistent or unknown.)
	 */
	public OrderException(String message, Throwable cause) {
		super(message, cause);
	}
	
//-----------------------------------------------------------------------------
//-------------------------Getters---------------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * The HttpStatus code
	 */
	public Integer getHttpStatus() {
		return httpStatus;
	}
	
//-----------------------------------------------------------------------------
//-------------------------Overrides-------------------------------------------
//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "OrderException [httpStatus=" + httpStatus + "]";
	}
}
