@future @F144 @F144_Text_Search
Feature: F144-eHMP Viewer GUI - Text Search

@US2226
Scenario: Text Search
	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "vital" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2364
Scenario: Text Search: Immunization
	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "immunization" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2251 @US2792
Scenario: Text Search: Problem List
	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "headache" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2242
Scenario: Text Search: Lab Result
	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "hdl - serum" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2250
Scenario: Test Search: Lab Order
	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "Urinalysis" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2374  @DE2337
Scenario: Text Search: Medication
	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "med" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2241  @DE2337
Scenario: Text Search: Allergy
	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "allergy" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2256  @DE2337
Scenario: Text Search: Radiology
	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "Radiology" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

 @US2906  @DE2337
 Scenario: Text snippets should display when the requested text is found in the search result
 	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "blood" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2791  @DE2337
Scenario: Data under subgroup is not loaded until the User expands the sub group.
 	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "Progress Notes" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Administrative Notes ( Documents )
 	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "Administrative" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Advance Directive ( Documents )
 	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "directive" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Clinical Procedure ( Documents )
 	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "clinical procedure" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Consult Report ( Documents )
 	Given a patient with pid "9E7A;8" has been synced through the RDK API
	When the client requests a text search for term "consult report" for the patient "9E7A;8" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Consultation Note (Provider) ( Documents )
 	Given a patient with pid "9E7A;3" has been synced through the RDK API
	When the client requests a text search for term "consultation note (provider) document" for the patient "9E7A;3" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Crisis Note ( Documents )
 	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "crisis note" for the patient "9E7A;229" in RDK format
    Then a successful response is returned

@US2792  @DE2337
Scenario: Text Search: Discharge Summary 
 	Given a patient with pid "9E7A;229" has been synced through the RDK API
	When the client requests a text search for term "Discharge Summary" for the patient "9E7A;229" in RDK format
    Then a successful response is returned