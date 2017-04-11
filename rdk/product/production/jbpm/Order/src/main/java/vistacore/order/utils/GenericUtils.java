package vistacore.order.utils;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class GenericUtils {
	public static String getOptionalJsonElementValueAsString(JsonObject jsonObject, String memberName) {
		try {
			JsonElement jsonElement = jsonObject.get(memberName);
			if (jsonElement != null)
				return jsonElement.getAsString();
			else
				return null;
		} catch (Exception e) {
			Logging.info("getJsonElementValueAsString was unable to retrieve '" + memberName + "':" + e.getMessage());
		}

		return null;
	}
}
