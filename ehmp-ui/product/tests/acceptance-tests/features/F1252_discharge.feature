@F1252  @reg1
Feature: Discharge Follow-Up Applet

Scenario:
  Given staff view screen is displayed
  And the staff view screen has Workspace Selection dropdown button and named Homepage
  When user selects Workspace Selector dropdown button menu option for the HOMEPAGE
  Then dropdown list has Discharge Care Coordination option 

Scenario:
  When the user selects the Discharge Care Coordination option from the dropdown list
  Then the Discharge Care Coordination screen is active
  And the Inpatient Dischange Follow Up Expanded applet is displayed
  And the title of the Dischange Follow Up applet is "inpatient discharge follow-up - panorama"
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