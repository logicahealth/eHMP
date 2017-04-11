#Team_Europa @DE3161
Feature: F576 FHIR Domain - MedicationRx
@F576_MedicationPrescription @US9154 @DE3161
Scenario: Client can request Medication Rx in FHIR format (new format: http://IP_ADDRESS:PORT/resource/fhir/patient/5000000217V519385/medicationprescription)
   Given a patient with "medicationprescription" in multiple VistAs
   When client sends GET request for medication prescription in FHIR format with "9E7A;100716"
   Then a successful response is returned
   And the FHIR results contain "medicationprescription"
    | field                                  | value|
    |resource.resourceType                   | MedicationPrescription|
    |resource.status                         | active |
    |resource.contained.resourceType         | Medication   |
    |resource.contained.name                 | METHOCARBAMOL TAB |
    |resource.contained.code.text            | Methocarbamol 500 MG Oral Tablet |
    |resource.contained.code.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.88 |
    |resource.contained.code.coding.code     | 197943 |
    |resource.contained.code.coding.display  | Methocarbamol 500 MG Oral Tablet |
    |resource.contained.product.form.text    | TAB |
    |resource.contained.product.ingredient.item.display     | METHOCARBAMOL TAB |
    |resource.contained.contained.resourceType              | Substance |
    |resource.contained.contained.type.text                 | METHOCARBAMOL 500MG TAB |
    |resource.contained.contained.type.coding.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
    |resource.contained.contained.type.coding.code          | CONTAINS urn:va:vuid:4017879 |
    |resource.contained.contained.type.coding.display       | METHOCARBAMOL |
    |resource.contained.contained.type.coding.system        | SNOMED-CT |
    |resource.contained.contained.type.coding.code          | CONTAINS urn:sct:410942007 |
    |resource.contained.contained.type.coding.display       | METHOCARBAMOL TAB |
    |resource.contained.contained.description               | METHOCARBAMOL 500MG TAB |
    |resource.identifier.system              | CONTAINS urn:oid:2.16.840.1.113883.6.233 |
    |resource.identifier.value               | CONTAINS urn:va:med:9016:5000000217V519385:5587940 |
    |resource.note                           | METHOCARBAMOL 500MG TAB (ACTIVE)\n TAKE ONE TABLET BY MOUTH 1|
    |resource.prescriber.reference           | Provider/urn:va:user:9016:520736421 |
    |resource.dosageInstruction.text         |  TAKE ONE TABLET BY MOUTH 1 |
    |resource.dosageInstruction.scheduledTiming.repeat.frequency     |  1 |
    |resource.dosageInstruction.scheduledTiming.repeat.periodUnits   |  s |
    |resource.dosageInstruction.scheduledTiming.code.text            | 1 |
    |resource.dosageInstruction.route.text                           | PO |
    |resource.dosageInstruction.doseQuantity.value                   | 500 |
    |resource.dosageInstruction.doseQuantity.units                   | MG |
    |resource.dispense.numberOfRepeatsAllowed                        | 11 |
    |resource.dispense.quantity.value                                | 1 |
    |resource.dispense.expectedSupplyDuration.value                  | 30 |

@F576 @US9149
 Scenario: Client can request Condition in FHIR format
     When client sends GET request for Condition in FHIR format with "5000000217V519385"
     Then a successful response is returned
     And the FHIR results contain "condition"
     | field                   | value |
     |resource.resourceType    | Condition  |

