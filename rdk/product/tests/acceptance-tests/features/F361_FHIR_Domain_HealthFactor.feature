#Team_Europa @DE3161
@F361_healthfactors @US5108 @DE1444
Feature: F361 FHIR Domain - Health Factors
 Scenario: Client can request Health Factors in FHIR format
     Given a patient with "healthfactors" in multiple VistAs
     When the client requests "healthFactors-healthFactors" for the patient "9E7A;229"
     Then a successful response is returned
     And the FHIR results contain "healthfactors"
        | field 						        | value|
        | resource.resourceType 			    | Observation |
        | resource.text.status 			        | generated	|
        | resource.text.div               	    | CONTAINS <div>REFUSAL TO COMPLETE SCREENING TOOL</div> |
        | resource.contained.resourceType       | Organization 				|
        | resource.contained.identifier.system  | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
        | resource.contained.identifier.value   | 536 |
        | resource.contained.name 			    | New Jersey HCS |
        | resource.code.coding.system		    | http://ehmp.DNS   /terminology/1.0 |
        | resource.code.coding.code             | /concept/HF.REFUSAL%20TO%20COMPLETE%20SCREENING%20TOOL |
        | resource.code.coding.display 	        | REFUSAL TO COMPLETE SCREENING TOOL |
        | resource.appliesDateTime              | IS_FHIR_FORMATTED_DATE |
        | resource.status 				        | final |
        | resource.reliability 			        | unknown |
        | resource.identifier.use 			    | official |
        | resource.identifier.system 		    | http://vistacore.us/fhir/id/uid |
        | resource.identifier.value 	        | CONTAINS urn:va:factor:2939:15:32 |
        | resource.subject.reference 	        | Patient/15 |
        | resource.performer.display 	        | New Jersey HCS|