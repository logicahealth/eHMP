package gov.va.signalregistrationservice;

import static org.junit.Assert.*;

import java.util.Map;

import org.junit.Test;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.va.signalregistrationservice.util.RegistrationUtil;

public class FlattenJsonTests {

	JsonParser parser = new JsonParser();

	@Test
	public void emptyJsonTest() {

		JsonObject matchJsonObject = parser.parse("{}").getAsJsonObject();		
		Map<String, String> map = RegistrationUtil.flattenJson(matchJsonObject);				
		assertTrue(map.isEmpty());
	}	
	
	@Test
	public void simpleJsonTest() {

		JsonObject matchJsonObject = parser.parse("{'prop1':'val1','prop2':'val2'}").getAsJsonObject();
		
		Map<String, String> map = RegistrationUtil.flattenJson(matchJsonObject);		
		
		assertFalse(map.isEmpty());
		assertEquals(2, map.size());
		assertEquals("val1", map.get("prop1"));
		assertEquals("val2", map.get("prop2"));
	}	

	@Test
	public void simpleJsonWithArrayTest() {

		String json = "{'prop1':'val1','prop2':['aval1','aval2'] }";
		JsonObject matchJsonObject = parser.parse(json).getAsJsonObject();
		
		Map<String, String> map = RegistrationUtil.flattenJson(matchJsonObject);		
		
		assertFalse(map.isEmpty());
		assertEquals(3, map.size());
		assertEquals("val1", map.get("prop1"));
		assertEquals("aval1", map.get("prop2[0]"));
		assertEquals("aval2", map.get("prop2[1]"));
	}	
	
	@Test
	public void nestedJsonTest() {

		String json = "{'prop1':'val1','prop2':{'nested1':'nval1', 'nested2':'nval2'} }";
		JsonObject matchJsonObject = parser.parse(json).getAsJsonObject();
		
		Map<String, String> map = RegistrationUtil.flattenJson(matchJsonObject);		
		
		assertFalse(map.isEmpty());
		assertEquals(3, map.size());
		assertEquals("val1", map.get("prop1"));
		assertEquals("nval1", map.get("prop2.nested1"));
		assertEquals("nval2", map.get("prop2.nested2"));
	}	

	@Test
	public void nestedJsonWithArrayTest() {

		String json = "{'prop1':'val1','prop2':{'nested1':'nval1', 'nested2':['aval1','aval2']} }";
		JsonObject matchJsonObject = parser.parse(json).getAsJsonObject();
		
		Map<String, String> map = RegistrationUtil.flattenJson(matchJsonObject);		
		
		assertFalse(map.isEmpty());
		assertEquals(4, map.size());
		assertEquals("val1", map.get("prop1"));
		assertEquals("nval1", map.get("prop2.nested1"));
		assertEquals("aval1", map.get("prop2.nested2[0]"));
		assertEquals("aval2", map.get("prop2.nested2[1]"));
	}	

}
