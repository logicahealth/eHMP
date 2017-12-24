@F1142 @US17414
Feature: Home Page Usability (Staff View) - Implement Recent Patient list tray

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "edm1234" verifycode as  "edm1234!!"
  Then staff view screen is displayed

@F1142_rp_1
Scenario: Verify Recent Patients dropdown in header displays message when there are no recent patients
  Given the user opens the recent patient dropdown
  Then the first record in the list is "No recent patients found"