#Team_Europa @DE3161
Feature: F361 FHIR Domain - MedicationPrescription
# TODO: Update this scenario to use changes in resource URI. (US9154)
  @F361_medicationprescription @US5272 @DE3161
  Scenario: Client can request Med Prescription in FHIR format
      Given a patient with "medicationprescription" in multiple VistAs
  	  When the client requests "medicationprescription-medicationprescription" for the patient "9E7A;229"
      Then a successful response is returned
      And the FHIR results contain "medicationprescription"
      	| field 						    | value 								|
      	| resourceType 					    | MedicationPrescription				|
      	| status 							| stopped								|
      	| contained.resourceType 			| Medication 							|
      	| contained.name 					| METFORMIN TAB,SA	|
      	| contained.code.text 				| 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet			|
      	| contained.code.coding.system      | CONTAINS urn:oid:2.16.840.1.113883.6.88  |
        | contained.code.coding.code        | 860975|
        | contained.code.coding.display     | 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet|
        | contained.product.form.text       | TAB,SA|
        | contained.product.ingredient.item.display | METFORMIN TAB,SA |
        | contained.contained.resourceType         | Substance |
        | contained.contained.type.text            | METFORMIN HCL 500MG 24HR TAB,SA|
        | contained.contained.type.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
        | contained.contained.type.coding.code     | CONTAINS urn:va:vuid:4023979|
        | contained.contained.type.coding.system   | SNOMED-CT |
        | contained.contained.type.coding.code     | CONTAINS urn:sct:410942007 |
        | contained.contained.type.coding.display  | METFORMIN|
        | contained.contained.description          | METFORMIN HCL 500MG 24HR TAB,SA|
        | identifier.system              | CONTAINS rn:oid:2.16.840.1.113883.6.233 |
        | identifier.value               | CONTAINS urn:va:med:9E7A:229:27852|
        | note                           | METFORMIN HCL 500MG 24HR TAB,SA (EXPIRED)\n TAKE ONE TABLET MOUTH TWICE A DAY |
        | dateWritten                    | IS_FHIR_FORMATTED_DATE|
        | prescriber.reference           | Provider/urn:va:user:9E7A:983|
        | dosageInstruction.text         | TAKE ONE TABLET MOUTH TWICE A DAY|
        | dosageInstruction.scheduledTiming.repeat.frequency | 1 |
        | dosageInstruction.scheduledTiming.repeat.periodUnits | s |
        | dosageInstruction.scheduledTiming.code.text          | BID |
        | dosageInstruction.route.text             | PO |
        | dosageInstruction.doseQuantity.value     | 500 |
        | dosageInstruction.doseQuantity.units     | MG |
        | dispense.validityPeriod.start            | 2010-02-27|
        | dispense.validityPeriod.end              | 2010-05-28|
        | dispense.quantity.value                  | 180 |
        | dispense.expectedSupplyDuration.value    | 90 |
        | dispense.expectedSupplyDuration.units    | days |
