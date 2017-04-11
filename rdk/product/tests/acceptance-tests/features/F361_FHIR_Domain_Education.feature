#Team_Europa @DE3161
Feature: F361 FHIR Domain - Education
@F361_educations @US5108 @DE1444
 Scenario: Client can request Education in FHIR format
     Given a patient with "educations" in multiple VistAs
     #And a patient with pid "10107V395912" has been synced through the RDK API
     When the client requests "educations-educations" for the patient "9E7A;229"
     Then a successful response is returned
     And the FHIR results contain "educations"
     	| field 							| value 							    |
     	| resource.resourceType 				| Procedure 						    |
     	| resource.text.status 				| generated						    |
     	| resource.text.div               		| CONTAINS <div>undefined</div> 		    |
     	| resource.contained.resourceType       | Organization 					    |
     	| resource.contained.identifier.system 	| CONTAINS urn:oid:2.16.840.1.113883.6.233  |
     	| resource.contained.identifier.value 	| 536							    |
     	| resource.contained.name 			| New Jersey HCS						    |
     	| resource.identifier.use 			| official 						    |
     	| resource.identifier.system 			| http://vistacore.us/fhir/id/uid 		    |
     	| resource.identifier.value 			| CONTAINS urn:va:education:2939:15:43  |
     	| resource.patient.reference 			| Patient/9E7A;229					    |
     	| resource.status 					| completed 					         |
     	| resource.type.coding.system			| http://ehmp.DNS   /terminology/1.0 	    |
     	| resource.type.coding.code 			| /concept/ED.SMOKING%20CESSATION |
     	| resource.type.coding.display 		| SMOKING CESSATION          	|
     	| resource.performedDateTime 			| IS_FHIR_FORMATTED_DATE        	     |
     	| resource.encounter.reference		| CONTAINS urn:va:visit:2939:15:2041	|
     	| resource.encounter.display 	    	     | PRIMARY CARE Apr 06, 2000 		 |
     	| resource.location.reference 		|CONTAINS urn:va:location:2939:32	 |
     	| resource.location.display 			| PRIMARY CARE 				 |
