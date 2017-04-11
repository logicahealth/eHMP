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
      	| resource.resourceType 					    | MedicationPrescription				|
      	| resource.status 							| stopped								|
      	| resource.contained.resourceType 			| Medication 							|
      	| resource.contained.name 					| METFORMIN TAB,SA	|
      	| resource.contained.code.text 				| 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet			|
      	| resource.contained.code.coding.system      | CONTAINS urn:oid:2.16.840.1.113883.6.88  |
        | resource.contained.code.coding.code        | 860975|
        | resource.contained.code.coding.display     | 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet|
        | resource.contained.product.form.text       | TAB,SA|
        | resource.contained.product.ingredient.item.display | METFORMIN TAB,SA |
        | resource.contained.contained.resourceType         | Substance |
        | resource.contained.contained.type.text            | METFORMIN HCL 500MG 24HR TAB,SA|
        | resource.contained.contained.type.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
        | resource.contained.contained.type.coding.code     | CONTAINS urn:va:vuid:4023979|
        | resource.contained.contained.type.coding.system   | SNOMED-CT |
        | resource.contained.contained.type.coding.code     | CONTAINS urn:sct:410942007 |
        | resource.contained.contained.type.coding.display  | METFORMIN|
        | resource.contained.contained.description          | METFORMIN HCL 500MG 24HR TAB,SA|
        | resource.identifier.system              | CONTAINS rn:oid:2.16.840.1.113883.6.233 |
        | resource.identifier.value               | CONTAINS urn:va:med:9E7A:229:27852|
        | resource.note                           | METFORMIN HCL 500MG 24HR TAB,SA (EXPIRED)\n TAKE ONE TABLET MOUTH TWICE A DAY |
        | resource.dateWritten                    | IS_FHIR_FORMATTED_DATE|
        | resource.prescriber.reference           | Provider/urn:va:user:9E7A:983|
        | resource.dosageInstruction.text         | TAKE ONE TABLET MOUTH TWICE A DAY|
        | resource.dosageInstruction.scheduledTiming.repeat.frequency | 1 |
        | resource.dosageInstruction.scheduledTiming.repeat.periodUnits | s |
        | resource.dosageInstruction.scheduledTiming.code.text          | BID |
        | resource.dosageInstruction.route.text             | PO |
        | resource.dosageInstruction.doseQuantity.value     | 500 |
        | resource.dosageInstruction.doseQuantity.units     | MG |
        | resource.dispense.validityPeriod.start            | 2010-02-27|
        | resource.dispense.validityPeriod.end              | 2010-05-28|
        | resource.dispense.quantity.value                  | 180 |
        | resource.dispense.expectedSupplyDuration.value    | 90 |
        | resource.dispense.expectedSupplyDuration.units    | days |
        And FHIR date and time conver to Zulu format for Medication Prescription
