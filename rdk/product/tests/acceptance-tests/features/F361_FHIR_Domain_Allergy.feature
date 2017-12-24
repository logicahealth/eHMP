#Team_Europa @DE3161
Feature: F361 FHIR Domain - AllergyIntolerance
@F361-allergies @US5960 @DE3161
 Scenario: Client can request Allergy in FHIR format
     Given a patient with "allergyintolerance" in multiple VistAs
     When the client requests allergyintolerance for the patient "SITE;100022"
     Then a successful response is returned
     And the FHIR results contain "allergyintolerance"
     	   | field 										      | value 								|
         | resource.resourceType 					   | AllergyIntolerance          |
         | resource.text.status                    | generated |
         | resource.text.div                       | CONTAINS <div>PENICILLIN</div> |
         | resource.recordedDate                   | IS_FHIR_FORMATTED_DATE|
         | resource.patient.reference              | Patient/SITE;100022 |
         | resource.substance.coding.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.substance.coding.code          | AM114 |
         | resource.substance.coding.display       | (INACTIVE) PENICILLINS|
         | resource.criticality                    | unassessible |
         | resource.type                           | immune |
         | resource.event.substance.coding.system  | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.event.substance.coding.code    | CONTAINS urn:va:vuid: |
         | resource.event.substance.coding.display | PENICILLIN |
         | resource.event.certainty                | likely |
         | resource.event.manifestation.coding.system  | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.event.manifestation.coding.code    | CONTAINS urn:va:vuid: |
         | resource.event.manifestation.coding.display | CONTAINS ANOREXIA |
      And FHIR date and time conver to Zulu format for Allergy F361