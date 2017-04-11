package com.cognitive.cds.invocation.mongo;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.model.IntentMapping;

public class InitIntentMappingDaoTest {

	private static final Logger LOGGER = LoggerFactory.getLogger(IntentMappingDaoTest.class);
	private static ApplicationContext context;
	private static IntentMappingDao intentMappingDao;

	@BeforeClass
	public static void beforeClass() {
		try {
			context = new ClassPathXmlApplicationContext("classpath:initIntent-mongodb-dao-context.xml");
			intentMappingDao = (IntentMappingDao) context.getBean("intentLookup");
		} catch (Exception e) {
			LOGGER.error(e.getLocalizedMessage(),e);
		}
	}

	
	@Ignore("this is a service integration test")
	@Test
	public void testPostProcessAfterInitialization() {
		assertNotNull(context);
		assertNotNull(intentMappingDao);
		IntentMapping intent = intentMappingDao.getIntent("RheumatologyConsultScreen");
		assertNotNull(intent);
		assertEquals("RheumatologyConsultScreen.prerequisites ",intent.getInvocations().get(0).getPrerequisites().size(),2);
		intent = intentMappingDao.getIntent("NeurosurgeryConsult");
		assertNotNull(intent);
		assertEquals("NeurosurgeryConsult.prerequisites ",intent.getInvocations().get(0).getPrerequisites().size(),1);	
	}
}
