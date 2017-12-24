#Team_Europa
Feature: F361 FHIR Domain - DiagnosticReport
@F361_diagnosticreport @US5961 @DE3161
     Scenario: Client can request DiagnosticReport in FHIR format
     Given a patient with "diagnosticreport" in multiple VistAs
     When the diagnosticreport is requested for the patient "SITE;229"
     Then a successful response is returned
     And the FHIR results contain "diagnosticreport"
     	 | field 											           | value 								|
       | resource.resourceType 					 | DiagnosticReport |
       | resource.name.text              | HDL|
       | resource.name.coding.code       |  urn:lnc:2085-9      |
       | resource.name.coding.display    | HDL|
       | resource.status                 | final |
       | resource.issued                 | IS_FHIR_FORMATTED_DATE |
       | resource.subject.reference      | Patient/SITE;229|
       | resource.performer.display      | ALBANY VA MEDICAL CENTER|
       | resource.contained.resourceType | Observation |
       | resource.contained.issued       | IS_FHIR_FORMATTED_DATE |
       | resource.contained.appliesDateTime |IS_FHIR_FORMATTED_DATE|
       | resource.contained.code.text    | HDL |
       | resource.contained.status       | final |
       | resource.contained.reliability  | ok |
       | resource.contained.valueQuantity.value | 58 |
       | resource.contained.valueQuantity.units | MG/DL|
       | resource.contained.specimen.display              | SERUM |
       | resource.contained.referenceRange.high.value     |60|
       | resource.contained.referenceRange.high.units     | MG/DL|
       | resource.contained.referenceRange.low.value      | 40 |
       | resource.contained.referenceRange.low.units      | MG/DL|
       | resource.serviceCategory.text                    | Chemistry |
       | resource.serviceCategory.coding.system           | http://hl7.org/fhir/v2/0074 |
       | resource.serviceCategory.coding.code             | CH |
       | resource.serviceCategory.coding.display          | Chemistry |
       | resource.diagnosticDateTime                      | IS_FHIR_FORMATTED_DATE |
    And FHIR date and time conver to Zulu format for Diagnostic Report
