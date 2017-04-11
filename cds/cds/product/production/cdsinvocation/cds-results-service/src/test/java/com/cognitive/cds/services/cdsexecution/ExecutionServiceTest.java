/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
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
 */

package com.cognitive.cds.services.cdsexecution;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.cxf.interceptor.InterceptorChain;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.cxf.jaxrs.ext.MessageContextImpl;
import org.apache.cxf.message.Attachment;
import org.apache.cxf.message.Exchange;
import org.apache.cxf.message.Message;
import org.apache.cxf.transport.Destination;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.CDSInvocationIFace;
import com.cognitive.cds.invocation.CDSInvoker;
import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.engineplugins.MockEngine;
import com.cognitive.cds.invocation.execution.model.ExecutionRequest;
import com.cognitive.cds.invocation.execution.model.ExecutionResult;
import com.cognitive.cds.invocation.execution.model.Job;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })
public class ExecutionServiceTest {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ExecutionServiceTest.class);

	@Autowired
	@Qualifier("baseService")
	ExecutionService instance;

	@Ignore("Configured as a Service level itegration test right now")
	@Test
	public void testExecuteRulesWithSimpleList() {
		ExecutionRequest request = new ExecutionRequest();
		Context baseContext = Context.createContext();
		baseContext.getUser().setName("USER PANORAMA");
		baseContext.getUser().setCodeSystem("VA:DUZ");
		baseContext.getUser().setId("9E7A:10000000230");
		baseContext.getUser().setType("provider");

		InvocationTarget target = new InvocationTarget();
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Background);
		List<String> intentsSet = new ArrayList<>();
		intentsSet.add("mockBatch");
		target.setIntentsSet(intentsSet);

		List<String> subjectIds = new ArrayList<>();
		subjectIds.add("10107V395912");
		subjectIds.add("5000000317V387446");
		request.setSubjectIds(subjectIds);
		request.setTarget(target);
		request.setBaseContext(baseContext);

		loadTestResult(instance.getCdsInvoker());

		ExecutionResult result = instance.executeRules(request);
		logger.info("Result Status = " + result.getStatus().getCode());
		assertTrue("Should be sucessfull", result.getStatus().getCode() == StatusCode.SUCCESS.getCode());
	}

	@Ignore("Configured as a Service level itegration test right now")
	@Test
	public void testExecuteRulesJob() {
		ExecutionRequest request = new ExecutionRequest();
		Context baseContext = Context.createContext();
		baseContext.getUser().setName("USER PANORAMA");
		baseContext.getUser().setCodeSystem("VA:DUZ");
		baseContext.getUser().setId("9E7A:10000000230");
		baseContext.getUser().setType("provider");

		InvocationTarget target = new InvocationTarget();
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Background);
		List<String> intentsSet = new ArrayList<>();
		intentsSet.add("mockBatch");
		target.setIntentsSet(intentsSet);

		List<String> subjectIds = new ArrayList<>();
		subjectIds.add("10107V395912");
		subjectIds.add("5000000317V387446");
		request.setSubjectIds(subjectIds);
		request.setTarget(target);
		request.setBaseContext(baseContext);

		Job job = new Job();
		String jobId = "UnitTestJob";
		job.setExecution(request);
		job.setDisabled(false);
		job.setName(jobId);
		job.setDescription("A Test job from the unit tests");
		job.setOwner(baseContext.getUser());

		try {
			logger.info("Deleting the job in case it is still arround");
			boolean deleted = instance.deleteJob(jobId);
			if (deleted) {
				logger.info("Job was deleted");
			}

			logger.info("Saving job " + job.toJsonString());
			

			instance.createJob(jobId, job);
			 
			MessageContext context = new MessageContextImpl(new Message() {
                
                @Override
                public Collection<Object> values() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public int size() {
                    // TODO Auto-generated method stub
                    return 0;
                }
                
                @Override
                public Object remove(Object key) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public void putAll(Map<? extends String, ? extends Object> m) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public Object put(String key, Object value) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Set<String> keySet() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public boolean isEmpty() {
                    // TODO Auto-generated method stub
                    return false;
                }
                
                @Override
                public Object get(Object key) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Set<Entry<String, Object>> entrySet() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public boolean containsValue(Object value) {
                    // TODO Auto-generated method stub
                    return false;
                }
                
                @Override
                public boolean containsKey(Object key) {
                    // TODO Auto-generated method stub
                    return false;
                }
                
                @Override
                public void clear() {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public <T> void put(Class<T> key, T value) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public <T> T get(Class<T> key) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public void setInterceptorChain(InterceptorChain chain) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public void setId(String id) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public void setExchange(Exchange exchange) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public <T> void setContent(Class<T> format, Object content) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public void setAttachments(Collection<Attachment> attachments) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public void resetContextCache() {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public <T> void removeContent(Class<T> format) {
                    // TODO Auto-generated method stub
                    
                }
                
                @Override
                public InterceptorChain getInterceptorChain() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public String getId() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Exchange getExchange() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Destination getDestination() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Set<String> getContextualPropertyKeys() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Object getContextualProperty(String key) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Set<Class<?>> getContentFormats() {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public <T> T getContent(Class<T> format) {
                    // TODO Auto-generated method stub
                    return null;
                }
                
                @Override
                public Collection<Attachment> getAttachments() {
                    // TODO Auto-generated method stub
                    return null;
                }
            });
			
			instance.executeRulesJob(jobId, context);

		
			Job fndJob = instance.loadJobInfo(jobId);
			assertNotNull("Job did not load", fndJob);

			logger.info("Loaded job " + fndJob.toJsonString());	
			
			deleted = instance.deleteJob(jobId);		
			if (deleted) {
				logger.info("Job was deleted");
			}

			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	@Ignore("Configured as a Service level itegration test right now")
	@Test
	public void testJobIntegration() {

		ExecutionRequest request = new ExecutionRequest();
		Context baseContext = Context.createContext();
		baseContext.getUser().setName("USER PANORAMA");
		baseContext.getUser().setCodeSystem("VA:DUZ");
		baseContext.getUser().setId("9E7A:10000000230");
		baseContext.getUser().setType("provider");

		InvocationTarget target = new InvocationTarget();
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Background);
		List<String> intentsSet = new ArrayList<>();
		intentsSet.add("mockBatch");
		target.setIntentsSet(intentsSet);

		List<String> subjectIds = new ArrayList<>();
		subjectIds.add("10107V395912");
		subjectIds.add("5000000317V387446");
		request.setSubjectIds(subjectIds);
		request.setTarget(target);
		request.setBaseContext(baseContext);

		Job job = new Job();
		String jobId = "UnitTestJob";
		job.setExecution(request);
		job.setDisabled(false);
		job.setName(jobId);
		job.setDescription("A Test job from the unit tests");
		job.setOwner(baseContext.getUser());

		try {
			logger.info("Deleting the job in case it is still arround");
			boolean deleted = instance.deleteJob(jobId);
			if (deleted) {
				logger.info("Job was deleted");
			}

			logger.info("Saving job " + job.toJsonString());

			instance.createJob(jobId, job);

			Job fndJob = instance.loadJobInfo(jobId);
			assertNotNull("Job did not load", fndJob);

			logger.info("Loaded job " + fndJob.toJsonString());

			// Test Update
			job.setLastRun(new Date(System.currentTimeMillis()));

			instance.saveJobInfo(jobId, fndJob);

			deleted = instance.deleteJob(jobId);
			
		
			if (deleted) {
				logger.info("Job was deleted");
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void loadTestResult(CDSInvocationIFace invoker) {
		CDSInvoker cdsInvoker = (CDSInvoker) invoker;

		MockEngine engine = (MockEngine) cdsInvoker.getEnginesMap().get("mockEngineOne").getEngine();

		String out = "{\"resourceType\":\"Bundle\",\"entry\":[{\"resource\":{\"resourceType\":\"CommunicationRequest\",\"payload\":[{\"contentString\":\"The risk of heart disease increases for men after age 45. This is a FHIR rule.\"}]}},{\"resource\":{\"resourceType\":\"Patient\",\"extension\":[{\"url\":\"http://vistacore.us/fhir/profiles/@main#service-connected\",\"valueCoding\":{\"code\":\"Y\",\"display\":\"Service Connected\"}},{\"url\":\"http://vistacore.us/fhir/profiles/@main#sensitive\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/profiles/@main#religion\",\"valueCoding\":{\"code\":\"urn:va:pat-religion:29\",\"display\":\"UNKNOWN/NO PREFERENCE\"}},{\"url\":\"http://vistacore.us/fhir/profiles/@main#service-connected-percent\",\"valueQuantity\":{\"value\":0,\"units\":\"%\"}}],\"text\":{\"status\":\"generated\",\"div\":\"<div>SEVEN,PATIENT. SSN: 666000007</div>\"},\"contained\":[{\"resourceType\":\"Organization\",\"id\":\"284160c8-2d58-448e-d082-fc88044e3f55\",\"identifier\":[{\"label\":\"facility-code\",\"value\":\"998\"}],\"name\":\"ABILENE (CAA)\"}],\"identifier\":[{\"use\":\"official\",\"label\":\"ssn\",\"system\":\"http://hl7.org/fhir/sid/us-ssn\",\"value\":\"666000007\"},{\"label\":\"uid\",\"system\":\"http://vistacore.us/fhir/id/uid\",\"value\":\"urn:va:patient:9E7A:253:253\"},{\"label\":\"dfn\",\"system\":\"http://vistacore.us/fhir/id/dfn\",\"value\":\"253\"},{\"label\":\"pid\",\"system\":\"http://vistacore.us/fhir/id/pid\",\"value\":\"9E7A;253\"},{\"label\":\"lrdfn\",\"system\":\"http://vistacore.us/fhir/id/lrdfn\",\"value\":\"394\"},{\"label\":\"icn\",\"system\":\"http://vistacore.us/fhir/id/icn\",\"value\":\"10107V395912\"}],\"name\":[{\"use\":\"official\",\"text\":\"SEVEN,PATIENT\",\"family\":[\"SEVEN\"],\"given\":[\"PATIENT\"]}],\"telecom\":[{\"system\":\"phone\",\"value\":\"(222)555-8235\",\"use\":\"home\"},{\"system\":\"phone\",\"value\":\"(222)555-7720\",\"use\":\"work\"}],\"gender\":\"male\",\"birthDate\":\"1935-04-07\",\"address\":[{\"line\":[\"Any Street\"],\"city\":\"Any Town\",\"state\":\"WV\"}],\"maritalStatus\":{\"coding\":[{\"system\":\"http://hl7.org/fhir/v3/MaritalStatus\",\"code\":\"UNK\",\"display\":\"unknown\"}]},\"contact\":[{\"relationship\":[{\"coding\":[{\"system\":\"http://hl7.org/fhir/patient-contact-relationship\",\"code\":\"family\",\"display\":\"Next of Kin\"}],\"text\":\"Next of Kin\"}],\"name\":{\"use\":\"usual\",\"text\":\"VETERAN,BROTHER\"}}],\"managingOrganization\":{\"reference\":\"#284160c8-2d58-448e-d082-fc88044e3f55\"}}}]}";
		ResultBundle bundle = new ResultBundle();
		ArrayList<Result> results = new ArrayList<>();
		Result r1 = new Result();
		r1.setGeneratedBy("OpenCDS");
		r1.setTitle("");
		r1.setProvenance("");
		r1.setBody(out);
		r1.setCallId("Provided By Engine and Invocataion - This should never be seen in a result");
		r1.setType(InvocationConstants.ADVICE);
		results.add(r1);
		bundle.setResults(results);
		bundle.setStatus(StatusCode.SUCCESS);
		engine.setResultBundle(bundle);
	}
}
