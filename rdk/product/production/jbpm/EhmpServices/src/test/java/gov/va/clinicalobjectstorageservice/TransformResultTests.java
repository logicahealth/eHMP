package gov.va.clinicalobjectstorageservice;

import static org.junit.Assert.*;
import gov.va.clinicalobjectstorageservice.ClinicalObjectWriteHandler;
import gov.va.ehmp.services.exception.EhmpServicesException;

import org.junit.Test;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class TransformResultTests {

	ClinicalObjectWriteHandler writeHandler = new ClinicalObjectWriteHandler();
	
	@Test
	public void emptyResultTest() throws EhmpServicesException {
		String result = writeHandler.transformResult("");
				
		assertEquals("", result);
	}
	
	@Test
	public void noElementsInResultJSONTest() throws EhmpServicesException {
		String result = writeHandler.transformResult("{}");
		assertNotEquals("", result);
		
		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(result).getAsJsonObject();
		
		assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
		assertEquals(200, obj.get("status").getAsInt());
		assertTrue(obj.has("uid") && obj.get("uid").isJsonPrimitive());		
		assertEquals("", obj.get("uid").getAsString());
	}

	@Test
	public void noHeadersElementInResultJSONTest() throws EhmpServicesException {
		String result = writeHandler.transformResult("{\"data\":{}}");
		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(result).getAsJsonObject();
		
		assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
		assertEquals(200, obj.get("status").getAsInt());
		assertTrue(obj.has("uid") && obj.get("uid").isJsonPrimitive());		
		assertEquals("", obj.get("uid").getAsString());
	}

	@Test
	public void noLocationElementInResultJSONTest() throws EhmpServicesException {
		String result = writeHandler.transformResult("{\"data\":{\"headers\":{}}}");
		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(result).getAsJsonObject();
		
		assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
		assertEquals(200, obj.get("status").getAsInt());
		assertTrue(obj.has("uid") && obj.get("uid").isJsonPrimitive());		
		assertEquals("", obj.get("uid").getAsString());
	}
	
	@Test
	public void validResultJSONTest() throws EhmpServicesException {
		String result = writeHandler.transformResult("{\"data\":{\"headers\":{\"location\":\"http://IP             /clinicobj/urn:va:ehmp-activity:9E7A:3:f385c135-79d7-47b7-ae7b-08d6db753bce\"}}}");
		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(result).getAsJsonObject();
		
		assertTrue(obj.has("status") && obj.get("status").isJsonPrimitive());
		assertEquals(200, obj.get("status").getAsInt());
		assertTrue(obj.has("uid") && obj.get("uid").isJsonPrimitive());		
		assertEquals("urn:va:ehmp-activity:9E7A:3:f385c135-79d7-47b7-ae7b-08d6db753bce", obj.get("uid").getAsString());
	}

}
