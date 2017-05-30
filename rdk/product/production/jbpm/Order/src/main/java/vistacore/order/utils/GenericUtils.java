package vistacore.order.utils;

import org.jboss.logging.Logger;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class GenericUtils {
	private static final Logger LOGGER = Logger.getLogger(GenericUtils.class);
	public static String getOptionalJsonElementValueAsString(JsonObject jsonObject, String memberName) {
		try {
			JsonElement jsonElement = jsonObject.get(memberName);
			if (jsonElement != null)
				return jsonElement.getAsString();
			else
				return null;
		} catch (Exception e) {
			LOGGER.info("getJsonElementValueAsString was unable to retrieve '" + memberName + "':" + e.getMessage(), e);
		}

		return null;
	}
}
