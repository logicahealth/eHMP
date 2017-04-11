package vistacore.order.kie.utils;

import org.kie.api.runtime.process.WorkflowProcessInstance;

import vistacore.order.consult.ConsultClinicalObject;
import vistacore.order.consult.ConsultOrder;
import vistacore.order.consult.ConsultPreReqOrder;
import vistacore.order.consult.SignalBody;
import vistacore.order.consult.TeamFocus;
import vistacore.order.exception.OrderException;


public class WorkflowProcessInstanceUtil {
//-----------------------------------------------------------------------------
//-------------------------REQUIRED--------------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a String, or the object returned is null
	 */
	public static String getRequiredString(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof java.lang.String)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a String as expected.");
		}
		
		String retvalue = (String)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not an Integer, or the object returned is null
	 */
	public static Integer getRequiredInteger(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof java.lang.Integer)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a Integer as expected.");
		}
		
		Integer retvalue = (Integer)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a Long, or the object returned is null
	 */
	public static Long getRequiredLong(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof java.lang.Long)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a Long as expected.");
		}
		
		Long retvalue = (Long)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a Boolean, or the object returned is null
	 */
	public static Boolean getRequiredBoolean(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof java.lang.Boolean)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a Boolean as expected.");
		}
		
		Boolean retvalue = (Boolean)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a TeamFocus, or the object returned is null
	 */
	public static TeamFocus getRequiredTeamFocus(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof TeamFocus)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a TeamFocus as expected.");
		}
		
		TeamFocus retvalue = (TeamFocus)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a ConsultOrder, or the object returned is null
	 */
	public static ConsultOrder getRequiredConsultOrder(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof ConsultOrder)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a ConsultOrder as expected.");
		}
		
		ConsultOrder retvalue = (ConsultOrder)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a ConsultClinicalObject, or the object returned is null
	 */
	public static ConsultClinicalObject getRequiredConsultClinicalObject(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof ConsultClinicalObject)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a ConsultClinicalObject as expected.");
		}
		
		ConsultClinicalObject retvalue = (ConsultClinicalObject)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a SignalBody, or the object returned is null
	 */
	public static SignalBody getRequiredSignalBody(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof SignalBody)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a SignalBody as expected.");
		}
		
		SignalBody retvalue = (SignalBody)obj;
		return retvalue;
	}
	
	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and throws an EhmpServicesException if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, if what is returned is not a ConsultPreReqOrder, or the object returned is null
	 */
	public static ConsultPreReqOrder getRequiredConsultPreReqOrder(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getRequiredVariable(workflowProcessInstance, paramName);
		
		if (!(obj instanceof ConsultPreReqOrder)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a ConsultPreReqOrder as expected.");
		}
		
		ConsultPreReqOrder retvalue = (ConsultPreReqOrder)obj;
		return retvalue;
	}
//-----------------------------------------------------------------------------
//-------------------------OPTIONAL--------------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and returns null if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, or if what is returned is not null and not a String.
	 */
	public static String getOptionalString(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getVariable(workflowProcessInstance, paramName);
		if (obj == null) {
			return null;
		}
		if (!(obj instanceof java.lang.String)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a String as expected.");
		}
		
		String retvalue = (String)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and returns null if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, or if what is returned is not null and not an Integer.
	 */
	public static Integer getOptionalInteger(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getVariable(workflowProcessInstance, paramName);
		if (obj == null) {
			return null;
		}
		if (!(obj instanceof java.lang.Integer)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a Integer as expected.");
		}
		
		Integer retvalue = (Integer)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and returns null if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, or if what is returned is not null and not a Boolean.
	 */
	public static Boolean getOptionalBoolean(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getVariable(workflowProcessInstance, paramName);
		if (obj == null) {
			return null;
		}
		if (!(obj instanceof java.lang.Boolean)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a Boolean as expected.");
		}
		
		Boolean retvalue = (Boolean)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the WorkflowProcessInstance and returns null if it doesn't exist.
	 * 
	 * @throws OrderException If workflowProcessInstance is null, the paramName is null or empty, or if what is returned is not null and not a SignalBody.
	 */
	public static SignalBody getOptionalSignalBody(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getVariable(workflowProcessInstance, paramName);
		if (obj == null) {
			return null;
		}
		if (!(obj instanceof SignalBody)) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was not a SignalBody as expected.");
		}
		
		SignalBody retvalue = (SignalBody)obj;
		return retvalue;
	}

//-----------------------------------------------------------------------------
//-------------------------INTERNAL--------------------------------------------
//-----------------------------------------------------------------------------

	/**
	 * Validates that the workflowProcessInstance and paramName are not null or empty.
	 * Then, it extracts the given parameter from the WorkflowProcessInstance and then returns it.
	 * 
	 * @throws OrderException If workflowProcessInstance is null or the paramName is null or empty.
	 */
	private static Object getVariable(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		if (workflowProcessInstance == null) {
			throw new OrderException(OrderException.BAD_REQUEST, "workflowProcessInstance was null");			
		}
		if (paramName == null || paramName.isEmpty()) {
			throw new OrderException(OrderException.BAD_REQUEST, "paramName was null or empty");			
		}
		
		Object obj  = workflowProcessInstance.getVariable(paramName);
		return obj;
	}
	
	/**
	 * Calls {@link #getVariable(WorkflowProcessInstance, String)} and then validates that the returned object is not null.
	 * 
	 * @throws OrderException If workflowProcessInstance is null or the paramName is null or empty.
	 */
	private static Object getRequiredVariable(WorkflowProcessInstance workflowProcessInstance, String paramName) throws OrderException {
		Object obj = getVariable(workflowProcessInstance, paramName);
		if (obj == null) {
			throw new OrderException(OrderException.BAD_REQUEST, "Required parameter '" + paramName + "' was null.");
		}
		return obj;
	}
}
