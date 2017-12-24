@F1252  @reg1
Feature: Discharge Follow-Up Applet

Background:
  And user searches for and selects "Eight,Patient"
  Then Summary View is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces

@US18989 
Scenario: Verify inpatient discharge follow-up applet displays with correct headers
  Given the user creates a user defined workspace named "inpatientdischarge"
  When the user customizes the "inpatientdischarge" workspace
  Then the user adds an expanded "discharge_followup" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  And the "INPATIENTDISCHARGE" screen is active
  And the active screen displays 1 applets
  And the Inpatient Dischange Follow Up Expanded applet is displayed
  And the title of the Dischange Follow Up applet is "inpatient discharge follow-up"
  Then Discharge Follow Up applet has headers
  | headers           |
  | Patient Name      |
  | Discharged On     |
  | From Facility     |
  | Disposition To    |
  | Assigned PCP      |
  | Primary Care Team |
  | Attempts          |
  | Flag              |
 


