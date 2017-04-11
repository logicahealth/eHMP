@F144  
Feature: F144-eHMP Viewer GUI - Coversheet View

#POC: Team Mercury

@US2145 @DE130 @DE160 @smoke
Scenario: User views the cover sheet
#	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	And the Global Header displays the user name "BCMA,Eight(B0008)"
	And the applets are displayed on the coversheet
		| applet 					|
		| PROBLEMS	 			|
		| NUMERIC LAB RESULTS	    |
		| VITALS 					|
		| Active & Recent MEDICATIONS		|
		| ALLERGIES					|
		| IMMUNIZATIONS				|
		| ORDERS					|
		| APPOINTMENTS				|
		| COMMUNITY HEALTH SUMMARIES|
	And the Vitals applet displays data grid rows
