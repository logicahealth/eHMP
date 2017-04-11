package com.cognitive.cds.services.cdsresults;

import static org.junit.Assert.assertEquals;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;

import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.dstu2.composite.CodeableConceptDt;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.composite.QuantityDt;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.valueset.ObservationStatusEnum;
import ca.uhn.fhir.model.primitive.CodeDt;
import ca.uhn.fhir.model.primitive.DecimalDt;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.services.cdsinteractive.InvokeServiceReq;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.MappingJsonFactory;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })
public class VitalsResultsServiceIT {

	@Value("${invokeRulesEndpoint}")
	String endpointUrl;

    @Ignore("Service Integration test in the Unit test cycle")
	@Test
	public void testVitalsResults() throws Exception {
		List<Object> providers = new ArrayList<Object>();
		providers
				.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

		InvokeServiceReq input = new InvokeServiceReq();

		InvocationTarget target = new InvocationTarget();
		Context context = new Context();
		context.setSubject(new Subject("TestSubject", "9E7A;100816"));
		context.setLocation(new Location("Test Location", "Location1"));
		context.setUser(new User("Tester", "Id1"));
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Direct);
		LinkedList<String> intents = new LinkedList<String>();
		target.setIntentsSet(intents);
		Properties parameters = new Properties();

		ResultBundle out;

		intents.add("VitalsValidation");

		// Ok now we try with a parameter
		target.setMode(InvocationMode.Normal);
		Observation obs = new Observation();
		// Needed: Code, status,
		CodeableConceptDt code = new CodeableConceptDt();
		CodingDt codeDt = new CodingDt();
		codeDt.setCode("29463-7");
		codeDt.setSystem("http://loinc.org");
		code.getCoding().add(codeDt);
		obs.setCode(code);
		obs.setStatus(ObservationStatusEnum.PRELIMINARY);

		// Useful: issued, value
		obs.setComments("Comment");
		Date now = new Date(System.currentTimeMillis());
		obs.setIssuedWithMillisPrecision(now);
		QuantityDt qdt = new QuantityDt();
		qdt.setCode("Pounds");
		DecimalDt theValue = new DecimalDt(180.5);
		qdt.setValue(theValue);
		obs.setValue(qdt);
		
		 ExtensionDt extDN = new ExtensionDt();
		 extDN.setUrl("http://org.cognitive.cds.invocation.fhir.datanature");
		 extDN.setModifier(true);
		 CodeDt cd = new CodeDt();
		 cd.setValueAsString("Input");
		 extDN.setValue(cd);
		 obs.addUndeclaredExtension(extDN);

		parameters.put("Weight", obs);

		Observation obs1 = new Observation();
		// Needed: Code, status,
		CodeableConceptDt code1 = new CodeableConceptDt();
		CodingDt codeDt1 = new CodingDt();
		codeDt1.setCode("8302-2");
		codeDt1.setSystem("http://loinc.org");
		code1.getCoding().add(codeDt1);
		obs1.setCode(code1);
		obs1.setStatus(ObservationStatusEnum.PRELIMINARY);

		// Useful: issued, value
		obs1.setComments("Comment");
		Date now1 = new Date(System.currentTimeMillis());
		obs.setIssuedWithMillisPrecision(now1);
		QuantityDt qdt1 = new QuantityDt();
		qdt.setCode("inches");
		DecimalDt theValue1 = new DecimalDt(68.5);
		qdt1.setValue(theValue1);
		obs1.setValue(qdt1);
		
		 ExtensionDt extDN1 = new ExtensionDt();
		 extDN.setUrl("http://org.cognitive.cds.invocation.fhir.datanature");
		 extDN.setModifier(true);
		 CodeDt cd1 = new CodeDt();
		 cd1.setValueAsString("Input");
		 extDN1.setValue(cd1);
		 obs1.addUndeclaredExtension(extDN1);

		parameters.put("Height", obs1);

		// InvokeServiceReq req = new InvokeServiceReq();
		input.setContext(context);
		// input.setDataModel("");
		input.setParameters(parameters);
		input.setTarget(target);

		//String reqStr = JsonUtils.toJsonStringCompact(input);
		//System.out.println("Example Invoke String = " + reqStr);

		// input.setReason("demo");
		// WebClient client = WebClient.create(endpointUrl +
		// "/rest/invokeRules", providers);
		WebClient client = WebClient.create(endpointUrl, providers);

		 Response r = client.accept("application/json")
		 .type("application/json")
		 .post(input);
//		Response r = client.accept("application/json").type("application/json")
//				.post(reqStr);

		assertEquals(Response.Status.OK.getStatusCode(), r.getStatus());
		MappingJsonFactory jfactory = new MappingJsonFactory();
		// JsonFactory jfactory = new JsonFactory();
		JsonParser parser = jfactory.createParser((InputStream) r.getEntity());
		// CDSResultBundle output = parser.readValueAs(CDSResultBundle.class);
		ResultBundle output = parser.readValueAs(ResultBundle.class);

		String outputJson = JsonUtils.toJsonStringCompact(output);

		System.err.println("Output: " + outputJson);
		assertEquals("0", output.getStatus().getCode());
	}

}
