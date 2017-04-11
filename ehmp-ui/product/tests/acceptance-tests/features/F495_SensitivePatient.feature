@F495 @regression
Feature: Handling Sensitive/Flagged Patients in PT Selection List

@US8462 @TC1140
Scenario: As a user, I want to see any eHMP patient flagged as Sensitive ,to have their SSN/DOB to be displayed at "*SENSITIVE* so that if the patient identity information is not revealed. 
	# Given user is logged into eHMP-UI
	When the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "EMPLOYEE, ONE"
    Then the patient name "EMPLOYEE, ONE" is displayed
    And the patient ssn is "*SENSITIVE*"
    And the patient DOB is "*SENSITIVE*"