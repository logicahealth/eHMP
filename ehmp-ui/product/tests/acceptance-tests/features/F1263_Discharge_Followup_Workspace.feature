@F1263 @discharge_follow_up_workspace @reg2
Feature: Discharge Follow-Up Workspace

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18768_discharge_follow_up_workspace
Scenario: Discharge follow up workspace exists in the workspace dropdown and has all 7 applets.

  And Summary View is active
  And discharge follow up workspace exists in the workspace drop down
  When user selects the workspace discharge follow up from workspace drop down
  Then user can see the following applets and corresponding view types
	| applet_title					| data applet id				| view type	|
	| Documents						| documents	 					| summary	|
	| Orders						| orders	    				| expanded	|
	| Active & Recent Medications	| activeMeds					| gist		|
	| Numeric Lab Results			| lab_results_grid				| gist		|
    | Narrative Lab Results 		| narrative_lab_results_grid	| summary	|    
  And user scrolls the problems applet into view
  Then user can see the following applets and corresponding view types
	| applet_title					| data applet id				| view type	|
	| Problems						| problems						| summary	|
  And user scrolls the appointments applet into view
  Then user can see the following applets and corresponding view types
	| applet_title					| data applet id				| view type	|
	| Appointments & Visits			| appointments					| summary	|
  And all the applets on discharge follow up screen are loaded successfully
  
@US18769_documents_applet_filters
Scenario: Apply Pre-Defined Filters and Filter Group Name to the Discharge Follow-up Workspace
    
  And Summary View is active
  And discharge follow up workspace exists in the workspace drop down
  When user selects the workspace discharge follow up from workspace drop down
  Then all the applets on discharge follow up screen are loaded successfully
  And user scrolls the Documents applet into view
  And Documents applet filters are automatically collapsed when applet first loads
  And Documents applet has following filters applied already when filter is opened
    | Filters	|
    | imaging	|
    | consult	|
    | procedure	|
    | discharge |
  And Documents applet has a group filter title called "Discharge Care Coordination"
  
  