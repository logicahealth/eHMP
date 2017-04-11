#Team_Europa @DE3161
Feature: F361 FHIR Domain - MedicationAdministration
 @F361_medicationadministration @US5272 @DE3161
 Scenario: Client can request Medication Administration in FHIR format
     Given a patient with "medicationadministration" in multiple VistAs
     #And a patient with pid "5000000217V519385" has been synced through the RDK API
 	 When the client requests medicationadministration for the patient "9E7A;100716"
    Then a successful response is returned
     And the FHIR results contain "medicationadministration"
       | field 											     | value 								|
       | resource.resourceType 						         | MedicationAdministration				|
       | resource.status                                     | stopped |
       | resource.contained.contained.resourceType           | Medication |
       | resource.contained.contained.name                   | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL |
       | resource.contained.contained.code.coding.system     | DOD_NCID |
       | resource.contained.contained.code.coding.code       |15479451 |
       | resource.contained.contained.product.form.text      | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL |
       | resource.contained.contained.contained.resourceType | Substance |
       | resource.contained.contained.contained.type.text    | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL |
       | resource.contained.contained.contained.type.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.contained.contained.contained.type.coding.system | SNOMED-CT |
       | resource.contained.contained.contained.description  | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL|
       | resource.contained.identifier.system                | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.contained.identifier.value                 | CONTAINS urn:va:med:DOD:0000000001:2157545513|
       | resource.contained.note  | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL (Discontinued)\n TAKE ONE PER DAY #1 RF0 |
       | resource.contained.dispense.validityPeriod.start | IS_FHIR_FORMATTED_DATE |
       | resource.contained.dispense.validityPeriod.end    | IS_FHIR_FORMATTED_DATE |
       | resource.contained.dispense.quantity.value        | 1 |
       | resource.contained.dispense.expectedSupplyDuration.value | 30 |
       | resource.contained.dispense.expectedSupplyDuration.units  | days |
       | resource.contained.resourceType         | Practitioner |
       | resource.identifier.system          | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.identifier.value           | CONTAINS urn:va:med:DOD:0000000001:2157545513|
       | resource.extension.valueString      | Acetaminophen 100mg/mL, Solution, Oral, 0.8mL|
       | resource.patient.reference          | Patient/DOD;0000000001 |
       | resource.wasNotGiven                | true |
       | resource.reasonNotGiven.text        | None |
       | resource.reasonNotGiven.coding.system | http://hl7.org/fhir/reason-medication-not-given |
       | resource.reasonNotGiven.coding.code   | a |
       | resource.reasonNotGiven.coding.display | None |
       | resource.effectiveTimeDateTime        | IS_FHIR_FORMATTED_DATE |
    And FHIR date and time conver to Zulu format for Medication Administration
    
