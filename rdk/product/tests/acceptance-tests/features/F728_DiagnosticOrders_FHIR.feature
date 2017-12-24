 @Team_Europa @US10660
 @F728_DiagnosticOrders_FHIR @vxsync @patient
 Feature: F728 - Return of DiagnosticOrders in FHIR format

 #This feature item returns a diagnostic order in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.
 #Patients used: SITE;253, SITE;229, SITE;231, SITE;8, SITE;167, SITE;230

 @F728_1_DiagnosticOrders_FHIR  @fhir @2939127
 Scenario: Client can request diagnosticorders results in FHIR format
      Given a patient with "diagnosticorders" in multiple VistAs
      When the client requests diagnosticorders for the patient "SITE;231" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "diagnosticorders"

      #DiagnosticOrder
       | name                                  | value                                                     |
       | resource.resourceType                 | DiagnosticOrder                                           |
       | resource.subject.reference            | Patient/SITE;231                                         |
       | resource.event.dateTime               | IS_FHIR_FORMATTED_DATE                                    |
       | resource.text.status                  | generated                                                 |
       #Practitioner
       | resource.contained.resourceType       | Practitioner                                              |
       | resource.contained.text.status        | generated                                                 |
       | resource.contained.text.div           | CONTAINS <div>PROGRAMMER,ONE</div>                          |
       | resource.contained.identifier.value   | CONTAINS urn:va:user:SITE:1                         |
       #Organization
       | resource.text.status                  | generated                                                 |
       | resource.identifier.system            | CONTAINS urn:oid:2.16.840.1.113883.6.233                  |
       #Location
       | resource.text.status                  | generated                                                 |
       | resource.identifier.system            | CONTAINS urn:oid:2.16.840.1.113883.6.233                  |

 @F728_2_DiagnosticOrders_FHIR  @fhir @2939127
 Scenario: Client can request diagnosticorders results in FHIR format
      Given a patient with "diagnosticorders" in multiple VistAs
      When the client requests diagnosticorders for the patient "SITE;231" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "diagnosticorders"

      #DiagnosticOrder
       | name                               | value                                                     |
       | resource.resourceType              | DiagnosticOrder                                           |
       | resource.subject.reference         | Patient/SITE;231                                      |
       | resource.item.code.coding.code     | CONTAINS urn:va:oi:357                                    |
       | resource.item.code.coding.display  | CONTAINS HDL                                              |
       | resource.item.code.coding.extension.url            |CONTAINS diagnosticorder#oiPackageRef         |
       | resource.item.code.coding.extension.valueString    | CONTAINS 244;99LRT                           |
       | resource.event.status                 | completed                                                 |
       | resource.event.description            | CONTAINS HDL BLOOD                                        |
       | resource.event.dateTime               | IS_FHIR_FORMATTED_DATE                                    |
       #Practitioner
       | resource.contained.resourceType       | Practitioner                                              |
       | resource.contained.text.status        | generated                                                 |
       | resource.contained.text.div           | CONTAINS <div>GENERAL MEDICINE</div>               |
       | resource.contained.name.family        | VEHU                                                      |
       | resource.contained.name.given         | ONE                                     |
       | resource.contained.identifier.value   | CONTAINS urn:va:user:SITE:20001                          |
       #Organization
       | resource.text.status                  | generated                                                 |
       | resource.identifier.system            | CONTAINS urn:oid:2.16.840.1.113883.6.233                  |
       #Location
       | resource.text.status                  | generated                                                 |
       | resource.identifier.system            | CONTAINS urn:oid:2.16.840.1.113883.6.233                  |
       | resource.status                       | completed                                                 |

 @F728_3_DiagnosticOrders_FHIR @fhir @2939127
 Scenario: Client can request diagnosticorders results in FHIR format
      Given a patient with "diagnosticorders" in multiple VistAs
      When the client requests diagnosticorders for the patient "SITE;231" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "diagnosticorders"

      #DiagnosticOrder
       | name                               | value                                           |
       | resource.resourceType              | DiagnosticOrder                                 |
       | resource.item.code.coding.system   | CONTAINS urn:oid:2.16.840.1.113883.6.233        |
       | resource.item.code.coding.code     | CONTAINS urn:va:oi:357                          |
       | resource.item.code.coding.display  | HDL                                             |
       | resource.subject.reference         | Patient/SITE;231                                |
       | resource.text.status               | generated                                       |
       | resource.extension.url             | CONTAINS diagnosticorder#kind                   |

