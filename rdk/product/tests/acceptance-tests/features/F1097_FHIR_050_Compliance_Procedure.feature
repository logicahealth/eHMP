 # Team Europa

 Feature: F1097 - v2.0 PSI 12 Production CDS Infrastructure
 
 @F1097_1 @US14760
 Scenario: Client can request both education and procedure in FHIR format
 When the client requests both education and procedure for patient "SITE;227"
 Then a successful response is returned
 And the returned json data include both education and procedure objects
 And required elements "patient", "type" and "status" returned

 @F1097_2 @US14760
 Scenario: Client can request only education in FHIR format
 When the client requests only "educations" for patient "SITE;227"
 Then a successful response is returned
 And the returned json data include only "education" objects
 And required elements "patient", "type" and "status" returned
 
 @F1097_3 @US14760
 Scenario: Client can request only procedure in FHIR format
 When the client requests only "procedure" for patient "SITE;227"
 Then a successful response is returned
 And the returned json data include only "procedure" objects
 And required elements "patient", "type" and "status" returned     
        
 @F1097_4 @US14760
 Scenario: Verify that Educations standalone resource has been removed.
 When the client requests Educations standalone resource for patient "SITE;227"
 Then a "404" code response is returned
 
 @DE5449
 Scenario:  Verify that a user issues a request with an unsupported _tag value,
 When the client issues a request with an unsupported _tag value "badtag" for patient "SITE;227"
 Then a "400" code response is returned
