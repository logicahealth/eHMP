#Team Neptune
@F120_allergyapplet_dod 
Feature: JLV GUI Refactoring to use VistA Exchange

@US1446 @US2178
Scenario: Verify current patient identifying traits
    Given user searches for and selects "Eight,Patient"
	Then Cover Sheet is active
	And the Patient View Current Patient displays the user name "Eight,Patient (E0008)"
	And the applets are displayed on the coversheet
		| applet 					|
		| ALLERGIES     		 	| 
