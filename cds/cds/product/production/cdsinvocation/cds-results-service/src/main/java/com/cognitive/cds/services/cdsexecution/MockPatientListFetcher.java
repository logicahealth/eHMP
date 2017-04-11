package com.cognitive.cds.services.cdsexecution;

import java.util.Set;

public class MockPatientListFetcher implements SubjectFetcherIface {

	@Override
	public void fetchSubject(String listId, Set<String> ids) throws Exception {
			ids.add("TestId1");
			ids.add("TestId2");

	}

}
