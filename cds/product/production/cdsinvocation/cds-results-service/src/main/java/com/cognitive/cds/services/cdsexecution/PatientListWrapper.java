package com.cognitive.cds.services.cdsexecution;

import com.cognitive.cds.invocation.execution.model.PatientList;

public class PatientListWrapper {
	
	PatientList payload;
	
	public PatientListWrapper()
	{
		
	}

	public PatientList getPayload() {
		return payload;
	}

	public void setPayload(PatientList payload) {
		this.payload = payload;
	}
	
	
}
