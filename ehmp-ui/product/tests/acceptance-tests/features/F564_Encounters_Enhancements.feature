@F564  @reg3

Feature: Encounters Applet Enhancements

@US5650 @F564-2 @DE6882
Scenario: As a clinical user when I am reviewing inpatient admissions within the encounters applet I would like the discharge diagnosis to display
	And user searches for and selects "thirtytwo,patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When the user expands type Admissions in Encounters trend view applet
  	When the user views the details for the "SPINAL CORD INJURY" Admission type encounter
    Then the modal is displayed
    And the modal's title is "Hospitalization" 
    And the Timeline event "Admission" Detail modal displays 
      | modal item      			|
      | Discharge Diagnoses			|