package gov.va.storageservice.notifications.util;

import org.json.JSONException;
import org.junit.Test;
import org.skyscreamer.jsonassert.JSONAssert;

import gov.va.ehmp.services.exception.EhmpServicesException;

public class ResourceUtilTest {
	@Test
	public void validateErrorForBadNotification() throws JSONException {
		ResourceUtil ru = new ResourceUtil();
		String jsonBody = "{" +
							"\"deploymentId\":\"BOGUS\"," +
							"\"processDefId\":\"Order.Consult\"," +
							"\"parameter\":{" +
							"\"notification\": \"{   \\\"recipients\\\": [{     \\\"recipient\\\": {       \\\"userId\\\": \\\"10000000270\\\"     },     \\\"salience\\\": 2    }, {     \\\"recipient\\\": {       \\\"userId\\\": \\\"10000000272\\\"         },     \\\"salience\\\": 2      }],   \\\"producer\\\": {     \\\"description\\\": \\\"workflow: lab order management\\\"   },   \\\"referenceId\\\": \\\"task123\\\",   \\\"patientId\\\": \\\"9E7A;253\\\",   \\\"message\\\": {     \\\"subject\\\": \\\"Order lab\\\",     \\\"body\\\": \\\"Finish ordering your lab\\\"   },   \\\"resolution\\\": \\\"producer\\\",   \\\"navigation\\\": {     \\\"channel\\\": \\\"labOE\\\",     \\\"event\\\": \\\"entry:show\\\",     \\\"parameter\\\": \\\"123\\\"   } }\"," +
						    "\"icn\" : \"9E7A;3\"," +
						    "\"pid\" : \"9E7A;3\"," +
						    "\"facility\": \"9E7A\"" +
						  "}" +
						"}";

		String result = null;
		try {
			result = ru.invokePostResource(jsonBody);
		} catch (EhmpServicesException e) {
//			com.google.gson.JsonParser parser = new com.google.gson.JsonParser();
//			com.google.gson.JsonObject obj = parser.parse(e.toJsonString()).getAsJsonObject();
//			
//			org.junit.Assert.assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
//			org.junit.Assert.assertEquals(400, obj.get("status").getAsInt());
//			org.junit.Assert.assertTrue(obj.has("error") && obj.get("error").isJsonPrimitive());		
//			org.junit.Assert.assertEquals("HttpRuntimeException (Caused by HttpClientErrorException 400): 400 Bad Request", obj.get("error").getAsString());
			String expected = "{\"status\":400,\"error\":\"HttpRuntimeException (Caused by HttpClientErrorException 400): 400 Bad Request, messageBody: {\\\"message\\\":\\\"body.recipients is a required property\\\",\\\"status\\\":400}\"}";
			JSONAssert.assertEquals(expected, e.toJsonString(), true);
			return;
		}
		
		org.junit.Assert.fail("Should have received a 400 error due to json not being valid for a notification - result: " + result);
	}
}
