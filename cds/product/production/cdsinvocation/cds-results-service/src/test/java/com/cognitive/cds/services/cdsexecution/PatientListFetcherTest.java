package com.cognitive.cds.services.cdsexecution;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.HashSet;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })

public class PatientListFetcherTest {
	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PatientListFetcherTest.class);

	@Autowired
	//@Qualifier("baseService")
	PatientListFetcher instance;


	@Ignore("Configured as a Service level integration test right now")
	@Test
	public void testFetchSubject() {
		HashSet<String> ids = new HashSet<>();
		try {
			instance.fetchSubject("TestList1", ids);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			logger.error("Error Fetching Patient List", e);
			fail(e.getMessage());
		}
		assertTrue("Id set is empty",ids.size()>0);
	}

}
