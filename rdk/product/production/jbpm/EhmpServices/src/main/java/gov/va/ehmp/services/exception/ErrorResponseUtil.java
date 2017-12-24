package gov.va.ehmp.services.exception;

import org.jboss.logging.Logger;
import org.springframework.http.HttpStatus;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ErrorResponseUtil {
	
	private static final Logger LOGGER = Logger.getLogger(ErrorResponseUtil.class);

	/**
	 * Takes any message and creates a json string containing error and status as the two fields.
	 * 
	 * @param httpStatus the status
	 * @param message the error message
	 * @param serverResponse the response that came from the server - can be null
	 */
	public static String createJsonErrorResponse(HttpStatus httpStatus, String message, String serverResponse) {
				
		JsonObject outputObj = new JsonObject();
		
		//status
		if (httpStatus == null) {
			outputObj.addProperty("status", 500);
			outputObj.addProperty("additionalStatusInfo", "No httpStatus code was given, defaulting to 500");
		}
		else {
			outputObj.addProperty("status", httpStatus.value());
		}
		
		//error
		if (message == null || message.isEmpty()) {
			outputObj.addProperty("error", "");
			outputObj.addProperty("additionalErrorInfo", "UNKNOWN ERROR - ERROR MESSAGE WAS NOT SUPPLIED");
		}
		else {
			outputObj.addProperty("error", message);
		}
		
		//serverResponse
		if (serverResponse != null && serverResponse.isEmpty() == false) {
			JsonParser parser = new JsonParser();
			
			JsonObject obj = null;
			try {
				obj = parser.parse(serverResponse).getAsJsonObject();
				outputObj.add("serverResponse", obj);
			}
			catch(Exception e) {
				LOGGER.error(e.getMessage(), e);
				outputObj.addProperty("serverResponse", serverResponse);
			}
		}
		
		Gson gson = new GsonBuilder().create();
		String response = gson.toJson(outputObj);
		return response;
	}
}
