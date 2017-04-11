package com.cognitive.cds.invocation.fhir;

public enum FhirDataNature {

	  Current, //(Default)
	  Input, //Prospective
	  Output,
	  Historical,
	  Reported, // New
	  Unknown;
}
