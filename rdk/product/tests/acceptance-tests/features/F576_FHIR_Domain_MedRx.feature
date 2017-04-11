#Team_Europa @DE3161
Feature: F576 FHIR Domain - MedicationRx
@F576_MedicationPrescription @US9154 @DE3161
Scenario: Client can request Medication Rx in FHIR format (new format: http://IP             /resource/fhir/patient/5000000217V519385/medicationprescription)
   Given a patient with "medicationprescription" in multiple VistAs 
   When client sends GET request for medication prescription in FHIR format with "9E7A;100716"
   Then a successful response is returned
   And the FHIR results contain "medicationprescription"
    | field                                  | value|
    |resourceType                   | MedicationPrescription|
    |status                         | active |
    |contained.resourceType         | Medication   |
    |contained.name                 | METHOCARBAMOL TAB |
    |contained.code.text            | Methocarbamol 500 MG Oral Tablet |
    |contained.code.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.88 |
    |contained.code.coding.code     | 197943 |
    |contained.code.coding.display  | Methocarbamol 500 MG Oral Tablet |
    |contained.product.form.text    | TAB |
    |contained.product.ingredient.item.display     | METHOCARBAMOL TAB |
    |contained.contained.resourceType              | Substance |
    |contained.contained.type.text                 | METHOCARBAMOL 500MG TAB |
    |contained.contained.type.coding.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
    |contained.contained.type.coding.code          | CONTAINS urn:va:vuid:4017879 |
    |contained.contained.type.coding.display       | METHOCARBAMOL |
    |contained.contained.type.coding.system        | SNOMED-CT |
    |contained.contained.type.coding.code          | CONTAINS urn:sct:410942007 |
    |contained.contained.type.coding.display       | METHOCARBAMOL TAB |
    |contained.contained.description               | METHOCARBAMOL 500MG TAB |
    |identifier.system              | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
    |identifier.value               | CONTAINS urn:va:med:2939:343:5587940 |
    |note                           | METHOCARBAMOL 500MG TAB (ACTIVE)\n TAKE ONE TABLET BY MOUTH 1|
    |prescriber.reference           | Provider/urn:va:user:2939:520736421 |
    |dosageInstruction.text         |  TAKE ONE TABLET BY MOUTH 1 |
    |dosageInstruction.scheduledTiming.repeat.frequency     |  1 |
    |dosageInstruction.scheduledTiming.repeat.periodUnits   |  s |
    |dosageInstruction.scheduledTiming.code.text            | 1 |
    |dosageInstruction.route.text                           | PO |
    |dosageInstruction.doseQuantity.value                   | 500 |
    |dosageInstruction.doseQuantity.units                   | MG |
    |dispense.numberOfRepeatsAllowed                        | 11 |
    |dispense.quantity.value                                | 1 |
    |dispense.expectedSupplyDuration.value                  | 30 |

@F576 @US9149
 Scenario: Client can request Condition in FHIR format
     When client sends GET request for Condition in FHIR format with "5000000217V519385"
     Then a successful response is returned
     And the FHIR results contain "condition"
     | field                   | value |
     |resource.resourceType    | Condition  |

