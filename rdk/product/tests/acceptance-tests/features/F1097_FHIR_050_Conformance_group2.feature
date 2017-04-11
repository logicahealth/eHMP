 # Team Europa

 Feature: F1097 - v2.0 PSI 12 Production CDS Infrastructure
 
 @F1097_01 @US13123
 Scenario: Client are able to retrieve Conformance statement for Immunization in FHIR format
 When the client requests Conformance statement for "immunization"
 Then a successful response is returned
 And the returned json data must include resource type "immunization"

 @F1097_02 @US13123
 Scenario: Client are able to retrieve Conformance statement for DiagnosticReport in FHIR format
 When the client requests Conformance statement for "diagnosticreport"
 Then a successful response is returned
 And the returned json data must include resource type "diagnosticreport"
 
 @F1097_03 @US13123
 Scenario: Client are able to retrieve Conformance statement for MedicationAdministration in FHIR format
 When the client requests Conformance statement for "medicationadministration"
 Then a successful response is returned
 And the returned json data must include resource type "medicationadministration"          

 @F1097_04 @US13123
 Scenario: Client are able to retrieve Conformance statement for MedicationDispense in FHIR format
 When the client requests Conformance statement for "medicationdispense"
 Then a successful response is returned
 And the returned json data must include resource type "medicationdispense"
 
  @F1097_05 @US13122
 Scenario: Client are able to retrieve Conformance statement for allergyintolerance in FHIR format
 When the client requests Conformance statement for "allergyintolerance"
 Then a successful response is returned
 And the returned json data must include resource type "allergyintolerance"
 
 @F1097_06 @US13122
 Scenario: Client are able to retrieve Conformance statement for composition in FHIR format
 When the client requests Conformance statement for "composition"
 Then a successful response is returned
 And the returned json data must include resource type "composition"

@F1097_07 @US13122
 Scenario: Client are able to retrieve Conformance statement for condition in FHIR format
 When the client requests Conformance statement for "condition"
 Then a successful response is returned
 And the returned json data must include resource type "condition"

@F1097_08 @US13122
 Scenario: Client are able to retrieve Conformance statement for diagnosticorder in FHIR format
 When the client requests Conformance statement for "diagnosticorder"
 Then a successful response is returned
 And the returned json data must include resource type "diagnosticorder"

 
 