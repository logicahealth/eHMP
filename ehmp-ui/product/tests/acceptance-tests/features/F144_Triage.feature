
Feature: Stop gap to prevent red triage build.  Can be deleted when triage build is fixed

#POC: Team Mercury

@triage
Scenario: User views the cover sheet
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
		| field			| value 				|
		| patient name	| Bcma,Eight 			|
	And the applets are displayed on the coversheet
		| applet 					|
		| CONDITIONS	 			|
		| NUMERIC LAB RESULTS		|
		| VITALS 					|
		| Active & Recent MEDICATIONS		|
		| ALLERGIES					|
		| IMMUNIZATIONS				|
		| ORDERS					|
		| APPOINTMENTS				|
		| COMMUNITY HEALTH SUMMARIES|
	And the Vitals applet displays data grid rows
