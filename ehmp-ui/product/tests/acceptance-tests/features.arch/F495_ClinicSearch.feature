@F495 @regression @OBG
Feature: Enhance the Patient Selection Process - Clinic time frame search

Background: 
	Given user is logged into eHMP-UI
    When the patient search screen is displayed

@US7830 @TC399 @TC985 @TC3727
Scenario: Verify the Custom date Clinic search displays correct results
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/11/2014"
	And the user enters Clinic end date "04/11/2015"
	And the user selects Clinic "Cardiology"
	And a list of clinic results is displayed
	Then the clinic results displays appointments in correct format
	Then the clinic results displays appointments between "12/11/2014 00:00" and "04/11/2015 23:59"
	And the clinic results displays appointments for clinic "Cardiology"

@TC773 @debug @DE5314
Scenario: Verify the custom filter resets when a user clicks on one of the other date range button
   Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/05/2013"
	And the user enters Clinic end date "12/07/2013"
	And the user clicks Tomorrow
	Then the Clinic start date is ''
	And the Clinic end date is ''

@TC985 @DE3774 @debug
Scenario: Verify that *SENSITIVE* is in place of SSN and DOB for sensitive patients
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/05/2013"
	And the user enters Clinic end date "12/07/2013"
	And the user selects Clinic "Audiology"
	Then the Clinic patient name "EHMP, SIX" is displayed
    And the Clinic patient ssn is "*SENSITIVE*"
    And the Clinic patient DOB is "*SENSITIVE*"