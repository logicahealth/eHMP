@F1274
Feature: Global Header Navigation Optimization

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "edm1234" verifycode as  "edm1234!!"
  Then staff view screen is displayed

@rp_header_button
Scenario: Verify Recent Patients button
  Given the user selects Patients header button
  Then the Patients header button is highlighted
  And the Recent Patients Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
  And the Recent Patients Tray no results message displays

