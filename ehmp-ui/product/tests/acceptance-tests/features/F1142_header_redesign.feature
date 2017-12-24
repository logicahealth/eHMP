@F1142 @F1274 @reg3
Feature: Home Page usability (Staff View), Header redesign

Background:

@US17394_1 @US18886
Scenario: Verify global header for a non-sensitive patient
	Given user searches for and selects "Ten,Patient"
	And Cover Sheet is active
    Then the left side bar does not contain the patient name "Ten"
    And the Type of care info moved to bottom of patient info
    And the Patient View Current Patient displays the user name "Ten,Patient (T0010)"

@US17394_2 @US18886
Scenario: Verify global header for a restricted patient
	Given user searches for and selects restricted patient "Zzzretfivefifty,Patient"
	Then Cover Sheet is active
    And the Patient View Current Patient displays the user name "Zzzretfivefifty,Patient (Z2121)"