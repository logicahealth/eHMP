 # Team Europa

 Feature: F1097 - v2.0 PSI 12 Production CDS Infrastructure
 
 @F1097_01 @US13125
 Scenario: Client are able to retrieve Conformance statement for Patient in FHIR format
 When the client requests Conformance statement for "patient"
 Then a successful response is returned
 And the returned json data must include resource type "patient"

 @F1097_02 @US13125
 Scenario: Client are able to retrieve Conformance statement for Procedure in FHIR format
 When the client requests Conformance statement for "procedure"
 Then a successful response is returned
 And the returned json data must include resource type "procedure"
 
 @F1097_03 @US13125
 Scenario: Client are able to retrieve Conformance statement for ReferralRequest in FHIR format
 When the client requests Conformance statement for "referralrequest"
 Then a successful response is returned
 And the returned json data must include resource type "referralrequest"    
        

 