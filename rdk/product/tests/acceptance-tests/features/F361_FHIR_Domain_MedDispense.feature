#Team_Europa
Feature: F361 FHIR Domain - MedicationDispense
@F361_medicationdispense @US5272 @DE3161
 Scenario: Client can request Medication Dispense in FHIR format
     Given a patient with "medicationdispense" in multiple VistAs
     #And a patient with pid "10107V395912" has been synced through the RDK API
 	 When the client requests medicationdispense for the patient "9E7A;229"
     Then a successful response is returned
     And the FHIR results contain "medicationdispense"
     	 | field 								       | value 				 |
     	 | resource.resourceType 					   | MedicationDispense	 |
         | resource.status                             | stopped |
         | resource.patient.reference                  | Patient/9E7A;229 |
         | resource.dispenser.reference                | Provider/urn:va:user:9E7A:10000000031|
         | resource.contained.resourceType             | MedicationPrescription |
         | resource.contained.patient.reference        | Patient/9E7A;229 |
         | resource.contained.identifier.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.contained.identifier.value         | CONTAINS urn:va:med:9E7A:229:18083|
         | resource.contained.status                   | stopped |
         | resource.contained.dateWritten              | IS_FHIR_FORMATTED_DATE|
         | resource.contained.prescriber.reference     | Provider/urn:va:user:9E7A:10000000031|
         | resource.contained.note                     | METOPROLOL TARTRATE 50MG TAB (DISCONTINUED)\n TAKE ONE TABLET BY MOUTH TWICE A DAY|
         | resource.contained.resourceType             | Medication |
         | resource.contained.name                     | METOPROLOL TARTRATE TAB|
         | resource.contained.code.text                | 866514/Metoprolol Tartrate 50 MG Oral Tablet |
         | resource.contained.code.coding.system       | CONTAINS urn:oid:2.16.840.1.113883.6.88 |
         | resource.contained.code.coding.code         | 866514 |
         | resource.contained.code.coding.display      | Metoprolol Tartrate 50 MG Oral Tablet |
         | resource.contained.product.form.text        | TAB|
         | resource.contained.product.ingredient.item.display    | METOPROLOL TARTRATE TAB|
         | resource.contained.contained.resourceType             | Substance |
         | resource.contained.contained.type.text                | METOPROLOL TARTRATE 50MG TAB |
         | resource.contained.contained.type.coding.system       | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.contained.contained.type.coding.code         | CONTAINS urn:va:vuid:4019836 |
         | resource.contained.contained.type.coding.display      | METOPROLOL |
         | resource.contained.contained.type.coding.system       | SNOMED-CT |
         | resource.contained.contained.type.coding.code         | CONTAINS urn:sct:410942007 |
         | resource.contained.contained.type.coding.display      | METOPROLOL|
         | resource.contained.contained.description              | METOPROLOL TARTRATE 50MG TAB |
         | resource.identifier.system                  | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.identifier.value                   |CONTAINS urn:va:med:9E7A:229:18083|
         | resource.authorizingPrescription.display    |METOPROLOL TARTRATE TAB |
         | resource.quantity.value                     | 180 |
         | resource.quantity.units                     | TAB |
         | resource.daysSupply.value                   | 90 |
         | resource.daysSupply.units                   | days |
         | resource.medication.display                 | METOPROLOL TARTRATE TAB|
         | resource.whenPrepared                       | 2007-04-11|
         | resource.note                               | METOPROLOL TARTRATE 50MG TAB (DISCONTINUED)\n TAKE ONE TABLET BY MOUTH TWICE A DAY |
         | resource.dosageInstruction.schedulePeriod.start | 2007-04-11 |
         | resource.dosageInstruction.schedulePeriod.end   |2008-01-28|
         | resource.dosageInstruction.scheduleTiming.code.text           | BID  |
         | resource.dosageInstruction.scheduleTiming.code.coding.code    | BID  |
         | resource.dosageInstruction.scheduleTiming.code.coding.display | BID  |
         | resource.dosageInstruction.scheduleTiming.repeat.frequency    | 720  |
         | resource.dosageInstruction.route.text                         | Oral |
         | resource.dosageInstruction.route.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
         | resource.dosageInstruction.route.coding.code                  | PO   |
         | resource.dosageInstruction.route.coding.display               | Oral |
         | resource.dosageInstruction.doseQuantity.value                 | 50   |
         | resource.dosageInstruction.doseQuantity.units                 | MG   |
         And FHIR date and time conver to Zulu format for Medication Dispense
