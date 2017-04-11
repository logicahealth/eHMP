@F495 @regression @triage
Feature: Enhance the Patient Selection Process - 

Background:
	Given user is logged into eHMP-UI
    When the patient search screen is displayed

@US8352 @US7514 @TC825 @TC1041 @DE1345
Scenario: Verify that the Date Buttons
 	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	Then the Preset Date Range buttons are
	 |button |
	 | Last 30d |
	 | Last 7d |
	 | Yesterday |
	 | Today |
	 | Tomorrow |
	 | Next 7d |
	When user selects Preset Date Range 'Yesterday'
	Then the following Preset Date Range buttons are not selected
	 |button |
	 | Last 30d |
	 | Last 7d |
	 | Today |
	 | Tomorrow |
	 | Next 7d |