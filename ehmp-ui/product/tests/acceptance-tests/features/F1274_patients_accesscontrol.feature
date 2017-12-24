@F1274 @reg2
Feature: Global Header Navigation Optimization 

@US18885
Scenario: As a user I want to be able to select a new patient while viewing the Access Control view so I can switch to a new patient if needed. 
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  And user searches for and selects "bcma,eight"
  And Summary View is active
  When POB user views the Access Control Applet
  And the user selects Patients header button
  Then the Patients header button is highlighted
  And the Patients Search sidebar tray displays
  And the Recent Patients tray is open
  And the Recent Patients Tray contains search results

  When user chooses to load a patient from the Recent Patients results list
  Then the Summary View is active by default