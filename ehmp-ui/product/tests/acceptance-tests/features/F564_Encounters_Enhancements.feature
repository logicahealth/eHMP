@F564 @regression
Feature: Encounters Applet Enhancements

@US5650 @F564-2
Scenario: As a clinical user when I am reviewing inpatient admissions within the encounters applet I would like the discharge diagnosis to display
	Given user is logged into eHMP-UI
	And user searches for and selects "thirtytwo,patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When the user expands "Admissions" in Encounters Gist Applet
  	When user clicks on the "Left" hand side of the "Diagnosis" "SPINAL CORD INJURY" 
    Then a Menu appears on the Encounters Gist for the item "SPINAL CORD INJURY"
    Then user selects the "SPINAL CORD INJURY" detail icon in Encounters Gist
    Then the modal is displayed
    And the modal's title is "Hospitalization" 
    And the Timeline event "Admission" Detail modal displays 
      | modal item      |
      | Discharge Diagnoses			|