#Team_Europa @DE3161
Feature: F361 FHIR Domain - MedicationStatement
 @F361_medicationstatement @US5272 @DE3161
 Scenario: Client can request Medication Statement in FHIR format
     Given a patient with "medicationstatement" in multiple VistAs
     #And a patient with pid "5000000217V519385" has been synced through the RDK API
 	When the client requests medicationstatement for the patient "SITE;229"
     Then a successful response is returned
     And the FHIR results contain "medicationstatement"
     	 | field 						 | value 		     |
     	 | resource.resourceType 		 | MedicationStatement |
       | resource.status                   | in-progress |
       | resource.patient.reference        | Patient/SITE;229 |
       | resource.contained.resourceType   | Medication |
       | resource.contained.name           | ASPIRIN TAB,EC |
       | resource.contained.code.text      | 308416/Aspirin 81 MG Delayed Release Oral Tablet |
       | resource.contained.code.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.88 |
       | resource.contained.code.coding.code |308416 |
       | resource.contained.code.coding.display  | Aspirin 81 MG Delayed Release Oral Tablet |
       | resource.contained.product.form.text | TAB,EC |
       | resource.contained.product.ingredient.item.display | ASPIRIN TAB,EC |
       | resource.contained.contained.resourceType | Substance |
       | resource.contained.contained.type.text    | ASPIRIN 81MG TAB,EC |
       | resource.contained.contained.type.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.contained.contained.type.coding.display |CONTAINS ASPIRIN|
       | resource.contained.contained.type.coding.system | SNOMED-CT |
       | resource.contained.contained.type.coding.code  | CONTAINS urn:sct:410942007 |
       | resource.contained.contained.type.coding.display |CONTAINS ASPIRIN |
       | resource.contained.contained.description      | ASPIRIN 81MG TAB,EC |
       | resource.contained.extension.valueString  | CONTAINS urn:vandf:4017536|
       | resource.identifier.system                | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.identifier.value                 | CONTAINS urn:va:med:SITE:229:18084|
       | resource.informationSource.reference      | Practitioner/urn:va:user:SITE:10000000031|
       | resource.wasNotGiven                      | false |
       | resource.note                             | ASPIRIN 81MG TAB,EC (ACTIVE)\n TAKE ONE TABLET BY MOUTH EVERY MORNING |
       | resource.medication.display               | ASPIRIN TAB,EC |
       | resource.dosage.text                      | MedicationDose{uid=''} |
       | resource.dosage.schedule.code.text        | QAM|
       | resource.dosage.schedule.code.coding.code | QAM|
       | resource.dosage.schedule.repeat.frequency  | 1440 |
       | resource.dosage.route.text                 | Oral |
       | resource.dosage.route.coding.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
       | resource.dosage.route.coding.code          | PO |
       | resource.dosage.route.coding.display       | Oral |
       | resource.dosage.quantity.value             | 81 |
       | resource.dosage.quantity.units             | MG |
