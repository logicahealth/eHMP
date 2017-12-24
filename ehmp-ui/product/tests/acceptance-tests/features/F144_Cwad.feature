# Team Mercury
@F144 @US3584 @cwad   @reg2
Feature: F144-eHMP Viewer GUI - Crisis Notes, Warnings, Allergies, Directives (CWAD)
The user should be able look at CWAD flags in patient header and user looks for patient-status-icon

Background:
    When user searches for and selects "Eight,Patient"
    Then Summary View is active

@US3584_cwad_crisisnotes @DE979 @DE1045 @crisis
Scenario: The user should be able to view Crisis Notes details
    Given the following postings are active
      | Posting    |
      | Crisis Notes |
    When the user opens the "Crisis Notes" details view
    Then the cwad details view contains 
      | field          | 
      | Crisis Note    |
      | Local Title    | 
      | Standard Title | 
      | Date of Note   | 
      | Entry Date     | 
      | Author         | 

@US3584_cwad_allergies @DE979 @DE1045 
Scenario: The user should be able to view Allergies details
    Given the following postings are active
      | Posting    |
      | Allergies  |
    When the user opens the "Allergies" details view
    Then the cwad details view contains 
      | field               	| 
      | Drug Classes        	|
      | Originated          	| 
      | Verified            	| 
      | Nature of reaction  	| 
      | Observed / Historical 	| 

@US3584_cwad_directives @DE979 @DE1045 
Scenario: The user should be able to view Directives details
    Given the following postings are active
      | Posting    |
      | Directives  |
    When the user opens the "Directives" details view
    Then the cwad details view contains 
      | field        | 
      | Local Title  | 
      | Date of Note | 
      | Entry Date   | 

@US3584_cwad_patientflags 
Scenario: The user should be able to view patient flags
    Given the following postings are active
      | Posting        |
      | Patient Flags  |
    When the user opens the "Patient Flags" details view
    Then the cwad details view contains 
      | field             | 
      | Assignment Status | 

@US3584_4_cwad @DE979
Scenario: The user can identify when a patient has postings (secondary test)
  Given the following postings are active
    | Posting      |
    | Crisis Notes |
    | Allergies    |
    | Directives    |
    | Patient Flags |
  And the following postings are inactive
    | Posting       |
    | Warnings      |    

@SyncStatus_1 @DE1252
Scenario: The user looks for patient-status-icon
    Then the region "Bottom Region" is displayed
    And "Bottom Region" contains "eHMP version"
    Then the user looks for patientstatus icon site,All VA ,DOD and Externals
     | field	 |
	   | My Site   |
     | All VA    |
	   | DoD       |
	   | Communities |


  
