/*******************************************************************************
 *
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 *
 *******************************************************************************/
package com.cognitive.cds.services.cdsexecution;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.model.InvocationMapping;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class IntentMappingTest {

	public static void main(String[] args) {
		IntentMapping intentMapping = createIntentMappingObject();
		
		try {
			ObjectMapper mapper = new ObjectMapper();
			String json = mapper.writeValueAsString(intentMapping);
			System.out.println(json);
			IntentMapping intentMapping1 = mapper.readValue(json, IntentMapping.class);
			String json2 = mapper.writeValueAsString(intentMapping1);
			System.out.println(json2);
			
		} catch (JsonParseException e) {
			
			e.printStackTrace();
		} catch (JsonMappingException e) {
			
			e.printStackTrace();
		} catch (IOException e) {
			
			e.printStackTrace();
		}
	}
	 private static IntentMapping createIntentMappingObject(){
	    	IntentMapping intentMapping = new IntentMapping();
	   
		    InvocationMapping invocationMapping = new InvocationMapping();
			List<Rule> rules = new ArrayList<>();
		   	Rule rule = new Rule();
		   	Properties props = new Properties();
		   	props.put("scopingEntityId", "com.cognitive");
		   	props.put("businessId", "genderAge");
		   	props.put("version","1.0.0");
		   	rule.setProperties(props);
		   	rules.add(rule);
		   	invocationMapping.setRules(rules);
		   	invocationMapping.setEngineName("OpenCDS");
		   	invocationMapping.setName("providerInteractiveAdvice");
		   	List<String> dataQueries = new ArrayList<>();
		   	dataQueries.add("patient/##SUBJECT.ID##");
		   	invocationMapping.setDataQueries(dataQueries);
		   	
		   	List<InvocationMapping> invocations = new ArrayList<>();
	        invocations.add(invocationMapping);
	        intentMapping.setInvocations(invocations);
	        intentMapping.setName("providerInteractiveAdvice");
		   	return intentMapping;
	   }
}
