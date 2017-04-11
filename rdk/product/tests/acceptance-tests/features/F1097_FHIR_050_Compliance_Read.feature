 # Team Europa

 Feature: F1097 - v2.0 PSI 12 Production CDS Infrastructure
 
 @F1097_Read_1 @US12986
 Scenario: Verify that responses for resource diagnosticorder include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "diagnosticorder" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "diagnosticorder"

 @F1097_Read_2 @US12986
 Scenario: Verify that responses for resource observation include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "observation" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "observation"
 
 @F1097_Read_3 @US12986
 Scenario: Verify that responses for resource adversereaction include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "adversereaction" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "adversereaction"    
        
 @F1097_Read_4 @US12986
 Scenario: Verify that responses for resource allergyintolerance include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "allergyintolerance" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "allergyintolerance"
 
 @F1097_Read_5 @US12986
 Scenario: Verify that responses for resource composition include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "composition" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "composition"
 
 @F1097_Read_6 @US12986
 Scenario: Verify that responses for resource condition include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "condition" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "condition"
 
 @F1097_Read_7 @US12986
 Scenario: Verify that responses for resource DiagnosticReport include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "DiagnosticReport" for patient "10107V395912" in domain lab
 Then a successful response is returned
 And the returned json data include id element for resource "DiagnosticReport"
 
 @F1097_Read_8 @US12986
 Scenario: Verify that responses for resource immunization include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "immunization" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "immunization"
 
 @F1097_Read_9 @US12986
 Scenario: Verify that responses for resource medicationadministration include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "medicationadministration" for patient "5000000217V519385"
 Then a successful response is returned
 And the returned json data include id element for resource "medicationadministration"
 
 @F1097_Read_10 @US12986
 Scenario: Verify that responses for resource medicationdispense include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "medicationdispense" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "medicationdispense"
 
 @F1097_Read_11 @US12986
 Scenario: Verify that responses for resource medicationprescription include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "medicationprescription" for patient "10107V395912" with filter
 Then a successful response is returned
 And the returned json data include id element for resource "medicationprescription"
 
 @F1097_Read_12 @US12986
 Scenario: Verify that responses for resource medicationstatement include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "medicationstatement" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "medicationstatement"
 
 @F1097_Read_13 @US12986
 Scenario: Verify that responses for resource order include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "order" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "order"
 
 @F1097_Read_14 @US12986
 Scenario: Verify that responses for resource procedure include an id element which is compliant with the 0.5.0 specification
 When the client send a requests resource "procedure" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "procedure"
 
 @F1097_Read_15 @US12986
 Scenario: Verify that responses for resource ReferralRequest include an id element which is compliant with the 0.5.0 specification
 When the client requests resource "ReferralRequest" for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "ReferralRequest"
 
 @F1097_Read_16 @US12986
 Scenario: Verify that responses for resource patient include an id element which is compliant with the 0.5.0 specification
 When the client send a requests for patient "10107V395912"
 Then a successful response is returned
 And the returned json data include id element for resource "patient"