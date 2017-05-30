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
package com.cognitive.cds.invocation.execution.model;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import org.junit.Test;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.fhir.FhirDataRetrieverTest;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.InvocationMapping;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.model.Specialty;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;

public class JobTest {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JobTest.class);

	@Test
	public void test() throws ParseException, IOException {
		Job job = new Job();
		job.setName("JobName");
		job.setDescription("The Descripiton");
		job.setOwner(new User("TheJobOwner", "JobOwnerId", "Administrator"));
		ExecutionRequest exeReq = new ExecutionRequest();
		Context ctx = new Context();
		ctx.setLocation(new Location("LocationName", "LocationId", "Clinic"));
		ctx.setSpecialty(new Specialty("SpecName", "SpecId", "Department"));
		ctx.setUser(new User("TheUser", "UserId", "Provider"));
		exeReq.setBaseContext(ctx);
		ArrayList<SubjectListReference> subjectsListReferences = new ArrayList<>();
		subjectsListReferences.add(new SubjectListReference("ListId1"));
		subjectsListReferences.add(new SubjectListReference("ListId2"));
		exeReq.setSubjectListReferences(subjectsListReferences);
		exeReq.getSubjectIds().add("Patient:Id1");
		exeReq.getSubjectIds().add("Patient:Id2");
		exeReq.getSubjectIds().add("Patient:Id3");
		InvocationTarget target = new InvocationTarget();
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Background);
		target.getIntentsSet().add("Intent1");
		target.getIntentsSet().add("Intent2");
		List<InvocationMapping> supMapping = new ArrayList<>();
		InvocationMapping mapping = new InvocationMapping();
		mapping.setDataFormat("FHIR");
		ArrayList<String> dataQueries = new ArrayList<>();
		dataQueries
		        .add("http://www.rdk.gov/fhir/resource?id=\"{$Subject.Id}\"");
		mapping.setDataQueries(dataQueries);
		mapping.setEngineName("Engine1");
		Rule rule1 = new Rule();
		rule1.setId("Engine1-RuleId22");
		Properties props = new Properties();
		props.setProperty("AProperty", "SomeValue");
		rule1.setProperties(props);
		Rule rule2 = new Rule();
		rule2.setId("Engine1-RuleId34");
		ArrayList<Rule> rules = new ArrayList<>();
		rules.add(rule1);
		rules.add(rule2);
		mapping.setRules(rules);
		supMapping.add(mapping);
		target.setSupplementalMappings(supMapping);
		exeReq.setTarget(target);
		job.setExecution(exeReq);

		// Setup as if it ran
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
		Date lastRun = formatter.parse("4/10/2015/13:15:00");
		job.setLastRun(lastRun);
		ExecutionResult result = new ExecutionResult();
		result.setStatus(StatusCode.MULTIPLE_FAULTS);
		result.setTotalResults(1002);
		result.setTotalRuntme(1000 * 60 * 15);
		result.setTotalSubjectsProcessed(3467);
		ArrayList<ExecutionFault> faults = new ArrayList<>();
		ExecutionFault fault1 = new ExecutionFault();
		Context ctxF1 = new Context(ctx);
		ctxF1.setSubject(new Subject("PateintName1", "Id1", "Patient"));
		fault1.setContext(ctxF1);
		fault1.setTarget(target);
		ArrayList<FaultInfo> faultInfoList = new ArrayList<>();
		faultInfoList.add(new FaultInfo("A Fault"));
		faultInfoList.add(new FaultInfo("Another Fault"));
		fault1.setFaultInfo(faultInfoList);
		result.setFaults(faults);
		String json = job.toJsonString();
		log.debug("Test Job JSON = "+json);
	}

}
