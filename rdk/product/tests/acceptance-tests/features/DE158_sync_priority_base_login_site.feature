@sync_priority @unstable
Feature: F142 VX Cache Management and Expiration/Sync Stabilization
           

@DE158_1
Scenario: Client can request lab (Chem/Hem) results in FHIR format and receive data from login site without waiting for other site to sync.
	Given a patient with "lab (Chem/Hem) results" in multiple VistAs
	And the client requests that the patient with pid "9E7A;227" be cleared through the RDK API
	When the client requests lab "(Chem/Hem)" results for that patient "9E7A;227"
	Then a successful response is returned
	And the client receives 46 FHIR "panorama" result(s)


@DE158_2
Scenario: Client can request Radiology Reports in FHIR format and receive data from login site without waiting for other site to sync.
  Given a patient with "radiology report results" in multiple VistAs
  And the client requests that the patient with pid "9E7A;253" be cleared through the RDK API
  When the client requests radiology report results for the patient "9E7A;253" in FHIR format
  Then a successful response is returned
  And the client receives 1 FHIR "panorama" result(s)


  @DE158_3
  Scenario: Client can request vital results in FHIR format and receive data from login site without waiting for other site to sync.
	Given a patient with "vitals" in multiple VistAs
    And the client requests that the patient with pid "9E7A;227" be cleared through the RDK API
	When the client "C877;PW    " requests vitals for the patient "9E7A;227" in FHIR format
	Then a successful response is returned
	And the client receives 61 FHIR "kodak" result(s)




      
      
  

