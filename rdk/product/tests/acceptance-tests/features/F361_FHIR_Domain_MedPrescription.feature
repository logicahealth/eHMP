#Team_Europa @DE3161
Feature: F361 FHIR Domain - MedicationPrescription
  @F361_medicationprescription @US5272 @DE3161
  Scenario: Client can request Med Prescription in FHIR format
      Given a patient with "medicationprescription-medicationprescription" in multiple VistAs
  	  When the client requests medicationprescription for the patient "SITE;229"
      Then a successful response is returned
      And the FHIR results contain "medicationprescription"
      	| field 						                  | value 						     		|
      	| resource.resourceType 					    | MedicationPrescription		|
      	| resource.status 							      | CONTAINS stopped					|
      	| resource.contained.resourceType 		| CONTAINS Medication 						  |
      	| resource.contained.name 					  | CONTAINS METFORMIN TAB,SA	        |
      	| resource.contained.code.text 				       | CONTAINS 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet |
      	| resource.contained.code.coding.system      | CONTAINS urn:oid:2.16.840.1.113883.6.88  |
        | resource.contained.code.coding.code        | CONTAINS 860975 |
        | resource.contained.code.coding.display     | CONTAINS 24 HR Metformin hydrochloride 500 MG Extended Release Oral Tablet |
        | resource.contained.product.form.text       | CONTAINS TAB,SA |
        | resource.contained.product.ingredient.item.display | CONTAINS METFORMIN TAB,SA |
        | resource.contained.contained.resourceType         | Substance |
        | resource.contained.contained.type.text            | CONTAINS METFORMIN HCL 500MG 24HR TAB,SA |
        | resource.contained.contained.type.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
        | resource.contained.contained.type.coding.code     | CONTAINS urn:va:vuid:4023979 |
        | resource.contained.contained.type.coding.system   | SNOMED-CT |
        | resource.contained.contained.type.coding.code     | CONTAINS urn:sct:410942007 |
        | resource.contained.contained.type.coding.display  | CONTAINS METFORMIN|
        | resource.contained.contained.description          | CONTAINS METFORMIN HCL 500MG 24HR TAB,SA|
        | resource.identifier.system              | CONTAINS rn:oid:2.16.840.1.113883.6.233 |
        | resource.identifier.value               | CONTAINS urn:va:med:SITE:229:27852 |
        | resource.note                           | CONTAINS METFORMIN HCL 500MG 24HR TAB,SA (EXPIRED)\n TAKE ONE TABLET MOUTH TWICE A DAY |
        | resource.dateWritten                    | IS_FHIR_FORMATTED_DATE |
        | resource.prescriber.reference           | CONTAINS Provider/urn:va:user:SITE:983 |
        | resource.dosageInstruction.text         | CONTAINS TAKE ONE TABLET MOUTH TWICE A DAY |
        | resource.dosageInstruction.scheduledTiming.repeat.frequency | 1 |
        | resource.dosageInstruction.scheduledTiming.repeat.periodUnits | CONTAINS s   |
        | resource.dosageInstruction.scheduledTiming.code.text          | CONTAINS BID |
        | resource.dosageInstruction.route.text             | CONTAINS PO |
        | resource.dosageInstruction.doseQuantity.value     | 500 |
        | resource.dosageInstruction.doseQuantity.units     | CONTAINS MG |
        | resource.dispense.validityPeriod.start            | 2010-02-27 |
        | resource.dispense.validityPeriod.end              | 2010-05-28 |
        | resource.dispense.quantity.value                  | 180 |
        | resource.dispense.expectedSupplyDuration.value    | 90  |
        | resource.dispense.expectedSupplyDuration.units    | CONTAINS days |
        And FHIR date and time conver to Zulu format for Medication Prescription

  @F361_medicationprescription_count @US9154 @US16298
  Scenario: Client can request Med Prescription in FHIR format
      Given a patient with "medicationprescription-medicationprescription" in multiple VistAs
      When requesting "medicationprescription" FHIR resources compartmentalized by patient "SITE;229" with search parameter "count" as "3"
      Then a successful response is returned
      And the FHIR results contain "medicationprescription"    
      | field                                 | value                         |
      | resource.resourceType                 | MedicationPrescription        | 
      | resource.id                           | CONTAINS urn.va.med.9016.10104V248233.5587940 |
      | resource.status                       | CONTAINS active                        |
      | resource.contained.resourceType       | CONTAINS Medication                    |
      | resource.contained.name               | CONTAINS METHOCARBAMOL TAB             |
      | resource.contained.code.text          | CONTAINS Methocarbamol 500 MG Oral Tablet     |
      | resource.contained.code.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.88       |
      | resource.contained.code.coding.code   | CONTAINS 197943                               |
      | resource.contained.code.coding.display | CONTAINS Methocarbamol 500 MG Oral Tablet    |
      | resource.contained.product.form.text   | CONTAINS TAB                                 |
      | resource.contained.product.ingredient.item.display   | CONTAINS METHOCARBAMOL TAB     |
      | resource.dateWritten                   | IS_FHIR_FORMATTED_DATE                       |
       And the FHIR results contain "medicationprescription"    
      | field                                 | value                         |
      | resource.resourceType                 | MedicationPrescription        | 
      | resource.id                           | CONTAINS urn.va.med.SITE.229.27952     |
      | resource.status                       | CONTAINS stopped                       |
      | resource.contained.resourceType       | CONTAINS Medication                    |
      | resource.contained.name               | CONTAINS METOPROLOL TARTRATE TAB                    |
      | resource.contained.code.text          | CONTAINS Metoprolol Tartrate 50 MG Oral Tablet      |
      | resource.contained.code.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.88             |
      | resource.contained.code.coding.code   | CONTAINS 866514                                     |
      | resource.contained.code.coding.display | CONTAINS Metoprolol Tartrate 50 MG Oral Tablet     |
      | resource.contained.product.form.text   | CONTAINS TAB                                       |
      | resource.contained.product.ingredient.item.display   | CONTAINS METOPROLOL TARTRATE TAB     |
      | resource.dateWritten                   | IS_FHIR_FORMATTED_DATE                             | 
      And the FHIR results contain "medicationprescription"    
      | field                                 | value                         |
      | resource.resourceType                 | MedicationPrescription        | 
      | resource.id                           | CONTAINS urn.va.med.SITE.229.28052     |
      | resource.status                       | CONTAINS stopped                       |
      | resource.contained.resourceType       | CONTAINS Medication                    |
      | resource.contained.name               | CONTAINS SIMVASTATIN TAB               |
      | resource.contained.code.text          | CONTAINS Simvastatin 40 MG Oral Tablet        |
      | resource.contained.code.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.88       |
      | resource.contained.code.coding.code   | CONTAINS 198211                               |
      | resource.contained.code.coding.display | CONTAINS Simvastatin 40 MG Oral Tablet       |
      | resource.contained.product.form.text   | CONTAINS TAB                                 |
      | resource.contained.product.ingredient.item.display   | CONTAINS SIMVASTATIN TAB       |
      | resource.dateWritten                   | IS_FHIR_FORMATTED_DATE                       |
     
  @F361_medicationprescription_sort @US9154 @US16298
  Scenario: Client can request Med Prescription in FHIR format
      Given a patient with "medicationprescription-medicationprescription" in multiple VistAs
      When requesting "medicationprescription" FHIR resources compartmentalized by patient "SITE;229" with search parameter "sort" as "identifier"
      Then a successful response is returned
      And the FHIR results contain "medicationprescription"    
      | field                               | value                         |
      | resource.resourceType               | MedicationPrescription        | 
      | resource.identifier.system          | CONTAINS urn:oid:2.16.840.1.113883.6.233      |
      | resource.identifier.value           | CONTAINS urn:va:med:9016:10104V248233:5587940 |
      | resource.dateWritten                | IS_FHIR_FORMATTED_DATE                        |
      And the FHIR results contain "medicationprescription"    
      | resource.resourceType               | MedicationPrescription                        | 
      | resource.identifier.system          | CONTAINS urn:oid:2.16.840.1.113883.6.233      |
      | resource.identifier.value           | CONTAINS urn:va:med:SITE:229:10552            |
      | resource.dateWritten                | IS_FHIR_FORMATTED_DATE                        |
       And the FHIR results contain "medicationprescription"    
      | resource.resourceType               | MedicationPrescription                        | 
      | resource.identifier.system          | CONTAINS urn:oid:2.16.840.1.113883.6.233      |
      | resource.identifier.value           | CONTAINS urn:va:med:SITE:229:10553            |
      | resource.dateWritten                | IS_FHIR_FORMATTED_DATE                        |

  @F361_medicationprescription_dateWritten @US9154 @US16298
  Scenario: Client can request Med Prescription in FHIR format
      Given a patient with "medicationprescription-medicationprescription" in multiple VistAs
      When requesting "medicationprescription" FHIR resources compartmentalized by patient "SITE;229" with search parameter "dateWritten" as "!=2000"
      Then a successful response is returned
      And the FHIR results contain "medicationprescription"    
      | field                               | value                         |
      | resource.resourceType               | MedicationPrescription        |     
      | resource.dateWritten                | IS_FHIR_FORMATTED_DATE        |


