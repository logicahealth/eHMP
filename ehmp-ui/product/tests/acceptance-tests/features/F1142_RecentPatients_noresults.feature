@F1142 @US17414
Feature: Home Page Usability (Staff View) - Implement Recent Patient list tray

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "edm1234" verifycode as  "edm1234!!"
  Then staff view screen is displayed

@F1142_rp_0
Scenario: Verify Recent Patients tray display displays message when there are no recent patients
  When the user opens the Recent Patients tray
  And the Recent Patients Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
  Then the Recent Patients Tray no results message displays

