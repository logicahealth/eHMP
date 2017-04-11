package gov.va.ehmp.services.utils;

import static org.junit.Assert.*;

import org.json.JSONException;
import org.junit.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.http.HttpStatus;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.va.ehmp.services.exception.ErrorResponseUtil;

public class ErrorResponseUtilTest {
	@Test
	public void validateErrorConstruction() throws JSONException {
		String actual = ErrorResponseUtil.create(HttpStatus.BAD_REQUEST, "Bogus Message", null);
		String expected = "{\"error\": \"Bogus Message\",\"status\": 400}";
		JSONAssert.assertEquals(expected, actual, true);
	}
	@Test
	public void validateErrorConstructionNullHttpStatus() throws JSONException {
		String actual = ErrorResponseUtil.create(null, "Bogus Message", null);
		String expected = "{\"error\": \"Bogus Message\",\"status\": 500,\"additionalStatusInfo\":\"No httpStatus code was given, defaulting to 500\"}";
		JSONAssert.assertEquals(expected, actual, true);
	}
	@Test
	public void validateErrorConstructionNullMessage() throws JSONException {
		String actual = ErrorResponseUtil.create(HttpStatus.BAD_REQUEST, null, null);
		String expected = "{\"error\": \"\",\"additionalErrorInfo\":\"UNKNOWN ERROR - ERROR MESSAGE WAS NOT SUPPLIED\",\"status\": 400}";
		JSONAssert.assertEquals(expected, actual, true);
	}
	@Test
	public void validateErrorConstructionEmptyMessage() throws JSONException {
		String actual = ErrorResponseUtil.create(HttpStatus.BAD_REQUEST, "", null);
		String expected = "{\"error\": \"\",\"additionalErrorInfo\":\"UNKNOWN ERROR - ERROR MESSAGE WAS NOT SUPPLIED\",\"status\": 400}";
		JSONAssert.assertEquals(expected, actual, true);
	}
	@Test
	public void validateErrorConstructionServerMessageJson() throws JSONException {
		String actual = ErrorResponseUtil.create(HttpStatus.BAD_REQUEST, "Bogus Message", "{\"message\": \"KieRemoteRestOperationException thrown with message 'No deployments available for BOGUS'\",\"status\": 400}");
		String expected = "{\"status\":400,\"error\":\"Bogus Message\",\"serverResponse\":{\"message\":\"KieRemoteRestOperationException thrown with message \u0027No deployments available for BOGUS\u0027\",\"status\":400}}";
		JSONAssert.assertEquals(expected, actual, true);
	}
	@Test
	public void validateErrorConstructionServerMessageString() throws JSONException {
		String serverResponse = "SyntaxError: Unexpected end of input\n" +
								"<br> &nbsp; &nbsp;at Object.parse (native)\n" +
								"<br> &nbsp; &nbsp;at parse (/opt/rdk/node_modules/body-parser/lib/types/json.js:88:17)\n" +
								"<br> &nbsp; &nbsp;at /opt/rdk/node_modules/body-parser/lib/read.js:116:18\n" +
								"<br> &nbsp; &nbsp;at invokeCallback (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:262:16)\n" +
								"<br> &nbsp; &nbsp;at done (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:251:7)\n" +
								"<br> &nbsp; &nbsp;at IncomingMessage.onEnd (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:308:7)\n" +
								"<br> &nbsp; &nbsp;at IncomingMessage.emit (events.js:92:17)\n" +
								"<br> &nbsp; &nbsp;at _stream_readable.js:944:16\n" +
								"<br> &nbsp; &nbsp;at process._tickCallback (node.js:448:13)";

		String actual = ErrorResponseUtil.create(HttpStatus.BAD_REQUEST, "Bogus Message", serverResponse);
		String expected = "{\"status\":400,\"error\":\"Bogus Message\",\"serverResponse\":\"SyntaxError: Unexpected end of input\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at Object.parse (native)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at parse (/opt/rdk/node_modules/body-parser/lib/types/json.js:88:17)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at /opt/rdk/node_modules/body-parser/lib/read.js:116:18\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at invokeCallback (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:262:16)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at done (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:251:7)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at IncomingMessage.onEnd (/opt/rdk/node_modules/body-parser/node_modules/raw-body/index.js:308:7)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at IncomingMessage.emit (events.js:92:17)\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at _stream_readable.js:944:16\\n\\u003cbr\\u003e \\u0026nbsp; \\u0026nbsp;at process._tickCallback (node.js:448:13)\"}";
		JSONAssert.assertEquals(expected, actual, false);
		
		//This shows how to do the exact same thing as the one line above.
		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(actual).getAsJsonObject();
		
		assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
		assertEquals(400, obj.get("status").getAsInt());
		assertTrue(obj.has("error") && obj.get("error").isJsonPrimitive());
		assertEquals("Bogus Message", obj.get("error").getAsString());
		
		assertTrue(obj.has("serverResponse") && obj.get("serverResponse").isJsonPrimitive());
		assertEquals(serverResponse, obj.get("serverResponse").getAsString());
	}
}
