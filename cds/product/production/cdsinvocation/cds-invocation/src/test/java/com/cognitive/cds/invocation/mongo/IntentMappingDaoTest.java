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
package com.cognitive.cds.invocation.mongo;

import com.cognitive.cds.invocation.execution.model.Coding;
import com.cognitive.cds.invocation.execution.model.Prerequisite;
import com.cognitive.cds.invocation.execution.model.Remediation;
import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.model.InvocationMapping;
import com.cognitive.cds.invocation.model.Rule;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.junit.Ignore;

/**
 *
 * @author Tadesse Sefer
 * 
 */
public class IntentMappingDaoTest {

	private static MongoDbDao mongoDbDao;
	private static IntentMappingDao intentMappingDao;
	private static ApplicationContext context;
	private static final Logger LOGGER = LoggerFactory.getLogger(IntentMappingDaoTest.class);
	

	@BeforeClass
	public static void beforeClass() {
		try {
			context = new ClassPathXmlApplicationContext("classpath:mongodb-dao-context.xml");
			mongoDbDao = (MongoDbDao) context.getBean("mongoDbDao");
			intentMappingDao = new IntentMappingDao();
			intentMappingDao.setMongoDbDao(mongoDbDao);
		} catch (Exception e) {
			LOGGER.error("Error loading connection properties.  Cannot connect to MongoDB");
		}
	}

	@Ignore("a service integration test")
	@Test
	public void testCreateIntentMapping() throws JsonProcessingException {
		String id = new String();
		IntentMapping im = createIntentMappingObject();
		try {
			id = intentMappingDao.createIntent(im);
		} catch (JsonProcessingException jpe) {
			jpe.printStackTrace();
		}
		LOGGER.info(id);

		Assert.assertNotNull(id);

		String savedIntent = intentMappingDao.getIntent(im.getName()).getName();
		Assert.assertNotNull(savedIntent);

		intentMappingDao.deleteIntent(savedIntent);
	}

	@Ignore("a service integration test")
	@Test
	public void testUpdateIntentMapping() {
		IntentMapping im = null;
		try {
			im = createIntentMappingObject();
			IntentMapping imNew = intentMappingDao.getIntent(im.getName());
			im.set_id(imNew.get_id());
			im.setName("Hypertension");
			intentMappingDao.updateIntentMapping(im);
			IntentMapping updatedIM = intentMappingDao.getIntent(im.getName());
			Assert.assertTrue(updatedIM.getName().equals("Hypertension"));
			// Clean up after test
			intentMappingDao.deleteIntent(im.getName());
		} catch (JsonProcessingException e) {
			LOGGER.error(e.getMessage());
		}
	}
	
	@Ignore("a service integration test")
	@Test
	public void testGetAll() {
		System.out.println(intentMappingDao.getAll());
	}
	
	@Ignore("a service integration test")
	@Test
	public void testCreateIntentMappingWithRemediation() throws JsonProcessingException {
		String id = new String();
		IntentMapping im = createIntentMappingWithRemediationObject();
		try {
			id = intentMappingDao.createIntent(im);
		} catch (JsonProcessingException jpe) {
			jpe.printStackTrace();
		}
		LOGGER.info(id);

		Assert.assertNotNull(id);

		String savedIntent = intentMappingDao.getIntent(im.getName()).getName();
		Assert.assertNotNull(savedIntent);

		intentMappingDao.deleteIntent(savedIntent);
	}



	private IntentMapping createIntentMappingObject() {
		IntentMapping intentMapping = new IntentMapping();
		InvocationMapping invocationMapping = new InvocationMapping();
		List<Rule> rules = new ArrayList<>();
		Rule rule = new Rule();
		Properties props = new Properties();
		props.put("scopingEntityId", "com.cognitive");
		props.put("businessId", "genderAge");
		props.put("version", "1.0.0");
		rule.setProperties(props);
		rules.add(rule);
		invocationMapping.setRules(rules);
		invocationMapping.setEngineName("OpenCDS");

		List<String> dataQueries = new ArrayList<>();
		dataQueries.add("patient/##SUBJECT.ID##");
		invocationMapping.setDataQueries(dataQueries);

		List<InvocationMapping> invocations = new ArrayList<>();
		invocations.add(invocationMapping);
		intentMapping.setName("providerInteractiveAdvice");
		intentMapping.setInvocations(invocations);

		return intentMapping;
	}
	
	private IntentMapping createIntentMappingWithRemediationObject() {
		IntentMapping intentMapping = new IntentMapping();
		InvocationMapping invocationMapping = new InvocationMapping();
		List<Rule> rules = new ArrayList<>();
		Rule rule = new Rule();
		Properties props = new Properties();
		props.put("scopingEntityId", "com.cognitive");
		props.put("businessId", "rheumatologyConsultScreen");
		props.put("version", "1.0.0");
		rule.setProperties(props);
		rules.add(rule);
		invocationMapping.setRules(rules);
		invocationMapping.setEngineName("OpenCDS");

		List<String> dataQueries = new ArrayList<>();
		dataQueries.add("patient/##SUBJECT.ID##/diagnosticreport?domain=lab&amp;date=##dateGreaterThanOrEqual-90d##");
		invocationMapping.setDataQueries(dataQueries);

		List<InvocationMapping> invocations = new ArrayList<>();
		Remediation r = new Remediation();
		r.setAction("order");
		r.setDomain("lab");
		List<Prerequisite> prerequisites = new ArrayList<>();
		Prerequisite p1 = new Prerequisite();
		Coding coding1  = new Coding();
		coding1.setCode("55235003");
		coding1.setSystem("http://snomed.org");
		coding1.setDisplay("C Reactive Protein");
		p1.setCoding(coding1);
		p1.setRemediation(r);
		p1.setDisplay("CRP");
		p1.setValueSetQuery("valueSet.sparql");
		p1.setRemediationQuery("orderable.sparql");
		p1.setDomain("lab");
		
		Prerequisite p2 = new Prerequisite();
		Coding coding2  = new Coding();
		coding2.setCode("415301001");
		coding2.setSystem("http://snomed.org");
		coding2.setDisplay("Rheumatoid Factor");
		p2.setCoding(coding2);
		p2.setRemediation(r);
		p2.setDisplay("RF");
		p2.setValueSetQuery("valueSet.sparql");
		p2.setRemediationQuery("orderable.sparql");
		p2.setDomain("lab");
		
		prerequisites.add(p1);
		prerequisites.add(p2);
		invocationMapping.setPrerequisites(prerequisites );
		invocationMapping.setCrsResolverRequired(true);
		invocations.add(invocationMapping);
		intentMapping.setName("RheumatologyConsultScreen");
		intentMapping.setInvocations(invocations);
		

		return intentMapping;
	}
}
