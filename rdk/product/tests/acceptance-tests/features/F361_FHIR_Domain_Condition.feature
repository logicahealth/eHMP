#Team_Europa @DE3161
Feature: F361 FHIR Domain - Condition
@F361_condition @US5108 @DE1444
 Scenario: Client can request Condition in FHIR format
     Given a patient with "condition" in multiple VistAs
     #And a patient with pid "5000000217V519385" has been synced through the RDK API
     When the client requests "condition-getProblems" for the patient "9E7A;229"
     Then a successful response is returned
     And the FHIR results contain "condition"
     	| field 							   | value 	  |
     	| resource.resourceType 				   | Condition   |
     	| resource.category.coding.code		   | diagnosis   |
     	| resource.category.coding.system 		   | 2.16.840.1.113883.4.642.2.224 					|
     	| resource.stage.summary 			   | Occasional, uncontrolled chest pain (ICD-9-CM 411.1) 	|
     	| resource.code.coding.system 		   | CONTAINS urn:oid:2.16.840.1.113883.6.233 			|
     	| resource.code.coding.code 			   | CONTAINS urn:icd:411.1 							|
     	| resource.code.coding.display 		   | INTERMED CORONARY SYND 							|
     	| resource.code.coding.code 			   | 25106000 										|
     	| resource.code.coding.display 		   | Impending infarction (disorder) 					|
     	| resource.code.coding.system 		   | CONTAINS http://snomed.info/sct |
     	| resource.asserter.display 			   | PROGRAMMER,TWENTY 							     |
     	| resource.dateAsserted 				   | 1996-05-14 									|
     	| resource.onsetDateTime 		        | 1996-03-15 									|
     	| resource.contained.resourceType 		   | Encounter 									|
     	| resource.contained.text.status 		   | generated 									|
     	| resource.contained.location.resourceType | Location 										|
     	| resource.contained.resourceType 		   | Practitioner 									|
     	| resource.contained.name 			   | PROGRAMMER,TWENTY 								|
     	| resource.contained.identifier.value 	   | CONTAINS urn:va:user:ABCD:755						|
     	| resource.contained.identifier.system 	   | CONTAINS urn:oid:2.16.840.1.113883.6.233 			|
     	| resource.clinicalStatus 			   | confirmed 									|
     	| resource.extension.url 		    	   | CONTAINS http://vistacore.us/fhir/extensions/condition 		|
     	| resource.extension.valueString           | <div><ul><li>comment:SHERIDAN PROBLEM</li><li>entered:19960514</li><li>enteredByCode:urn:va:user:ABCD:755</li><li>enteredByName:PROGRAMMER,TWENTY</li><li>summary:ProblemComment{uid=&#39;&#39;}</li></ul></div>|
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition		     |
     	| resource.extension.valueString 		   | MEDICINE 												|
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition           |
     	| resource.extension.valueBoolean		   | false 												|
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition 		|
     	| resource.extension.valueString 		   | CONTAINS urn:sct:55561003 								|
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition           |
     	| resource.extension.valueString 		   | Active 												|
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition 		|
     	| resource.extension.valueString		   | ACTIVE 											     |
     	| resource.extension.url 			   | CONTAINS http://vistacore.us/fhir/extensions/condition  		|
     	| resource.extension.valueDateTime		   | 1996-05-14 											|

