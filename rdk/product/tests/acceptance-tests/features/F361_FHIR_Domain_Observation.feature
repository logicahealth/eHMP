#Team_Europa
Feature: F361 FHIR Domain - Observation
@F361_vitalsBP @DE1445
 Scenario: Client can request vitals BP in FHIR format
     Given a patient with "vitals" in multiple VistAs
     #And a patient with pid "5000000217V519385" has been synced through the RDK API
 	   When the "observation" is requested for patient "9E7A;271"
     Then a successful response is returned
     And the FHIR results contain "observation"
     	| field 											                | value 								                |
     	| resource.resourceType 					          	| Observation 							            |
     	| resource.text.status 						            | generated 							              |
      | resource.text.div                           | CONTAINS <div>TEMPERATURE 98.6 F</div>  |
      | resource.code.coding.code                   | CONTAINS urn:va:vuid:4500638            |
      | resource.code.coding.display                | CONTAINS TEMPERATURE                  |
      | resource.code.coding.system                 | http://loinc.org                      |
      | resource.appliesDateTime                    | IS_FHIR_FORMATTED_DATE                |
      | resource.issued                             | IS_FHIR_FORMATTED_DATE                |
      | resource.status                             | final                                 |
      | resource.reliability                        | unknown                               |
      | resource.identifier.use                     | official                              |
      | resource.identifier.system                  | CONTAINS http://vistacore.us/fhir/id/uid |
      | resource.identifier.value                   | CONTAINS urn:va:vital:9E7A:271:12489  |
      | resource.subject.reference                  | Patient/271                         |
      | resource.performer.display                  | ABILENE (CAA)                         |
      # ------------ CHECKING ORGANIZATION CONTAINED RESOURCE ----------------------
      | resource.contained.resourceType             | Organization                          |
      | resource.contained.identifier.system        | urn:oid:2.16.840.1.113883.6.233       |
      | resource.contained.identifier.value         | 998                                   |
      | resource.contained.name                     | ABILENE (CAA)                         |
      And FHIR date and time conver to Zulu format for Observation
      

@F361_vitals @US5108 @DE3161
 Scenario: Client can request vitals in FHIR format
     Given a patient with "vitals" in multiple VistAs
     #And a patient with pid "5000000217V519385" has been synced through the RDK API
     When the "observation" is requested for patient "9E7A;271"
     Then a successful response is returned
     And the FHIR results contain "observation"
        | field                                       | value                                 |
        | resource.resourceType                       | Observation                           |
        | resource.text.status                        | generated                             |
        | resource.text.div                           | CONTAINS <div>TEMPERATURE 98.6 F</div>  |
        | resource.contained.resourceType             | Organization                          |
        | resource.contained.identifier.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
        | resource.contained.identifier.value         | 998                                 |
        | resource.contained.name                     | ABILENE (CAA)                              |
        | resource.code.coding.system                 | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
        | resource.code.coding.code                   | CONTAINS urn:va:vuid:4500638          |
        | resource.code.coding.display                | TEMPERATURE                           |
        | resource.code.coding.system                 | http://loinc.org                      |
        | resource.code.coding.code                   | 8310-5                                |
        | resource.code.coding.display                | BODY TEMPERATURE                      |
        | resource.valueQuantity.value                | 98.6                                   |
        | resource.valueQuantity.units                | F                                     |
        | resource.appliesDateTime                    | IS_FHIR_FORMATTED_DATE                |
        | resource.issued                             | IS_FHIR_FORMATTED_DATE                |
        | resource.status                             | final                                 |
        | resource.reliability                        | unknown                               |
        | resource.identifier.use                     | official                              |
        | resource.identifier.system                  | http://vistacore.us/fhir/id/uid       |
        | resource.subject.reference                  | Patient/271                           |
        | resource.performer.display                  | ABILENE (CAA)                         |
        | resource.referenceRange.low.value           | 95                                    |
        | resource.referenceRange.low.units           | F                                     |
        | resource.referenceRange.high.value          | 102                                   |
        | resource.referenceRange.high.units             | F                                  |
        | resource.referenceRange.meaning.coding.system  | http://snomed.info/id              |
        | resource.referenceRange.meaning.coding.code    | 87273009                           |
        | resource.referenceRange.meaning.coding.display | Normal Temperature                 |

