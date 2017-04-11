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

