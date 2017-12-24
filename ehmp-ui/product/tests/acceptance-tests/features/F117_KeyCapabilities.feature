@F117_crosscutting @DE602 
Feature: F117 provides cross cutting UI concerns including: displaying the current patient identifying traits, displaying the application version, and providing screen-to-screen navigation.

# POC: Team Mercury
Background:
#	Given user is logged into eHMP-UI
	And user searches for and selects "Ten,Patient"
	Then Cover Sheet is active

@US2145
Scenario: Verify current patient identifying traits, application version and screen to screen navigation
	Then the "patient identifying traits" is displayed with information
		| html 			| value 				|
		| SSN 			| 666-00-0010			|
        | Gender        | Male                  |
    And the Patient View Current Patient displays the user name "Ten,Patient (T0010)"
    And the patient DOB is in correct format
	And "Bottom Region" contains "eHMP version"
    When the user selects Staff View from navigation bar
	Then staff view screen is displayed

	
